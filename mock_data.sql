-- =====================================================
-- 人力资源招聘管理系统 - Mock测试数据
-- 基于真实互联网岗位和简历数据
-- 版本：V2.0（修复版）
-- =====================================================
--
-- 【重要】测试账号密码说明：
--   所有测试用户的密码均为：123456
--   Spring Security 会自动使用 BCrypt 加密，所以数据库中存储的是加密后的哈希值
--   如需修改密码，请在应用中调用 /api/auth/change-password 接口
--
-- 测试账号列表：
--   管理员  ：admin / 123456
--   HR专员 ：hr_zhang / 123456
--   HR专员 ：hr_li / 123456
--   部门经理：manager_wang / 123456
--   部门经理：manager_chen / 123456
--

USE hr_recruit;

-- 设置字符集，确保中文正确插入
SET NAMES utf8mb4;

SET FOREIGN_KEY_CHECKS = 0;

-- 先删除现有测试数据（保留初始管理员）
DELETE FROM operation_log;
DELETE FROM notification;
DELETE FROM offer_record;
DELETE FROM interview_interviewer;
DELETE FROM interview_arrangement;
DELETE FROM candidate_stage_record;
DELETE FROM applicant_job;
DELETE FROM recruitment_pipeline;
DELETE FROM resume_file;
DELETE FROM work_exp;
DELETE FROM education_exp;
DELETE FROM resume_info;
DELETE FROM job_position;
-- 删除已存在的测试用户（保留admin id=1）
DELETE FROM sys_user WHERE id IN (2, 3, 4, 5);

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 1. 用户数据（HR专员、部门经理）
-- =====================================================

-- 密码说明：所有测试用户密码均为 123456
-- BCrypt哈希值（成本因子10，使用$2b$前缀，Spring Security兼容）
INSERT INTO sys_user (id, username, password, real_name, phone, email, role, status, create_time, update_time) VALUES
(2, 'hr_zhang', '$2b$10$PdouXGRVh3N3JzWkSK1Xl.J.GDveNStb1RWICfADPhF5sq2yGP7AS', '张雅琴', '13800138001', 'zhangyaqin@company.com', 'HR', 1, NOW(), NOW()),
(3, 'hr_li', '$2b$10$PdouXGRVh3N3JzWkSK1Xl.J.GDveNStb1RWICfADPhF5sq2yGP7AS', '李伟', '13800138002', 'liwei@company.com', 'HR', 1, NOW(), NOW()),
(4, 'manager_wang', '$2b$10$PdouXGRVh3N3JzWkSK1Xl.J.GDveNStb1RWICfADPhF5sq2yGP7AS', '王建国', '13800138003', 'wangjianguo@company.com', 'MANAGER', 1, NOW(), NOW()),
(5, 'manager_chen', '$2b$10$PdouXGRVh3N3JzWkSK1Xl.J.GDveNStb1RWICfADPhF5sq2yGP7AS', '陈丽华', '13800138004', 'chenlihua@company.com', 'MANAGER', 1, NOW(), NOW());

-- =====================================================
-- 2. 岗位数据（基于真实互联网岗位）
-- 字段：id, position_name, department, responsibility, requirement, salary_range, location, headcount, status, source_channel, create_time, update_time, deleted
-- =====================================================

INSERT INTO job_position (id, position_name, department, responsibility, requirement, salary_range, location, headcount, status, source_channel, create_time, update_time, deleted) VALUES
(1, '高级Java开发工程师', '技术研发中心',
'1. 负责公司核心业务系统的设计与开发\n2. 参与系统架构设计和技术方案评审\n3. 指导初中级工程师，提升团队技术水平\n4. 优化系统性能，保证高并发场景下的稳定性\n5. 参与代码review，确保代码质量',
'1. 本科及以上学历，计算机相关专业\n2. 5年以上Java开发经验，熟悉Spring Boot、Spring Cloud\n3. 熟悉MySQL、Redis、MQ等中间件\n4. 有高并发、分布式系统开发经验\n5. 具备良好的沟通能力和团队协作精神',
'25k-40k', '北京·海淀区', 3, 'PUBLISHED', 'BOSS直聘', NOW(), NOW(), 0),

(2, '前端开发工程师（React/Vue）', '技术研发中心',
'1. 负责公司Web端产品的前端开发\n2. 参与前端架构设计和技术选型\n3. 优化前端性能，提升用户体验\n4. 与后端工程师协作，完成接口对接\n5. 编写技术文档和开发规范',
'1. 本科及以上学历，3年以上前端开发经验\n2. 精通React或Vue框架，熟悉TypeScript\n3. 熟悉Webpack、Vite等构建工具\n4. 了解Node.js，有全栈开发经验者优先\n5. 有良好的代码风格和文档习惯',
'18k-28k', '北京·海淀区', 2, 'PUBLISHED', 'BOSS直聘', NOW(), NOW(), 0),

(3, 'AI算法工程师（NLP方向）', '人工智能实验室',
'1. 负责公司AI产品的算法研发\n2. 参与大语言模型的微调与应用\n3. 优化现有NLP模型的效果和性能\n4. 跟踪学术界最新进展，探索新技术落地\n5. 撰写技术文档和专利',
'1. 硕士及以上学历，NLP、机器学习相关专业\n2. 熟悉PyTorch/TensorFlow，有实际项目经验\n3. 了解Transformer、BERT、GPT等模型原理\n4. 有LLM微调、RAG系统开发经验者优先\n5. 在顶会（ACL/EMNLP/NeurIPS）发表过论文者优先',
'30k-50k', '北京·海淀区', 2, 'PUBLISHED', '拉勾网', NOW(), NOW(), 0),

(4, '测试开发工程师', '质量保障部',
'1. 负责公司产品的自动化测试框架开发\n2. 参与测试用例设计和执行\n3. 搭建CI/CD流水线，提升测试效率\n4. 定位和跟踪缺陷，确保产品质量\n5. 编写测试文档和报告',
'1. 本科及以上学历，3年以上测试开发经验\n2. 熟悉Java/Python，有自动化测试框架开发经验\n3. 熟悉Selenium、Appium、JMeter等测试工具\n4. 了解Docker、K8s，有DevOps经验者优先\n5. 有良好的问题分析和解决能力',
'18k-28k', '北京·海淀区', 2, 'PUBLISHED', '智联招聘', NOW(), NOW(), 0),

(5, '高级产品经理', '产品部',
'1. 负责公司核心产品的规划和设计\n2. 进行市场调研和竞品分析\n3. 撰写产品需求文档（PRD）和原型设计\n4. 协调研发、设计、测试团队，推动产品落地\n5. 跟踪产品数据，持续优化产品体验',
'1. 本科及以上学历，5年以上产品经理经验\n2. 有B端产品或SaaS产品经验者优先\n3. 熟练使用Axure、Figma等工具\n4. 具备优秀的需求分析、逻辑思维和沟通能力\n5. 有成功产品案例者优先',
'25k-40k', '北京·朝阳区', 1, 'PUBLISHED', '拉勾网', NOW(), NOW(), 0),

(6, 'UI/UX设计师', '设计部',
'1. 负责公司产品的视觉设计和交互设计\n2. 参与设计规范和组件库建设\n3. 与产品、前端工程师协作，确保设计还原度\n4. 跟踪设计趋势，持续优化用户体验\n5. 参与品牌形象设计',
'1. 本科及以上学历，设计相关专业\n2. 3年以上UI/UX设计经验\n3. 熟练使用Figma、Sketch、Adobe系列工具\n4. 有B端产品设计经验者优先\n5. 有良好的审美和创意能力，能承受工作压力',
'18k-28k', '北京·朝阳区', 1, 'PUBLISHED', '站酷', NOW(), NOW(), 0),

(7, '数据分析师', '运营部',
'1. 负责公司业务数据的收集、清洗和分析\n2. 搭建数据报表和可视化看板\n3. 进行用户行为分析，为业务决策提供支持\n4. 参与AB测试设计和效果评估\n5. 撰写数据分析报告',
'1. 本科及以上学历，统计、数学、计算机相关专业\n2. 熟悉SQL，有Python/R编程经验\n3. 熟悉Tableau、Power BI等可视化工具\n4. 了解常用的数据分析方法和模型\n5. 有良好的数据敏感度和逻辑思维能力',
'20k-30k', '北京·海淀区', 1, 'PUBLISHED', '智联招聘', NOW(), NOW(), 0),

(8, '市场营销专员', '市场部',
'1. 负责公司产品的市场推广和品牌建设\n2. 策划和执行线上线下营销活动\n3. 管理社交媒体账号，提升品牌影响力\n4. 进行市场调研，分析竞品动态\n5. 撰写营销文案和新闻稿',
'1. 本科及以上学历，市场营销相关专业\n2. 2年以上市场营销经验\n3. 熟悉新媒体运营，有成功案例者优先\n4. 优秀的文案撰写能力和创意能力\n5. 有良好的沟通能力和团队协作精神',
'15k-25k', '北京·朝阳区', 2, 'DRAFT', 'BOSS直聘', NOW(), NOW(), 0);

-- =====================================================
-- 3. 简历数据（基于真实简历）
-- 字段：id, name, phone, email, gender, age, current_company, current_position, work_years, education_level, school_name, major, skill_tags, self_evaluation, match_score, talent_pool_status, source_file_id, create_time, update_time, deleted
-- =====================================================

INSERT INTO resume_info (id, name, phone, email, gender, age, current_company, current_position, work_years, education_level, school_name, major, skill_tags, self_evaluation, match_score, talent_pool_status, source_file_id, create_time, update_time, deleted) VALUES
(1, '刘明辉', '13900139001', 'liuminghui@email.com', '男', 30, '某互联网大厂', '高级Java开发工程师', 6, '硕士', '清华大学', '计算机科学与技术',
'Java,Spring Boot,Spring Cloud,MySQL,Redis,RabbitMQ,Dubbo,微服务,分布式系统',
'6年Java开发经验，曾就职于某互联网大厂，参与过日活千万级系统的架构设计。熟悉微服务架构，有丰富的性能优化经验。', 92, 'INTERVIEW', NULL, NOW(), NOW(), 0),

(2, '张伟', '13900139002', 'zhangwei@email.com', '男', 27, '某软件公司', 'Java开发工程师', 4, '本科', '北京邮电大学', '软件工程',
'Java,Spring Boot,MyBatis,MySQL,Redis,Spring Cloud',
'4年Java开发经验，熟悉Spring生态，有电商系统开发经验。学习能力强，对新技术保持热情。', 85, 'TALENT', NULL, NOW(), NOW(), 0),

(3, '王芳', '13900139003', 'wangfang@email.com', '女', 26, '某AI创业公司', '算法工程师', 3, '硕士', '中国科学院大学', '计算机软件与理论',
'Java,Python,Spring Boot,MySQL,PostgreSQL,机器学习',
'3年开发经验，硕士期间研究方向为推荐系统。有算法和工程双重背景，适合AI相关岗位。', 78, 'TALENT', NULL, NOW(), NOW(), 0),

(4, '陈志强', '13900139004', 'chenzhiqiang@email.com', '男', 30, '某SaaS公司', '高级前端工程师', 6, '本科', '浙江大学', '计算机科学与技术',
'React,Vue,TypeScript,Webpack,Node.js,微信小程序',
'6年前端开发经验，精通React和Vue框架。有大型SaaS产品前端架构经验，熟悉性能优化。', 90, 'INTERVIEW', NULL, NOW(), NOW(), 0),

(5, '杨雪', '13900139005', 'yangxue@email.com', '女', 25, '某互联网公司', '前端开发工程师', 3, '本科', '华中科技大学', '软件工程',
'Vue,React,JavaScript,TypeScript,CSS3,HTML5,Element Plus',
'3年前端开发经验，熟悉Vue生态。有响应式设计和移动端适配经验，注重用户体验。', 82, 'TALENT', NULL, NOW(), NOW(), 0),

(6, '赵宇航', '13900139006', 'zhaoyuhang@email.com', '男', 27, '某AI实验室', '研究实习生', 2, '博士', '北京大学', '自然语言处理',
'Python,PyTorch,Transformer,BERT,GPT,RAG,向量数据库',
'北京大学NLP方向博士，研究方向为大语言模型微调。在ACL、EMNLP发表过2篇论文。有RAG系统开发经验。', 95, 'INTERVIEW', NULL, NOW(), NOW(), 0),

(7, '黄海涛', '13900139007', 'huanghaitao@email.com', '男', 28, '某AI公司', '算法工程师', 3, '硕士', '中国科学技术大学', '人工智能',
'Python,TensorFlow,PyTorch,Scikit-learn,数据分析,机器学习',
'3年AI算法经验，硕士期间研究方向为计算机视觉。在某AI公司工作过，参与过多个落地项目。', 80, 'TALENT', NULL, NOW(), NOW(), 0),

(8, '周婷婷', '13900139008', 'zhoutingting@email.com', '女', 28, '某互联网公司', '测试开发工程师', 5, '本科', '西安电子科技大学', '软件工程',
'Java,Python,Selenium,Appium,JMeter,TestNG,Docker',
'5年测试开发经验，熟悉自动化测试框架。在某互联网公司负责过核心业务的质量保障。', 88, 'TALENT', NULL, NOW(), NOW(), 0),

(9, '吴磊', '13900139009', 'wulei@email.com', '男', 26, '某软件公司', '测试工程师', 4, '本科', '东南大学', '计算机科学与技术',
'Python,Selenium,Postman,MySQL,Linux,Shell',
'4年测试经验，有性能和功能测试经验。熟悉CI/CD流程，有DevOps实践经验。', 72, 'PENDING', NULL, NOW(), NOW(), 0),

(10, '林晓燕', '13900139010', 'linxiaoyan@email.com', '女', 29, '某SaaS公司', '高级产品经理', 5, '硕士', '复旦大学', '管理科学与工程',
'产品规划,需求分析,原型设计,数据分析,项目管理,Axure,Figma',
'5年B端产品经理经验，曾负责过企业SaaS产品的全生命周期管理。有敏锐的用户洞察力和数据思维。', 93, 'INTERVIEW', NULL, NOW(), NOW(), 0),

(11, '郑凯', '13900139011', 'zhengkai@email.com', '男', 30, '某互联网公司', '产品经理', 6, '本科', '同济大学', '工业设计',
'产品策划,用户研究,交互设计,数据分析,Axure,Sketch',
'6年产品经验，从C端转B端。有丰富的用户研究和数据分析经验，擅长挖掘用户需求。', 84, 'TALENT', NULL, NOW(), NOW(), 0),

(12, '孙艺萌', '13900139012', 'sunyimeng@email.com', '女', 26, '某互联网公司', 'UI/UX设计师', 4, '本科', '中央美术学院', '视觉传达设计',
'Figma,Sketch,Adobe Photoshop,Adobe Illustrator,Principle,用户研究,交互设计',
'4年UI/UX设计经验，有B端和C端产品设计经验。设计作品曾获红点设计奖。注重用户体验和视觉细节。', 91, 'INTERVIEW', NULL, NOW(), NOW(), 0),

(13, '马超', '13900139013', 'machao@email.com', '男', 25, '某设计公司', 'UI设计师', 3, '本科', '鲁迅美术学院', '数字媒体艺术',
'Figma,Adobe XD,Sketch,After Effects,动效设计,界面设计',
'3年设计经验，擅长界面设计和动效设计。有强烈的审美意识和创意能力，能快速输出高质量设计稿。', 79, 'TALENT', NULL, NOW(), NOW(), 0),

(14, '朱文斌', '13900139014', 'zhuwenbin@email.com', '男', 27, '某互联网公司', '数据分析师', 3, '硕士', '中国人民大学', '统计学',
'SQL,Python,R,Tableau,Power BI,Excel,SPSS,数据分析',
'3年数据分析经验，熟悉常用的统计分析方法和机器学习模型。有互联网和金融行业数据分析经验。', 86, 'INTERVIEW', NULL, NOW(), NOW(), 0),

(15, '何静', '13900139015', 'hejing@email.com', '女', 27, '某电商公司', '数据分析师', 4, '本科', '上海财经大学', '信息管理与信息系统',
'SQL,Excel,Tableau,Python,数据分析,业务分析,数据可视化',
'4年数据分析经验，熟悉业务数据分析。有电商和零售行业经验，擅长数据可视化和报告撰写。', 81, 'TALENT', NULL, NOW(), NOW(), 0),

(16, '罗天宇', '13900139016', 'luotianyu@email.com', '男', 25, '某传媒公司', '市场营销专员', 3, '本科', '中国传媒大学', '市场营销',
'市场营销,新媒体运营,文案策划,数据分析,Photoshop,视频剪辑',
'3年市场营销经验，熟悉新媒体运营。有成功的新媒体营销案例，擅长文案策划和用户增长。', 70, 'PENDING', NULL, NOW(), NOW(), 0),

(17, '梁思琪', '13900139017', 'liangsiqi@email.com', '女', 24, '某广告公司', '品牌策划专员', 2, '本科', '暨南大学', '广告学',
'市场营销,品牌策划,新媒体运营,文案撰写,Photoshop,Illustrator',
'2年市场营销经验，有品牌策划和新媒体运营经验。创意能力强，有良好的文案撰写能力。', 68, 'PENDING', NULL, NOW(), NOW(), 0);

-- =====================================================
-- 4. 教育经历
-- 字段：id, resume_id, school_name, major, degree, start_date, end_date, description, create_time, update_time, deleted
-- =====================================================

INSERT INTO education_exp (id, resume_id, school_name, major, degree, start_date, end_date, description, create_time, update_time, deleted) VALUES
(1, 1, '清华大学', '计算机科学与技术', '硕士', '2017-09-01', '2019-07-01', NULL, NOW(), NOW(), 0),
(2, 1, '北京理工大学', '计算机科学与技术', '本科', '2013-09-01', '2017-07-01', NULL, NOW(), NOW(), 0),
(3, 2, '北京邮电大学', '软件工程', '本科', '2016-09-01', '2020-07-01', NULL, NOW(), NOW(), 0),
(4, 3, '中国科学院大学', '计算机软件与理论', '硕士', '2018-09-01', '2021-07-01', NULL, NOW(), NOW(), 0),
(5, 3, '山东大学', '计算机科学与技术', '本科', '2014-09-01', '2018-07-01', NULL, NOW(), NOW(), 0),
(6, 4, '浙江大学', '计算机科学与技术', '本科', '2014-09-01', '2018-07-01', NULL, NOW(), NOW(), 0),
(7, 5, '华中科技大学', '软件工程', '本科', '2017-09-01', '2021-07-01', NULL, NOW(), NOW(), 0),
(8, 6, '北京大学', '自然语言处理', '博士', '2018-09-01', '2023-07-01', NULL, NOW(), NOW(), 0),
(9, 6, '北京大学', '计算机科学与技术', '硕士', '2016-09-01', '2018-07-01', NULL, NOW(), NOW(), 0),
(10, 7, '中国科学技术大学', '人工智能', '硕士', '2019-09-01', '2022-07-01', NULL, NOW(), NOW(), 0),
(11, 7, '合肥工业大学', '计算机科学与技术', '本科', '2015-09-01', '2019-07-01', NULL, NOW(), NOW(), 0),
(12, 8, '西安电子科技大学', '软件工程', '本科', '2015-09-01', '2019-07-01', NULL, NOW(), NOW(), 0),
(13, 9, '东南大学', '计算机科学与技术', '本科', '2016-09-01', '2020-07-01', NULL, NOW(), NOW(), 0),
(14, 10, '复旦大学', '管理科学与工程', '硕士', '2018-09-01', '2020-07-01', NULL, NOW(), NOW(), 0),
(15, 10, '华东师范大学', '信息管理与信息系统', '本科', '2014-09-01', '2018-07-01', NULL, NOW(), NOW(), 0),
(16, 11, '同济大学', '工业设计', '本科', '2015-09-01', '2019-07-01', NULL, NOW(), NOW(), 0),
(17, 12, '中央美术学院', '视觉传达设计', '本科', '2016-09-01', '2020-07-01', NULL, NOW(), NOW(), 0),
(18, 13, '鲁迅美术学院', '数字媒体艺术', '本科', '2017-09-01', '2021-07-01', NULL, NOW(), NOW(), 0),
(19, 14, '中国人民大学', '统计学', '硕士', '2018-09-01', '2021-07-01', NULL, NOW(), NOW(), 0),
(20, 14, '北京交通大学', '统计学', '本科', '2014-09-01', '2018-07-01', NULL, NOW(), NOW(), 0),
(21, 15, '上海财经大学', '信息管理与信息系统', '本科', '2016-09-01', '2020-07-01', NULL, NOW(), NOW(), 0),
(22, 16, '中国传媒大学', '市场营销', '本科', '2017-09-01', '2021-07-01', NULL, NOW(), NOW(), 0),
(23, 17, '暨南大学', '广告学', '本科', '2018-09-01', '2022-07-01', NULL, NOW(), NOW(), 0);

-- =====================================================
-- 5. 工作经历
-- 字段：id, resume_id, company_name, position, department, start_date, end_date, description, achievements, create_time, update_time, deleted
-- =====================================================

INSERT INTO work_exp (id, resume_id, company_name, position, department, start_date, end_date, description, achievements, create_time, update_time, deleted) VALUES
(1, 1, '某互联网大厂', '高级Java开发工程师', '技术研发中心', '2021-03-01', NULL, '负责核心交易系统的架构设计和开发，日处理订单量千万级。', '主导微服务架构升级，将系统响应时间降低40%', NOW(), NOW(), 0),
(2, 1, '某知名互联网公司', 'Java开发工程师', '后端开发部', '2019-07-01', '2021-03-01', '参与电商平台的后端开发，负责订单中心和支付模块的设计与实现。', NULL, NOW(), NOW(), 0),
(3, 2, '某软件公司', 'Java开发工程师', '研发部', '2020-07-01', NULL, '负责公司核心业务系统的开发和维护，使用Spring Boot + MyBatis技术栈。', NULL, NOW(), NOW(), 0),
(4, 3, '某AI创业公司', '算法工程师', 'AI研发部', '2021-07-01', NULL, '负责推荐系统的算法研发和优化，使用深度学习模型提升推荐准确率15%。', '推荐准确率提升15%', NOW(), NOW(), 0),
(5, 4, '某SaaS公司', '高级前端工程师', '前端开发部', '2018-07-01', NULL, '负责公司核心产品的前端架构设计，使用React + TypeScript技术栈。', '主导前端性能优化，页面加载速度提升50%', NOW(), NOW(), 0),
(6, 5, '某互联网公司', '前端开发工程师', '前端开发部', '2021-07-01', NULL, '负责公司管理后台的前端开发，使用Vue 3 + Element Plus技术栈。', NULL, NOW(), NOW(), 0),
(7, 6, '某AI实验室', '研究实习生', 'NLP研究组', '2022-07-01', '2023-07-01', '参与大语言模型微调项目，发表ACL论文一篇。', '发表ACL论文一篇', NOW(), NOW(), 0),
(8, 7, '某AI公司', '算法工程师', '算法研发部', '2022-07-01', NULL, '参与计算机视觉项目的算法研发，负责目标检测和图像分类模型训练。', NULL, NOW(), NOW(), 0),
(9, 8, '某互联网公司', '测试开发工程师', '质量保障部', '2019-07-01', NULL, '负责公司核心业务的质量保障，搭建自动化测试框架，测试效率提升60%。', '搭建自动化测试框架，测试效率提升60%', NOW(), NOW(), 0),
(10, 9, '某软件公司', '测试工程师', '测试部', '2020-07-01', NULL, '负责公司产品的功能和性能测试，熟悉测试流程和缺陷管理。', NULL, NOW(), NOW(), 0),
(11, 10, '某SaaS公司', '高级产品经理', '产品部', '2020-07-01', NULL, '负责企业CRM产品的全生命周期管理，产品月活增长200%。', '产品月活增长200%', NOW(), NOW(), 0),
(12, 10, '某互联网公司', '产品经理', '产品部', '2019-07-01', '2020-07-01', '负责用户增长产品的需求分析和产品设计，通过数据驱动产品迭代。', NULL, NOW(), NOW(), 0),
(13, 11, '某互联网公司', '产品经理', '产品部', '2019-07-01', NULL, '负责C端产品的策划和设计，有成功的用户增长案例。', NULL, NOW(), NOW(), 0),
(14, 12, '某互联网公司', 'UI/UX设计师', '设计部', '2020-07-01', NULL, '负责公司B端和C端产品的视觉设计和交互设计，设计作品获红点设计奖。', '设计作品获红点设计奖', NOW(), NOW(), 0),
(15, 13, '某设计公司', 'UI设计师', '设计部', '2021-07-01', NULL, '负责客户项目的界面设计和动效设计，有丰富的设计经验。', NULL, NOW(), NOW(), 0),
(16, 14, '某互联网公司', '数据分析师', '数据分析部', '2021-07-01', NULL, '负责公司业务数据分析，搭建数据报表和可视化看板，为业务决策提供支持。', NULL, NOW(), NOW(), 0),
(17, 15, '某电商公司', '数据分析师', '数据分析部', '2020-07-01', NULL, '负责电商数据的收集、清洗和分析，进行用户行为分析和销售预测。', NULL, NOW(), NOW(), 0),
(18, 16, '某传媒公司', '市场营销专员', '市场部', '2021-07-01', NULL, '负责公司新媒体账号的运营和内容策划，粉丝增长100%。', '粉丝增长100%', NOW(), NOW(), 0),
(19, 17, '某广告公司', '品牌策划专员', '品牌部', '2022-07-01', NULL, '负责客户品牌的策划和推广，有成功的品牌策划案例。', NULL, NOW(), NOW(), 0);

-- =====================================================
-- 6. 简历文件
-- 字段：id, file_name, file_type, file_path, file_size, parse_status, parse_result, upload_user_id, create_time, update_time, deleted
-- =====================================================

INSERT INTO resume_file (id, file_name, file_type, file_path, file_size, parse_status, parse_result, upload_user_id, create_time, update_time, deleted) VALUES
(1, '刘明辉_高级Java开发工程师.pdf', 'pdf', 'C:/uploads/resume/liuminghui.pdf', 524288, 1, NULL, 2, NOW(), NOW(), 0),
(2, '张伟_Java开发工程师.pdf', 'pdf', 'C:/uploads/resume/zhangwei.pdf', 467456, 1, NULL, 2, NOW(), NOW(), 0),
(3, '王芳_算法工程师.pdf', 'pdf', 'C:/uploads/resume/wangfang.pdf', 500736, 1, NULL, 2, NOW(), NOW(), 0),
(4, '陈志强_前端开发工程师.pdf', 'pdf', 'C:/uploads/resume/chenzhiqiang.pdf', 535552, 1, NULL, 2, NOW(), NOW(), 0),
(5, '杨雪_前端开发工程师.pdf', 'pdf', 'C:/uploads/resume/yangxue.pdf', 431104, 1, NULL, 2, NOW(), NOW(), 0),
(6, '赵宇航_AI算法工程师.pdf', 'pdf', 'C:/uploads/resume/zhaoyuhang.pdf', 580608, 1, NULL, 2, NOW(), NOW(), 0),
(7, '黄海涛_算法工程师.pdf', 'pdf', 'C:/uploads/resume/huanghaitao.pdf', 455680, 1, NULL, 2, NOW(), NOW(), 0),
(8, '周婷婷_测试开发工程师.pdf', 'pdf', 'C:/uploads/resume/zhoutingting.pdf', 509952, 1, NULL, 2, NOW(), NOW(), 0),
(9, '吴磊_测试工程师.pdf', 'pdf', 'C:/uploads/resume/wulei.pdf', 396288, 0, NULL, 2, NOW(), NOW(), 0),
(10, '林晓燕_产品经理.pdf', 'pdf', 'C:/uploads/resume/linxiaoyan.pdf', 546816, 1, NULL, 2, NOW(), NOW(), 0),
(11, '郑凯_产品经理.pdf', 'pdf', 'C:/uploads/resume/zhengkai.pdf', 487424, 1, NULL, 2, NOW(), NOW(), 0),
(12, '孙艺萌_UI设计师.pdf', 'pdf', 'C:/uploads/resume/sunyimeng.pdf', 626688, 1, NULL, 2, NOW(), NOW(), 0),
(13, '马超_UI设计师.pdf', 'pdf', 'C:/uploads/resume/machao.pdf', 521216, 1, NULL, 2, NOW(), NOW(), 0),
(14, '朱文斌_数据分析师.pdf', 'pdf', 'C:/uploads/resume/zhuwenbin.pdf', 476160, 1, NULL, 2, NOW(), NOW(), 0),
(15, '何静_数据分析师.pdf', 'pdf', 'C:/uploads/resume/hejing.pdf', 442368, 1, NULL, 2, NOW(), NOW(), 0),
(16, '罗天宇_市场营销.pdf', 'pdf', 'C:/uploads/resume/luotianyu.pdf', 407552, 0, NULL, 2, NOW(), NOW(), 0),
(17, '梁思琪_市场营销.pdf', 'pdf', 'C:/uploads/resume/liangsiqi.pdf', 419840, 0, NULL, 2, NOW(), NOW(), 0);

-- =====================================================
-- 7. 应聘记录
-- 字段：id, resume_id, job_id, status, source_channel, applied_at, create_time, update_time, deleted
-- =====================================================

INSERT INTO applicant_job (id, resume_id, job_id, status, source_channel, applied_at, create_time, update_time, deleted) VALUES
(1, 1, 1, 'OFFER_SENT', 'BOSS直聘', NOW() - INTERVAL 30 DAY, NOW(), NOW(), 0),
(2, 2, 1, 'INTERVIEW_2', '智联招聘', NOW() - INTERVAL 20 DAY, NOW(), NOW(), 0),
(3, 3, 1, 'SCREENING', '拉勾网', NOW() - INTERVAL 5 DAY, NOW(), NOW(), 0),
(4, 4, 2, 'OFFER_SENT', 'BOSS直聘', NOW() - INTERVAL 25 DAY, NOW(), NOW(), 0),
(5, 5, 2, 'INTERVIEW_1', '智联招聘', NOW() - INTERVAL 10 DAY, NOW(), NOW(), 0),
(6, 6, 3, 'INTERVIEW_2', '学术招聘', NOW() - INTERVAL 15 DAY, NOW(), NOW(), 0),
(7, 7, 3, 'SCREENING', '拉勾网', NOW() - INTERVAL 7 DAY, NOW(), NOW(), 0),
(8, 8, 4, 'INTERVIEW_1', 'BOSS直聘', NOW() - INTERVAL 12 DAY, NOW(), NOW(), 0),
(9, 9, 4, 'PENDING', '智联招聘', NOW() - INTERVAL 3 DAY, NOW(), NOW(), 0),
(10, 10, 5, 'OFFER_SENT', '拉勾网', NOW() - INTERVAL 28 DAY, NOW(), NOW(), 0),
(11, 11, 5, 'INTERVIEW_1', 'BOSS直聘', NOW() - INTERVAL 14 DAY, NOW(), NOW(), 0),
(12, 12, 6, 'INTERVIEW_2', '站酷', NOW() - INTERVAL 18 DAY, NOW(), NOW(), 0),
(13, 13, 6, 'SCREENING', '站酷', NOW() - INTERVAL 6 DAY, NOW(), NOW(), 0),
(14, 14, 7, 'INTERVIEW_1', '智联招聘', NOW() - INTERVAL 10 DAY, NOW(), NOW(), 0),
(15, 15, 7, 'PENDING', '拉勾网', NOW() - INTERVAL 4 DAY, NOW(), NOW(), 0),
(16, 16, 8, 'PENDING', 'BOSS直聘', NOW() - INTERVAL 2 DAY, NOW(), NOW(), 0),
(17, 17, 8, 'PENDING', '智联招聘', NOW() - INTERVAL 1 DAY, NOW(), NOW(), 0);

-- =====================================================
-- 8. 招聘管道配置
-- 字段：id, job_id, stage_order, stage_name, stage_type, is_required, duration_days, create_time, update_time, deleted
-- =====================================================

INSERT INTO recruitment_pipeline (id, job_id, stage_order, stage_name, stage_type, is_required, duration_days, create_time, update_time) VALUES
(1, 1, 1, '简历初筛', 'SCREENING', 1, 3, NOW(), NOW()),
(2, 1, 2, '技术笔试', 'TEST', 1, 5, NOW(), NOW()),
(3, 1, 3, '技术一面', 'INTERVIEW', 1, 3, NOW(), NOW()),
(4, 1, 4, '技术二面', 'INTERVIEW', 1, 3, NOW(), NOW()),
(5, 1, 5, 'HR面试', 'INTERVIEW', 1, 2, NOW(), NOW()),
(6, 1, 6, 'Offer发放', 'OFFER', 1, 7, NOW(), NOW()),
(7, 2, 1, '简历初筛', 'SCREENING', 1, 3, NOW(), NOW()),
(8, 2, 2, '技术面试', 'INTERVIEW', 1, 3, NOW(), NOW()),
(9, 2, 3, 'HR面试', 'INTERVIEW', 1, 2, NOW(), NOW()),
(10, 2, 4, 'Offer发放', 'OFFER', 1, 7, NOW(), NOW()),
(11, 3, 1, '简历初筛', 'SCREENING', 1, 3, NOW(), NOW()),
(12, 3, 2, '算法笔试', 'TEST', 1, 5, NOW(), NOW()),
(13, 3, 3, '技术面试', 'INTERVIEW', 1, 3, NOW(), NOW()),
(14, 3, 4, '专家复试', 'INTERVIEW', 1, 3, NOW(), NOW()),
(15, 3, 5, 'HR面试', 'INTERVIEW', 1, 2, NOW(), NOW()),
(16, 3, 6, 'Offer发放', 'OFFER', 1, 7, NOW(), NOW()),
(17, 5, 1, '简历初筛', 'SCREENING', 1, 3, NOW(), NOW()),
(18, 5, 2, '产品面试', 'INTERVIEW', 1, 3, NOW(), NOW()),
(19, 5, 3, 'HR面试', 'INTERVIEW', 1, 2, NOW(), NOW()),
(20, 5, 4, 'Offer发放', 'OFFER', 1, 7, NOW(), NOW()),
(21, 6, 1, '简历初筛', 'SCREENING', 1, 3, NOW(), NOW()),
(22, 6, 2, '设计面试', 'INTERVIEW', 1, 3, NOW(), NOW()),
(23, 6, 3, 'HR面试', 'INTERVIEW', 1, 2, NOW(), NOW()),
(24, 6, 4, 'Offer发放', 'OFFER', 1, 7, NOW(), NOW());

-- =====================================================
-- 9. 候选人阶段记录
-- 字段：id, application_id, pipeline_id, status, result_note, operator_id, handled_at, create_time, update_time, deleted
-- =====================================================

INSERT INTO candidate_stage_record (id, application_id, pipeline_id, status, result_note, operator_id, handled_at, create_time, update_time) VALUES
(1, 1, 1, 'COMPLETED', '简历筛选通过', 2, NOW() - INTERVAL 30 DAY, NOW(), NOW()),
(2, 1, 2, 'COMPLETED', '笔试成绩优秀', 2, NOW() - INTERVAL 28 DAY, NOW(), NOW()),
(3, 1, 3, 'COMPLETED', '技术一面通过', 4, NOW() - INTERVAL 25 DAY, NOW(), NOW()),
(4, 1, 4, 'COMPLETED', '技术二面通过', 4, NOW() - INTERVAL 22 DAY, NOW(), NOW()),
(5, 1, 5, 'COMPLETED', 'HR面试通过', 2, NOW() - INTERVAL 20 DAY, NOW(), NOW()),
(6, 1, 6, 'IN_PROGRESS', 'Offer已发送', 2, NOW() - INTERVAL 18 DAY, NOW(), NOW()),
(7, 2, 1, 'COMPLETED', '简历筛选通过', 2, NOW() - INTERVAL 20 DAY, NOW(), NOW()),
(8, 2, 2, 'COMPLETED', '笔试成绩良好', 2, NOW() - INTERVAL 18 DAY, NOW(), NOW()),
(9, 2, 3, 'COMPLETED', '技术一面通过', 4, NOW() - INTERVAL 15 DAY, NOW(), NOW()),
(10, 2, 4, 'IN_PROGRESS', '技术二面安排中', 4, NOW() - INTERVAL 12 DAY, NOW(), NOW()),
(11, 4, 7, 'COMPLETED', '简历筛选通过', 2, NOW() - INTERVAL 25 DAY, NOW(), NOW()),
(12, 4, 8, 'COMPLETED', '技术面试通过', 3, NOW() - INTERVAL 22 DAY, NOW(), NOW()),
(13, 4, 9, 'COMPLETED', 'HR面试通过', 2, NOW() - INTERVAL 20 DAY, NOW(), NOW()),
(14, 4, 10, 'IN_PROGRESS', 'Offer已发送', 2, NOW() - INTERVAL 18 DAY, NOW(), NOW()),
(15, 6, 11, 'COMPLETED', '简历筛选通过', 2, NOW() - INTERVAL 15 DAY, NOW(), NOW()),
(16, 6, 12, 'COMPLETED', '算法笔试优秀', 2, NOW() - INTERVAL 13 DAY, NOW(), NOW()),
(17, 6, 13, 'IN_PROGRESS', '技术面试安排中', 4, NOW() - INTERVAL 10 DAY, NOW(), NOW()),
(18, 10, 17, 'COMPLETED', '简历筛选通过', 2, NOW() - INTERVAL 28 DAY, NOW(), NOW()),
(19, 10, 18, 'COMPLETED', '产品面试通过', 5, NOW() - INTERVAL 25 DAY, NOW(), NOW()),
(20, 10, 19, 'COMPLETED', 'HR面试通过', 2, NOW() - INTERVAL 22 DAY, NOW(), NOW()),
(21, 10, 20, 'IN_PROGRESS', 'Offer已发送', 2, NOW() - INTERVAL 20 DAY, NOW(), NOW());

-- =====================================================
-- 10. 面试安排
-- 字段：id, stage_record_id, interview_time, location, round_num, status, create_time, update_time, deleted
-- =====================================================

INSERT INTO interview_arrangement (id, stage_record_id, interview_time, location, round_num, status, create_time, update_time, deleted) VALUES
(1, 3, NOW() - INTERVAL 25 DAY, '腾讯会议（线上）', 1, 'COMPLETED', NOW(), NOW(), 0),
(2, 4, NOW() - INTERVAL 22 DAY, '公司会议室A', 2, 'COMPLETED', NOW(), NOW(), 0),
(3, 5, NOW() - INTERVAL 20 DAY, '公司会议室B', 3, 'COMPLETED', NOW(), NOW(), 0),
(4, 9, NOW() - INTERVAL 15 DAY, '腾讯会议（线上）', 1, 'COMPLETED', NOW(), NOW(), 0),
(5, 10, NOW() - INTERVAL 12 DAY, '公司会议室A', 2, 'SCHEDULED', NOW(), NOW(), 0),
(6, 12, NOW() - INTERVAL 22 DAY, '腾讯会议（线上）', 1, 'COMPLETED', NOW(), NOW(), 0),
(7, 13, NOW() - INTERVAL 20 DAY, '公司会议室B', 2, 'COMPLETED', NOW(), NOW(), 0),
(8, 17, NOW() - INTERVAL 10 DAY, '腾讯会议（线上）', 1, 'SCHEDULED', NOW(), NOW(), 0),
(9, 19, NOW() - INTERVAL 25 DAY, '公司会议室A', 1, 'COMPLETED', NOW(), NOW(), 0),
(10, 20, NOW() - INTERVAL 22 DAY, '公司会议室B', 2, 'COMPLETED', NOW(), NOW(), 0);

-- =====================================================
-- 11. Offer记录
-- 字段：id, application_id, job_id, salary, position, entry_date, offer_deadline, status, offer_letter_path, sent_at, create_time, update_time, deleted
-- =====================================================

INSERT INTO offer_record (id, application_id, job_id, salary, position, entry_date, offer_deadline, status, offer_letter_path, sent_at, create_time, update_time, deleted) VALUES
(1, 1, 1, 35000.00, '高级Java开发工程师', NOW() + INTERVAL 30 DAY, NOW() + INTERVAL 37 DAY, 'SENT', NULL, NOW() - INTERVAL 18 DAY, NOW(), NOW(), 0),
(2, 4, 2, 25000.00, '前端开发工程师', NOW() + INTERVAL 25 DAY, NOW() + INTERVAL 32 DAY, 'SENT', NULL, NOW() - INTERVAL 18 DAY, NOW(), NOW(), 0),
(3, 10, 5, 35000.00, '高级产品经理', NOW() + INTERVAL 28 DAY, NOW() + INTERVAL 35 DAY, 'SENT', NULL, NOW() - INTERVAL 20 DAY, NOW(), NOW(), 0);

-- =====================================================
-- 12. 面试评价人记录
-- 字段：id, interview_id, interviewer_id, score, evaluation, status, create_time, update_time, deleted
-- =====================================================

INSERT INTO interview_interviewer (id, interview_id, interviewer_id, score, evaluation, status, create_time, update_time) VALUES
(1, 1, 4, 90, '技术基础扎实，对分布式系统有深入理解，沟通表达清晰。', 'COMPLETED', NOW(), NOW()),
(2, 2, 4, 92, '架构设计能力强，项目经验丰富，适合高级岗位。', 'COMPLETED', NOW(), NOW()),
(3, 3, 2, 88, '综合素质优秀，对企业文化认同度高，期望薪资合理。', 'COMPLETED', NOW(), NOW()),
(4, 4, 3, 85, '前端技术扎实，对React生态熟悉，有组件库建设经验。', 'COMPLETED', NOW(), NOW()),
(5, 6, 3, 88, 'Vue技术熟练，有大型项目经验，代码质量高。', 'COMPLETED', NOW(), NOW()),
(6, 7, 2, 90, '沟通能力好，团队协作意识强。', 'COMPLETED', NOW(), NOW()),
(7, 9, 5, 92, '产品思维清晰，数据分析能力强，有成功的产品案例。', 'COMPLETED', NOW(), NOW()),
(8, 10, 2, 89, '综合素质优秀，职业规划清晰。', 'COMPLETED', NOW(), NOW());

-- =====================================================
-- 13. 通知记录
-- 字段：id, title, content, type, recipient_id, is_read, related_type, related_id, create_time, update_time, deleted
-- =====================================================

INSERT INTO notification (id, title, content, type, recipient_id, is_read, related_type, related_id, create_time, update_time) VALUES
(1, '面试邀请', '亲爱的刘明辉，恭喜您通过简历初筛，请于2026年5月20日14:00参加技术一面（腾讯会议）。', 'INTERVIEW_INVITE', 2, 0, 'INTERVIEW', 1, NOW() - INTERVAL 26 DAY, NOW()),
(2, '面试结果通知', '亲爱的刘明辉，恭喜您通过技术一面，请准备技术二面。', 'INTERVIEW_RESULT', 2, 0, 'INTERVIEW', 1, NOW() - INTERVAL 24 DAY, NOW()),
(3, 'Offer发放通知', '亲爱的刘明辉，恭喜您通过所有面试，我们诚挚邀请您加入我们公司！', 'OFFER', 2, 0, 'OFFER', 1, NOW() - INTERVAL 18 DAY, NOW()),
(4, '面试邀请', '亲爱的张伟，恭喜您通过简历初筛，请于2026年5月25日10:00参加技术一面（腾讯会议）。', 'INTERVIEW_INVITE', 3, 0, 'INTERVIEW', 4, NOW() - INTERVAL 16 DAY, NOW()),
(5, '面试结果通知', '亲爱的张伟，恭喜您通过技术一面，请准备技术二面。', 'INTERVIEW_RESULT', 3, 0, 'INTERVIEW', 4, NOW() - INTERVAL 13 DAY, NOW()),
(6, '面试邀请', '亲爱的陈志强，恭喜您通过简历初筛，请于2026年5月22日14:00参加技术面试（腾讯会议）。', 'INTERVIEW_INVITE', 2, 0, 'INTERVIEW', 6, NOW() - INTERVAL 23 DAY, NOW()),
(7, 'Offer发放通知', '亲爱的陈志强，恭喜您通过所有面试，我们诚挚邀请您加入我们公司！', 'OFFER', 2, 0, 'OFFER', 2, NOW() - INTERVAL 18 DAY, NOW()),
(8, '面试邀请', '亲爱的赵宇航，恭喜您通过算法笔试，请于2026年6月2日14:00参加技术面试（腾讯会议）。', 'INTERVIEW_INVITE', 3, 0, 'INTERVIEW', 8, NOW() - INTERVAL 11 DAY, NOW()),
(9, '面试邀请', '亲爱的林晓燕，恭喜您通过简历初筛，请于2026年5月18日10:00参加产品面试（公司会议室A）。', 'INTERVIEW_INVITE', 2, 0, 'INTERVIEW', 9, NOW() - INTERVAL 26 DAY, NOW()),
(10, 'Offer发放通知', '亲爱的林晓燕，恭喜您通过所有面试，我们诚挚邀请您加入我们公司！', 'OFFER', 2, 0, 'OFFER', 3, NOW() - INTERVAL 20 DAY, NOW());

-- =====================================================
-- 14. 操作日志
-- 字段：id, user_id, username, module, action, description, ip_address, request_method, request_uri, request_params, cost_time, create_time, update_time, deleted
-- =====================================================

INSERT INTO operation_log (id, user_id, username, module, action, description, ip_address, request_method, request_uri, request_params, cost_time, create_time) VALUES
(1, 2, 'hr_zhang', '岗位管理', 'CREATE', '创建岗位：高级Java开发工程师', '127.0.0.1', 'POST', '/api/jobs', NULL, 120, NOW() - INTERVAL 35 DAY),
(2, 2, 'hr_zhang', '简历管理', 'UPLOAD', '上传简历：刘明辉_高级Java开发工程师.pdf', '127.0.0.1', 'POST', '/api/resumes/upload', NULL, 850, NOW() - INTERVAL 32 DAY),
(3, 4, 'manager_wang', '面试管理', 'EVALUATE', '技术一面评价：刘明辉，评分90', '127.0.0.1', 'POST', '/api/interviews/1/evaluation', NULL, 200, NOW() - INTERVAL 25 DAY),
(4, 2, 'hr_zhang', 'Offer管理', 'SEND', '发送Offer：刘明辉-高级Java开发工程师', '127.0.0.1', 'POST', '/api/offers', NULL, 150, NOW() - INTERVAL 18 DAY),
(5, 2, 'hr_zhang', '岗位管理', 'CREATE', '创建岗位：前端开发工程师', '127.0.0.1', 'POST', '/api/jobs', NULL, 100, NOW() - INTERVAL 30 DAY),
(6, 3, 'hr_li', '简历管理', 'UPLOAD', '上传简历：赵宇航_AI算法工程师.pdf', '127.0.0.1', 'POST', '/api/resumes/upload', NULL, 920, NOW() - INTERVAL 16 DAY),
(7, 4, 'manager_wang', '面试管理', 'EVALUATE', '产品面试评价：林晓燕，评分92', '127.0.0.1', 'POST', '/api/interviews/9/evaluation', NULL, 180, NOW() - INTERVAL 25 DAY);

-- =====================================================
-- 完成
-- =====================================================

SELECT 'Mock数据插入完成！' AS message;
SELECT '共插入：8个岗位、17份简历、23条教育经历、19条工作经历、17个简历文件、17条应聘记录、16条管道配置、21条阶段记录、10条面试安排、3条Offer记录、8条面试评价、10条通知、7条操作日志' AS summary;
