package com.hr.recruit.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.hr.recruit.entity.OfferRecord;
import com.hr.recruit.mapper.OfferRecordMapper;
import com.hr.recruit.service.OfferRecordService;
import org.springframework.stereotype.Service;

@Service
public class OfferRecordServiceImpl extends ServiceImpl<OfferRecordMapper, OfferRecord> implements OfferRecordService {
}
