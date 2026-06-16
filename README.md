# HR智能招聘管理系统

AI驱动的智能招聘平台 — 全流程招聘管理系统，支持简历解析、智能匹配、管道看板、面试管理、Offer发放等功能。

## 技术栈

| 层 | 技术 | 版本 |
|---|------|------|
| 后端框架 | Spring Boot | 3.2.5 |
| ORM | MyBatis-Plus | 3.5.7 |
| AI | Spring AI + DeepSeek ChatClient | 1.x |
| 数据库 | MySQL | 8.0 |
| 迁移工具 | Flyway | - |
| 前端 | Vue 3 + Element Plus | 3.x |
| 构建 | Vite | 5.x |
| PDF解析 | Apache PDFBox | 3.0.1 |
| 安全 | Spring Security + JWT | - |

## 功能特性（14项差异化功能）

| 功能 | 说明 |
|------|------|
| 🤖 AI智能匹配 | 候选人简历与岗位JD匹配评分，多维度分析 |
| ✍️ AI生成JD | 根据岗位需求AI生成职位描述 |
| 📝 AI面试题 | 根据岗位要求AI生成面试题 |
| 📊 实时数据大屏 | ECharts漏斗图/饼图/柱状图可视化 |
| 🗂️ 招聘管道看板 | 拖拽式Kanban，自定义招聘阶段 |
| 👥 多轮面试 | 支持面试委员会+多轮安排 |
| 📄 PDF简历解析 | PDFBox提取文本+AI结构化解析 |
| 🔍 全文搜索 | MySQL FULLTEXT + ngram |
| 📧 通知系统 | WebSocket实时推送+邮件通知模板 |
| ⏱️ 候选人时间线 | 可配置招聘流程跟踪 |
| 🏷️ 人才储备库 | 黑名单/储备库状态管理 |
| 📁 文件在线预览 | PDF/DOCX在线预览 |
| 📋 AOP操作日志 | 自动记录操作日志（按角色访问） |
| 🔐 角色权限 | ADMIN/HR/MANAGER三级权限隔离 |

## 快速启动

### 环境要求
- JDK 17+
- Node.js 18+
- MySQL 8.0+

### 1. 数据库
```sql
CREATE DATABASE hr_recruit CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
Flyway 会在后端启动时自动执行建表迁移。

### 2. 后端
```bash
cd hr_recruit/hr-recruit-backend
cp src/main/resources/application.yml.example src/main/resources/application.yml
# 编辑 application.yml 填入 MySQL 密码和 AI API Key
mvn spring-boot:run
```

### 3. 前端
```bash
cd hr_recruit/hr-recruit-frontend
npm install
npm run dev
```

### 4. 测试账号

| 用户名 | 密码 | 角色 | 权限范围 |
|--------|------|------|----------|
| `admin` | `123456` | ADMIN | 全部功能（含操作日志） |
| `hr_zhang` | `123456` | HR | 招聘管理功能 |
| `hr_li` | `123456` | HR | 招聘管理功能 |
| `manager_wang` | `123456` | MANAGER | 招聘管理功能 |
| `manager_chen` | `123456` | MANAGER | 招聘管理功能 |

### 5. 加载测试数据（可选）
```bash
mysql -u root -p hr_recruit < mock_data.sql
```

## 项目结构

```
实训目录/
├── docs/                          # 项目文档
│   ├── 已完成任务验收清单.md
│   └── 快速上手指南.md
├── hr_recruit/                    # 项目代码
│   ├── hr-recruit-backend/        # Spring Boot 后端
│   │   └── src/main/java/com/hr/recruit/
│   │       ├── common/            # 通用类
│   │       ├── config/            # 配置
│   │       ├── controller/        # 11个Controller
│   │       ├── entity/            # 实体类
│   │       ├── mapper/            # MyBatis Mapper
│   │       ├── service/           # 业务逻辑
│   │       └── vo/dto/            # 视图/数据传输对象
│   └── hr-recruit-frontend/       # Vue 3 前端
│       └── src/
│           ├── api/               # API请求
│           ├── layout/            # 布局
│           ├── router/            # 路由+权限
│           ├── stores/            # Pinia状态
│           └── views/             # 12个页面
├── .fault-history.md              # 历史故障记录（14项）
├── mock_data.sql                  # 测试数据
└── README.md                      # 本文件
```

## 数据库（19张表）

| 模块 | 表名 |
|------|------|
| 用户 | `sys_user` |
| 岗位 | `job_position` |
| 简历 | `resume_info`, `resume_file` |
| 投递 | `applicant_job` |
| 流程 | `recruitment_pipeline`, `candidate_stage_record` |
| 面试 | `interview_arrangement`, `interview_interviewer`, `interview_evaluation` |
| 录用 | `offer_record`, `onboard_record` |
| 员工 | `employee_archive` |
| 教育/工作 | `education_exp`, `work_exp` |
| 创新 | `notification`, `notification_template`, `operation_log`, `talent_pool`, `ai_match_record` |

## API 概览（11个Controller）

| Controller | 前缀 | 说明 |
|-----------|------|------|
| AuthController | `/api/auth` | 登录/注册/获取用户信息 |
| ResumeController | `/api/resumes` | 简历上传/解析/列表/详情/状态 |
| JobPositionController | `/api/jobs` | 岗位CRUD+发布/关闭 |
| InterviewController | `/api/interviews` | 面试创建/安排/评价/面试官查询 |
| OfferController | `/api/offers` | Offer CRUD+发送 |
| RecruitmentPipelineController | `/api/pipelines` | 管道阶段/拖拽切换 |
| CandidateController | `/api/candidate` | 候选人门户接口 |
| NotificationController | `/api/notifications` | 通知列表/已读 |
| OperationLogController | `/api/logs` | 操作日志（仅ADMIN） |
| AiController | `/api/ai` | AI匹配/面试题/JD生成 |
| DashboardController | `/api/dashboard` | 统计图表数据 |

## 角色权限

| 角色 | 菜单 | 备注 |
|------|------|------|
| ADMIN | 全部（含操作日志） | 系统管理员 |
| HR | 招聘功能（不含日志） | HR专员 |
| MANAGER | 招聘功能（不含日志） | 部门经理 |

## 文档

- [已完成任务验收清单](docs/已完成任务验收清单.md)
- [开发者快速上手指南](docs/快速上手指南.md)
- [故障历史记录](.fault-history.md)
- 实训计划书 / 需求规格 / 测试报告 / 数据库设计 / 接口设计（docx文件）

## License

本项目为软件工程实训课程项目。
