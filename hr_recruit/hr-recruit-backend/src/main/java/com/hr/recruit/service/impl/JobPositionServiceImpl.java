package com.hr.recruit.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.hr.recruit.common.BusinessException;
import com.hr.recruit.common.OperLog;
import com.hr.recruit.entity.JobPosition;
import com.hr.recruit.mapper.JobPositionMapper;
import com.hr.recruit.service.JobPositionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JobPositionServiceImpl extends ServiceImpl<JobPositionMapper, JobPosition> implements JobPositionService {

    @Override
    @OperLog(module = "POSITION", action = "PUBLISH", desc = "发布岗位")
    public void publish(Long id) {
        JobPosition job = this.getById(id);
        if (job == null) throw new BusinessException("岗位不存在");
        if (!"DRAFT".equals(job.getStatus())) throw new BusinessException("只有草稿状态可以发布");
        job.setStatus("PUBLISHED");
        this.updateById(job);
    }

    @Override
    @OperLog(module = "POSITION", action = "CLOSE", desc = "关闭岗位")
    public void close(Long id) {
        JobPosition job = this.getById(id);
        if (job == null) throw new BusinessException("岗位不存在");
        job.setStatus("CLOSED");
        this.updateById(job);
    }

    @Override
    public List<JobPosition> listPublicJobs(String keyword, String department) {
        LambdaQueryWrapper<JobPosition> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(JobPosition::getStatus, "PUBLISHED");
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.and(w -> w.like(JobPosition::getPositionName, keyword)
                    .or().like(JobPosition::getDepartment, keyword)
                    .or().like(JobPosition::getRequirement, keyword));
        }
        if (department != null && !department.isEmpty()) {
            wrapper.eq(JobPosition::getDepartment, department);
        }
        wrapper.orderByDesc(JobPosition::getCreateTime);
        return this.list(wrapper);
    }
}
