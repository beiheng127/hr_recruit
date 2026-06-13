package com.hr.recruit.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.hr.recruit.common.Result;
import com.hr.recruit.entity.Notification;
import com.hr.recruit.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public Result<Page<Notification>> list(
            @RequestParam(defaultValue = "1") long pageNum,
            @RequestParam(defaultValue = "10") long pageSize,
            @RequestParam(required = false) Integer isRead) {
        LambdaQueryWrapper<Notification> wrapper = new LambdaQueryWrapper<>();
        if (isRead != null) wrapper.eq(Notification::getIsRead, isRead);
        wrapper.orderByDesc(Notification::getCreateTime);
        return Result.success(notificationService.page(new Page<>(pageNum, pageSize), wrapper));
    }

    @PutMapping("/{id}/read")
    public Result<Void> read(@PathVariable Long id) {
        Notification n = new Notification();
        n.setId(id);
        n.setIsRead(1);
        notificationService.updateById(n);
        return Result.success("标记已读");
    }

    @PutMapping("/read-all")
    public Result<Void> readAll() {
        Notification n = new Notification();
        n.setIsRead(1);
        notificationService.update(n, new LambdaQueryWrapper<>());
        return Result.success("全部已读");
    }
}
