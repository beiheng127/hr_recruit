package com.hr.recruit.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.hr.recruit.common.Result;
import com.hr.recruit.entity.JobPosition;
import com.hr.recruit.service.JobPositionService;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobPositionController {

    private final JobPositionService jobPositionService;

    @GetMapping
    public Result<Page<JobPosition>> list(
            @RequestParam(defaultValue = "1") long pageNum,
            @RequestParam(defaultValue = "10") long pageSize,
            @RequestParam(required = false) String positionName,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String status) {

        LambdaQueryWrapper<JobPosition> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(positionName)) wrapper.like(JobPosition::getPositionName, positionName);
        if (StringUtils.hasText(department)) wrapper.eq(JobPosition::getDepartment, department);
        if (StringUtils.hasText(status)) wrapper.eq(JobPosition::getStatus, status);
        wrapper.orderByDesc(JobPosition::getCreateTime);

        Page<JobPosition> page = jobPositionService.page(new Page<>(pageNum, pageSize), wrapper);
        return Result.success(page);
    }

    @PostMapping
    public Result<Void> create(@RequestBody JobPosition job) {
        jobPositionService.save(job);
        return Result.success("创建成功");
    }

    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @RequestBody JobPosition job) {
        job.setId(id);
        jobPositionService.updateById(job);
        return Result.success("更新成功");
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        jobPositionService.removeById(id);
        return Result.success("删除成功");
    }

    @PostMapping("/{id}/publish")
    public Result<Void> publish(@PathVariable Long id) {
        jobPositionService.publish(id);
        return Result.success("发布成功");
    }

    @PostMapping("/{id}/close")
    public Result<Void> close(@PathVariable Long id) {
        jobPositionService.close(id);
        return Result.success("关闭成功");
    }
}
