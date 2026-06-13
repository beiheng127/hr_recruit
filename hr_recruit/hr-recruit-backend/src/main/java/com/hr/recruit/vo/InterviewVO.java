package com.hr.recruit.vo;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class InterviewVO {
    private Long id;
    private Long stageRecordId;
    private LocalDateTime interviewTime;
    private String location;
    private Integer roundNum;
    private String status;

    // 候选人信息
    private String candidateName;
    private String candidatePhone;
    private String candidateEmail;

    // 应聘岗位信息
    private String positionName;
    private String department;

    // 面试官信息
    private String interviewerNames;

    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
