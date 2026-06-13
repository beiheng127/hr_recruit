package com.hr.recruit.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("interview_interviewer")
public class InterviewInterviewer {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long interviewId;

    private Long interviewerId;

    private Integer score;

    private String evaluation;

    private String status;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
