package com.todolist.controller;

import com.todolist.entity.Todo;
import com.todolist.service.TodoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 待办事项REST API控制器
 * 提供所有待办事项相关的HTTP接口，供前端调用
 * 基础路径: /api/todos
 * 允许跨域访问（@CrossOrigin）
 */
@RestController
@RequestMapping("/api/todos")
@CrossOrigin(origins = "*")
public class TodoController {

    private final TodoService todoService;

    /**
     * 构造函数注入业务逻辑层
     * @param todoService 待办事项业务逻辑层
     */
    @Autowired
    public TodoController(TodoService todoService) {
        this.todoService = todoService;
    }

    /**
     * 获取所有待办事项
     * @return 所有待办事项列表
     * GET /api/todos
     */
    @GetMapping
    public List<Todo> getAllTodos() {
        return todoService.findAll();
    }

    /**
     * 根据完成状态获取待办事项
     * @param completed 完成状态 true=已完成 false=进行中
     * @return 符合条件的待办事项列表
     * GET /api/todos/completed/{completed}
     */
    @GetMapping("/completed/{completed}")
    public List<Todo> getTodosByCompleted(@PathVariable boolean completed) {
        return todoService.findByCompleted(completed);
    }

    /**
     * 根据优先级获取待办事项
     * @param priority 优先级 LOW/MEDIUM/HIGH
     * @return 符合条件的待办事项列表
     * GET /api/todos/priority/{priority}
     */
    @GetMapping("/priority/{priority}")
    public List<Todo> getTodosByPriority(@PathVariable String priority) {
        return todoService.findByPriority(priority);
    }

    /**
     * 根据分类获取待办事项
     * @param category 分类名称
     * @return 符合条件的待办事项列表
     * GET /api/todos/category/{category}
     */
    @GetMapping("/category/{category}")
    public List<Todo> getTodosByCategory(@PathVariable String category) {
        return todoService.findByCategory(category);
    }

    /**
     * 获取所有已过期且未完成的待办事项
     * @return 过期未完成的任务列表
     * GET /api/todos/overdue
     */
    @GetMapping("/overdue")
    public List<Todo> getOverdueTodos() {
        return todoService.findOverdueTodos();
    }

    /**
     * 根据ID获取单个待办事项
     * @param id 任务ID
     * @return 200 OK 包含任务数据，404 Not Found 如果任务不存在
     * GET /api/todos/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Todo> getTodoById(@PathVariable Long id) {
        return todoService.findById(id)
                .map(todo -> ResponseEntity.ok().body(todo))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 创建新的待办事项
     * @param todo 待创建的任务数据（从请求体JSON解析）
     * @return 201 Created 包含创建后的任务数据
     * POST /api/todos
     */
    @PostMapping
    public ResponseEntity<Todo> createTodo(@RequestBody Todo todo) {
        Todo savedTodo = todoService.save(todo);
        return new ResponseEntity<>(savedTodo, HttpStatus.CREATED);
    }

    /**
     * 更新整个待办事项
     * @param id 要更新的任务ID
     * @param todoDetails 更新后的任务数据
     * @return 200 OK 更新后的任务数据，404 Not Found 如果任务不存在
     * PUT /api/todos/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<Todo> updateTodo(@PathVariable Long id, @RequestBody Todo todoDetails) {
        return todoService.findById(id)
                .map(todo -> {
                    todo.setTitle(todoDetails.getTitle());
                    todo.setDescription(todoDetails.getDescription());
                    todo.setCompleted(todoDetails.isCompleted());
                    todo.setPriority(todoDetails.getPriority());
                    todo.setDueDate(todoDetails.getDueDate());
                    todo.setCategory(todoDetails.getCategory());
                    Todo updatedTodo = todoService.save(todo);
                    return ResponseEntity.ok(updatedTodo);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 切换任务完成状态（翻转状态）
     * 未完成 → 已完成，已完成 → 未完成
     * @param id 任务ID
     * @return 200 OK 更新后的任务数据，404 Not Found 如果任务不存在
     * PATCH /api/todos/{id}/toggle
     */
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Todo> toggleTodo(@PathVariable Long id) {
        Todo toggledTodo = todoService.toggleCompleted(id);
        if (toggledTodo != null) {
            return ResponseEntity.ok(toggledTodo);
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * 删除指定ID的待办事项
     * @param id 要删除的任务ID
     * @return 204 No Content 删除成功，404 Not Found 如果任务不存在
     * DELETE /api/todos/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTodo(@PathVariable Long id) {
        return todoService.findById(id)
                .map(todo -> {
                    todoService.deleteById(id);
                    return new ResponseEntity<Void>(HttpStatus.NO_CONTENT);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 批量更新任务排序
     * 拖拽排序后，传入新的ID顺序，批量更新orderIndex
     * @param orderedIds 新的顺序ID列表，第一个会是第一个位置
     * @return 200 OK 更新成功
     * PUT /api/todos/reorder
     */
    @PutMapping("/reorder")
    public ResponseEntity<Void> reorderTodos(@RequestBody List<Long> orderedIds) {
        for (int i = 0; i < orderedIds.size(); i++) {
            Long id = orderedIds.get(i);
            todoService.findById(id).ifPresent(todo -> {
                todo.setOrderIndex(i);
                todoService.save(todo);
            });
        }
        return ResponseEntity.ok().build();
    }
}
