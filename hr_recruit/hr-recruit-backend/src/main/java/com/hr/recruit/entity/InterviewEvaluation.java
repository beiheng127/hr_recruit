package com.hr.recruit.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("interview_evaluation")
public class InterviewEvaluation {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long interviewId;
    private Long applicationId;
    private Long interviewerId;
    private Integer score;
    private Integer communication;
    private Integer technical;
    private Integer teamwork;
    private Integer learning;
    private String evaluation;
    private String aiSummary;
    @TableField(exist = false)
    private String recommend;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
    @TableLogic
    private Integer deleted;
}
