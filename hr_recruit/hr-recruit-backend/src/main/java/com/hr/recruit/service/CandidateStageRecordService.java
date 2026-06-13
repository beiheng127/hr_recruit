package com.hr.recruit.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.hr.recruit.entity.CandidateStageRecord;

public interface CandidateStageRecordService extends IService<CandidateStageRecord> {

    /**
     * 更新阶段状态（带状态机校验 + 自动流转）
     */
    void updateStageStatusWithAutoTransition(Long recordId, String newStatus, String note, Long applicationId);

    /**
     * 切换候选人到新阶段
     */
    CandidateStageRecord switchStage(Long applicationId, Long oldRecordId, Long targetPipelineId);
}
