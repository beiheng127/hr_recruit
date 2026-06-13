package com.hr.recruit.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.hr.recruit.entity.ApplicantJob;
import java.util.List;
import java.util.Map;

public interface ApplicantJobService extends IService<ApplicantJob> {
    /**
     * 根据邮箱或手机号查询申请列表（候选人门户用）
     */
    List<Map<String, Object>> listByEmailOrPhone(String keyword);

    /**
     * 获取申请详情（含岗位信息、面试安排、Offer信息）
     */
    Map<String, Object> getApplicationDetail(Long applicationId);
}
