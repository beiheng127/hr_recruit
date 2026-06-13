package com.hr.recruit.controller;

import com.hr.recruit.common.Result;
import com.hr.recruit.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public Result<Map<String, Object>> getStats() {
        return Result.success(dashboardService.getStats());
    }

    @GetMapping("/funnel")
    public Result<Map<String, Object>> getFunnel() {
        return Result.success(dashboardService.getRecruitmentFunnel());
    }

    @GetMapping("/channel-stats")
    public Result<Map<String, Object>> getChannelStats() {
        return Result.success(dashboardService.getChannelStats());
    }
}
