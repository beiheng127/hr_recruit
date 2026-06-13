package com.hr.recruit.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("recruitment_pipeline")
public class RecruitmentPipeline {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long jobId;
    private Integer stageOrder;
    private String stageName;
    private String stageType;
    private Integer isRequired;
    private Integer durationDays;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
    @TableLogic
    private Integer deleted;
}
