package com.hr.recruit.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.hr.recruit.common.Result;
import com.hr.recruit.entity.CandidateStageRecord;
import com.hr.recruit.entity.RecruitmentPipeline;
<<<<<<< HEAD
import com.hr.recruit.mapper.CandidateStageRecordMapper;
=======
>>>>>>> 1a1d158e371191531b75389502f38fd6b00454a3
import com.hr.recruit.service.CandidateStageRecordService;
import com.hr.recruit.service.RecruitmentPipelineService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
<<<<<<< HEAD
import java.util.Map;
=======
>>>>>>> 1a1d158e371191531b75389502f38fd6b00454a3

@Slf4j
@RestController
@RequestMapping("/api/pipelines")
@RequiredArgsConstructor
public class RecruitmentPipelineController {

    private final RecruitmentPipelineService pipelineService;
    private final CandidateStageRecordService candidateStageRecordService;
<<<<<<< HEAD
    private final CandidateStageRecordMapper candidateStageRecordMapper;
=======
>>>>>>> 1a1d158e371191531b75389502f38fd6b00454a3

    @GetMapping("/job/{jobId}")
    public Result<List<RecruitmentPipeline>> getByJobId(@PathVariable Long jobId) {
        LambdaQueryWrapper<RecruitmentPipeline> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(RecruitmentPipeline::getJobId, jobId)
               .eq(RecruitmentPipeline::getDeleted, 0)
               .orderByAsc(RecruitmentPipeline::getStageOrder);
        return Result.success(pipelineService.list(wrapper));
    }

    @PostMapping
    public Result<Void> create(@RequestBody RecruitmentPipeline pipeline) {
        pipelineService.save(pipeline);
        return Result.success("创建成功");
    }

    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @RequestBody RecruitmentPipeline pipeline) {
        pipeline.setId(id);
        pipelineService.updateById(pipeline);
        return Result.success("更新成功");
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        RecruitmentPipeline pipeline = new RecruitmentPipeline();
        pipeline.setId(id);
        pipeline.setDeleted(1);
        pipelineService.updateById(pipeline);
        return Result.success("删除成功");
    }

    @GetMapping("/records/{applicationId}")
    public Result<List<CandidateStageRecord>> getStageRecords(@PathVariable Long applicationId) {
        LambdaQueryWrapper<CandidateStageRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CandidateStageRecord::getApplicationId, applicationId)
<<<<<<< HEAD
=======
               .eq(CandidateStageRecord::getDeleted, 0)
>>>>>>> 1a1d158e371191531b75389502f38fd6b00454a3
               .orderByAsc(CandidateStageRecord::getCreateTime);
        return Result.success(candidateStageRecordService.list(wrapper));
    }

<<<<<<< HEAD
    /**
     * 根据岗位ID查询该岗位下所有候选人的阶段记录（含候选人信息）
     */
    @GetMapping("/job-records/{jobId}")
    public Result<List<Map<String, Object>>> getStageRecordsByJobId(@PathVariable Long jobId) {
        return Result.success(candidateStageRecordMapper.getStageRecordsByJobId(jobId));
    }

=======
>>>>>>> 1a1d158e371191531b75389502f38fd6b00454a3
    @PutMapping("/stages/{recordId}/status")
    public Result<Void> updateStageStatus(@PathVariable Long recordId,
                                           @RequestParam String status,
                                           @RequestParam(required = false) String note) {
        candidateStageRecordService.updateStageStatusWithAutoTransition(recordId, status, note, null);
        return Result.success("状态更新成功");
    }

    @PostMapping("/stages/switch")
    public Result<Void> switchStage(@RequestParam Long recordId,
                                    @RequestParam String targetStageType,
                                    @RequestParam Long jobId) {
        LambdaQueryWrapper<RecruitmentPipeline> qw = new LambdaQueryWrapper<>();
        qw.eq(RecruitmentPipeline::getJobId, jobId)
           .eq(RecruitmentPipeline::getStageType, targetStageType)
           .eq(RecruitmentPipeline::getDeleted, 0);
        RecruitmentPipeline targetStage = pipelineService.getOne(qw);
        if (targetStage == null) {
            return Result.error(400, "目标阶段不存在：stageType=" + targetStageType);
        }
        CandidateStageRecord oldRecord = candidateStageRecordService.getById(recordId);
        if (oldRecord == null) {
            return Result.error(400, "阶段记录不存在");
        }
        candidateStageRecordService.switchStage(oldRecord.getApplicationId(), recordId, targetStage.getId());
        return Result.success("阶段切换成功");
    }
}
