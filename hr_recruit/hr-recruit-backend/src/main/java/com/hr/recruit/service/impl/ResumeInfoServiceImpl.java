package com.hr.recruit.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.hr.recruit.entity.ResumeFile;
import com.hr.recruit.entity.ResumeInfo;
import com.hr.recruit.mapper.ResumeFileMapper;
import com.hr.recruit.mapper.ResumeInfoMapper;
import com.hr.recruit.service.ResumeInfoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResumeInfoServiceImpl extends ServiceImpl<ResumeInfoMapper, ResumeInfo> implements ResumeInfoService {

    private final ResumeFileMapper resumeFileMapper;
    private final ChatClient chatClient;

    @Value("${app.upload.path:uploads/}")
    private String uploadPath;

    @Override
    public Long uploadAndParse(MultipartFile file) {
        // 1. 保存文件到本地（使用UUID确保文件名安全）
        String originalFilename = file.getOriginalFilename();
        String ext = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            ext = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String safeName = UUID.randomUUID() + ext;
        Path targetPath = Paths.get(uploadPath, "resume", safeName);
        try {
            Files.createDirectories(targetPath.getParent());
            file.transferTo(targetPath);
        } catch (IOException e) {
            throw new RuntimeException("文件保存失败: " + e.getMessage(), e);
        }

        // 2. 创建 resume_file 记录
        ResumeFile resumeFile = new ResumeFile();
        resumeFile.setFileName(originalFilename);
        resumeFile.setFileType(file.getContentType());
        resumeFile.setFilePath(targetPath.toString());
        resumeFile.setFileSize(file.getSize());
        resumeFile.setParseStatus(0);
        resumeFileMapper.insert(resumeFile);

        // 3. 创建 resume_info 记录（仅基本信息）
        ResumeInfo resumeInfo = new ResumeInfo();
        resumeInfo.setName(originalFilename);
        resumeInfo.setSourceFileId(resumeFile.getId());
        baseMapper.insert(resumeInfo);

        // 4. 异步解析（简化：直接调用）
        parseResume(resumeInfo.getId());

        return resumeInfo.getId();
    }

    @Override
    public Long uploadFile(MultipartFile file) {
        String originalFilename = file.getOriginalFilename();
        String ext = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            ext = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String safeName = UUID.randomUUID() + ext;
        Path targetPath = Paths.get(uploadPath, "resume", safeName);
        try {
            Files.createDirectories(targetPath.getParent());
            file.transferTo(targetPath);
        } catch (IOException e) {
            throw new RuntimeException("文件保存失败: " + e.getMessage(), e);
        }

        ResumeFile resumeFile = new ResumeFile();
        resumeFile.setFileName(originalFilename);
        resumeFile.setFileType(file.getContentType());
        resumeFile.setFilePath(targetPath.toString());
        resumeFile.setFileSize(file.getSize());
        resumeFile.setParseStatus(0);
        resumeFileMapper.insert(resumeFile);

        return resumeFile.getId();
    }

    private static final com.fasterxml.jackson.databind.ObjectMapper SHARED_MAPPER =
            new com.fasterxml.jackson.databind.ObjectMapper();

    @Override
    public void parseResume(Long resumeId) {
        ResumeInfo resumeInfo = baseMapper.selectById(resumeId);
        if (resumeInfo == null || resumeInfo.getSourceFileId() == null) {
            log.warn("简历不存在或缺少源文件: resumeId={}", resumeId);
            return;
        }

        ResumeFile resumeFile = resumeFileMapper.selectById(resumeInfo.getSourceFileId());
        if (resumeFile == null) {
            log.warn("源文件记录不存在: fileId={}", resumeInfo.getSourceFileId());
            return;
        }

        try {
            // 1. 根据文件类型提取文本内容
            String textContent = extractTextFromFile(resumeFile.getFilePath(), resumeFile.getFileName());

            if (textContent != null && !textContent.trim().isEmpty()) {
                log.info("文本提取成功, 文本长度: {}", textContent.length());

                // 2. 使用AI解析结构化信息
                parseWithAi(resumeInfo, textContent);

                // 3. 更新解析状态
                resumeFile.setParseStatus(1);
            } else {
                log.warn("文本为空或提取失败，使用基础信息");
                resumeFile.setParseStatus(2); // 部分成功
            }

            resumeFileMapper.updateById(resumeFile);
            log.info("简历解析完成: resumeId={}", resumeId);

        } catch (Exception e) {
            log.error("简历解析失败: resumeId={}, error={}", resumeId, e.getMessage(), e);
            resumeFile.setParseStatus(-1);
            resumeFileMapper.updateById(resumeFile);
        }
    }
    
    /**
     * 根据文件扩展名自动选择解析器提取文本
     */
    private String extractTextFromFile(String filePath, String fileName) {
        if (fileName != null && fileName.toLowerCase().endsWith(".docx")) {
            return extractTextFromDocx(filePath);
        }
        return extractTextFromPdf(filePath);
    }

    /**
     * 使用Apache PDFBox从PDF文件中提取文本
     */
    private String extractTextFromPdf(String filePath) {
        try {
            Path path = Paths.get(filePath);
            if (!Files.exists(path)) {
                log.error("PDF文件不存在: {}", filePath);
                return null;
            }

            org.apache.pdfbox.pdmodel.PDDocument document =
                org.apache.pdfbox.Loader.loadPDF(path.toFile());
            org.apache.pdfbox.text.PDFTextStripper stripper =
                new org.apache.pdfbox.text.PDFTextStripper();
            String text = stripper.getText(document);
            document.close();

            return text.trim();
        } catch (Exception e) {
            log.error("PDF文本提取失败: filePath={}, error={}", filePath, e.getMessage(), e);
            return null;
        }
    }

    /**
     * 使用Apache POI从DOCX文件中提取文本
     */
    private String extractTextFromDocx(String filePath) {
        try (InputStream is = Files.newInputStream(Paths.get(filePath));
             XWPFDocument doc = new XWPFDocument(is);
             XWPFWordExtractor extractor = new XWPFWordExtractor(doc)) {
            String text = extractor.getText();
            return text != null ? text.trim() : null;
        } catch (Exception e) {
            log.error("DOCX文本提取失败: filePath={}, error={}", filePath, e.getMessage(), e);
            return null;
        }
    }
    
    /**
     * 使用AI（DeepSeek）解析简历文本，提取结构化信息
     */
    private void parseWithAi(ResumeInfo resumeInfo, String textContent) {
        try {
            String prompt = buildResumeParsingPrompt(textContent);
            
            // 调用AI解析
            String aiResponse = chatClient.prompt()
                .user(prompt)
                .call()
                .content();
            
            log.info("AI解析结果: {}", aiResponse);
            
            // 解析JSON响应并更新简历信息
            updateResumeFromAiResponse(resumeInfo, aiResponse);
            
            baseMapper.updateById(resumeInfo);
            log.info("简历信息已通过AI解析更新: resumeId={}", resumeInfo.getId());
            
        } catch (Exception e) {
            log.error("AI解析失败: error={}", e.getMessage(), e);
            // AI解析失败时使用正则表达式作为备选方案
            fallbackRegexParsing(resumeInfo, textContent);
            baseMapper.updateById(resumeInfo);
        }
    }
    
    /**
     * 构建AI解析提示词
     */
    private String buildResumeParsingPrompt(String textContent) {
        return """
            你是一个专业的HR简历分析助手。请从以下简历文本中提取关键信息，并以严格的JSON格式返回。
            
            简历文本：
            %s
            
            请返回以下格式的JSON（不要包含其他任何文字）：
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
            
            注意：如果某项信息找不到，请返回null。确保返回的是有效JSON格式。
            """.formatted(textContent.substring(0, Math.min(textContent.length(), 8000)));
    }
    
    /**
     * 解析AI响应并更新简历实体
     */
    private void updateResumeFromAiResponse(ResumeInfo resumeInfo, String response) throws JsonProcessingException {
        try {
            // 提取JSON部分（去除可能的markdown代码块标记）
            String jsonStr = response.replaceAll("```json\\s*", "").replaceAll("```", "").trim();
            
            java.util.Map<String, Object> result = SHARED_MAPPER.readValue(jsonStr, java.util.Map.class);
            
            if (result.containsKey("name") && result.get("name") != null) {
                resumeInfo.setName(String.valueOf(result.get("name")));
            }
            if (result.containsKey("phone") && result.get("phone") != null) {
                resumeInfo.setPhone(String.valueOf(result.get("phone")));
            }
            if (result.containsKey("email") && result.get("email") != null) {
                resumeInfo.setEmail(String.valueOf(result.get("email")));
            }
            if (result.containsKey("gender") && result.get("gender") != null) {
                resumeInfo.setGender(String.valueOf(result.get("gender")));
            }
            if (result.containsKey("age") && result.get("age") != null) {
                resumeInfo.setAge(Integer.valueOf(result.get("age").toString()));
            }
            if (result.containsKey("currentCompany") && result.get("currentCompany") != null) {
                resumeInfo.setCurrentCompany(String.valueOf(result.get("currentCompany")));
            }
            if (result.containsKey("currentPosition") && result.get("currentPosition") != null) {
                resumeInfo.setCurrentPosition(String.valueOf(result.get("currentPosition")));
            }
            if (result.containsKey("workYears") && result.get("workYears") != null) {
                resumeInfo.setWorkYears(Integer.valueOf(result.get("workYears").toString()));
            }
            if (result.containsKey("educationLevel") && result.get("educationLevel") != null) {
                resumeInfo.setEducationLevel(String.valueOf(result.get("educationLevel")));
            }
            if (result.containsKey("schoolName") && result.get("schoolName") != null) {
                resumeInfo.setSchoolName(String.valueOf(result.get("schoolName")));
            }
            if (result.containsKey("major") && result.get("major") != null) {
                resumeInfo.setMajor(String.valueOf(result.get("major")));
            }
            if (result.containsKey("skillTags") && result.get("skillTags") != null) {
                resumeInfo.setSkillTags(String.valueOf(result.get("skillTags")));
            }
            if (result.containsKey("selfEvaluation") && result.get("selfEvaluation") != null) {
                resumeInfo.setSelfEvaluation(String.valueOf(result.get("selfEvaluation")));
            }
        } catch (Exception e) {
            log.error("解析AI JSON响应失败: error={}", e.getMessage(), e);
            throw e;
        }
    }
    
    /**
     * 备选方案：使用正则表达式解析基本信息
     */
    private void fallbackRegexParsing(ResumeInfo resumeInfo, String textContent) {
        log.info("使用正则表达式作为备选方案进行简历解析");
        
        // 手机号正则
        Pattern phonePattern = Pattern.compile("(?:1[3-9]\\d{9})");
        Matcher phoneMatcher = phonePattern.matcher(textContent);
        if (phoneMatcher.find()) {
            resumeInfo.setPhone(phoneMatcher.group());
        }
        
        // 邮箱正则
        Pattern emailPattern = Pattern.compile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");
        Matcher emailMatcher = emailPattern.matcher(textContent);
        if (emailMatcher.find()) {
            resumeInfo.setEmail(emailMatcher.group());
        }
        
        // 学历匹配
        String[] educationKeywords = {"博士研究生", "硕士研究生", "硕士", "本科", "专科", "大专"};
        for (String edu : educationKeywords) {
            if (textContent.contains(edu)) {
                resumeInfo.setEducationLevel(edu);
                break;
            }
        }
        
        // 技能关键词（常见技术栈）
        StringBuilder skills = new StringBuilder();
        String[] techStack = {"Java", "Python", "JavaScript", "Vue", "React", "Spring Boot", 
                             "MySQL", "Redis", "Docker", "Kubernetes", "Linux", "Git",
                             "机器学习", "深度学习", "NLP", "大数据"};
        for (String skill : techStack) {
            if (textContent.contains(skill)) {
                if (skills.length() > 0) skills.append(",");
                skills.append(skill);
            }
        }
        if (skills.length() > 0) {
            resumeInfo.setSkillTags(skills.toString());
        }
    }
}
