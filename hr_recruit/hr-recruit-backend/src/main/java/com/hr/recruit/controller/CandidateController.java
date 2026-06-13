package com.hr.recruit.controller;

import com.hr.recruit.common.Result;
import com.hr.recruit.dto.CandidateApplyRequest;
import com.hr.recruit.entity.ApplicantJob;
import com.hr.recruit.entity.JobPosition;
import com.hr.recruit.entity.ResumeInfo;
import com.hr.recruit.service.ApplicantJobService;
import com.hr.recruit.service.JobPositionService;
import com.hr.recruit.service.ResumeInfoService;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/candidate")
@RequiredArgsConstructor
public class CandidateController {

    private final JobPositionService jobPositionService;
    private final ResumeInfoService resumeInfoService;
    private final ApplicantJobService applicantJobService;

    // ==================== 公开接口（无需登录）====================

    /**
     * 获取公开岗位列表（只显示在招岗位）
     */
    @GetMapping("/jobs")
    public Result<?> listJobs(
            @RequestParam(defaultValue = "1") long pageNum,
            @RequestParam(defaultValue = "10") long pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String department) {
        List<JobPosition> list = jobPositionService.listPublicJobs(keyword, department);
        // 简单分页（岗位数量不多，直接内存分页）
        int start = (int) ((pageNum - 1) * pageSize);
        int end = Math.min(start + (int) pageSize, list.size());
        if (start > list.size()) start = list.size();
        Map<String, Object> data = new HashMap<>();
        data.put("records", list.subList(start, end));
        data.put("total", list.size());
        data.put("pageNum", pageNum);
        data.put("pageSize", pageSize);
        return Result.success(data);
    }

    /**
     * 获取岗位详情
     */
    @GetMapping("/jobs/{id}")
    public Result<?> getJobDetail(@PathVariable Long id) {
        JobPosition job = jobPositionService.getById(id);
        if (job == null) {
            return Result.error("岗位不存在");
        }
        return Result.success(job);
    }

    /**
     * 候选人投递简历（无需登录）
     */
    @PostMapping("/apply")
    @Transactional
    public Result<?> apply(@ModelAttribute CandidateApplyRequest request) {
        // 1. 创建简历记录
        ResumeInfo resume = new ResumeInfo();
        resume.setName(request.getName());
        resume.setPhone(request.getPhone());
        resume.setEmail(request.getEmail());
        resume.setEducationLevel(request.getEducationLevel());
        resume.setWorkYears(request.getWorkYears() != null ? request.getWorkYears() : 0);
        resume.setSkillTags(request.getSkillTags());
        resume.setSelfEvaluation(request.getBio());
        resume.setTalentPoolStatus("PENDING"); // 待处理
        resume.setCreateTime(LocalDateTime.now());
        resume.setUpdateTime(LocalDateTime.now());
        resumeInfoService.save(resume);

        // 2. 处理简历文件上传（如果有）
        MultipartFile file = request.getFile();
        if (file != null && !file.isEmpty()) {
            try {
                Long fileId = resumeInfoService.uploadFile(file);
                resume.setSourceFileId(fileId); // 记录文件ID
                resumeInfoService.updateById(resume);
            } catch (Exception e) {
                // 文件上传失败不影响主流程
            }
        }

        // 3. 创建投递记录
        ApplicantJob applicantJob = new ApplicantJob();
        applicantJob.setResumeId(resume.getId());
        applicantJob.setJobId(request.getJobId());
        applicantJob.setStatus("PENDING"); // 待处理
        applicantJob.setAppliedAt(LocalDateTime.now());
        applicantJob.setCreateTime(LocalDateTime.now());
        applicantJob.setUpdateTime(LocalDateTime.now());
        applicantJobService.save(applicantJob);

        Map<String, Object> result = new HashMap<>();
        result.put("applicationId", applicantJob.getId());
        result.put("resumeId", resume.getId());
        result.put("message", "投递成功！我们将在3个工作日内通知您后续进展。");
        return Result.success(result);
    }

    /**
     * 查询我的申请列表（通过邮箱或手机号）
     */
    @GetMapping("/applications")
    public Result<?> getMyApplications(
            @RequestParam String keyword // 邮箱或手机号
    ) {
        List<Map<String, Object>> applications = applicantJobService.listByEmailOrPhone(keyword);
        return Result.success(applications);
    }

    /**
     * 获取申请详情（含面试安排）
     */
    @GetMapping("/applications/{id}")
    public Result<?> getApplicationDetail(@PathVariable Long id) {
        Map<String, Object> detail = applicantJobService.getApplicationDetail(id);
        if (detail == null) {
            return Result.error("申请记录不存在");
        }
        return Result.success(detail);
    }
}
