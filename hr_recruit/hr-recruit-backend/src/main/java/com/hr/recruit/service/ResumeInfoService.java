package com.hr.recruit.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.hr.recruit.entity.ResumeInfo;
import org.springframework.web.multipart.MultipartFile;

public interface ResumeInfoService extends IService<ResumeInfo> {
    Long uploadAndParse(MultipartFile file);
    void parseResume(Long resumeId);

    /**
     * 仅上传简历文件，返回 resume_file 记录 ID（不创建 resume_info）
     */
    Long uploadFile(MultipartFile file);
}
