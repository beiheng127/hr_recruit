package com.hr.recruit.controller;

import com.hr.recruit.common.Result;
import com.hr.recruit.dto.LoginRequest;
import com.hr.recruit.dto.LoginResponse;
import com.hr.recruit.dto.RegisterRequest;
import com.hr.recruit.entity.SysUser;
import com.hr.recruit.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public Result<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return Result.success("登录成功", response);
    }

    @PostMapping("/register")
    public Result<Void> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return Result.success("注册成功");
    }

    @GetMapping("/me")
    public Result<Map<String, Object>> me(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            return Result.unauthorized("未登录");
        }
        Long userId = (Long) authentication.getPrincipal();
        SysUser user = authService.getById(userId);
        if (user == null) {
            return Result.error("用户不存在");
        }
        Map<String, Object> userMap = new HashMap<>();
        userMap.put("userId", user.getId());
        userMap.put("username", user.getUsername() != null ? user.getUsername() : "");
        userMap.put("realName", user.getRealName() != null ? user.getRealName() : "");
        userMap.put("role", user.getRole() != null ? user.getRole() : "");
        userMap.put("email", user.getEmail() != null ? user.getEmail() : "");
        userMap.put("phone", user.getPhone() != null ? user.getPhone() : "");
        return Result.success(userMap);
    }
}
