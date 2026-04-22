package com.todolist.controller;

import com.todolist.entity.Todo;
import com.todolist.service.TodoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/todos")
@CrossOrigin(origins = "*")
public class TodoController {

    private final TodoService todoService;

    @Autowired
    public TodoController(TodoService todoService) {
        this.todoService = todoService;
    }

    @GetMapping
    public List<Todo> getAllTodos() {
        return todoService.findAll();
    }

    @GetMapping("/completed/{completed}")
    public List<Todo> getTodosByCompleted(@PathVariable boolean completed) {
        return todoService.findByCompleted(completed);
    }

    @GetMapping("/priority/{priority}")
    public List<Todo> getTodosByPriority(@PathVariable String priority) {
        return todoService.findByPriority(priority);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Todo> getTodoById(@PathVariable Long id) {
        return todoService.findById(id)
                .map(todo -> ResponseEntity.ok().body(todo))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Todo> createTodo(@RequestBody Todo todo) {
        Todo savedTodo = todoService.save(todo);
        return new ResponseEntity<>(savedTodo, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Todo> updateTodo(@PathVariable Long id, @RequestBody Todo todoDetails) {
        return todoService.findById(id)
                .map(todo -> {
                    todo.setTitle(todoDetails.getTitle());
                    todo.setDescription(todoDetails.getDescription());
                    todo.setCompleted(todoDetails.isCompleted());
                    todo.setPriority(todoDetails.getPriority());
                    Todo updatedTodo = todoService.save(todo);
                    return ResponseEntity.ok(updatedTodo);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Todo> toggleTodo(@PathVariable Long id) {
        Todo toggledTodo = todoService.toggleCompleted(id);
        if (toggledTodo != null) {
            return ResponseEntity.ok(toggledTodo);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTodo(@PathVariable Long id) {
        return todoService.findById(id)
                .map(todo -> {
                    todoService.deleteById(id);
                    return new ResponseEntity<Void>(HttpStatus.NO_CONTENT);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
