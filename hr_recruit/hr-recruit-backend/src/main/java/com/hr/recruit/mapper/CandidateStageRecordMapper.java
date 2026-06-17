package com.hr.recruit.mapper;

import com.hr.recruit.entity.CandidateStageRecord;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
<<<<<<< HEAD
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

@Mapper
public interface CandidateStageRecordMapper extends BaseMapper<CandidateStageRecord> {

    /**
     * 根据岗位ID查询所有候选人的阶段记录（含候选人姓名、岗位名）
     * 返回 Map 以接收 JOIN 查询的额外字段
     */
    @Select("SELECT csr.id, csr.application_id AS applicationId, csr.pipeline_id AS pipelineId, " +
           "csr.status, csr.result_note AS resultNote, csr.create_time AS createTime, " +
           "ri.name AS name, ri.match_score AS matchScore, " +
           "jp.position_name AS position, rp.stage_type AS stageType " +
           "FROM candidate_stage_record csr " +
           "JOIN recruitment_pipeline rp ON csr.pipeline_id = rp.id " +
           "JOIN applicant_job aj ON csr.application_id = aj.id " +
           "JOIN resume_info ri ON aj.resume_id = ri.id " +
           "JOIN job_position jp ON aj.job_id = jp.id " +
           "WHERE rp.job_id = #{jobId} AND csr.deleted = 0 " +
           "ORDER BY csr.create_time ASC")
    List<Map<String, Object>> getStageRecordsByJobId(@Param("jobId") Long jobId);
=======

@Mapper
public interface CandidateStageRecordMapper extends BaseMapper<CandidateStageRecord> {
>>>>>>> 1a1d158e371191531b75389502f38fd6b00454a3
}
