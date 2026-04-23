# Todo List 待办事项管理应用

一个完整的全栈待办事项管理应用，基于 **Spring Boot 3.2 + Java 21 + Spring Data JPA + H2 数据库 + 原生 JavaScript 前端**。

## 📋 功能特性

### ✅ 核心功能
- **添加任务** - 支持标题、描述、优先级、截止日期、分类
- **查看任务** - 列表展示，按优先级和截止日期自动排序
- **切换状态** - 一键切换完成/未完成状态
- **删除任务** - 删除不需要的任务
- **编辑任务** - REST API 支持完整更新

### 🔍 筛选与搜索
- **状态筛选** - 全部/进行中/已完成
- **分类筛选** - 动态生成分类筛选按钮
- **关键词搜索** - 实时搜索标题、描述、分类
- **过期提醒** - 过期未完成任务高亮显示

### ⚡ 批量操作
- **标记全部已完成** - 一键将所有进行中任务标记为完成
- **删除已完成** - 批量清理所有已完成任务（不可恢复）

### 🎨 界面特性
- **优先级区分** - 低/中/高三种优先级，不同颜色标识
- **分类标签** - 自定义分类（工作/生活/学习等）
- **响应式设计** - 完美适配桌面和移动端
- **现代化UI** - 渐变背景、阴影分层、平滑动画

## 🏗️ 项目结构

```
todo-app/
├── pom.xml                              # Maven 配置文件
├── src/
│   └── main/
│       ├── java/com/todolist/
│       │   ├── TodoApplication.java     # 应用入口
│       │   ├── controller/
│       │   │   └── TodoController.java  # REST API 控制器
│       │   ├── entity/
│       │   │   └── Todo.java            # 任务实体类
│       │   ├── repository/
│       │   │   └── TodoRepository.java  # 数据访问层
│       │   └── service/
│       │       └── TodoService.java     # 业务逻辑层
│       └── resources/
│           ├── application.properties   # Spring Boot 配置
│           └── static/                  # 前端静态资源
│               ├── index.html           # 主页面
│               ├── style.css            # 样式表
│               └── app.js               # 前端JavaScript
└── README.md
```

## 📚 分层架构说明

| 层级 | 说明 | 职责 |
|------|------|------|
| **Entity** (`Todo.java`) | 实体层 | 定义数据库表结构，每个任务的属性 |
| **Repository** (`TodoRepository`) | 数据访问层 | 继承 JpaRepository，Spring Data JPA 自动实现，无需手写SQL |
| **Service** (`TodoService`) | 业务逻辑层 | 处理业务逻辑，调用 Repository 完成数据操作 |
| **Controller** (`TodoController`) | 控制层 | 提供 REST API，接收HTTP请求，返回JSON数据 |
| **Frontend** | 前端 | 原生JavaScript，调用API，渲染界面 |

## 🔧 API 接口说明

| 方法 | 路径 | 功能 |
|------|------|------|
| GET | `/api/todos` | 获取所有任务 |
| GET | `/api/todos/completed/{completed}` | 按完成状态筛选 |
| GET | `/api/todos/priority/{priority}` | 按优先级筛选 |
| GET | `/api/todos/category/{category}` | 按分类筛选 |
| GET | `/api/todos/overdue` | 获取所有过期未完成任务 |
| GET | `/api/todos/{id}` | 获取单个任务详情 |
| POST | `/api/todos` | 创建新任务 |
| PUT | `/api/todos/{id}` | 更新整个任务 |
| PATCH | `/api/todos/{id}/toggle` | 切换任务完成状态 |
| DELETE | `/api/todos/{id}` | 删除任务 |

## 🗄️ 数据模型

### Todo 实体属性

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | Long | 自增主键 |
| `title` | String | 任务标题（必填） |
| `description` | String | 任务描述（可选） |
| `completed` | boolean | 完成状态，默认 `false` |
| `priority` | String | 优先级：`LOW`/`MEDIUM`/`HIGH`，默认 `MEDIUM` |
| `dueDate` | LocalDateTime | 截止日期（可选） |
| `category` | String | 分类标签（可选） |
| `createdAt` | LocalDateTime | 创建时间，自动设置 |
| `updatedAt` | LocalDateTime | 最后更新时间，自动更新 |

## 🚀 运行方式

### 环境要求
- Java 21+
- Maven 3.8+

### 方法一：Maven 命令行运行

```bash
# 进入项目目录
cd todo-app

# 编译打包
mvn clean package

# 运行应用
java -jar target/todo-app-1.0.0.jar
```

### 方法二：Spring Boot Maven 插件

```bash
mvn spring-boot:run
```

### 方法三：IDE 运行

在 IntelliJ IDEA 中直接打开 `TodoApplication.java`，点击运行按钮即可。

## 🌐 访问应用

启动成功后，在浏览器访问：

- **前端界面**：http://localhost:9090
- **H2 数据库控制台**：http://localhost:9090/h2-console
  - JDBC URL: `jdbc:h2:file:./data/tododb`
  - Username: `sa`
  - Password: (空)

## ⚙️ 配置说明

配置文件位置：`src/main/resources/application.properties`

```properties
# 数据库配置 - H2 文件数据库，数据保存在 ./data/tododb
spring.datasource.url=jdbc:h2:file:./data/tododb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

# JPA 配置 - 自动更新表结构
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect

# H2 控制台开启
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

# 服务端口
server.port=9090
```

## 🎨 技术栈

- **后端**：Spring Boot 3.2, Spring Data JPA, H2 Database
- **前端**：HTML5, CSS3, 原生 JavaScript (无框架依赖)
- **工具**：Lombok (简化Java代码), Maven (项目构建)
- **Java 版本**：Java 21

## ✨ 特色

1. **完整的分层架构** - 清晰的 Entity/Repository/Service/Controller 分层
2. **详细的注释** - 每个类和方法都有清晰的功能说明文档
3. **原生前端** - 无需Node.js/npm，直接运行，易于理解
4. **嵌入式数据库** - H2 文件数据库，无需额外安装数据库
5. **响应式设计** - 手机、平板、桌面都有良好体验
6. **现代化UI** - 遵循现代设计规范，美观易用

## 📝 使用示例

1. 打开 http://localhost:9090
2. 在"输入新任务"框输入任务标题
3. （可选）添加描述、选择优先级、设置截止日期、填写分类
4. 点击"添加任务"
5. 在列表中看到任务，可以：
   - ✓ 按钮切换完成状态
   - 🗑 按钮删除任务
   - 使用顶部筛选按钮筛选任务
   - 使用搜索框搜索关键词

## 📄 许可证

MIT License
