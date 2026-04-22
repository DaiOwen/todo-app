package com.todolist.repositories;

import com.todolist.entity.Todo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TodoRepository extends JpaRepository<Todo, Long> {
    List<Todo> findByCompleted(boolean completed);
    List<Todo> findByPriority(String priority);
    List<Todo> findByCategory(String category);
    List<Todo> findAllByOrderByPriorityDescDueDateAscCreatedAtAsc();
    List<Todo> findByCompletedOrderByPriorityDescDueDateAscCreatedAtAsc(boolean completed);
    List<Todo> findByDueDateBeforeAndCompletedFalse(LocalDateTime now);
}
