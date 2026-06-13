package com.hr.recruit.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.hr.recruit.entity.ApplicantJob;
import com.hr.recruit.entity.JobPosition;
import com.hr.recruit.entity.ResumeInfo;
import com.hr.recruit.mapper.ApplicantJobMapper;
import com.hr.recruit.service.ApplicantJobService;
import com.hr.recruit.service.JobPositionService;
import com.hr.recruit.service.ResumeInfoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ApplicantJobServiceImpl extends ServiceImpl<ApplicantJobMapper, ApplicantJob>
        implements ApplicantJobService {

    private final ResumeInfoService resumeInfoService;
    private final JobPositionService jobPositionService;

    @Override
    public List<Map<String, Object>> listByEmailOrPhone(String keyword) {
        // 通过邮箱或手机号查找简历，再关联申请记录
        LambdaQueryWrapper<ResumeInfo> resumeWrapper = new LambdaQueryWrapper<>();
        resumeWrapper.and(w -> w.eq(ResumeInfo::getPhone, keyword)
                .or().eq(ResumeInfo::getEmail, keyword));
        List<ResumeInfo> resumes = resumeInfoService.list(resumeWrapper);

        List<Map<String, Object>> result = new ArrayList<>();
        for (ResumeInfo resume : resumes) {
            LambdaQueryWrapper<ApplicantJob> appWrapper = new LambdaQueryWrapper<>();
            appWrapper.eq(ApplicantJob::getResumeId, resume.getId())
                    .orderByDesc(ApplicantJob::getAppliedAt);
            List<ApplicantJob> apps = this.list(appWrapper);
            for (ApplicantJob app : apps) {
                Map<String, Object> map = new HashMap<>();
                map.put("id", app.getId());
                map.put("jobId", app.getJobId());
                map.put("status", app.getStatus());
                map.put("applyTime", app.getAppliedAt());
                map.put("interviewTime", app.getUpdateTime()); // 简化处理
                // 岗位名称
                JobPosition job = jobPositionService.getById(app.getJobId());
                if (job != null) {
                    map.put("jobName", job.getPositionName());
                    map.put("department", job.getDepartment());
                } else {
                    map.put("jobName", "未知岗位");
                    map.put("department", "");
                }
                result.add(map);
            }
        }
        return result;
    }

    @Override
    public Map<String, Object> getApplicationDetail(Long applicationId) {
        Map<String, Object> result = new HashMap<>();
        ApplicantJob app = this.getById(applicationId);
        if (app == null) return null;

        result.put("applicationId", app.getId());
        result.put("status", app.getStatus());
        result.put("appliedAt", app.getAppliedAt());

        // 岗位信息
        JobPosition job = jobPositionService.getById(app.getJobId());
        if (job != null) {
            result.put("jobName", job.getPositionName());
            result.put("department", job.getDepartment());
            result.put("location", job.getLocation());
            result.put("salaryRange", job.getSalaryRange());
        }

        // 简历信息
        ResumeInfo resume = resumeInfoService.getById(app.getResumeId());
        if (resume != null) {
            result.put("name", resume.getName());
            result.put("phone", resume.getPhone());
            result.put("email", resume.getEmail());
            result.put("educationLevel", resume.getEducationLevel());
        }

        return result;
    }
}
