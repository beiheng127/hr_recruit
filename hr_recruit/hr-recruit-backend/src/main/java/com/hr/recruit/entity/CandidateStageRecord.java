package com.hr.recruit.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("candidate_stage_record")
public class CandidateStageRecord {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long applicationId;
    private Long pipelineId;
    private String status;
    private String resultNote;
    private Long operatorId;
    private LocalDateTime handledAt;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
    @TableLogic
    private Integer deleted;
}
