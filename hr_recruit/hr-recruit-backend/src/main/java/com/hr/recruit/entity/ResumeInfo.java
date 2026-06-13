package com.hr.recruit.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("resume_info")
public class ResumeInfo {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private String phone;
    private String email;
    private String gender;
    private Integer age;
    private String currentCompany;
    private String currentPosition;
    private Integer workYears;
    private String educationLevel;
    private String schoolName;
    private String major;
    private String skillTags;
    private String selfEvaluation;
    private Integer matchScore;
    private String talentPoolStatus;
    private Long sourceFileId;

    /** 关联的简历文件名（非数据库字段，仅用于前端展示） */
    @TableField(exist = false)
    private String fileName;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
    @TableLogic
    private Integer deleted;
}
