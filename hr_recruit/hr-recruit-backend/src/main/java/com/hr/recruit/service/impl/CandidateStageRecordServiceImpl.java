package com.hr.recruit.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.hr.recruit.entity.CandidateStageRecord;
import com.hr.recruit.entity.RecruitmentPipeline;
import com.hr.recruit.mapper.CandidateStageRecordMapper;
import com.hr.recruit.service.CandidateStageRecordService;
import com.hr.recruit.service.RecruitmentPipelineService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class CandidateStageRecordServiceImpl extends ServiceImpl<CandidateStageRecordMapper, CandidateStageRecord> implements CandidateStageRecordService {

    private final RecruitmentPipelineService pipelineService;

    /**
     * 阶段状态机：合法状态转换
     * key=当前状态，value=允许转入的状态集合
     */
    private static final Map<String, Set<String>> STATUS_MACHINE = Map.of(
            "PENDING", Set.of("IN_PROGRESS", "REJECTED"),
            "IN_PROGRESS", Set.of("COMPLETED", "REJECTED"),
            "COMPLETED", Set.of(),
            "REJECTED", Set.of()
    );

    /**
     * 更新阶段状态（带状态机校验 + 自动流转）
     * @param recordId 阶段记录ID
     * @param newStatus 新状态（PENDING/IN_PROGRESS/COMPLETED/REJECTED）
     * @param note 操作备注
     * @param applicationId 申请ID（用于自动创建下一阶段记录）
     */
    @Transactional
    public void updateStageStatusWithAutoTransition(Long recordId, String newStatus, String note, Long applicationId) {
        CandidateStageRecord record = this.getById(recordId);
        if (record == null) {
            throw new RuntimeException("阶段记录不存在");
        }

        String oldStatus = record.getStatus();
        if (oldStatus.equals(newStatus)) return;

        // 状态机校验
        Set<String> allowed = STATUS_MACHINE.get(oldStatus);
        if (allowed == null || !allowed.contains(newStatus)) {
            throw new RuntimeException(String.format("无效的状态转换：%s → %s", oldStatus, newStatus));
        }

        // 更新当前阶段
        record.setStatus(newStatus);
        record.setResultNote(note);
        record.setHandledAt(LocalDateTime.now());
        this.updateById(record);
        log.info("阶段状态更新：recordId={}, {} → {}", recordId, oldStatus, newStatus);

        // 自动流转：当前阶段完成，创建下一阶段记录
        if ("COMPLETED".equals(newStatus)) {
            autoCreateNextStage(applicationId, record.getPipelineId());
        }
    }

    /**
     * 自动创建下一阶段记录
     */
    private void autoCreateNextStage(Long applicationId, Long currentPipelineId) {
        RecruitmentPipeline currentStage = pipelineService.getById(currentPipelineId);
        if (currentStage == null) return;

        // 查找下一阶段（同 jobId，stageOrder + 1）
        LambdaQueryWrapper<RecruitmentPipeline> qw = new LambdaQueryWrapper<>();
        qw.eq(RecruitmentPipeline::getJobId, currentStage.getJobId());
        qw.eq(RecruitmentPipeline::getStageOrder, currentStage.getStageOrder() + 1);
        qw.eq(RecruitmentPipeline::getDeleted, 0);
        RecruitmentPipeline nextStage = pipelineService.getOne(qw);

        if (nextStage == null) {
            log.info("已是最后阶段，无自动流转。applicationId={}", applicationId);
            return;
        }

        // 检查是否已有该阶段的记录（防止重复创建）
        LambdaQueryWrapper<CandidateStageRecord> existQw = new LambdaQueryWrapper<>();
        existQw.eq(CandidateStageRecord::getApplicationId, applicationId);
        existQw.eq(CandidateStageRecord::getPipelineId, nextStage.getId());
        existQw.eq(CandidateStageRecord::getDeleted, 0);
        if (this.count(existQw) > 0) {
            log.info("下一阶段记录已存在，跳过创建。applicationId={}, pipelineId={}", applicationId, nextStage.getId());
            return;
        }

        CandidateStageRecord nextRecord = new CandidateStageRecord();
        nextRecord.setApplicationId(applicationId);
        nextRecord.setPipelineId(nextStage.getId());
        nextRecord.setStatus("PENDING");
        nextRecord.setCreateTime(LocalDateTime.now());
        this.save(nextRecord);
        log.info("自动创建下一阶段记录：applicationId={}, pipelineId={}, stageName={}",
                applicationId, nextStage.getId(), nextStage.getStageName());
    }

    /**
     * 切换候选人到新阶段的完整逻辑（用于前端拖拽/下拉切换）
     * 将当前阶段置为 COMPLETED，并创建新阶段记录
     */
    @Transactional
    public CandidateStageRecord switchStage(Long applicationId, Long oldRecordId, Long targetPipelineId) {
        // 1. 将旧阶段置为 COMPLETED
        CandidateStageRecord oldRecord = this.getById(oldRecordId);
        if (oldRecord != null && !"COMPLETED".equals(oldRecord.getStatus())) {
            oldRecord.setStatus("COMPLETED");
            oldRecord.setHandledAt(LocalDateTime.now());
            oldRecord.setResultNote("切换阶段");
            this.updateById(oldRecord);
        }

        // 2. 检查新阶段记录是否已存在
        LambdaQueryWrapper<CandidateStageRecord> qw = new LambdaQueryWrapper<>();
        qw.eq(CandidateStageRecord::getApplicationId, applicationId);
        qw.eq(CandidateStageRecord::getPipelineId, targetPipelineId);
        qw.eq(CandidateStageRecord::getDeleted, 0);
        CandidateStageRecord exist = this.getOne(qw);
        if (exist != null) {
            log.info("新阶段记录已存在，返回已有记录。recordId={}", exist.getId());
            return exist;
        }

        // 3. 创建新阶段记录
        CandidateStageRecord newRecord = new CandidateStageRecord();
        newRecord.setApplicationId(applicationId);
        newRecord.setPipelineId(targetPipelineId);
        newRecord.setStatus("PENDING");
        newRecord.setCreateTime(LocalDateTime.now());
        this.save(newRecord);
        log.info("创建新阶段记录：applicationId={}, pipelineId={}, newRecordId={}",
                applicationId, targetPipelineId, newRecord.getId());
        return newRecord;
    }
}
