package com.hr.recruit.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class CandidateApplyRequest {
    @NotNull(message = "岗位ID不能为空")
    private Long jobId;

    @NotBlank(message = "姓名不能为空")
    private String name;

    @NotBlank(message = "手机号不能为空")
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String phone;

    @NotBlank(message = "邮箱不能为空")
    @Email(message = "邮箱格式不正确")
    private String email;

    private String educationLevel;
    private Integer workYears;
    private String expectedSalary;
    private String skillTags;
    private String bio;

    // 简历文件（可选，也可以填写基本信息代替）
    private MultipartFile file;
}
