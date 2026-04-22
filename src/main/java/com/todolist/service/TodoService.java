package com.todolist.service;

import com.todolist.entity.Todo;
import com.todolist.repositories.TodoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TodoService {

    private final TodoRepository todoRepository;

    @Autowired
    public TodoService(TodoRepository todoRepository) {
        this.todoRepository = todoRepository;
    }

    public List<Todo> findAll() {
        return todoRepository.findAllByOrderByPriorityDescCreatedAtAsc();
    }

    public List<Todo> findByCompleted(boolean completed) {
        return todoRepository.findByCompletedOrderByPriorityDescCreatedAtAsc(completed);
    }

    public List<Todo> findByPriority(String priority) {
        return todoRepository.findByPriority(priority);
    }

    public Optional<Todo> findById(Long id) {
        return todoRepository.findById(id);
    }

    public Todo save(Todo todo) {
        return todoRepository.save(todo);
    }

    public void deleteById(Long id) {
        todoRepository.deleteById(id);
    }

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
