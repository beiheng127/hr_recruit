package com.hr.recruit.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.hr.recruit.common.BusinessException;
import com.hr.recruit.common.JwtUtil;
import com.hr.recruit.dto.LoginRequest;
import com.hr.recruit.dto.LoginResponse;
import com.hr.recruit.dto.RegisterRequest;
import com.hr.recruit.entity.SysUser;
import com.hr.recruit.mapper.SysUserMapper;
import com.hr.recruit.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl extends ServiceImpl<SysUserMapper, SysUser> implements AuthService {

    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Override
    public LoginResponse login(LoginRequest request) {
        SysUser user = this.getOne(new LambdaQueryWrapper<SysUser>()
                .eq(SysUser::getUsername, request.getUsername()));

        if (user == null || (user.getStatus() != null && user.getStatus() == 0)) {
            throw new BusinessException(401, "用户名或密码错误");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BusinessException(401, "用户名或密码错误");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole());

        return new LoginResponse(token, user.getId(),
                user.getUsername(), user.getRealName(), user.getRole());
    }

    @Override
    public void register(RegisterRequest request) {
        // 检查用户名是否已存在
        long count = this.count(new LambdaQueryWrapper<SysUser>()
                .eq(SysUser::getUsername, request.getUsername()));
        if (count > 0) {
            throw new BusinessException(400, "用户名已存在");
        }

        SysUser user = new SysUser();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRealName(request.getRealName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setRole("HR");
        user.setStatus(1);

        this.save(user);
    }
}
