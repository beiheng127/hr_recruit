package com.hr.recruit.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.time.LocalDate;

@Data
@TableName("offer_record")
public class OfferRecord {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long applicationId;

    private Long jobId;

    private String salary;

    private String position;

    private LocalDate entryDate;

    private LocalDate offerDeadline;

    private String status;

    private String offerLetterPath;

    private LocalDateTime sentAt;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;
}
