ALTER TABLE candidate_stage_record
    ADD COLUMN deleted TINYINT DEFAULT 0 COMMENT '逻辑删除(0-未删,1-已删)' AFTER handled_at;
