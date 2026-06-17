package com.hr.recruit.controller;

<<<<<<< HEAD
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.hr.recruit.common.Result;
import com.hr.recruit.entity.*;
import com.hr.recruit.mapper.InterviewArrangementMapper;
import com.hr.recruit.mapper.InterviewEvaluationMapper;
import com.hr.recruit.mapper.InterviewInterviewerMapper;
import com.hr.recruit.mapper.SysUserMapper;
import com.hr.recruit.service.ApplicantJobService;
import com.hr.recruit.service.CandidateStageRecordService;
import com.hr.recruit.service.InterviewArrangementService;
import com.hr.recruit.service.ResumeInfoService;
import com.hr.recruit.vo.InterviewVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
=======
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
>>>>>>> 1a1d158e371191531b75389502f38fd6b00454a3
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
<<<<<<< HEAD
    private final ApplicantJobService applicantJobService;
    private final CandidateStageRecordService stageRecordService;
    private final SysUserMapper sysUserMapper;
    private final ResumeInfoService resumeInfoService;
=======
>>>>>>> 1a1d158e371191531b75389502f38fd6b00454a3

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

<<<<<<< HEAD
    /**
     * 创建面试（通过 resumeId + jobId 自动构建关联链路）
     * 前端传入: resumeId, jobId, interviewTime, location, roundNum, interviewerIds
     * 后端自动: 查找/创建 applicant_job → 查找/创建 candidate_stage_record → 创建 interview
     */
    @PostMapping
    public Result<Void> create(@RequestBody Map<String, Object> data) {
        Long resumeId = data.get("resumeId") != null ? Long.valueOf(data.get("resumeId").toString()) : null;
        Long jobId = data.get("jobId") != null ? Long.valueOf(data.get("jobId").toString()) : null;

        if (resumeId == null || jobId == null) {
            return Result.error(400, "请选择候选人和应聘岗位");
        }

        // 1. 查找或创建 applicant_job 投递记录
        Long applicationId = findOrCreateApplication(resumeId, jobId);

        // 2. 查找或创建 candidate_stage_record 阶段记录
        Long stageRecordId = findOrCreateStageRecord(applicationId);

        // 3. 创建面试安排
        InterviewArrangement interview = new InterviewArrangement();
        interview.setStageRecordId(stageRecordId);
        if (data.containsKey("interviewTime") && data.get("interviewTime") != null) {
            try {
                String timeStr = data.get("interviewTime").toString();
                if (timeStr.contains("T")) {
                    interview.setInterviewTime(LocalDateTime.parse(timeStr, DateTimeFormatter.ISO_LOCAL_DATE_TIME));
                } else {
                    interview.setInterviewTime(LocalDateTime.parse(timeStr, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
                }
            } catch (DateTimeParseException e) {
                return Result.error(400, "面试时间格式错误，请使用 yyyy-MM-ddTHH:mm:ss 格式");
            }
        }
        interview.setLocation(data.containsKey("location") ? data.get("location").toString() : null);
        interview.setRoundNum(data.containsKey("roundNum") ? Integer.valueOf(data.get("roundNum").toString()) : 1);
        interview.setStatus("PENDING");
        interviewService.save(interview);

        // 4. 同步面试官记录
        @SuppressWarnings("unchecked")
        List<Long> interviewerIds = (List<Long>) data.get("interviewerIds");
        saveInterviewInterviewers(interview.getId(), interviewerIds);

        log.info("面试创建成功: interviewId={}, stageRecordId={}, applicationId={}", interview.getId(), stageRecordId, applicationId);
        return Result.success("面试创建成功");
    }

    @PutMapping("/{interviewId}")
    public Result<Void> update(@PathVariable Long interviewId, @RequestBody Map<String, Object> data) {
        InterviewArrangement interview = new InterviewArrangement();
        interview.setId(interviewId);
        if (data.containsKey("interviewTime") && data.get("interviewTime") != null) {
            try {
                String timeStr = data.get("interviewTime").toString();
                if (timeStr.contains("T")) {
                    interview.setInterviewTime(LocalDateTime.parse(timeStr, DateTimeFormatter.ISO_LOCAL_DATE_TIME));
                } else {
                    interview.setInterviewTime(LocalDateTime.parse(timeStr, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
                }
            } catch (DateTimeParseException e) {
                // 忽略时间格式错误，不更新时间字段
            }
        }
        if (data.containsKey("location")) {
            interview.setLocation(data.get("location").toString());
        }
        if (data.containsKey("roundNum")) {
            interview.setRoundNum(Integer.valueOf(data.get("roundNum").toString()));
        }
        if (data.containsKey("status")) {
            interview.setStatus(data.get("status").toString());
        }
        interviewService.updateById(interview);

        // 先删除旧面试官记录，再插入新记录
        interviewerMapper.deleteByMap(Map.of("interview_id", interviewId));
        @SuppressWarnings("unchecked")
        List<Long> interviewerIds = (List<Long>) data.get("interviewerIds");
        saveInterviewInterviewers(interviewId, interviewerIds);
        return Result.success("更新成功");
    }

    /**
     * 获取面试官列表（所有启用状态的用户）
     */
    @GetMapping("/interviewers")
    public Result<List<Map<String, Object>>> listInterviewers() {
        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysUser::getStatus, 1)
               .eq(SysUser::getDeleted, 0)
               .orderByAsc(SysUser::getId);
        List<SysUser> users = sysUserMapper.selectList(wrapper);
        List<Map<String, Object>> result = users.stream().map(u -> {
            Map<String, Object> item = new HashMap<>();
            item.put("id", u.getId());
            item.put("realName", u.getRealName());
            item.put("username", u.getUsername());
            item.put("role", u.getRole());
            String label = u.getRealName() != null ? u.getRealName() : u.getUsername();
            if (u.getRole() != null && !u.getRole().isEmpty()) {
                label += "（" + getRoleLabel(u.getRole()) + "）";
            }
            item.put("label", label);
            return item;
        }).collect(Collectors.toList());
        return Result.success(result);
    }

    /**
     * 获取候选人简单列表（供新建面试下拉搜索用，不分页）
     */
    @GetMapping("/candidates")
    public Result<List<Map<String, Object>>> listCandidates(
            @RequestParam(required = false) String keyword) {
        LambdaQueryWrapper<ResumeInfo> wrapper = new LambdaQueryWrapper<>();
        if (keyword != null && !keyword.isBlank()) {
            wrapper.and(w -> w.like(ResumeInfo::getName, keyword)
                           .or().like(ResumeInfo::getPhone, keyword));
        }
        wrapper.eq(ResumeInfo::getDeleted, 0)
               .orderByDesc(ResumeInfo::getCreateTime)
               .last("LIMIT 50");
        List<ResumeInfo> list = resumeInfoService.list(wrapper);
        List<Map<String, Object>> result = list.stream().map(r -> {
            Map<String, Object> item = new HashMap<>();
            item.put("id", r.getId());
            item.put("name", r.getName());
            item.put("phone", r.getPhone());
            item.put("email", r.getEmail());
            String label = r.getName() != null ? r.getName() : "未命名";
            if (r.getPhone() != null) label += " - " + r.getPhone();
            item.put("label", label);
            return item;
        }).collect(Collectors.toList());
        return Result.success(result);
    }

=======
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

>>>>>>> 1a1d158e371191531b75389502f38fd6b00454a3
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
<<<<<<< HEAD
    public Result<Void> submitEvaluation(
            @PathVariable Long interviewId,
            @RequestBody Map<String, Object> data,
            Authentication auth) {
        // 从 SecurityContext 获取当前登录用户ID
        Long currentUserId = null;
        Object principal = auth != null ? auth.getPrincipal() : null;
        if (principal instanceof Long) {
            currentUserId = (Long) principal;
        }

        // 创建评价记录
=======
    public Result<Void> submitEvaluation(@PathVariable Long interviewId, @RequestBody Map<String, Object> data) {
>>>>>>> 1a1d158e371191531b75389502f38fd6b00454a3
        InterviewEvaluation eval = new InterviewEvaluation();
        eval.setInterviewId(interviewId);
        eval.setScore(data.containsKey("score") ? Integer.valueOf(data.get("score").toString()) : null);
        eval.setEvaluation(data.containsKey("comments") ? data.get("comments").toString() : null);
<<<<<<< HEAD
        eval.setInterviewerId(currentUserId);
        // 存储推荐意见
        if (data.containsKey("recommend")) {
            eval.setRecommend(data.get("recommend").toString());
        }
        evaluationMapper.insert(eval);
        log.info("面试评价已记录: interviewId={}, interviewerId={}", interviewId, currentUserId);

        // 检查是否所有面试官都已评价，全部完成才改状态
        Long interviewerCount = interviewerMapper.selectCount(
                new LambdaQueryWrapper<InterviewInterviewer>()
                        .eq(InterviewInterviewer::getInterviewId, interviewId));
        Long evaluationCount = evaluationMapper.selectCount(
                new LambdaQueryWrapper<InterviewEvaluation>()
                        .eq(InterviewEvaluation::getInterviewId, interviewId));
        if (evaluationCount >= interviewerCount) {
            InterviewArrangement interview = new InterviewArrangement();
            interview.setId(interviewId);
            interview.setStatus("COMPLETED");
            interviewService.updateById(interview);
            log.info("所有面试官已评价，面试状态设为 COMPLETED: interviewId={}", interviewId);
        } else {
            InterviewArrangement interview = new InterviewArrangement();
            interview.setId(interviewId);
            interview.setStatus("ONGOING");
            interviewService.updateById(interview);
        }
=======
        eval.setInterviewerId(data.containsKey("evaluatorId") ? Long.valueOf(data.get("evaluatorId").toString()) : null);
        evaluationMapper.insert(eval);

        InterviewArrangement interview = new InterviewArrangement();
        interview.setId(interviewId);
        interview.setStatus("COMPLETED");
        if (data.containsKey("comments")) {
            log.info("面试评价已记录: interviewId={}", interviewId);
        }
        interviewService.updateById(interview);
>>>>>>> 1a1d158e371191531b75389502f38fd6b00454a3
        return Result.success("评价提交成功");
    }

    @GetMapping("/{interviewId}/summary")
    public Result<String> getSummary(@PathVariable Long interviewId) {
<<<<<<< HEAD
        // 查询该面试的所有评价记录，拼接为摘要
        List<InterviewEvaluation> evals = evaluationMapper.selectList(
                new LambdaQueryWrapper<InterviewEvaluation>()
                        .eq(InterviewEvaluation::getInterviewId, interviewId)
                        .orderByAsc(InterviewEvaluation::getId));
        if (evals.isEmpty()) {
            return Result.success("暂无面试摘要", "暂无面试摘要");
        }
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < evals.size(); i++) {
            InterviewEvaluation eval = evals.get(i);
            sb.append("面试官").append(i + 1).append("：");
            if (eval.getScore() != null) sb.append("评分 ").append(eval.getScore()).append("分，");
            if (eval.getRecommend() != null) {
                String rec = switch (eval.getRecommend()) {
                    case "yes" -> "推荐录用";
                    case "no" -> "不推荐";
                    default -> "待定";
                };
                sb.append("意见：").append(rec);
            }
            if (eval.getEvaluation() != null && !eval.getEvaluation().isBlank()) {
                sb.append("，评语：").append(eval.getEvaluation());
            }
            sb.append("\n");
        }
        return Result.success(sb.toString().trim(), sb.toString().trim());
    }

    // ==================== 私有辅助方法 ====================

    /**
     * 查找或创建投递记录（applicant_job）
     */
    private Long findOrCreateApplication(Long resumeId, Long jobId) {
        // 先查找是否已有投递记录
        LambdaQueryWrapper<ApplicantJob> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ApplicantJob::getResumeId, resumeId)
               .eq(ApplicantJob::getJobId, jobId)
               .eq(ApplicantJob::getDeleted, 0);
        ApplicantJob existing = applicantJobService.getOne(wrapper, false);
        if (existing != null) {
            return existing.getId();
        }
        // 不存在则创建
        ApplicantJob newApp = new ApplicantJob();
        newApp.setResumeId(resumeId);
        newApp.setJobId(jobId);
        newApp.setStatus("SCREENING");
        newApp.setAppliedAt(LocalDateTime.now());
        applicantJobService.save(newApp);
        log.info("自动创建投递记录: applicationId={}, resumeId={}, jobId={}", newApp.getId(), resumeId, jobId);
        return newApp.getId();
    }

    /**
     * 查找或创建阶段记录（candidate_stage_record）
     */
    private Long findOrCreateStageRecord(Long applicationId) {
        LambdaQueryWrapper<CandidateStageRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CandidateStageRecord::getApplicationId, applicationId)
               .eq(CandidateStageRecord::getDeleted, 0);
        CandidateStageRecord existing = stageRecordService.getOne(wrapper, false);
        if (existing != null) {
            return existing.getId();
        }
        // 不存在则创建
        CandidateStageRecord newRecord = new CandidateStageRecord();
        newRecord.setApplicationId(applicationId);
        newRecord.setStatus("SCREENING");
        newRecord.setResultNote("由面试创建自动生成");
        stageRecordService.save(newRecord);
        log.info("自动创建阶段记录: stageRecordId={}, applicationId={}", newRecord.getId(), applicationId);
        return newRecord.getId();
    }

    private static String getRoleLabel(String role) {
        switch (role) {
            case "ADMIN": return "管理员";
            case "HR": return "HR";
            case "MANAGER": return "经理";
            case "INTERVIEWER": return "面试官";
            default: return role;
        }
=======
        return Result.success("暂无面试摘要", "暂无面试摘要");
>>>>>>> 1a1d158e371191531b75389502f38fd6b00454a3
    }
}
