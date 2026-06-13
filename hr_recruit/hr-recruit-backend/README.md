# HR招聘管理系统 - 后端

AI驱动的智能招聘管理平台，基于 Spring Boot 3 + MyBatis-Plus + Spring AI + Vue 3。

## 技术栈

- **框架**: Spring Boot 3.2.5
- **ORM**: MyBatis-Plus 3.5.7
- **AI**: Spring AI 1.0.0-M4 (支持 DeepSeek)
- **数据库**: MySQL 8.0 + Flyway 迁移
- **认证**: JWT (jjwt) + Spring Security
- **文档**: Knife4j (Swagger)
- **其他**: EasyExcel, WebSocket, AOP 操作日志

## 快速开始

### 1. 环境要求

- JDK 17+
- MySQL 8.0+
- Maven 3.8+

### 2. 数据库初始化

```bash
# 创建数据库
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS hr_recruit DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

Flyway 会在应用启动时自动执行 `V1__init.sql` 创建全部 19 张表。

### 3. 配置

在 `application.yml` 中修改：
- MySQL 连接信息（用户名/密码）
- DeepSeek API Key
- JWT 密钥（生产环境必须修改）

### 4. 启动应用

```bash
mvn spring-boot:run
```

访问 `http://localhost:5500/doc.html` 查看 API 文档。

默认管理员账号: `admin` / `admin123`

## 项目结构

```
src/main/java/com/hr/recruit/
├── config/          # 配置类 (Security, CORS, WebSocket, AI, MyBatis-Plus)
├── common/          # 通用类 (Result, 异常, JWT工具, 操作日志注解/AOP)
├── entity/          # 实体类 (19张表)
├── mapper/          # MyBatis-Plus Mapper接口
├── service/         # 业务接口
│   └── impl/       # 业务实现
├── controller/      # REST API控制器 (统一 /api 前缀)
├── dto/             # 数据传输对象
└── websocket/      # WebSocket处理器
```

## 核心功能

### 1. 岗位管理
- 岗位 CRUD、发布/关闭状态流转
- 按部门、状态、名称筛选
- 公开岗位列表（候选人门户用）

### 2. 简历管理
- PDF/DOCX 文件上传
- Spring AI 智能解析
- 人才库状态管理（待入库/人才库/面试中/已录用/黑名单）
- 技能标签搜索

### 3. 招聘管道
- 按岗位独立配置招聘流程
- 候选人阶段记录与拖拽流转
- 可自定义流程阶段

### 4. 面试管理
- 多轮面试安排
- 面试评价与 AI 摘要
- 面试委员会

### 5. AI 智能中心
- **智能问答**: SSE 流式对话，支持 Markdown 渲染，含思考过程动画
- **AI 生成 JD**: 根据岗位信息自动生成职位描述
- **AI 匹配评分**: 简历与岗位智能匹配
- **面试题生成**: 根据简历生成针对性面试题
- **评价摘要**: 自动生成面试评价摘要

### 6. 数据大屏
- 招聘漏斗分析
- 渠道来源统计
- 实时数据看板

### 7. 通知系统
- WebSocket 实时通知
- 通知模板管理

### 8. 操作日志
- AOP 自动记录所有关键操作

### 9. 候选人门户（V2.2 新增）
- **公开岗位浏览**: 无需登录，查看所有在招岗位
- **岗位详情**: 查看岗位职责、任职要求等信息
- **在线投递**: 填写基本信息 + 上传简历文件，完成投递
- **申请进度查询**: 通过邮箱/手机号查询投递状态
- **面试安排查看**: 查看面试时间、地点等信息
- **Offer 确认**: 查看并确认/拒绝 Offer

## 角色与权限设计

系统支持三种内部角色 + 外部候选人：

| 角色 | 主要职责 | 功能范围 |
|------|---------|---------|
| **系统管理员 (ADMIN)** | 系统配置、用户管理、数据监控 | 全部功能 + 用户管理 + 系统设置 |
| **HR 专员 (HR)** | 日常招聘工作 | 岗位管理、简历管理、面试安排、Offer 发送、招聘管道 |
| **部门经理 (MANAGER)** | 面试审批、用人决策 | 查看岗位/简历、参与面试、审批录用、查看统计报表 |
| **候选人 (CANDIDATE)** | 浏览岗位、投递简历 | 公开岗位列表、在线投递、申请进度查询（无需登录） |

> **候选人入口**: `http://localhost:5173/candidate` — 独立门户，无需登录即可浏览岗位并投递简历。

## API 文档

启动后访问: `http://localhost:5500/doc.html`

### 候选人门户 API（无需登录）

| 方法 | 路径 | 说明 |
|------|------|---------|
| GET | `/api/candidate/jobs` | 公开岗位列表 |
| GET | `/api/candidate/jobs/{id}` | 岗位详情 |
| POST | `/api/candidate/apply` | 投递简历（multipart/form-data）|
| GET | `/api/candidate/applications?keyword=邮箱或手机号` | 查询我的申请 |
| GET | `/api/candidate/applications/{id}` | 申请详情（含面试、Offer） |

## 注意事项

- Spring AI 版本为 Milestone 版本，Maven 需要配置 `spring-milestones` 仓库
- 默认使用 DeepSeek API，如需切换在 `application.yml` 中修改 `spring.ai.openai.base-url`
- MySQL 全文索引使用 ngram 解析器，需要 MySQL 5.7+
- 所有 Controller 统一使用 `/api` 前缀，前端通过 Vite proxy 转发
- 候选人门户 API (`/api/candidate/**`) 无需 JWT 认证，已在 SecurityConfig 中放行

## 故障记录

详见项目根目录 `故障.md`，记录了开发过程中多次出现的典型问题及修复方案。
