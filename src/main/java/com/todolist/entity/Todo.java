package com.todolist.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 待办事项实体类
 * 对应数据库表 todos，存储所有任务相关信息
 */
@Entity
@Data
@Table(name = "todos")
public class Todo {
    
    /**
     * 任务唯一ID，自增主键
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * 任务标题，不能为空
     * 用于快速识别任务内容
     */
    @Column(nullable = false)
    private String title;
    
    /**
     * 任务详细描述
     * 可以记录更多细节信息，可选字段
     */
    private String description;
    
    /**
     * 任务完成状态
     * true = 已完成，false = 进行中，默认为 false
     */
    private boolean completed = false;
    
    /**
     * 任务优先级
     * 可选值: LOW(低), MEDIUM(中), HIGH(高)，默认为 MEDIUM
     * 用于任务排序和视觉区分
     */
    @Column(nullable = false)
    private String priority = "MEDIUM";
    
    /**
     * 任务截止日期时间
     * 用于提醒用户任务需要完成的时间，可以为空
     */
    private LocalDateTime dueDate;
    
    /**
     * 任务分类/标签
     * 例如：工作、生活、学习等，用于分类筛选，可以为空
     */
    private String category;
    
    /**
     * 任务创建时间
     * 自动在实体首次保存时设置
     */
    private LocalDateTime createdAt;
    
    /**
     * 任务最后更新时间
     * 自动在实体每次更新时修改
     */
    private LocalDateTime updatedAt;
    
    /**
     * 排序索引，用于手动拖拽排序
     * 值越小越靠前，默认值为0
     */
    private Integer orderIndex = 0;
    
    /**
     * 在实体首次持久化（保存到数据库）前自动调用
     * 设置创建时间和更新时间为当前时间
     */
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    /**
     * 在实体更新（持久化）前自动调用
     * 更新最后修改时间为当前时间
     */
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
