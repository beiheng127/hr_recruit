package com.hr.recruit.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.hr.recruit.entity.JobPosition;
import java.util.List;

public interface JobPositionService extends IService<JobPosition> {
    void publish(Long id);
    void close(Long id);
    List<JobPosition> listPublicJobs(String keyword, String department);
}
