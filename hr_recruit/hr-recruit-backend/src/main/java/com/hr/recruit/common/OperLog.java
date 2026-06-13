package com.hr.recruit.common;

import java.lang.annotation.*;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface OperLog {
    String module();
    String action();
    String desc() default "";
}
