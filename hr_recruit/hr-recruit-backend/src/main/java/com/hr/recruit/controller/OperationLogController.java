package com.hr.recruit.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.hr.recruit.common.Result;
import com.hr.recruit.entity.OperationLog;
import com.hr.recruit.service.OperationLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
<<<<<<< HEAD
import org.springframework.security.access.prepost.PreAuthorize;
=======
>>>>>>> 1a1d158e371191531b75389502f38fd6b00454a3
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Slf4j
@RestController
@RequestMapping("/api/logs")
@RequiredArgsConstructor
<<<<<<< HEAD
@PreAuthorize("hasAuthority('ADMIN')")
=======
>>>>>>> 1a1d158e371191531b75389502f38fd6b00454a3
public class OperationLogController {

    private final OperationLogService operationLogService;

    @GetMapping
    public Result<Page<OperationLog>> list(
            @RequestParam(defaultValue = "1") long pageNum,
            @RequestParam(defaultValue = "10") long pageSize,
            @RequestParam(required = false) String module,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String startTime,
            @RequestParam(required = false) String endTime) {
        LambdaQueryWrapper<OperationLog> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(module)) wrapper.eq(OperationLog::getModule, module);
        if (StringUtils.hasText(action)) wrapper.eq(OperationLog::getAction, action);
        if (StringUtils.hasText(startTime)) {
            try {
                LocalDateTime start = LocalDateTime.parse(startTime, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
                wrapper.ge(OperationLog::getCreateTime, start);
            } catch (Exception e) {
                log.warn("startTime 格式错误: {}", startTime);
            }
        }
        if (StringUtils.hasText(endTime)) {
            try {
                LocalDateTime end = LocalDateTime.parse(endTime, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
                wrapper.le(OperationLog::getCreateTime, end);
            } catch (Exception e) {
                log.warn("endTime 格式错误: {}", endTime);
            }
        }
        wrapper.orderByDesc(OperationLog::getCreateTime);
        return Result.success(operationLogService.page(new Page<>(pageNum, pageSize), wrapper));
    }
}
