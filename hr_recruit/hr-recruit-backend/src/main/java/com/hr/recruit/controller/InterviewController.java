package com.hr.recruit.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.hr.recruit.common.Result;
import com.hr.recruit.entity.InterviewArrangement;
import com.hr.recruit.entity.InterviewEvaluation;
import com.hr.recruit.entity.InterviewInterviewer;
import com.hr.recruit.mapper.InterviewArrangementMapper;
import com.hr.recruit.mapper.InterviewEvaluationMapper;
import com.hr.recruit.mapper.InterviewInterviewerMapper;
import com.hr.recruit.service.InterviewArrangementService;
import com.hr.recruit.vo.InterviewVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
public class InterviewController {

    private final InterviewArrangementService interviewService;
    private final InterviewArrangementMapper interviewMapper;
    private final InterviewEvaluationMapper evaluationMapper;
    private final InterviewInterviewerMapper interviewerMapper;

    @GetMapping
    public Result<Page<InterviewVO>> list(
            @RequestParam(defaultValue = "1") long pageNum,
            @RequestParam(defaultValue = "10") long pageSize,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String candidateName) {
        Page<InterviewVO> page = new Page<>(pageNum, pageSize);
        interviewMapper.selectInterviewVOList(page, status, candidateName);
        return Result.success(page);
    }

    @PostMapping
    public Result<Void> create(@RequestBody InterviewArrangement interview) {
        interviewService.save(interview);
        // 同步面试官记录
        saveInterviewInterviewers(interview.getId(), interview.getInterviewerIds());
        return Result.success("安排成功");
    }

    @PutMapping("/{interviewId}")
    public Result<Void> update(@PathVariable Long interviewId, @RequestBody InterviewArrangement interview) {
        interview.setId(interviewId);
        interviewService.updateById(interview);
        // 先删除旧记录，再插入新记录
        interviewerMapper.deleteByMap(Map.of("interview_id", interviewId));
        saveInterviewInterviewers(interviewId, interview.getInterviewerIds());
        return Result.success("更新成功");
    }

    private void saveInterviewInterviewers(Long interviewId, List<Long> interviewerIds) {
        if (interviewerIds == null || interviewerIds.isEmpty()) return;
        List<InterviewInterviewer> list = interviewerIds.stream().map(iid -> {
            InterviewInterviewer ii = new InterviewInterviewer();
            ii.setInterviewId(interviewId);
            ii.setInterviewerId(iid);
            ii.setStatus("PENDING");
            return ii;
        }).collect(Collectors.toList());
        for (InterviewInterviewer ii : list) {
            interviewerMapper.insert(ii);
        }
    }

    @PostMapping("/{interviewId}/evaluation")
    public Result<Void> submitEvaluation(@PathVariable Long interviewId, @RequestBody Map<String, Object> data) {
        InterviewEvaluation eval = new InterviewEvaluation();
        eval.setInterviewId(interviewId);
        eval.setScore(data.containsKey("score") ? Integer.valueOf(data.get("score").toString()) : null);
        eval.setEvaluation(data.containsKey("comments") ? data.get("comments").toString() : null);
        eval.setInterviewerId(data.containsKey("evaluatorId") ? Long.valueOf(data.get("evaluatorId").toString()) : null);
        evaluationMapper.insert(eval);

        InterviewArrangement interview = new InterviewArrangement();
        interview.setId(interviewId);
        interview.setStatus("COMPLETED");
        if (data.containsKey("comments")) {
            log.info("面试评价已记录: interviewId={}", interviewId);
        }
        interviewService.updateById(interview);
        return Result.success("评价提交成功");
    }

    @GetMapping("/{interviewId}/summary")
    public Result<String> getSummary(@PathVariable Long interviewId) {
        return Result.success("暂无面试摘要", "暂无面试摘要");
    }
}
