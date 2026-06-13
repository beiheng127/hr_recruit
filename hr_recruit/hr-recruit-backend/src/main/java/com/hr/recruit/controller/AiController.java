package com.hr.recruit.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final ChatClient chatClient;

    @PostMapping("/generate-jd")
    public String generateJd(@RequestBody Map<String, String> req) {
        String prompt = """
            请根据以下信息生成一份专业的招聘岗位JD（职位描述）：
            岗位名称：%s
            部门：%s
            要求：%s
            
            请按以下格式输出：
            ## 岗位职责
            ## 任职要求
            ## 我们提供
            语言专业、简洁，适合发布到招聘网站。
            """.formatted(req.get("positionName"), req.get("department"), req.get("requirement"));

        return chatClient.prompt()
                .system("你是专业的HR招聘专家")
                .user(prompt)
                .call()
                .content();
    }

    @PostMapping("/match")
    public String matchResumeJob(@RequestBody Map<String, String> req) {
        String prompt = """
            请分析以下简历与岗位的匹配程度：
            
            岗位要求：%s
            
            简历内容：%s
            
            请输出JSON格式：
            {
              "matchScore": 分数(0-100),
              "matchReason": "匹配理由摘要",
              "matchDetail": {"技能匹配": "...", "经验匹配": "...", "学历匹配": "..."}
            }
            """.formatted(req.get("jobRequirement"), req.get("resumeText"));

        return chatClient.prompt().user(prompt).call().content();
    }

    @PostMapping("/generate-questions")
    public String generateQuestions(@RequestBody Map<String, String> req) {
        String prompt = """
            请根据以下简历和岗位信息，生成5道针对性的面试题目（3道技术题+2道行为题）：
            岗位：%s
            简历技能：%s
            简历经历：%s
            
            每道题请给出参考答案要点。
            """.formatted(req.get("position"), req.get("skills"), req.get("experience"));

        return chatClient.prompt().user(prompt).call().content();
    }

    @GetMapping(value = "/chat", produces = "text/event-stream")
    public Flux<String> chat(@RequestParam String message) {
        return chatClient.prompt()
                .system("你是HR招聘管理系统的智能助手，可以回答关于岗位发布、简历管理、面试安排、录用流程等问题。请用中文回答，回答简洁专业。")
                .user(message)
                .stream().content();
    }

    @PostMapping("/chat")
    public String chatPost(@RequestBody Map<String, String> req) {
        return chatClient.prompt()
                .system("你是HR招聘管理系统的智能助手，可以回答关于岗位发布、简历管理、面试安排、录用流程等问题。请用中文回答，回答简洁专业。")
                .user(req.get("message"))
                .call()
                .content();
    }

    @GetMapping("/summary/{interviewId}")
    public String summarizeEvaluation(@PathVariable Long interviewId) {
        return chatClient.prompt()
                .system("你是专业的HR面试官，请根据面试记录生成一份面试评价摘要。")
                .user("请为面试ID " + interviewId + " 生成面试评价摘要，包含候选人综合表现、优点、需改进点、是否建议录用。")
                .call()
                .content();
    }
}
