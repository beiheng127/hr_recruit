-- =====================================================
-- HR-Recruit 数据库初始化脚本 V1.0
-- 人力资源招聘管理系统 - 全部19张表
-- 字符集: utf8mb4  排序规则: utf8mb4_unicode_ci
-- =====================================================

-- -------------------------------------------
-- 1. 系统用户表
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS sys_user (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    username    VARCHAR(50)  NOT NULL COMMENT '用户名',
    password    VARCHAR(255) NOT NULL COMMENT '密码(BCrypt加密)',
    real_name   VARCHAR(50)  DEFAULT NULL COMMENT '真实姓名',
    phone       VARCHAR(20)  DEFAULT NULL COMMENT '手机号',
    email       VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
    role        VARCHAR(20)  NOT NULL DEFAULT 'HR' COMMENT '角色: ADMIN/HR/INTERVIEWER',
    status      TINYINT      NOT NULL DEFAULT 1 COMMENT '状态: 1启用/0禁用',
    create_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted     TINYINT      NOT NULL DEFAULT 0 COMMENT '逻辑删除: 0未删/1已删',
    UNIQUE KEY uk_username (username),
    INDEX idx_role (role),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统用户表';

-- -------------------------------------------
-- 2. 招聘岗位表
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS job_position (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    position_name   VARCHAR(100) NOT NULL COMMENT '岗位名称',
    department      VARCHAR(50)  NOT NULL COMMENT '所属部门',
    responsibility  TEXT         DEFAULT NULL COMMENT '岗位职责',
    requirement     TEXT         DEFAULT NULL COMMENT '任职要求',
    salary_range    VARCHAR(50)  DEFAULT NULL COMMENT '薪资范围',
    location        VARCHAR(100) DEFAULT NULL COMMENT '工作地点',
    headcount       INT          NOT NULL DEFAULT 1 COMMENT '招聘人数',
    status          VARCHAR(20)  NOT NULL DEFAULT 'DRAFT' COMMENT '状态: DRAFT/PUBLISHED/CLOSED',
    source_channel  VARCHAR(50)  DEFAULT NULL COMMENT '招聘渠道: BOSS/ZHIPIN/NEITUI/CAMPUS/OTHER',
    create_time     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted         TINYINT      NOT NULL DEFAULT 0,
    INDEX idx_department (department),
    INDEX idx_status (status),
    FULLTEXT INDEX ft_position (position_name, responsibility, requirement) WITH PARSER ngram
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='招聘岗位表';

-- -------------------------------------------
-- 3. 简历信息表
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS resume_info (
    id                 BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    name               VARCHAR(50)  DEFAULT NULL COMMENT '姓名',
    phone              VARCHAR(20)  DEFAULT NULL COMMENT '手机号',
    email              VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
    gender             VARCHAR(10)  DEFAULT NULL COMMENT '性别',
    age                INT          DEFAULT NULL COMMENT '年龄',
    current_company    VARCHAR(100) DEFAULT NULL COMMENT '当前公司',
    current_position   VARCHAR(100) DEFAULT NULL COMMENT '当前职位',
    work_years         INT          DEFAULT NULL COMMENT '工作年限',
    education_level    VARCHAR(20)  DEFAULT NULL COMMENT '学历',
    school_name        VARCHAR(100) DEFAULT NULL COMMENT '学校名称',
    major              VARCHAR(100) DEFAULT NULL COMMENT '专业',
    skill_tags         VARCHAR(500) DEFAULT NULL COMMENT '技能标签(逗号分隔)',
    self_evaluation    TEXT         DEFAULT NULL COMMENT '自我评价',
    match_score        INT          DEFAULT NULL COMMENT 'AI匹配分数(0-100)',
    talent_pool_status VARCHAR(20)  DEFAULT 'NORMAL' COMMENT '人才库状态: NORMAL/STANDBY/BLACKLIST',
    source_file_id     BIGINT       DEFAULT NULL COMMENT '来源简历文件ID',
    create_time        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted            TINYINT      NOT NULL DEFAULT 0,
    INDEX idx_talent_pool (talent_pool_status),
    INDEX idx_phone (phone),
    INDEX idx_email (email),
    FULLTEXT INDEX ft_resume (name, skill_tags, self_evaluation, current_position) WITH PARSER ngram
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='简历信息表';

-- -------------------------------------------
-- 4. 简历文件表
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS resume_file (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    file_name     VARCHAR(255) NOT NULL COMMENT '文件名',
    file_type     VARCHAR(10)  NOT NULL COMMENT '文件类型: PDF/DOCX',
    file_path     VARCHAR(500) NOT NULL COMMENT '存储路径',
    file_size     BIGINT       DEFAULT NULL COMMENT '文件大小(字节)',
    parse_status  TINYINT      NOT NULL DEFAULT 0 COMMENT '解析状态: 0未解析/1解析中/2已完成/3失败',
    parse_result  JSON         DEFAULT NULL COMMENT 'AI解析结果',
    upload_user_id BIGINT      DEFAULT NULL COMMENT '上传人ID',
    create_time   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted       TINYINT      NOT NULL DEFAULT 0,
    INDEX idx_parse_status (parse_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='简历文件表';

-- -------------------------------------------
-- 5. 教育经历表
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS education_exp (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    resume_id   BIGINT       NOT NULL COMMENT '简历ID',
    school_name VARCHAR(100) NOT NULL COMMENT '学校名称',
    major       VARCHAR(100) DEFAULT NULL COMMENT '专业',
    degree      VARCHAR(20)  DEFAULT NULL COMMENT '学位: 本科/硕士/博士/大专',
    start_date  DATE         DEFAULT NULL COMMENT '开始日期',
    end_date    DATE         DEFAULT NULL COMMENT '结束日期',
    description VARCHAR(500) DEFAULT NULL COMMENT '描述',
    create_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted     TINYINT      NOT NULL DEFAULT 0,
    INDEX idx_resume_id (resume_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='教育经历表';

-- -------------------------------------------
-- 6. 工作经历表
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS work_exp (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    resume_id    BIGINT       NOT NULL COMMENT '简历ID',
    company_name VARCHAR(100) NOT NULL COMMENT '公司名称',
    position     VARCHAR(100) DEFAULT NULL COMMENT '职位',
    department   VARCHAR(100) DEFAULT NULL COMMENT '部门',
    start_date   DATE         DEFAULT NULL COMMENT '开始日期',
    end_date     DATE         DEFAULT NULL COMMENT '结束日期',
    description  TEXT         DEFAULT NULL COMMENT '工作描述',
    achievements TEXT         DEFAULT NULL COMMENT '工作成果',
    create_time  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted      TINYINT      NOT NULL DEFAULT 0,
    INDEX idx_resume_id (resume_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工作经历表';

-- -------------------------------------------
-- 7. 应聘记录表 (核心状态表)
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS applicant_job (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    resume_id       BIGINT       NOT NULL COMMENT '简历ID',
    job_id          BIGINT       NOT NULL COMMENT '岗位ID',
    status          VARCHAR(20)  NOT NULL DEFAULT 'APPLIED' COMMENT '状态: APPLIED/SCREENED_PASS/SCREENED_FAIL/INTERVIEWING/OFFERED/HIRED/REJECTED/WITHDRAWN',
    source_channel  VARCHAR(50)  DEFAULT NULL COMMENT '投递渠道: BOSS/ZHIPIN/NEITUI/CAMPUS/OTHER',
    applied_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '投递时间',
    create_time     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted         TINYINT      NOT NULL DEFAULT 0,
    UNIQUE KEY uk_resume_job (resume_id, job_id),
    INDEX idx_job_status (job_id, status),
    INDEX idx_status (status),
    INDEX idx_source_channel (source_channel)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='应聘记录表';

-- -------------------------------------------
-- 8. 招聘流程配置表 (按岗位独立配置)
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS recruitment_pipeline (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    job_id        BIGINT       NOT NULL COMMENT '岗位ID',
    stage_order   INT          NOT NULL COMMENT '阶段顺序(1开始)',
    stage_name    VARCHAR(50)  NOT NULL COMMENT '阶段名称',
    stage_type    VARCHAR(20)  NOT NULL COMMENT '阶段类型: SCREEN/WRITTEN/INTERVIEW/OFFER/ONBOARD',
    is_required   TINYINT      NOT NULL DEFAULT 1 COMMENT '是否必选: 0否/1是',
    duration_days INT          DEFAULT 7 COMMENT '预计持续天数',
    create_time   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_job_order (job_id, stage_order),
    INDEX idx_job_id (job_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='招聘流程配置表';

-- -------------------------------------------
-- 9. 候选人阶段记录表
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS candidate_stage_record (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    application_id  BIGINT       NOT NULL COMMENT '应聘记录ID',
    pipeline_id     BIGINT       NOT NULL COMMENT '流程阶段ID',
    status          VARCHAR(20)  NOT NULL DEFAULT 'PENDING' COMMENT '状态: PENDING/PASS/FAIL/SKIP',
    result_note     VARCHAR(500) DEFAULT NULL COMMENT '结果备注',
    operator_id     BIGINT       DEFAULT NULL COMMENT '操作人ID',
    handled_at      DATETIME     DEFAULT NULL COMMENT '处理时间',
    create_time     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_application (application_id),
    INDEX idx_pipeline (pipeline_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='候选人阶段记录表';

-- -------------------------------------------
-- 10. 面试安排表
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS interview_arrangement (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    stage_record_id BIGINT       NOT NULL COMMENT '阶段记录ID',
    interview_time  DATETIME     DEFAULT NULL COMMENT '面试时间',
    location        VARCHAR(200) DEFAULT NULL COMMENT '面试地点/链接',
    round_num       INT          DEFAULT 1 COMMENT '第几轮',
    status          VARCHAR(20)  NOT NULL DEFAULT 'SCHEDULED' COMMENT '状态: SCHEDULED/ONGOING/COMPLETED/CANCELLED',
    create_time     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted         TINYINT      NOT NULL DEFAULT 0,
    INDEX idx_stage_record (stage_record_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='面试安排表';

-- -------------------------------------------
-- 11. 面试-面试官关联表
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS interview_interviewer (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    interview_id   BIGINT       NOT NULL COMMENT '面试安排ID',
    interviewer_id BIGINT       NOT NULL COMMENT '面试官(用户ID)',
    score          INT          DEFAULT NULL COMMENT '评分(0-100)',
    evaluation     TEXT         DEFAULT NULL COMMENT '评价内容',
    status         VARCHAR(20)  NOT NULL DEFAULT 'PENDING' COMMENT '状态: PENDING/SUBMITTED',
    create_time    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_interview_user (interview_id, interviewer_id),
    INDEX idx_interview_id (interview_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='面试-面试官关联表';

-- -------------------------------------------
-- 12. 录用通知表
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS offer_record (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    application_id  BIGINT        NOT NULL COMMENT '应聘记录ID',
    job_id          BIGINT        NOT NULL COMMENT '岗位ID',
    salary          DECIMAL(12,2) DEFAULT NULL COMMENT '薪资',
    position        VARCHAR(100)  DEFAULT NULL COMMENT '录用岗位',
    entry_date      DATE          DEFAULT NULL COMMENT '预计入职日期',
    offer_deadline  DATE          DEFAULT NULL COMMENT 'Offer截止日期',
    status          VARCHAR(20)   NOT NULL DEFAULT 'DRAFT' COMMENT '状态: DRAFT/SENT/ACCEPTED/REJECTED/EXPIRED',
    offer_letter_path VARCHAR(500) DEFAULT NULL COMMENT 'Offer文件路径',
    sent_at         DATETIME      DEFAULT NULL COMMENT '发送时间',
    create_time     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted         TINYINT       NOT NULL DEFAULT 0,
    INDEX idx_application (application_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='录用通知表';

-- -------------------------------------------
-- 13. 入职记录表
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS onboard_record (
    id                 BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    offer_id           BIGINT       NOT NULL COMMENT 'Offer ID',
    application_id     BIGINT       NOT NULL COMMENT '应聘记录ID',
    actual_entry_date  DATE         DEFAULT NULL COMMENT '实际入职日期',
    status             VARCHAR(20)  NOT NULL DEFAULT 'PENDING' COMMENT '状态: PENDING/IN_PROGRESS/COMPLETED',
    id_card_submitted  TINYINT      DEFAULT 0 COMMENT '身份证: 0未提交/1已提交',
    contract_submitted TINYINT      DEFAULT 0 COMMENT '合同: 0/1',
    medical_submitted  TINYINT      DEFAULT 0 COMMENT '体检报告: 0/1',
    diploma_submitted  TINYINT      DEFAULT 0 COMMENT '学历证书: 0/1',
    photo_submitted    TINYINT      DEFAULT 0 COMMENT '照片: 0/1',
    create_time        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted            TINYINT      NOT NULL DEFAULT 0,
    INDEX idx_offer (offer_id),
    INDEX idx_application (application_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='入职记录表';

-- -------------------------------------------
-- 14. 员工档案表
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS employee_archive (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    onboard_id  BIGINT       NOT NULL COMMENT '入职记录ID',
    user_id     BIGINT       DEFAULT NULL COMMENT '系统用户ID',
    employee_no VARCHAR(50)  DEFAULT NULL COMMENT '工号',
    name        VARCHAR(50)  NOT NULL COMMENT '姓名',
    phone       VARCHAR(20)  DEFAULT NULL COMMENT '手机号',
    email       VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
    department  VARCHAR(50)  DEFAULT NULL COMMENT '部门',
    position    VARCHAR(100) DEFAULT NULL COMMENT '岗位',
    entry_date  DATE         DEFAULT NULL COMMENT '入职日期',
    status      VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE' COMMENT '状态: ACTIVE/RESIGNED',
    create_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted     TINYINT      NOT NULL DEFAULT 0,
    INDEX idx_user_id (user_id),
    INDEX idx_department (department)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='员工档案表';

-- -------------------------------------------
-- 15. 通知表
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS notification (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    title         VARCHAR(200) NOT NULL COMMENT '通知标题',
    content       TEXT         NOT NULL COMMENT '通知内容',
    type          VARCHAR(20)  NOT NULL COMMENT '类型: SYSTEM/INTERVIEW/OFFER/ONBOARD',
    recipient_id  BIGINT       NOT NULL COMMENT '接收人ID',
    is_read       TINYINT      NOT NULL DEFAULT 0 COMMENT '是否已读: 0未读/1已读',
    related_type  VARCHAR(50)  DEFAULT NULL COMMENT '关联业务类型',
    related_id    BIGINT       DEFAULT NULL COMMENT '关联业务ID',
    create_time   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_recipient (recipient_id, is_read),
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知表';

-- -------------------------------------------
-- 16. 通知模板表
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS notification_template (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    template_name VARCHAR(100) NOT NULL COMMENT '模板名称',
    template_code VARCHAR(50)  NOT NULL COMMENT '模板编码(唯一)',
    type          VARCHAR(20)  NOT NULL COMMENT '类型: EMAIL/SYSTEM',
    title         VARCHAR(500) NOT NULL COMMENT '标题(支持占位符)',
    content       TEXT         NOT NULL COMMENT '内容(支持占位符: {name}/{position}等)',
    status        TINYINT      NOT NULL DEFAULT 1 COMMENT '状态: 1启用/0禁用',
    description   VARCHAR(500) DEFAULT NULL COMMENT '描述',
    create_time   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted       TINYINT      NOT NULL DEFAULT 0,
    UNIQUE KEY uk_code (template_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知模板表';

-- -------------------------------------------
-- 17. 操作日志表
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS operation_log (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    user_id         BIGINT       DEFAULT NULL COMMENT '操作人ID',
    username        VARCHAR(50)  DEFAULT NULL COMMENT '操作人用户名',
    module          VARCHAR(50)  NOT NULL COMMENT '操作模块: POSITION/RESUME/INTERVIEW/OFFER/ONBOARD',
    action          VARCHAR(50)  NOT NULL COMMENT '操作类型: CREATE/UPDATE/DELETE/PUBLISH/REVIEW',
    description     VARCHAR(500) DEFAULT NULL COMMENT '操作描述',
    ip_address      VARCHAR(50)  DEFAULT NULL COMMENT 'IP地址',
    request_method  VARCHAR(10)  DEFAULT NULL COMMENT '请求方法',
    request_uri     VARCHAR(200) DEFAULT NULL COMMENT '请求URI',
    request_params  TEXT         DEFAULT NULL COMMENT '请求参数(JSON)',
    cost_time       BIGINT       DEFAULT NULL COMMENT '耗时(ms)',
    create_time     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    INDEX idx_user_id (user_id),
    INDEX idx_module (module, action),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='操作日志表';

-- -------------------------------------------
-- 18. AI匹配记录表
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS ai_match_record (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    resume_id    BIGINT       NOT NULL COMMENT '简历ID',
    job_id       BIGINT       NOT NULL COMMENT '岗位ID',
    match_score  INT          NOT NULL COMMENT '匹配分数(0-100)',
    match_reason TEXT         DEFAULT NULL COMMENT '匹配理由摘要',
    match_detail JSON         DEFAULT NULL COMMENT '匹配详情(JSON)',
    create_time  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '匹配时间',
    INDEX idx_resume (resume_id),
    INDEX idx_job (job_id),
    INDEX idx_score (match_score DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI匹配记录表';

-- -------------------------------------------
-- 19. 面试评价汇总表 (面试评价摘要，AI汇总用)
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS interview_evaluation (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    interview_id    BIGINT       NOT NULL COMMENT '面试安排ID',
    application_id  BIGINT       NOT NULL COMMENT '应聘记录ID',
    interviewer_id  BIGINT       NOT NULL COMMENT '面试官ID',
    score           INT          DEFAULT NULL COMMENT '评分(0-100)',
    communication   INT          DEFAULT NULL COMMENT '沟通能力评分',
    technical       INT          DEFAULT NULL COMMENT '技术能力评分',
    teamwork        INT          DEFAULT NULL COMMENT '团队协作评分',
    learning        INT          DEFAULT NULL COMMENT '学习能力评分',
    evaluation      TEXT         DEFAULT NULL COMMENT '评价意见',
    ai_summary      TEXT         DEFAULT NULL COMMENT 'AI评价摘要',
    create_time     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted         TINYINT      NOT NULL DEFAULT 0,
    INDEX idx_interview (interview_id),
    INDEX idx_application (application_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='面试评价表';

-- =====================================================
-- 初始化数据
-- =====================================================

-- 默认管理员 (密码: admin123, BCrypt)
INSERT INTO sys_user (username, password, real_name, role, status) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5Eh', '系统管理员', 'ADMIN', 1)
ON DUPLICATE KEY UPDATE username=username;

-- 默认通知模板
INSERT INTO notification_template (template_name, template_code, type, title, content, description) VALUES
('面试通知', 'INTERVIEW_INVITE', 'EMAIL',
 '{name}同学您好，恭喜您通过{position}岗位的简历筛选！',
 '您好{name}：\n\n感谢您应聘{position}岗位。现通知您参加面试：\n\n面试时间：{interview_time}\n面试地点：{location}\n\n请携带个人简历及相关证件准时参加。\n\n如有疑问请联系HR。\n\n此致',
 '面试邀请邮件模板'),
('录用通知', 'OFFER_LETTER', 'EMAIL',
 '录用通知 - {position}',
 '您好{name}：\n\n经面试评估，您已被录用为{position}。\n\n薪资：{salary}\n入职日期：{entry_date}\n\n请在{deadline}前回复确认。\n\n欢迎加入！',
 'Offer录用通知模板'),
('面试结果通知', 'INTERVIEW_RESULT', 'SYSTEM',
 '面试结果通知',
 '{name}您好，您在{position}岗位的面试结果为：{result}。',
 '系统内部通知')
ON DUPLICATE KEY UPDATE template_code=template_code;
