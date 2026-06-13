package com.hr.recruit.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.time.LocalDate;

@Data
@TableName("employee_archive")
public class EmployeeArchive {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long onboardId;

    private Long userId;

    private String employeeNo;

    private String name;

    private String phone;

    private String email;

    private String department;

    private String position;

    private LocalDate entryDate;

    private String status;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;
}
