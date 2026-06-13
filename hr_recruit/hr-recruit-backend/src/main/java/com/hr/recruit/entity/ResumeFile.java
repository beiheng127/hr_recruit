package com.hr.recruit.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("resume_file")
public class ResumeFile {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String fileName;
    private String fileType;
    private String filePath;
    private Long fileSize;
    private Integer parseStatus;
    private String parseResult;
    private Long uploadUserId;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
    @TableLogic
    private Integer deleted;
}
