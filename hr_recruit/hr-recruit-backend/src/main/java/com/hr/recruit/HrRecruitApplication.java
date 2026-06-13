package com.hr.recruit;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@MapperScan("com.hr.recruit.mapper")
@EnableAsync
@EnableScheduling
public class HrRecruitApplication {
    public static void main(String[] args) {
        SpringApplication.run(HrRecruitApplication.class, args);
    }
}
