package com.todolist;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Spring Boot 应用入口类
 * 这是一个完整的待办事项管理应用，包含 RESTful API 和前端页面
 * 技术栈: Spring Boot 3.2 + Spring Data JPA + H2 数据库 + 原生 JavaScript 前端
 */
@SpringBootApplication
public class TodoApplication {
    /**
     * 应用程序主入口方法
     * 启动 Spring Boot 应用
     * @param args 命令行参数
     */
    public static void main(String[] args) {
        SpringApplication.run(TodoApplication.class, args);
    }
}
