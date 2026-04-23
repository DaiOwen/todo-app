package com.todolist.service;

import com.todolist.entity.Todo;
import com.todolist.repositories.TodoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 待办事项业务逻辑层
 * 处理所有与待办事项相关的业务操作，调用数据访问层完成数据操作
 */
@Service
public class TodoService {

    private final TodoRepository todoRepository;

    /**
     * 构造函数注入，依赖注入由Spring自动完成
     * @param todoRepository 待办事项数据访问层
     */
    @Autowired
    public TodoService(TodoRepository todoRepository) {
        this.todoRepository = todoRepository;
    }

    /**
     * 查询所有待办事项，按手动排序索引、优先级和截止日期排序
     * 排序规则：orderIndex(手动排序) → 优先级 → 截止日期 → 创建时间
     * @return 所有待办事项列表
     */
    public List<Todo> findAll() {
        return todoRepository.findAllByOrderByOrderIndexAscPriorityDescDueDateAscCreatedAtAsc();
    }

    /**
     * 根据完成状态查询待办事项
     * @param completed 完成状态 true=已完成 false=进行中
     * @return 符合条件的待办事项列表
     */
    public List<Todo> findByCompleted(boolean completed) {
        return todoRepository.findByCompletedOrderByOrderIndexAscPriorityDescDueDateAscCreatedAtAsc(completed);
    }

    /**
     * 根据优先级查询待办事项
     * @param priority 优先级 LOW/MEDIUM/HIGH
     * @return 符合条件的待办事项列表
     */
    public List<Todo> findByPriority(String priority) {
        return todoRepository.findByPriority(priority);
    }

    /**
     * 根据分类查询待办事项
     * @param category 分类名称
     * @return 符合条件的待办事项列表
     */
    public List<Todo> findByCategory(String category) {
        return todoRepository.findByCategory(category);
    }

    /**
     * 查询所有已过期且未完成的待办事项
     * @return 过期未完成的任务列表
     */
    public List<Todo> findOverdueTodos() {
        return todoRepository.findByDueDateBeforeAndCompletedFalse(LocalDateTime.now());
    }

    /**
     * 根据ID查询单个待办事项
     * @param id 任务ID
     * @return Optional包装的任务对象，可能为空
     */
    public Optional<Todo> findById(Long id) {
        return todoRepository.findById(id);
    }

    /**
     * 保存或更新待办事项
     * 如果任务ID为空则新建，否则更新
     * @param todo 待保存的任务对象
     * @return 保存后的任务对象（包含生成的ID）
     */
    public Todo save(Todo todo) {
        return todoRepository.save(todo);
    }

    /**
     * 根据ID删除待办事项
     * @param id 要删除的任务ID
     */
    public void deleteById(Long id) {
        todoRepository.deleteById(id);
    }

    /**
     * 切换任务完成状态
     * 如果当前是未完成则变为已完成，如果是已完成则变为未完成
     * @param id 任务ID
     * @return 更新后的任务对象，如果ID不存在则返回null
     */
    public Todo toggleCompleted(Long id) {
        Optional<Todo> todoOptional = findById(id);
        if (todoOptional.isPresent()) {
            Todo todo = todoOptional.get();
            todo.setCompleted(!todo.isCompleted());
            return save(todo);
        }
        return null;
    }
}
