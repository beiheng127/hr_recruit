package com.hr.recruit.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.time.LocalDate;

@Data
@TableName("onboard_record")
public class OnboardRecord {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long offerId;

    private Long applicationId;

    private LocalDate actualEntryDate;

    private String status;

    private Integer idCardSubmitted;

    private Integer contractSubmitted;

    private Integer medicalSubmitted;

    private Integer diplomaSubmitted;

    private Integer photoSubmitted;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;
}
