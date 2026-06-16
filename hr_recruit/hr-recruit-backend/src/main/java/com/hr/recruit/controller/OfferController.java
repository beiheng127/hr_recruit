package com.hr.recruit.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.hr.recruit.common.Result;
import com.hr.recruit.entity.ApplicantJob;
import com.hr.recruit.entity.Notification;
import com.hr.recruit.entity.OfferRecord;
import com.hr.recruit.mapper.ApplicantJobMapper;
import com.hr.recruit.service.NotificationService;
import com.hr.recruit.service.OfferRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/offers")
@RequiredArgsConstructor
public class OfferController {

    private final OfferRecordService offerRecordService;
    private final ApplicantJobMapper applicantJobMapper;
    private final NotificationService notificationService;

    @GetMapping
    public Result<Page<OfferRecord>> list(
            @RequestParam(defaultValue = "1") long pageNum,
            @RequestParam(defaultValue = "10") long pageSize,
            @RequestParam(required = false) String status) {
        LambdaQueryWrapper<OfferRecord> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(status)) wrapper.eq(OfferRecord::getStatus, status);
        wrapper.orderByDesc(OfferRecord::getCreateTime);
        return Result.success(offerRecordService.page(new Page<>(pageNum, pageSize), wrapper));
    }

    @GetMapping("/{id}")
    public Result<OfferRecord> detail(@PathVariable Long id) {
        OfferRecord offer = offerRecordService.getById(id);
        if (offer == null) {
            return Result.error(404, "Offer不存在");
        }
        return Result.success(offer);
    }

    @GetMapping("/by-application/{applicationId}")
    public Result<OfferRecord> getByApplication(@PathVariable Long applicationId) {
        LambdaQueryWrapper<OfferRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(OfferRecord::getApplicationId, applicationId);
        wrapper.orderByDesc(OfferRecord::getCreateTime);
        OfferRecord offer = offerRecordService.getOne(wrapper);
        if (offer == null) {
            return Result.error(404, "未找到该申请对应的Offer");
        }
        return Result.success(offer);
    }

    @PostMapping
    public Result<Void> create(@RequestBody OfferRecord offer) {
        offerRecordService.save(offer);
        return Result.success("创建成功");
    }

    @PostMapping("/{id}/send")
    public Result<Void> send(@PathVariable Long id) {
        OfferRecord offer = offerRecordService.getById(id);
        if (offer == null) {
            return Result.error("Offer不存在");
        }
        offer.setStatus("SENT");
        offer.setSentAt(LocalDateTime.now());
        offerRecordService.updateById(offer);

        // 更新 applicant_job 状态 + 创建通知
        if (offer.getApplicationId() != null) {
            ApplicantJob applicantJob = applicantJobMapper.selectById(offer.getApplicationId());
            if (applicantJob != null) {
                applicantJob.setStatus("OFFER");
                applicantJobMapper.updateById(applicantJob);

                Notification notification = new Notification();
                notification.setRecipientId(applicantJob.getResumeId());
                notification.setType("OFFER");
                notification.setTitle("恭喜！您收到录用Offer");
                notification.setContent("岗位：" + (offer.getPosition() != null ? offer.getPosition() : "") + "，请及时查看并确认。");
                notification.setIsRead(0);
                notification.setCreateTime(LocalDateTime.now());
                notificationService.save(notification);
            }
        }
        return Result.success("发送成功");
    }

    @PostMapping("/{id}/accept")
    public Result<Void> accept(@PathVariable Long id) {
        OfferRecord offer = offerRecordService.getById(id);
        if (offer == null) {
            return Result.error("Offer不存在");
        }
        offer.setStatus("ACCEPTED");
        offerRecordService.updateById(offer);

        // 更新 applicant_job 状态为 HIRED
        if (offer.getApplicationId() != null) {
            ApplicantJob applicantJob = applicantJobMapper.selectById(offer.getApplicationId());
            if (applicantJob != null) {
                applicantJob.setStatus("HIRED");
                applicantJobMapper.updateById(applicantJob);
            }
        }
        return Result.success("接受成功");
    }

    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @RequestBody OfferRecord offer) {
        offer.setId(id);
        offerRecordService.updateById(offer);
        return Result.success("更新成功");
    }
}
