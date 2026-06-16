-- V3: 给 recruitment_pipeline 表添加 deleted 列
-- RecruitmentPipeline 实体有 @TableLogic，但建表时遗漏了 deleted 列

ALTER TABLE recruitment_pipeline
    ADD COLUMN deleted TINYINT DEFAULT 0 COMMENT '逻辑删除(0-未删,1-已删)' AFTER duration_days;

-- 同步更新 candidate_stage_record 的状态注释，与代码状态机保持一致
ALTER TABLE candidate_stage_record
    MODIFY COLUMN status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
    COMMENT '状态: PENDING/IN_PROGRESS/COMPLETED/REJECTED';
