# AI功能优化与知识库建设方案

> 版本：V3.0  
> 日期：2026-06-12  
> 目标：构建本地知识库，实现数据记录与智能检索，提升AI功能的实用性和智能化水平

---

## 一、现状分析

### 1.1 当前AI功能

| 功能 | 描述 | 局限性 |
|------|------|----------|
| 智能问答 | 基于DeepSeek API的对话 | 无上下文记忆，无法访问本地数据 |
| 简历匹配 | 计算简历与岗位的匹配度 | 每次重新计算，无历史记录 |
| JD生成 | 根据岗位信息生成描述 | 无模板库，每次从头生成 |
| 面试题生成 | 根据岗位生成面试问题 | 无题库，无法积累优质问题 |
| 面试评价摘要 | 总结面试评价 | 无历史数据参考 |

### 1.2 核心问题

1. **无状态记忆**：每次对话都是全新的，无法记住历史交互
2. **无数据访问**：AI无法访问系统中的简历、岗位、面试等数据
3. **无知识积累**：生成的内容无法沉淀为可复用的知识
4. **无个性化**：无法根据公司历史招聘数据提供个性化建议

---

## 二、优化方案总览

### 2.1 架构设计

```
┌─────────────────┐
│                    用户交互层                              │
│            (AI智能中心 / 简历管理 / 岗位管理)           │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│                   AI服务层                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ 智能问答 │  │ 简历匹配 │  │ 内容生成 │          │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘          │
│       │               │               │                      │
│  ┌────▼─────────────▼─────────────▼────┐              │
│  │         RAG检索增强生成模块           │              │
│  └────┬────────────────────┬────────┘              │
└───────────┼────────────────────┼───────────────────────┘
            │                    │
┌───────────▼────────────────────▼───────────────────────┐
│                 知识库层                                   │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐    │
│  │ 向量数据库 │  │  关系数据库 │  │  文件存储  │    │
│  │(简历/岗位)│  │(历史记录)  │  │(文档模板)  │    │
│  └────────────┘  └────────────┘  └────────────┘    │
└────────────────────────────────────────────────────────────┘
```

### 2.2 功能模块

| 模块 | 优先级 | 工作量 | 价值 |
|------|--------|--------|------|
| 本地知识库构建 | P0 | 3天 | 核心基础 |
| RAG智能问答 | P0 | 2天 | 核心功能 |
| 简历-岗位匹配增强 | P1 | 2天 | 高价值 |
| 历史记录与学习 | P1 | 1天 | 数据积累 |
| 智能推荐 | P2 | 2天 | 差异化 |
| 数据分析洞察 | P2 | 2天 | 决策支持 |

---

## 三、详细设计方案

### 3.1 本地知识库构建

#### 3.1.1 数据向量化

**目标**：将简历、岗位等文本数据转换为向量，支持语义检索

**技术方案**：
- 使用Embedding模型（如`text-embedding-ada-002`或本地模型）
- 存储向量到MySQL（使用`VECTOR`类型）或独立的向量数据库（如Milvus、Chroma）

**数据范围**：
```sql
-- 知识库包含的数据
1. 简历数据（resume_info + education_exp + work_exp）
2. 岗位数据（job_position）
3. 面试记录（interview_arrangement + 评价）
4. Offer记录（offer_record）
5. 历史AI对话记录
6. 用户上传的JD模板、面试题库
```

**向量化Pipeline**：
```java
@Service
public class KnowledgeBaseService {
    
    // 1. 简历向量化
    public void embedResume(Long resumeId) {
        ResumeInfo resume = resumeInfoService.getById(resumeId);
        String text = buildResumeText(resume); // 拼接姓名、技能、经历等
        float[] embedding = embeddingClient.embed(text);
        resumeVectorMapper.insert(new ResumeVector(resumeId, embedding));
    }
    
    // 2. 岗位向量化
    public void embedJob(Long jobId) {
        JobPosition job = jobPositionService.getById(jobId);
        String text = buildJobText(job); // 拼接岗位名称、要求、职责等
        float[] embedding = embeddingClient.embed(text);
        jobVectorMapper.insert(new JobVector(jobId, embedding));
    }
    
    // 3. 批量向量化（初始化时使用）
    public void embedAll() {
        resumeInfoService.list().forEach(r -> embedResume(r.getId()));
        jobPositionService.list().forEach(j -> embedJob(j.getId()));
    }
}
```

#### 3.1.2 向量数据存储

**方案A：MySQL VECTOR类型（推荐，无需额外依赖）**

```sql
-- 简历向量表
CREATE TABLE resume_vector (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    resume_id BIGINT NOT NULL,
    embedding VECTOR(1536),  -- OpenAI ada-002维度
    content TEXT,  -- 原始文本（用于展示）
    created_at DATETIME,
    INDEX idx_resume_id (resume_id),
    VECTOR INDEX idx_embedding (embedding)  -- MySQL 9.0+支持
);

-- 岗位向量表
CREATE TABLE job_vector (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    job_id BIGINT NOT NULL,
    embedding VECTOR(1536),
    content TEXT,
    created_at DATETIME,
    INDEX idx_job_id (job_id)
);

-- AI对话历史表（新增）
CREATE TABLE ai_chat_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    session_id VARCHAR(64),
    role ENUM('user', 'assistant'),
    content TEXT,
    embedding VECTOR(1536),  -- 问题向量化（用于上下文检索）
    created_at DATETIME,
    INDEX idx_user_session (user_id, session_id)
);
```

**方案B：独立向量数据库（如Chroma，适合大规模）**

```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-chroma-store</artifactId>
</dependency>
```

```java
// Spring AI VectorStore
@Autowired
private ChromaVectorStore vectorStore;

public void addToKnowledgeBase(String text, Map<String, Object> metadata) {
    Document document = new Document(text, metadata);
    vectorStore.add(List.of(document));
}

public List<Document> searchSimilar(String query, int topK) {
    return vectorStore.similaritySearch(query, topK);
}
```

#### 3.1.3 知识库管理界面

**前端页面**：`KnowledgeBaseView.vue`

**功能**：
- 查看知识库统计（简历数、岗位数、对话记录数）
- 手动触发向量化（单个/批量）
- 搜索测试（输入问题，查看检索到的相关知识）
- 清空知识库

---

### 3.2 RAG智能问答增强

#### 3.2.1 RAG流程

```
用户输入问题
    ↓
1. 向量化问题
    ↓
2. 在知识库中检索Top-K相关知识
    ↓
3. 拼接上下文：{相关知识 + 历史对话 + 当前问题}
    ↓
4. 调用DeepSeek API（带上下文）
    ↓
5. 返回答案 + 记录到历史
```

#### 3.2.2 实现代码

```java
@RestController
@RequestMapping("/api/ai")
public class AiController {
    
    @Autowired
    private ChatClient chatClient;
    
    @Autowired
    private VectorStore vectorStore;  // 向量数据库
    
    @Autowired
    private AiChatHistoryMapper chatHistoryMapper;
    
    /**
     * RAG增强的智能问答
     */
    @GetMapping(value = "/chat", produces = "text/event-stream")
    public Flux<String> ragChat(
            @RequestParam("message") String message,
            @RequestParam(value = "sessionId", defaultValue = "default") String sessionId,
            @RequestHeader("Authorization") String token) {
        
        // 1. 检索相关知识（RAG核心）
        List<Document> relevantDocs = vectorStore.similaritySearch(
            SearchRequest.query(message)
                .withTopK(5)  // 检索Top-5相关知识
                .withSimilarityThreshold(0.7)
        );
        
        // 2. 构建上下文
        String context = buildContext(relevantDocs);
        
        // 3. 获取历史对话（最近10轮）
        List<AiChatHistory> history = chatHistoryMapper.selectRecent(userId, sessionId, 10);
        String historyText = buildHistoryText(history);
        
        // 4. 构建Prompt
        String prompt = String.format("""
            你是一个专业的HR招聘助手。请基于以下知识回答问题。
            
            【相关知识】
            %s
            
            【历史对话】
            %s
            
            【当前问题】
            %s
            
            要求：
            1. 优先使用【相关知识】中的信息
            2. 如果知识库中没有相关信息，明确告知用户
            3. 回答要专业、简洁、有针对性
            """, context, historyText, message);
        
        // 5. 调用AI（流式返回）
        Flux<String> flux = chatClient.prompt()
            .user(prompt)
            .stream()
            .content();
        
        // 6. 记录对话历史
        saveChatHistory(userId, sessionId, "user", message);
        flux.subscribe(content -> {
            if (content.equals("[DONE]")) {
                saveChatHistory(userId, sessionId, "assistant", fullResponse);
            }
        });
        
        return flux;
    }
    
    private String buildContext(List<Document> docs) {
        return docs.stream()
            .map(Document::getContent)
            .collect(Collectors.joining("\n\n---\n\n"));
    }
}
```

#### 3.2.3 前端适配

```vue
<!-- AiCenterView.vue 增强 -->
<script setup>
// 新增：会话管理
const sessions = ref([])  // 历史会话列表
const currentSessionId = ref(generateUUID())

// 新增：知识库来源展示
const showKnowledgeSource = ref(false)
const knowledgeSources = ref([])  // 当前回答参考的知识

function sendMsg() {
  // ... 现有代码 ...
  
  // 请求时带上sessionId
  fetch(`/api/ai/chat?message=${encodeURIComponent(text)}&sessionId=${currentSessionId.value}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  // ... 流式处理 ...
}
</script>

<template>
  <!-- 新增：知识来源展示 -->
  <div v-if="knowledgeSources.length > 0" class="knowledge-source">
    <el-collapse>
      <el-collapse-item title="📚 参考知识" name="1">
        <div v-for="(doc, idx) in knowledgeSources" :key="idx">
          <el-tag>{{ doc.type }}</el-tag>
          <span>{{ doc.content.substring(0, 100) }}...</span>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>
```

---

### 3.3 简历-岗位匹配增强

#### 3.3.1 传统匹配 vs 智能匹配

| 方式 | 原理 | 优点 | 缺点 |
|------|------|------|------|
| 传统（关键词） | 技能标签重叠度 | 快速、可解释 | 无法理解语义 |
| 向量相似度 | 计算embedding余弦相似度 | 理解语义、泛化能力强 | 需要向量化 |
| **混合（推荐）** | 关键词得分 × 0.3 + 向量得分 × 0.7 | 兼顾准确和可解释 | 实现复杂 |

#### 3.3.2 实现方案

```java
@Service
public class ResumeMatchService {
    
    @Autowired
    private VectorStore vectorStore;
    
    /**
     * 混合匹配：关键词 + 向量相似度
     */
    public MatchResult matchResumeToJob(Long resumeId, Long jobId) {
        // 1. 关键词匹配得分（0-100）
        int keywordScore = calculateKeywordScore(resumeId, jobId);
        
        // 2. 向量相似度得分（0-100）
        float vectorScore = calculateVectorScore(resumeId, jobId);
        
        // 3. 混合得分
        int finalScore = (int)(keywordScore * 0.3 + vectorScore * 0.7);
        
        // 4. 生成匹配分析（调用AI）
        String analysis = generateMatchAnalysis(resumeId, jobId);
        
        return new MatchResult(finalScore, keywordScore, vectorScore, analysis);
    }
    
    private float calculateVectorScore(Long resumeId, Long jobId) {
        // 获取简历和岗位的向量
        float[] resumeVec = resumeVectorMapper.selectByResumeId(resumeId).getEmbedding();
        float[] jobVec = jobVectorMapper.selectByJobId(jobId).getEmbedding();
        
        // 计算余弦相似度
        float similarity = cosineSimilarity(resumeVec, jobVec);
        return similarity * 100;  // 转为百分制
    }
}
```

#### 3.3.3 相似简历推荐

```java
/**
 * 根据岗位推荐相似简历
 */
public List<ResumeInfo> recommendResumesForJob(Long jobId, int topK) {
    // 1. 获取岗位向量
    float[] jobVec = jobVectorMapper.selectByJobId(jobId).getEmbedding();
    
    // 2. 在简历向量表中检索Top-K
    List<ResumeVector> similar = resumeVectorMapper.selectTopKSimilar(jobVec, topK);
    
    // 3. 过滤已投递该岗位的简历
    List<Long> appliedResumeIds = applicantJobService.getAppliedResumeIds(jobId);
    similar = similar.stream()
        .filter(v -> !appliedResumeIds.contains(v.getResumeId()))
        .collect(Collectors.toList());
    
    // 4. 返回简历详情
    return resumeInfoService.listByIds(similar.stream().map(ResumeVector::getResumeId).collect(Collectors.toList()));
}
```

---

### 3.4 历史记录与学习

#### 3.4.1 数据表设计

```sql
-- AI对话历史（已在3.1.2中定义）
CREATE TABLE ai_chat_history (...);

-- 简历解析历史（新增）
CREATE TABLE ai_parse_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    resume_id BIGINT NOT NULL,
    parse_result JSON,  -- 解析结果（姓名、技能、经历等）
    confidence FLOAT,  -- 解析置信度
    created_at DATETIME,
    INDEX idx_resume_id (resume_id)
);

-- 匹配记录历史（新增）
CREATE TABLE ai_match_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    resume_id BIGINT NOT NULL,
    job_id BIGINT NOT NULL,
    match_score INT,  -- 匹配得分
    match_analysis TEXT,  -- AI分析结果
    actual_outcome VARCHAR(20),  -- 实际结果（HIRED/REJECTED/INTERVIEW）
    created_at DATETIME,
    INDEX idx_resume_job (resume_id, job_id)
);

-- 内容生成历史（新增）
CREATE TABLE ai_generation_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    type ENUM('JD', 'INTERVIEW_QUESTIONS', 'SUMMARY'),
    input_data JSON,  -- 输入数据
    output_content TEXT,  -- 生成内容
    rating INT,  -- 用户评分（1-5）
    created_at DATETIME,
    INDEX idx_type (type)
);
```

#### 3.4.2 学习与优化

```java
@Service
public class AILearningService {
    
    /**
     * 记录匹配结果与实际录用的关系（用于优化匹配算法）
     */
    public void recordMatchOutcome(Long matchHistoryId, String actualOutcome) {
        AiMatchHistory history = matchHistoryMapper.selectById(matchHistoryId);
        history.setActualOutcome(actualOutcome);
        matchHistoryMapper.updateById(history);
        
        // 如果实际录用了，将该简历加入岗位的正例
        if ("HIRED".equals(actualOutcome)) {
            addToPositiveSamples(history.getJobId(), history.getResumeId());
        }
    }
    
    /**
     * 基于历史数据优化匹配权重
     */
    public void optimizeMatchWeights() {
        // 分析历史匹配记录，调整关键词权重和向量权重
        // 这可以通过机器学习实现（如逻辑回归），或使用规则
    }
}
```

---

### 3.5 智能推荐

#### 3.5.1 推荐场景

| 场景 | 输入 | 输出 | 实现 |
|------|------|------|------|
| 岗位推荐简历 | 岗位ID | Top-K简历 | 向量相似度检索 |
| 简历推荐岗位 | 简历ID | Top-K岗位 | 向量相似度检索 |
| 相似简历 | 简历ID | Top-K相似简历 | 简历-简历向量检索 |
| 面试问题推荐 | 岗位ID + 面试轮次 | 定制化问题 | 检索历史优质问题 + AI生成 |
| 面试评价模板 | 岗位ID | 评价维度建议 | 检索历史评价 + 岗位要求 |

#### 3.5.2 实现示例

```java
@RestController
@RequestMapping("/api/ai")
public class AIRecommendController {
    
    @Autowired
    private VectorStore vectorStore;
    
    /**
     * 为岗位推荐简历
     */
    @GetMapping("/recommend/resumes/{jobId}")
    public Result<List<ResumeInfo>> recommendResumes(@PathVariable Long jobId) {
        // 1. 获取岗位向量
        JobVector jobVec = jobVectorMapper.selectByJobId(jobId);
        
        // 2. 检索相似简历
        List<ResumeVector> similar = resumeVectorMapper.selectTopKSimilar(
            jobVec.getEmbedding(), 10);
        
        // 3. 补充匹配得分和分析
        List<ResumeMatchDTO> result = similar.stream().map(r -> {
            ResumeInfo resume = resumeInfoService.getById(r.getResumeId());
            int score = calculateMatchScore(r.getResumeId(), jobId);
            String analysis = generateQuickAnalysis(r.getResumeId(), jobId);
            return new ResumeMatchDTO(resume, score, analysis);
        }).collect(Collectors.toList());
        
        return Result.success(result);
    }
    
    /**
     * 智能生成面试问题（基于岗位要求 + 历史优质问题）
     */
    @PostMapping("/generate/questions")
    public Result<List<String>> generateInterviewQuestions(@RequestBody GenerateQuestionsRequest req) {
        // 1. 检索历史优质问题
        List<Document> similarCases = vectorStore.similaritySearch(
            SearchRequest.query(req.getPositionName() + " " + req.getRoundType())
                .withTopK(3)
                .withFilter("type == 'INTERVIEW_QUESTIONS'")
        );
        
        // 2. 构建Prompt
        String prompt = String.format("""
            请为以下岗位生成%d道%s面试题：
            
            岗位：%s
            要求：%s
            
            参考历史优质问题：
            %s
            
            要求：
            1. 问题要有针对性，能考察候选人的实际能力
            2. 问题难度要适中
            3. 返回JSON数组格式
            """, req.getCount(), req.getRoundType(), 
                req.getPositionName(), req.getRequirement(),
                similarCases.stream().map(Document::getContent).collect(Collectors.joining("\n")));
        
        // 3. 调用AI
        String response = chatClient.prompt().user(prompt).call().content();
        List<String> questions = parseQuestionsFromResponse(response);
        
        // 4. 记录到历史
        saveGenerationHistory("INTERVIEW_QUESTIONS", req, questions);
        
        return Result.success(questions);
    }
}
```

---

### 3.6 数据分析与洞察

#### 3.6.1 新增AI分析接口

```java
@RestController
@RequestMapping("/api/ai")
public class AIAnalyticsController {
    
    /**
     * 分析简历质量（给出优化建议）
     */
    @GetMapping("/analyze/resume/{resumeId}")
    public Result<ResumeAnalysis> analyzeResume(@PathVariable Long resumeId) {
        ResumeInfo resume = resumeInfoService.getById(resumeId);
        
        String prompt = String.format("""
            请分析以下简历的质量，给出评分和优化建议（JSON格式）：
            
            简历信息：
            姓名：%s
            学历：%s
            工作年限：%d年
            技能：%s
            自我评价：%s
            
            输出格式：
            {
                "score": 85,
                "strengths": ["技能全面", "大厂背景"],
                "weaknesses": ["自我评价过于简单", "项目经历描述不够具体"],
                "suggestions": ["补充具体项目成果", "量化工作业绩"]
            }
            """, resume.getName(), resume.getEducationLevel(), 
                resume.getWorkYears(), resume.getSkillTags(), resume.getSelfEvaluation());
        
        String response = chatClient.prompt().user(prompt).call().content();
        ResumeAnalysis analysis = parseAnalysisFromResponse(response);
        
        return Result.success(analysis);
    }
    
    /**
     * 招聘漏斗分析（AI生成洞察报告）
     */
    @GetMapping("/analytics/funnel")
    public Result<String> generateFunnelAnalysis() {
        // 1. 统计各阶段数据
        long totalResumes = resumeInfoService.count();
        long interviewed = applicantJobService.countByStatus("INTERVIEW%");
        long offered = applicantJobService.countByStatus("OFFER%");
        long hired = applicantJobService.countByStatus("HIRED");
        
        // 2. 调用AI生成分析报告
        String prompt = String.format("""
            请基于以下招聘数据，生成一份专业的招聘漏斗分析报告：
            
            数据：
            - 简历总数：%d
            - 面试人数：%d（占比%.1f%%）
            - Offer人数：%d（占比%.1f%%）
            - 入职人数：%d（占比%.1f%%）
            
            请从以下角度分析：
            1. 漏斗转化率是否正常
            2. 可能存在的瓶颈
            3. 优化建议
            """, totalResumes, interviewed, 
                (float)interviewed/totalResumes*100,
                offered, (float)offered/totalResumes*100,
                hired, (float)hired/totalResumes*100);
        
        String analysis = chatClient.prompt().user(prompt).call().content();
        return Result.success(analysis);
    }
}
```

---

## 四、实施计划

### 4.1 第一阶段（Week 1）：知识库基础

**目标**：搭建知识库基础设施，实现数据向量化

| 任务 | 详情 | 产出 |
|------|------|------|
| 1.1 向量数据库选型与搭建 | 选择MySQL VECTOR或Chroma | 可用的向量存储 |
| 1.2 数据向量化服务 | 实现简历、岗位的向量化 | `KnowledgeBaseService.java` |
| 1.3 向量数据表设计 | 设计`resume_vector`、`job_vector`等表 | SQL迁移脚本 |
| 1.4 批量向量化工具 | 提供初始化脚本，将现有数据向量化 | BatchEmbeddingTool.java |
| 1.5 知识库管理界面 | 前端页面，查看统计、触发向量化 | `KnowledgeBaseView.vue` |

**验收标准**：
- [ ] 能够将现有17份简历和8个岗位向量化并存储
- [ ] 能够通过向量检索找到相似简历/岗位
- [ ] 知识库管理界面可以正常操作

---

### 4.2 第二阶段（Week 2）：RAG智能问答

**目标**：增强AI问答功能，使其能访问本地知识库

| 任务 | 详情 | 产出 |
|------|------|------|
| 2.1 RAG检索模块 | 实现向量检索 + 上下文拼接 | `RAGService.java` |
| 2.2 AI对话接口改造 | 在`/api/ai/chat`中集成RAG | `AiController.java` (修改) |
| 2.3 对话历史记录 | 设计`ai_chat_history`表，实现记录逻辑 | `AiChatHistoryMapper.java` |
| 2.4 会话管理 | 支持多会话、查看历史对话 | 前端会话列表组件 |
| 2.5 知识来源展示 | 在回答下方展示参考的知识 | UI优化 |

**验收标准**：
- [ ] 提问"帮我推荐Java开发工程师的简历"能返回知识库中的相关简历
- [ ] 提问"某个岗位的要求是什么"能返回岗位详情
- [ ] 对话历史能够正确保存和展示

---

### 4.3 第三阶段（Week 3）：匹配与推荐

**目标**：增强简历-岗位匹配功能，实现智能推荐

| 任务 | 详情 | 产出 |
|------|------|------|
| 3.1 混合匹配算法 | 实现关键词 + 向量相似度的混合匹配 | `ResumeMatchService.java` |
| 3.2 匹配历史记录 | 设计`ai_match_history`表，记录每次匹配 | SQL + Mapper |
| 3.3 岗位推荐简历 | 实现`/api/ai/recommend/resumes/{jobId}` | `AIRecommendController.java` |
| 3.4 简历推荐岗位 | 实现反向推荐 | 同上 |
| 3.5 相似简历推荐 | 在简历详情页推荐相似简历 | 前端组件 |
| 3.6 面试问题智能生成 | 基于知识库生成定制化问题 | 集成到面试安排功能 |

**验收标准**：
- [ ] 匹配得分综合考虑关键词和语义相似度
- [ ] 推荐功能能够返回相关度高的结果
- [ ] 面试问题生成能参考历史优质问题

---

### 4.4 第四阶段（Week 4）：学习与洞察

**目标**：实现系统的自我学习能力，提供数据分析洞察

| 任务 | 详情 | 产出 |
|------|------|------|
| 4.1 匹配结果反馈 | 记录实际录用结果，用于优化算法 | `AILearningService.java` |
| 4.2 简历质量分析 | AI给出简历优化建议 | `/api/ai/analyze/resume/{id}` |
| 4.3 招聘漏斗分析 | AI生成招聘数据分析报告 | `/api/ai/analytics/funnel` |
| 4.4 内容生成历史 | 记录JD、面试题等生成历史 | `AiGenerationHistoryMapper` |
| 4.5 用户反馈机制 | 对AI生成内容进行评分 | 前端评分组件 |

**验收标准**：
- [ ] 能够记录和查询AI功能的实际使用效果
- [ ] 简历质量分析能给出有价值的建议
- [ ] 数据分析报告有实际指导意义

---

## 五、技术选型

### 5.1 Embedding模型

| 模型 | 维度 | 成本 | 效果 | 推荐场景 |
|------|------|------|------|----------|
| OpenAI `text-embedding-ada-002` | 1536 | $0.0001/1K tokens | ⭐⭐⭐⭐⭐ | 有API额度 |
| 本地 `all-MiniLM-L6-v2` | 384 | 免费 | ⭐⭐⭐⭐ | 无API或需离线 |
| 本地 `bge-large-zh-v1.5` | 1024 | 免费 | ⭐⭐⭐⭐⭐ | 中文场景（推荐） |

**推荐方案**：
- 开发阶段：使用OpenAI API（快速验证）
- 生产阶段：部署本地模型（如`bge-large-zh-v1.5`，使用Ollama或FastAPI封装）

### 5.2 向量数据库

| 方案 | 优点 | 缺点 | 推荐场景 |
|------|------|------|----------|
| MySQL VECTOR | 无需额外依赖，运维简单 | 性能一般，功能有限 | 小规模（<10万条） |
| Chroma | 轻量级，易于部署 | 功能相对简单 | 中等规模 |
| Milvus | 功能强大，性能优秀 | 部署复杂 | 大规模（>100万条） |

**推荐方案**：
- 当前阶段：使用MySQL VECTOR（项目规模小，简化架构）
- 未来扩展：迁移到Chroma或Milvus

### 5.3 Spring AI版本

- 当前：`1.0.0-M4`
- 推荐：升级到`1.0.0-RC1`（更稳定，支持更多功能）

---

## 六、前端改动概览

### 6.1 新增页面

| 页面 | 路由 | 功能 |
|------|------|------|
| 知识库管理 | `/ai/knowledge` | 查看统计、触发向量化、搜索测试 |
| 会话历史 | `/ai/history` | 查看历史对话、继续对话 |
| 智能推荐 | `/resume/recommend/:jobId` | 查看岗位推荐的简历 |
| 简历分析 | `/resume/analysis/:id` | 查看AI给出的简历优化建议 |

### 6.2 改造页面

| 页面 | 改动 |
|------|------|
| `AiCenterView.vue` | 新增会话管理、知识来源展示、历史对话查看 |
| `ResumeListView.vue` | 新增"查看相似简历"按钮、简历质量评分展示 |
| `JobListView.vue` | 新增"推荐简历"按钮 |
| `InterviewArrangement.vue` | 集成智能面试题生成 |

---

## 七、后端改动概览

### 7.1 新增文件

```
hr-recruit-backend/
├── src/main/java/com/hr/recruit/
│   ├── controller/
│   │   ├── AiRecommendController.java         # 智能推荐接口
│   │   ├── AIAnalyticsController.java        # 数据分析接口
│   │   └── KnowledgeBaseController.java      # 知识库管理接口
│   ├── service/
│   │   ├── KnowledgeBaseService.java         # 知识库服务
│   │   ├── RAGService.java                  # RAG检索服务
│   │   ├── ResumeMatchService.java           # 混合匹配服务
│   │   ├── AILearningService.java            # 学习优化服务
│   │   └── VectorizationService.java         # 向量化服务
│   ├── entity/
│   │   ├── ResumeVector.java                # 简历向量实体
│   │   ├── JobVector.java                   # 岗位向量实体
│   │   ├── AiChatHistory.java               # AI对话历史
│   │   ├── AiMatchHistory.java              # 匹配历史
│   │   └── AiGenerationHistory.java          # 生成历史
│   └── mapper/
│       ├── ResumeVectorMapper.java
│       ├── JobVectorMapper.java
│       ├── AiChatHistoryMapper.java
│       └── ...
```

### 7.2 修改文件

| 文件 | 改动 |
|------|------|
| `AiController.java` | 改造`/chat`接口，集成RAG |
| `ResumeController.java` | 新增分析接口 |
| `pom.xml` | 新增Spring AI VectorStore依赖 |

---

## 八、测试计划

### 8.1 单元测试

| 测试对象 | 测试用例 |
|----------|----------|
| `VectorizationService` | 简历文本拼接是否正确、向量维度是否正确 |
| `RAGService` | 检索结果相关性、上下文拼接格式 |
| `ResumeMatchService` | 混合得分计算、相似简历推荐 |

### 8.2 集成测试

1. **知识库流程**：向量化 → 检索 → 返回结果
2. **RAG问答流程**：提问 → 检索知识 → AI回答 → 记录历史
3. **推荐流程**：输入岗位 → 返回推荐简历 → 查看详情

### 8.3 用户验收测试（UAT）

| 场景 | 操作步骤 | 预期结果 |
|------|----------|----------|
| 智能问答增强 | 问"推荐几个Java工程师的简历" | 返回知识库中的相关简历 |
| 简历匹配 | 点击"匹配岗位"按钮 | 显示混合得分和详细分析 |
| 面试问题生成 | 安排面试时点击"生成问题" | 返回定制化问题 |
| 简历质量分析 | 查看简历详情页的"AI分析"标签 | 显示评分和优化建议 |

---

## 九、风险评估

| 风险 | 影响 | 应对措施 |
|------|------|----------|
| Embedding API额度不足 | 无法向量化新数据 | 部署本地Embedding模型 |
| 向量检索性能问题 | 大规模数据检索慢 | 优化索引、限制检索范围 |
| AI回答质量不稳定 | 用户体验差 | 优化Prompt、增加结果校验 |
| 历史数据质量差 | 影响推荐效果 | 数据清洗、人工标注优质样本 |

---

## 十、成果交付

### 10.1 代码交付

- [ ] 后端：新增Service、Controller、Entity、Mapper等
- [ ] 前端：新增页面、改造现有页面
- [ ] 数据库：新增表结构的Flyway迁移脚本

### 10.2 文档交付

- [ ] 《AI功能优化设计文档》（本文档）
- [ ] 《API接口文档》（新增接口说明）
- [ ] 《部署手册》（向量数据库配置、Embedding模型部署）
- [ ] 《用户使用手册》（AI功能操作指南）

### 10.3 演示场景

1. **知识库问答演示**：提问岗位要求、简历信息，展示AI如何从知识库检索答案
2. **智能推荐演示**：为一个岗位推荐简历，展示推荐列表和匹配分析
3. **简历分析演示**：上传一份简历，展示AI给出的质量评分和优化建议
4. **数据分析演示**：生成招聘漏斗分析报告，展示数据洞察

---

## 附录：快速开始

### A. 初始化知识库

```bash
# 1. 向量化所有现有数据
curl -X POST http://localhost:5500/api/knowledge/embed-all \
  -H "Authorization: Bearer {token}"

# 2. 查看知识库统计
curl http://localhost:5500/api/knowledge/stats \
  -H "Authorization: Bearer {token}"
```

### B. 测试RAG问答

```bash
# 1. 提问（应该能检索到知识库内容）
curl http://localhost:5500/api/ai/chat?message=推荐几个Java开发工程师的简历 \
  -H "Authorization: Bearer {token}"

# 2. 查看对话历史
curl http://localhost:5500/api/ai/history?sessionId=xxx \
  -H "Authorization: Bearer {token}"
```

### C. 测试推荐功能

```bash
# 1. 为岗位推荐简历
curl http://localhost:5500/api/ai/recommend/resumes/1 \
  -H "Authorization: Bearer {token}"

# 2. 为简历推荐岗位
curl http://localhost:5500/api/ai/recommend/jobs/1 \
  -H "Authorization: Bearer {token}"
```

---

**文档版本**：V3.0  
**最后更新**：2026-06-12  
**编写人**：AI助手  
**审核人**：___________
