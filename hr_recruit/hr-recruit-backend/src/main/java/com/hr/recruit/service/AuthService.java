package com.hr.recruit.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.hr.recruit.dto.LoginRequest;
import com.hr.recruit.dto.LoginResponse;
import com.hr.recruit.dto.RegisterRequest;
import com.hr.recruit.entity.SysUser;

public interface AuthService extends IService<SysUser> {
    LoginResponse login(LoginRequest request);
    void register(RegisterRequest request);
}
