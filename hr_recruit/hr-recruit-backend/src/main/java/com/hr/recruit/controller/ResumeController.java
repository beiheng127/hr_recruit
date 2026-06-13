package com.hr.recruit.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.hr.recruit.common.Result;
import com.hr.recruit.entity.ResumeFile;
import com.hr.recruit.entity.ResumeInfo;
import com.hr.recruit.mapper.ResumeFileMapper;
import com.hr.recruit.service.ResumeInfoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/resumes")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeInfoService resumeInfoService;
    private final ResumeFileMapper resumeFileMapper;

    @GetMapping
    public Result<Map<String, Object>> list(
            @RequestParam(defaultValue = "1") long pageNum,
            @RequestParam(defaultValue = "10") long pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String talentPoolStatus) {
        LambdaQueryWrapper<ResumeInfo> wrapper = new LambdaQueryWrapper<>();
        if (keyword != null) wrapper.and(w -> w.like(ResumeInfo::getName, keyword).or().like(ResumeInfo::getSkillTags, keyword));
        if (talentPoolStatus != null) wrapper.eq(ResumeInfo::getTalentPoolStatus, talentPoolStatus);
        wrapper.orderByDesc(ResumeInfo::getCreateTime);
        Page<ResumeInfo> page = resumeInfoService.page(new Page<>(pageNum, pageSize), wrapper);
        // 给每条记录附加文件名
        Map<String, Object> result = new HashMap<>();
        result.put("total", page.getTotal());
        result.put("records", page.getRecords().stream().peek(r -> {
            if (r.getSourceFileId() != null) {
                ResumeFile rf = resumeFileMapper.selectById(r.getSourceFileId());
                r.setFileName(rf != null ? rf.getFileName() : null);
            }
        }).toList());
        return Result.success(result);
    }

    @PostMapping("/upload")
    public Result<?> upload(@RequestParam("file") MultipartFile file) {
        return Result.success(resumeInfoService.uploadAndParse(file));
    }

    @PostMapping("/{id}/parse")
    public Result<?> parse(@PathVariable Long id) {
        resumeInfoService.parseResume(id);
        return Result.success("解析任务已提交");
    }

    @GetMapping("/{id}")
    public Result<Map<String, Object>> detail(@PathVariable Long id) {
        ResumeInfo resume = resumeInfoService.getById(id);
        if (resume == null) return Result.error(404, "简历不存在");
        Map<String, Object> result = new HashMap<>();
        result.put("id", resume.getId());
        result.put("name", resume.getName());
        result.put("phone", resume.getPhone());
        result.put("email", resume.getEmail());
        result.put("gender", resume.getGender());
        result.put("age", resume.getAge());
        result.put("educationLevel", resume.getEducationLevel());
        result.put("schoolName", resume.getSchoolName());
        result.put("major", resume.getMajor());
        result.put("currentCompany", resume.getCurrentCompany());
        result.put("currentPosition", resume.getCurrentPosition());
        result.put("workYears", resume.getWorkYears());
        result.put("skillTags", resume.getSkillTags());
        result.put("selfEvaluation", resume.getSelfEvaluation());
        result.put("talentPoolStatus", resume.getTalentPoolStatus());
        result.put("matchScore", resume.getMatchScore());
        result.put("sourceFileId", resume.getSourceFileId());
        result.put("createTime", resume.getCreateTime());
        // 关联文件名
        if (resume.getSourceFileId() != null) {
            ResumeFile rf = resumeFileMapper.selectById(resume.getSourceFileId());
            result.put("fileName", rf != null ? rf.getFileName() : null);
        } else {
            result.put("fileName", null);
        }
        return Result.success(result);
    }

    @PutMapping("/{id}")
    public Result<?> update(@PathVariable Long id, @RequestBody ResumeInfo resume) {
        resume.setId(id);
        resumeInfoService.updateById(resume);
        return Result.success("更新成功");
    }

    @PutMapping("/{id}/talent-status")
    public Result<?> updateTalentStatus(@PathVariable Long id, @RequestParam String status) {
        ResumeInfo resume = new ResumeInfo();
        resume.setId(id);
        resume.setTalentPoolStatus(status);
        resumeInfoService.updateById(resume);
        return Result.success("更新成功");
    }

    @GetMapping("/talent-pool")
    public Result<?> talentPool(
            @RequestParam(defaultValue = "1") long pageNum,
            @RequestParam(defaultValue = "10") long pageSize,
            @RequestParam(required = false) String keyword) {
        LambdaQueryWrapper<ResumeInfo> wrapper = new LambdaQueryWrapper<>();
        wrapper.ne(ResumeInfo::getTalentPoolStatus, "NORMAL");
        if (keyword != null) wrapper.and(w -> w.like(ResumeInfo::getName, keyword).or().like(ResumeInfo::getSkillTags, keyword));
        wrapper.orderByDesc(ResumeInfo::getCreateTime);
        return Result.success(resumeInfoService.page(new Page<>(pageNum, pageSize), wrapper));
    }

    @GetMapping("/{id}/file")
    public void downloadFile(@PathVariable Long id, HttpServletResponse response) {
        ResumeInfo resume = resumeInfoService.getById(id);
        if (resume == null || resume.getSourceFileId() == null) {
            response.setStatus(404);
            return;
        }
        ResumeFile resumeFile = resumeFileMapper.selectById(resume.getSourceFileId());
        if (resumeFile == null) {
            response.setStatus(404);
            return;
        }
        File file = new File(resumeFile.getFilePath());
        if (!file.exists()) {
            log.warn("简历文件不存在: filePath={}", resumeFile.getFilePath());
            response.setStatus(404);
            return;
        }
        try (FileInputStream fis = new FileInputStream(file)) {
            String encodedName = URLEncoder.encode(resumeFile.getFileName(), StandardCharsets.UTF_8.name()).replaceAll("\\+", "%20");
            response.setContentType(resumeFile.getFileType() != null ? resumeFile.getFileType() : "application/octet-stream");
            response.setHeader("Content-Disposition", "inline; filename*=UTF-8''" + encodedName);
            response.setContentLengthLong(file.length());
            FileCopyUtils.copy(fis, response.getOutputStream());
        } catch (IOException e) {
            log.error("文件下载失败: {}", e.getMessage(), e);
            response.setStatus(500);
        }
    }
}
