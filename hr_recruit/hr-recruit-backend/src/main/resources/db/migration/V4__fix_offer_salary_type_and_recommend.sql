-- V4: 修改 offer_record.salary 字段类型以支持字符串薪资
ALTER TABLE offer_record MODIFY COLUMN salary VARCHAR(50) DEFAULT NULL COMMENT '薪资';

-- 给面试评价表添加 recommend 字段
ALTER TABLE interview_evaluation
    ADD COLUMN recommend VARCHAR(10) DEFAULT NULL COMMENT '是否推荐: yes/no/maybe'
    AFTER ai_summary;
