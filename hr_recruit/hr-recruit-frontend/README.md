# HR招聘管理系统 - 前端

AI驱动智能招聘管理平台前端，基于 Vue 3 + Element Plus + ECharts + Pinia。

## 技术栈

- **框架**: Vue 3.4 + Vite 5
- **UI**: Element Plus 2.7
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **图表**: ECharts 5
- **HTTP**: Axios
- **WebSocket**: SockJS + StompJS

## 快速开始

### 1. 安装依赖

```bash
cd hr-recruit-frontend
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:5173`

### 3. 生产构建

```bash
npm run build
```

产物输出到 `dist/` 目录。

## 项目结构

```
src/
├── api/           # API请求封装 (axios)
├── stores/        # Pinia状态管理
├── router/        # Vue Router路由配置
├── views/         # 页面组件
│   ├── auth/      # 登录页
│   ├── dashboard/ # 数据大屏
│   ├── job/       # 岗位管理
│   ├── resume/    # 简历管理
│   ├── pipeline/  # 招聘管道(看板)
│   ├── interview/ # 面试管理
│   ├── offer/     # 录用管理
│   ├── ai/        # AI智能中心
│   ├── notification/ # 通知中心
│   └── log/       # 操作日志
├── layout/        # 主布局组件
├── components/    # 通用组件
└── styles/        # 全局样式
```

## 核心页面

| 页面 | 功能 |
|------|------|
| 数据大屏 | ECharts图表展示招聘漏斗、渠道统计、实时数据 |
| 岗位管理 | 岗位CRUD、发布/关闭、AI生成JD |
| 简历管理 | 上传解析、全文搜索、AI匹配评分、人才库 |
| 招聘管道 | 拖拽式看板、阶段流转、候选人时间线 |
| 面试管理 | 面试安排、多面试官评价、AI汇总 |
| AI智能中心 | 匹配评分、JD生成、面试题生成、问答 |

## 默认账号

- 用户名: `admin`
- 密码: `admin123`

## 注意事项

- 后端需运行在 `http://localhost:8080`
- 开发环境已配置代理，API请求自动转发到后端
- 生产环境需修改 `vite.config.js` 中的代理配置
