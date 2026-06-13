package com.hr.recruit.common;

import com.hr.recruit.entity.OperationLog;
import com.hr.recruit.mapper.OperationLogMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;
import java.util.Arrays;

@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class OperationLogAspect {

    private final OperationLogMapper operationLogMapper;

    @Around("@annotation(com.hr.recruit.common.OperLog)")
    public Object around(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();
        Object result = joinPoint.proceed();
        long costTime = System.currentTimeMillis() - start;

        try {
            MethodSignature signature = (MethodSignature) joinPoint.getSignature();
            OperLog operLog = signature.getMethod().getAnnotation(OperLog.class);

            HttpServletRequest request = null;
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) request = attrs.getRequest();

            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

            OperationLog logEntity = new OperationLog();
            if (principal instanceof Long) logEntity.setUserId((Long) principal);
            logEntity.setModule(operLog.module());
            logEntity.setAction(operLog.action());
            logEntity.setDescription(operLog.desc());
            logEntity.setCostTime(costTime);
            if (request != null) {
                logEntity.setIpAddress(request.getRemoteAddr());
                logEntity.setRequestMethod(request.getMethod());
                logEntity.setRequestUri(request.getRequestURI());
                logEntity.setRequestParams(Arrays.toString(joinPoint.getArgs()));
            }
            operationLogMapper.insert(logEntity);
        } catch (Exception e) {
            log.warn("操作日志记录失败", e);
        }
        return result;
    }
}
