package com.hr.recruit.service;

import java.util.Map;

public interface DashboardService {
    Map<String, Object> getStats();
    Map<String, Object> getRecruitmentFunnel();
    Map<String, Object> getChannelStats();
}
