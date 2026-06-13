package com.hr.recruit.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.hr.recruit.entity.InterviewArrangement;
import com.hr.recruit.mapper.InterviewArrangementMapper;
import com.hr.recruit.service.InterviewArrangementService;
import org.springframework.stereotype.Service;

@Service
public class InterviewArrangementServiceImpl extends ServiceImpl<InterviewArrangementMapper, InterviewArrangement> implements InterviewArrangementService {
}
