package com.hr.recruit.config;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;

import java.io.IOException;

/**
 * Jackson ObjectMapper 全局配置
 * - 解决 Map null key 序列化问题
 * - 统一日期格式
 */
@Configuration
public class JacksonConfig {

    @Bean
    public Jackson2ObjectMapperBuilder jackson2ObjectMapperBuilder() {
        return new Jackson2ObjectMapperBuilder() {
            @Override
            public void configure(ObjectMapper objectMapper) {
                super.configure(objectMapper);

                // 允许 Map 的 key 为 null 时序列化为 ""（空字符串）
                objectMapper.getSerializerProvider().setNullKeySerializer(
                    new JsonSerializer<Object>() {
                        @Override
                        public void serialize(Object value, JsonGenerator gen, SerializerProvider serializers) throws IOException {
                            gen.writeString("");
                        }
                    }
                );

                // 反序列化时忽略未知字段
                objectMapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);

                // 日期不使用时间戳（默认ISO格式）
                objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
            }
        };
    }
}
