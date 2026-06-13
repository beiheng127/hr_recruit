package com.hr.recruit.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.hr.recruit.entity.OperationLog;
import com.hr.recruit.mapper.OperationLogMapper;
import com.hr.recruit.service.OperationLogService;
import org.springframework.stereotype.Service;

@Service
public class OperationLogServiceImpl extends ServiceImpl<OperationLogMapper, OperationLog> implements OperationLogService {
}
