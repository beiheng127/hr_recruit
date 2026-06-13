package com.hr.recruit.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Slf4j
@Configuration
public class UploadConfig {

    @Value("${app.upload.path:${user.home}/hr-recruit/uploads/}")
    private String uploadPath;

    @Bean
    public ApplicationRunner initUploadDirectories() {
        return args -> {
            String[] subDirs = {"resume", "avatar", "offer"};
            for (String dir : subDirs) {
                Path path = Paths.get(uploadPath, dir);
                if (!Files.exists(path)) {
                    Files.createDirectories(path);
                    log.info("创建上传目录: {}", path);
                } else {
                    log.info("上传目录已存在: {}", path);
                }
            }
        };
    }
}
