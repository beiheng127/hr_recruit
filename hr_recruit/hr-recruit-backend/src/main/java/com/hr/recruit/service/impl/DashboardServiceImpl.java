package com.hr.recruit.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.hr.recruit.entity.*;
import com.hr.recruit.mapper.JobPositionMapper;
import com.hr.recruit.mapper.ResumeInfoMapper;
import com.hr.recruit.mapper.ApplicantJobMapper;
import com.hr.recruit.mapper.OfferRecordMapper;
import com.hr.recruit.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final JobPositionMapper jobPositionMapper;
    private final ResumeInfoMapper resumeInfoMapper;
    private final ApplicantJobMapper applicantJobMapper;
    private final OfferRecordMapper offerRecordMapper;

    @Override
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("jobCount", jobPositionMapper.selectCount(new LambdaQueryWrapper<JobPosition>().eq(JobPosition::getStatus, "PUBLISHED")));
        stats.put("resumeCount", resumeInfoMapper.selectCount(null));
        stats.put("interviewCount", applicantJobMapper.selectCount(new LambdaQueryWrapper<ApplicantJob>().eq(ApplicantJob::getStatus, "INTERVIEWING")));
        stats.put("offerCount", offerRecordMapper.selectCount(new LambdaQueryWrapper<OfferRecord>().eq(OfferRecord::getStatus, "ACCEPTED")));
        return stats;
    }

    @Override
    public Map<String, Object> getRecruitmentFunnel() {
        Map<String, Object> funnel = new HashMap<>();
        funnel.put("applied", applicantJobMapper.selectCount(new LambdaQueryWrapper<ApplicantJob>().eq(ApplicantJob::getStatus, "APPLIED")));
        funnel.put("interviewing", applicantJobMapper.selectCount(new LambdaQueryWrapper<ApplicantJob>().in(ApplicantJob::getStatus, "SCREENED_PASS", "INTERVIEWING")));
        funnel.put("offered", applicantJobMapper.selectCount(new LambdaQueryWrapper<ApplicantJob>().eq(ApplicantJob::getStatus, "OFFERED")));
        funnel.put("hired", applicantJobMapper.selectCount(new LambdaQueryWrapper<ApplicantJob>().eq(ApplicantJob::getStatus, "HIRED")));
        return funnel;
    }

    @Override
    public Map<String, Object> getChannelStats() {
        Map<String, Object> result = new LinkedHashMap<>();
        List<Map<String, Object>> rows = applicantJobMapper.selectMaps(
                new QueryWrapper<ApplicantJob>()
                        .select("source_channel as channel, count(*) as count")
                        .groupBy("source_channel")
        );
        for (Map<String, Object> row : rows) {
<<<<<<< HEAD
            String channel = (String) row.get("channel");
            result.put(channel != null ? channel : "未知渠道", row.get("count"));
=======
            result.put((String) row.get("channel"), row.get("count"));
>>>>>>> 1a1d158e371191531b75389502f38fd6b00454a3
        }
        return result;
    }
}
