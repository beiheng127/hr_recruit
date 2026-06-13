package com.hr.recruit.mapper;

import com.hr.recruit.entity.InterviewArrangement;
import com.hr.recruit.vo.InterviewVO;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface InterviewArrangementMapper extends BaseMapper<InterviewArrangement> {

    @Select("""
        SELECT
            ia.id,
            ia.stage_record_id,
            ia.interview_time,
            ia.location,
            ia.round_num,
            ia.status,
            ia.create_time,
            ia.update_time,
            ri.name as candidate_name,
            ri.phone as candidate_phone,
            ri.email as candidate_email,
            jp.position_name,
            jp.department,
            (SELECT GROUP_CONCAT(DISTINCT su.real_name)
             FROM interview_interviewer ii2
             LEFT JOIN sys_user su ON ii2.interviewer_id = su.id
             WHERE ii2.interview_id = ia.id) as interviewer_names
        FROM interview_arrangement ia
        LEFT JOIN candidate_stage_record csr ON ia.stage_record_id = csr.id
        LEFT JOIN applicant_job aj ON csr.application_id = aj.id
        LEFT JOIN resume_info ri ON aj.resume_id = ri.id
        LEFT JOIN job_position jp ON aj.job_id = jp.id
        WHERE ia.deleted = 0
          AND (#{status} IS NULL OR #{status} = '' OR ia.status = #{status})
          AND (#{candidateName} IS NULL OR #{candidateName} = '' OR ri.name LIKE CONCAT('%', #{candidateName}, '%'))
        ORDER BY ia.interview_time DESC
        """)
    List<InterviewVO> selectInterviewVOList(Page<InterviewVO> page,
                                            @Param("status") String status,
                                            @Param("candidateName") String candidateName);
}
