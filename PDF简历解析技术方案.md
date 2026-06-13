# PDF简历解析技术方案

## 1. 技术选型与对比分析

### 1.1 主流技术方案对比

| 方案 | 技术栈 | 中文支持 | 准确度 | 复杂度 | 推荐指数 |
|------|--------|----------|--------|--------|----------|
| **Apache PDFBox + AI (DeepSeek)** | Java + Spring AI | ⭐⭐⭐⭐⭐ | 高 | 中 | ★★★★★ |
| Apache Tika + NLP | Java + OpenNLP/Stanford NLP | ⭐⭐⭐ | 中 | 高 | ★★★☆☆ |
| GATE框架 | Java + GATE | ⭐⭐ | 中（英文为主） | 很高 | ★★☆☆☆ |
| PaddleOCR + LLM | Python + PaddlePaddle | ⭐⭐⭐⭐⭐ | 很高 | 高 | ★★★★☆ |

### 1.2 推荐方案：Apache PDFBox + DeepSeek AI

**选择理由：**
1. **已有依赖**：项目已集成 `apache-pdfbox:3.0.1` 和 `Spring AI (DeepSeek)`
2. **中文支持好**：DeepSeek对中文理解能力强
3. **实现简单**：无需引入额外复杂依赖
4. **准确度高**：AI能理解上下文，提取信息更准确
5. **可扩展性强**：可以轻松添加新的字段或调整解析逻辑

---

## 2. 技术架构

### 2.1 整体流程图

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   上传PDF    │ ──▶ │  Apache PDFBox   │ ──▶ │  提取文本内容    │
│   简历文件   │     │  文本提取         │     │  (纯文本)        │
└─────────────┘     └──────────────────┘     └────────┬─────────┘
                                                      │
                                                      ▼
                                              ┌──────────────────┐
                                              │  DeepSeek AI 解析 │
                                              │  (ChatClient)      │
                                              └────────┬─────────┘
                                                      │
                                                      ▼
                                              ┌──────────────────┐
                                              │  结构化JSON结果   │
                                              │  {name, phone,    │
                                              │   email, skills...}│
                                              └────────┬─────────┘
                                                      │
                                                      ▼
                                              ┌──────────────────┐
                                              │  更新ResumeInfo   │
                                              │  数据库记录        │
                                              └──────────────────┘
```

### 2.2 核心组件

```
hr-recruit-backend/
├── src/main/java/com/hr/recruit/
│   ├── service/impl/
│   │   └── ResumeInfoServiceImpl.java      # 简历解析核心逻辑
│   ├── config/
│   │   └── AiConfig.java                   # ChatClient Bean配置
│   └── entity/
│       └── ResumeInfo.java                 # 简历实体类
│
├── pom.xml                                 # Maven依赖配置
│   └── apache-pdfbox:3.0.1                 # PDF文本提取库
│   └── spring-ai-openai-spring-boot-starter # AI调用（DeepSeek）
```

---

## 3. 详细实现说明

### 3.1 PDF文本提取（Apache PDFBox）

```java
// 使用PDFBox从PDF文件中提取纯文本
private String extractTextFromPdf(String filePath) {
    // 1. 加载PDF文件
    PDDocument document = PDDocument.load(path.toFile());
    
    // 2. 创建文本提取器
    PDFTextStripper stripper = new PDFTextStripper();
    
    // 3. 提取文本
    String text = stripper.getText(document);
    
    // 4. 关闭文档
    document.close();
    
    return text.trim();
}
```

**PDFBox优势：**
- ✅ 支持标准PDF格式（非扫描件）
- ✅ 保持原始文本顺序
- ✅ 处理中文无乱码问题
- ✅ 性能优秀（处理速度快）

### 3.2 AI智能解析（DeepSeek）

#### 3.2.1 Prompt设计

```java
String prompt = """
    你是一个专业的HR简历分析助手。请从以下简历文本中提取关键信息，并以严格的JSON格式返回。
    
    简历文本：
    %s
    
    请返回以下格式的JSON：
    {
      "name": "姓名",
      "phone": "手机号",
      "email": "邮箱",
      "gender": "男/女",
      "age": 数字,
      "currentCompany": "当前公司",
      "currentPosition": "当前职位",
      "workYears": 工作年限数字,
      "educationLevel": "学历(本科/硕士/博士等)",
      "schoolName": "学校名称",
      "major": "专业",
      "skillTags": "技能标签，用逗号分隔",
      "selfEvaluation": "自我评价"
    }
    """;
```

#### 3.2.2 AI调用

```java
// 调用DeepSeek API进行解析
String aiResponse = chatClient.prompt()
    .user(prompt)
    .call()
    .content();
```

**AI解析优势：**
- ✅ 理解中文语义和上下文
- ✅ 能识别各种简历格式
- ✅ 提取隐含信息（如工作年限推算）
- ✅ 自动纠错（如"微服务架构师"→"后端开发工程师"）
- ✅ 可持续优化（通过调整Prompt提升准确率）

### 3.3 备选方案：正则表达式解析

当AI服务不可用时，使用正则表达式作为备选：

```java
// 手机号匹配：1开头的11位数字
Pattern phonePattern = Pattern.compile("(?:1[3-9]\\d{9})");

// 邮箱匹配：标准邮箱格式
Pattern emailPattern = Pattern.compile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");

// 学历关键词匹配
String[] educationKeywords = {"博士研究生", "硕士研究生", "硕士", "本科", "专科"};

// 技术栈关键词匹配
String[] techStack = {"Java", "Python", "Spring Boot", "Vue", "React", ...};
```

---

## 4. 提取的信息字段说明

| 字段名 | 数据类型 | 说明 | 示例 |
|--------|----------|------|------|
| name | String | 候选人姓名 | 张三 |
| phone | String | 手机号 | 13812345678 |
| email | String | 电子邮箱 | zhangsan@email.com |
| gender | String | 性别 | 男/女 |
| age | Integer | 年龄 | 28 |
| currentCompany | String | 当前公司 | 阿里巴巴集团 |
| currentPosition | String | 当前职位 | 高级Java开发工程师 |
| workYears | Integer | 工作年限 | 5 |
| educationLevel | String | 最高学历 | 本科 |
| schoolName | String | 毕业院校 | 北京大学 |
| major | String | 专业 | 计机科学与技术 |
| skillTags | String | 技能标签（逗号分隔） | Java,Spring Boot,MySQL,Redis |
| selfEvaluation | String | 自我评价 | 5年Java开发经验... |

---

## 5. GitHub参考资源

### 5.1 相关开源项目

1. **Nixer/resume-parser-java** ⭐推荐
   - 地址：https://github.com/Nixer/resume-parser-java
   - 技术：Spring Boot + GATE框架
   - 特点：支持多格式（PDF/DOC/HTML），但主要支持英文

2. **Apache Tika** - 文档解析工具包
   - 地址：https://github.com/apache/tika
   - 特点：支持1000+文件格式，强大的文本提取能力

3. **Apache PDFBox** - PDF处理库
   - 地址：https://pdfbox.apache.org/
   - 特点：纯Java实现，性能优秀

4. **OpenNLP** - 自然语言处理工具包
   - 地址：https://opennlp.apache.org/
   - 特点：命名实体识别(NER)，分词，词性标注

5. **pgardunoc/resume-parser** - AI驱动的简历解析
   - 地址：https://github.com/pgardunoc/resume-parser
   - 技术：Python + Hugging Face AI
   - 特点：使用大语言模型解析，准确率高

6. **PaddleOCR/PaddleNLP** - 百度深度学习平台
   - 地址：https://github.com/PaddlePaddle
   - 特点：中文OCR和NLP效果极佳

### 5.2 推荐阅读文章

- [OpenResume解析算法深度揭秘](https://blog.csdn.net/gitblog_00016/article/details/154102481)
- [SpringBoot + Apache Tika：一站式解决文件数据提取难题](https://jishuzhan.net/article/1966389127941242881)
- [简历智能筛选工具：78秒完成PDF解析与结构化匹配](https://blog.csdn.net/weixin_31528001/article/details/161847345)

---

## 6. 配置要求

### 6.1 Maven依赖（已集成）

```xml
<!-- PDF文本提取 -->
<dependency>
    <groupId>org.apache.pdfbox</groupId>
    <artifactId>pdfbox</artifactId>
    <version>3.0.1</version>
</dependency>

<!-- Spring AI (DeepSeek) -->
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-openai-spring-boot-starter</artifactId>
    <version>1.0.0-M4</version>
</dependency>
```

### 6.2 应用配置

```yaml
# application.yml
spring:
  ai:
    openai:
      api-key: ${DEEPSEEK_API_KEY}
      base-url: https://api.deepseek.com/v1
      chat:
        options:
          model: deepseek-chat
          temperature: 0.3
          max-tokens: 2000

app:
  upload:
    path: uploads/
```

---

## 7. 测试方法

### 7.1 手动测试

1. **准备测试PDF简历**：找一份中文PDF格式简历
2. **上传简历**：通过前端上传简历文件
3. **查看日志**：观察控制台输出：
   ```
   INFO  PDF文本提取成功, 文本长度: 3580
   INFO  AI解析结果: {"name":"张三","phone":"13812345678",...}
   INFO  简历信息已通过AI解析更新: resumeId=1
   ```
4. **验证数据库**：检查`resume_info`表中的字段是否正确填充

### 7.2 单元测试代码示例

```java
@Test
public void testParseResume() throws Exception {
    // 模拟上传PDF文件
    MultipartFile file = new MockMultipartFile(
        "test.pdf",
        "test.pdf",
        "application/pdf",
        Files.readAllBytes(Path.of("src/test/resources/test_resume.pdf"))
    );
    
    Long fileId = resumeInfoService.uploadFile(file);
    
    ResumeInfo resume = new ResumeInfo();
    resume.setName("测试");
    resume.setSourceFileId(fileId);
    resumeInfoService.save(resume);
    
    // 执行解析
    resumeInfoService.parseResume(resume.getId());
    
    // 验证结果
    ResumeInfo updated = resumeInfoService.getById(resume.getId());
    assertNotNull(updated.getPhone());
    assertNotNull(updated.getEmail());
    assertTrue(updated.getSkillTags().contains("Java"));
}
```

---

## 8. 性能优化建议

### 8.1 异步解析

对于大量简历批量导入场景，建议使用异步处理：

```java
@Async
@Override
public void parseResume(Long resumeId) {
    // 解析逻辑...
}
```

### 8.2 缓存优化

对相同内容的简历进行去重，避免重复调用AI API：

```java
@Cacheable(value = "resume-parse", key = "#resumeId")
public void parseResume(Long resumeId) { ... }
```

### 8.3 文本截断

避免发送过长的文本给AI（节省token）：

```java
// 截断到8000字符以内
String truncatedText = textContent.substring(0, Math.min(textContent.length(), 8000));
```

---

## 9. 常见问题排查

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| PDF文本为空 | PDF是扫描件（图片格式） | 使用OCR技术（如Tesseract、PaddleOCR） |
| AI返回格式错误 | Prompt不够明确 | 调整Prompt，强调JSON格式要求 |
| 手机号提取错误 | 正则匹配不准确 | 使用AI优先方案 |
| 中文乱码 | 编码问题 | 确保PDFBox版本≥2.0，设置UTF-8编码 |
| 解析超时 | AI响应慢 | 设置合理的timeout时间，考虑异步处理 |

---

## 10. 未来扩展方向

1. **OCR支持**：集成Tesseract或PaddleOCR处理扫描版PDF
2. **图片简历**：支持JPG/PNG格式的简历图片解析
3. **批量解析**：支持ZIP打包批量上传并解析
4. **解析模板自定义**：允许用户自定义需要提取的字段
5. **解析质量评估**：自动评估解析结果的置信度
6. **人工校正**：提供UI界面让用户手动修正解析结果

---

## 11. 总结

本方案采用**Apache PDFBox + DeepSeek AI**的组合方式，具有以下核心优势：

✅ **高准确性**：AI能理解语义，准确率远超传统正则/NLP方案  
✅ **中文友好**：DeepSeek对中文理解能力强  
✅ **易于维护**：代码简洁清晰，通过调整Prompt即可优化  
✅ **可扩展性**：轻松添加新字段或适配不同格式  
✅ **成本可控**：按API调用计费，无需额外服务器成本  

该方案已在项目中完整实现并通过测试验证。
