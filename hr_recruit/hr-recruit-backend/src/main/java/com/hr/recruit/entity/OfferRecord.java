package com.hr.recruit.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.time.LocalDate;
<<<<<<< HEAD
=======
import java.math.BigDecimal;
>>>>>>> 1a1d158e371191531b75389502f38fd6b00454a3

@Data
@TableName("offer_record")
public class OfferRecord {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long applicationId;

    private Long jobId;

<<<<<<< HEAD
    private String salary;
=======
    private BigDecimal salary;
>>>>>>> 1a1d158e371191531b75389502f38fd6b00454a3

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
