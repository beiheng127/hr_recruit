package com.hr.recruit.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("ai_match_record")
public class AiMatchRecord {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long resumeId;
    private Long jobId;
    private Integer matchScore;
    private String matchReason;
    private String matchDetail;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
