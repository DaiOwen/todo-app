package com.todolist.repositories;

import com.todolist.entity.Todo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 待办事项数据访问层接口
 * 继承 JpaRepository 获得基本的 CRUD 操作
 * Spring Data JPA 会自动实现这个接口，不需要手动编写SQL
 */
@Repository
public interface TodoRepository extends JpaRepository<Todo, Long> {
    
    /**
     * 根据完成状态查找所有任务
     * @param completed 完成状态 true=已完成 false=进行中
     * @return 符合条件的任务列表
     */
    List<Todo> findByCompleted(boolean completed);
    
    /**
     * 根据优先级查找任务
     * @param priority 优先级 LOW/MEDIUM/HIGH
     * @return 符合条件的任务列表
     */
    List<Todo> findByPriority(String priority);
    
    /**
     * 根据分类查找任务
     * @param category 分类名称
     * @return 符合条件的任务列表
     */
    List<Todo> findByCategory(String category);
    
    /**
     * 查询所有任务并排序
     * 排序规则：排序索引升序（手动排序）→ 优先级降序（高优先级在前）→ 截止日期升序（先到期在前）→ 创建时间升序（先创建在前）
     * @return 排序后的任务列表
     */
    List<Todo> findAllByOrderByOrderIndexAscPriorityDescDueDateAscCreatedAtAsc();
    
    /**
     * 根据完成状态查询并排序
     * 排序规则同 findAllByOrderByOrderIndexAscPriorityDescDueDateAscCreatedAtAsc
     * @param completed 完成状态
     * @return 排序后的任务列表
     */
    List<Todo> findByCompletedOrderByOrderIndexAscPriorityDescDueDateAscCreatedAtAsc(boolean completed);
    
    /**
     * 查找所有已过期且未完成的任务
     * @param now 当前时间
     * @return 过期且未完成的任务列表
     */
    List<Todo> findByDueDateBeforeAndCompletedFalse(LocalDateTime now);
}
