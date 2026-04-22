# Todo List Application

一个基于 Spring Boot 3.2 + Java 21 的全栈待办事项管理应用，包含简洁美观的前端页面。

## 📋 功能特性

- ✅ 任务增删改查
- ✅ 任务状态切换（完成/未完成）
- ✅ 按状态筛选（全部/进行中/已完成）
- ✅ 任务描述支持
- ✅ 创建时间记录
- ✅ 响应式设计，支持手机和桌面
- ✅ 简洁美观的现代UI设计

## 🛠️ 技术栈

**后端：**
- Java 21
- Spring Boot 3.2
- Spring Data JPA
- H2 内存数据库
- Maven

**前端：**
- HTML5
- CSS3 (现代渐变设计)
- 原生 JavaScript
- RESTful API 调用

## 🚀 快速开始

### 环境要求
- JDK 21+
- Maven 3.8+

### 运行项目

```bash
# 克隆项目
git clone https://github.com/DaiOwen/todo-app.git
cd todo-app

# 编译运行
mvn spring-boot:run
```

### 访问应用

打开浏览器访问： http://localhost:8080

## 📁 项目结构

```
todo-app/
├── src/
│   ├── main/
│   │   ├── java/com/todolist/
│   │   │   ├── TodoApplication.java      # 启动类
│   │   │   ├── controller/               # REST API控制器
│   │   │   ├── entity/                   # 实体类
│   │   │   ├── repositories/            # 数据访问层
│   │   │   └── service/                  # 业务逻辑层
│   │   └── resources/
│   │       ├── application.properties    # 配置文件
│   │       └── static/                   # 前端静态文件
│   │           ├── index.html            # 主页面
│   │           ├── style.css             # 样式
│   │           └── app.js                # JavaScript逻辑
│   └── test/
└── pom.xml
```

## 🔌 API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/todos` | 获取所有任务 |
| GET | `/api/todos/completed/{completed}` | 按状态筛选 |
| GET | `/api/todos/{id}` | 获取单个任务 |
| POST | `/api/todos` | 创建任务 |
| PUT | `/api/todos/{id}` | 更新任务 |
| PATCH | `/api/todos/{id}/toggle` | 切换完成状态 |
| DELETE | `/api/todos/{id}` | 删除任务 |

## ⚙️ 配置说明

默认使用H2内存数据库，数据会在应用重启后清空。如果需要持久化，可以修改 `src/main/resources/application.properties`：

```properties
spring.datasource.url=jdbc:h2:file:./data/todo;DB_CLOSE_DELAY=-1
```

## 📝 开发说明

- 采用标准的MVC分层架构
- 前后端分离，前端使用原生JS，无需构建工具
- CORS已配置，支持跨域访问
- Lombok简化代码

## 📄 许可证

MIT License
