package com.hr.recruit.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@TableName("interview_arrangement")
public class InterviewArrangement {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long stageRecordId;
    private LocalDateTime interviewTime;
    private String location;
    private Integer roundNum;
    private String status;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
    @TableLogic
    private Integer deleted;

    @TableField(exist = false)
    private List<Long> interviewerIds;
}
