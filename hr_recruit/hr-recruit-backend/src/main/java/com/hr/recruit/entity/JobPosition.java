package com.hr.recruit.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("job_position")
public class JobPosition {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String positionName;
    private String department;
    private String responsibility;
    private String requirement;
    private String salaryRange;
    private String location;
    private Integer headcount;
    private String status;
    private String sourceChannel;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
    @TableLogic
    private Integer deleted;
}
