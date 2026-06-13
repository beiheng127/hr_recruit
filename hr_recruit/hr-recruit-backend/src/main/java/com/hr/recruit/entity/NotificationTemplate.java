package com.hr.recruit.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("notification_template")
public class NotificationTemplate {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String templateName;

    private String templateCode;

    private String type;

    private String title;

    private String content;

    private Integer status;

    private String description;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;
}
