const API_BASE = '/api/todos';
let currentFilter = 'all';
let currentCategory = null;
let searchQuery = '';
let todos = [];

const todoListEl = document.getElementById('todoList');
const emptyStateEl = document.getElementById('emptyState');
const todoTitleInput = document.getElementById('todoTitle');
const todoDescriptionInput = document.getElementById('todoDescription');
const todoCategoryInput = document.getElementById('todoCategory');
const searchInput = document.getElementById('searchInput');
const addButton = document.getElementById('addButton');
const filterButtons = document.querySelectorAll('.filter-btn');
const categoryFiltersEl = document.getElementById('categoryFilters');
const todoCountEl = document.getElementById('todoCount');
const template = document.getElementById('todoItemTemplate');

async function fetchTodos() {
    try {
        const response = await fetch(`${API_BASE}`);
        todos = await response.json();
        renderTodos();
        updateCount();
        rebuildCategoryFilters();
    } catch (error) {
        console.error('Failed to fetch todos:', error);
    }
}

async function createTodo(title, description, priority, dueDate, category) {
    const todo = {
        title,
        description: description || '',
        completed: false,
        priority: priority || 'MEDIUM',
        dueDate: dueDate || null,
        category: category || null
    };

    try {
        const response = await fetch(`${API_BASE}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(todo)
        });
        const newTodo = await response.json();
        todos.push(newTodo);
        renderTodos();
        updateCount();
        return true;
    } catch (error) {
        console.error('Failed to create todo:', error);
        alert('创建任务失败，请重试');
        return false;
    }
}

async function toggleTodo(id) {
    try {
        const response = await fetch(`${API_BASE}/${id}/toggle`, {
            method: 'PATCH'
        });
        if (response.ok) {
            const updatedTodo = await response.json();
            const index = todos.findIndex(t => t.id === id);
            if (index !== -1) {
                todos[index] = updatedTodo;
            }
            renderTodos();
        }
    } catch (error) {
        console.error('Failed to toggle todo:', error);
    }
}

async function deleteTodo(id) {
    try {
        await fetch(`${API_BASE}/${id}`, {
            method: 'DELETE'
        });
        todos = todos.filter(t => t.id !== id);
        renderTodos();
        updateCount();
    } catch (error) {
        console.error('Failed to delete todo:', error);
    }
}

function createTodoElement(todo) {
    const clone = document.importNode(template.content, true);
    const itemEl = clone.querySelector('.todo-item');
    itemEl.dataset.id = todo.id;
    itemEl.classList.add(`priority-${todo.priority?.toLowerCase() || 'medium'}`);

    if (todo.completed) {
        itemEl.classList.add('completed');
    }

    // Check if overdue
    if (!todo.completed && todo.dueDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(todo.dueDate);
        due.setHours(0, 0, 0, 0);
        if (due < today) {
            itemEl.classList.add('overdue');
        }
    }

    const titleEl = clone.querySelector('.todo-title');
    titleEl.textContent = todo.title;

    const descEl = clone.querySelector('.todo-description');
    descEl.textContent = todo.description;

    // Category badge
    const categoryBadge = clone.querySelector('.category-badge');
    if (todo.category) {
        categoryBadge.textContent = todo.category;
    } else {
        categoryBadge.style.display = 'none';
    }

    // Priority badge
    const priorityBadge = clone.querySelector('.priority-badge');
    const priority = todo.priority || 'MEDIUM';
    priorityBadge.textContent = {
        'LOW': '低',
        'MEDIUM': '中',
        'HIGH': '高'
    }[priority];
    priorityBadge.classList.add(`priority-${priority.toLowerCase()}`);

    const statusEl = clone.querySelector('.todo-status');
    statusEl.textContent = todo.completed ? '已完成' : '进行中';
    statusEl.classList.add(todo.completed ? 'completed' : 'active');

    // Due date display
    const dueDateEl = clone.querySelector('.todo-due-date');
    if (todo.dueDate) {
        const date = new Date(todo.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(todo.dueDate);
        due.setHours(0, 0, 0, 0);
        
        let label = '截止: ' + date.toLocaleDateString('zh-CN');
        if (!todo.completed && due < today) {
            dueDateEl.textContent = label + ' (已过期)';
            dueDateEl.classList.add('overdue');
            itemEl.classList.add('overdue');
        } else if (due.getTime() === today.getTime()) {
            dueDateEl.textContent = label + ' (今天)';
            dueDateEl.classList.add('today');
        } else {
            dueDateEl.textContent = label;
        }
    } else {
        dueDateEl.textContent = '';
    }

    const dateEl = clone.querySelector('.todo-date');
    if (todo.createdAt) {
        const date = new Date(todo.createdAt);
        dateEl.textContent = '创建: ' + date.toLocaleString('zh-CN');
    }

    const toggleBtn = clone.querySelector('.btn-toggle');
    toggleBtn.addEventListener('click', () => toggleTodo(todo.id));

    const deleteBtn = clone.querySelector('.btn-delete');
    deleteBtn.addEventListener('click', () => {
        if (confirm('确定要删除这个任务吗？')) {
            deleteTodo(todo.id);
        }
    });

    return itemEl;
}

function renderTodos() {
    let filteredTodos = todos;
    
    // Filter by status
    if (currentFilter === 'active') {
        filteredTodos = filteredTodos.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        filteredTodos = filteredTodos.filter(t => t.completed);
    }
    
    // Filter by category
    if (currentCategory) {
        filteredTodos = filteredTodos.filter(t => t.category === currentCategory);
    }
    
    // Filter by search query
    if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        filteredTodos = filteredTodos.filter(t => 
            t.title.toLowerCase().includes(q) || 
            (t.description && t.description.toLowerCase().includes(q)) ||
            (t.category && t.category.toLowerCase().includes(q))
        );
    }

    todoListEl.innerHTML = '';

    if (filteredTodos.length === 0) {
        emptyStateEl.classList.add('show');
    } else {
        emptyStateEl.classList.remove('show');
        filteredTodos.forEach(todo => {
            const el = createTodoElement(todo);
            todoListEl.appendChild(el);
        });
    }
}

function updateCount() {
    const activeCount = todos.filter(t => !t.completed).length;
    todoCountEl.textContent = `${activeCount} 个进行中`;
}

// Rebuild category filter buttons
function rebuildCategoryFilters() {
    const categories = [...new Set(todos.map(t => t.category).filter(c => c))];
    categoryFiltersEl.innerHTML = '';
    
    if (categories.length === 0) {
        document.querySelector('.extra-filters').style.display = 'none';
        return;
    }
    
    document.querySelector('.extra-filters').style.display = 'flex';
    
    // Add "All" button
    const allBtn = document.createElement('button');
    allBtn.className = `category-filter-btn clear ${currentCategory === null ? 'active' : ''}`;
    allBtn.textContent = '全部';
    allBtn.addEventListener('click', () => {
        currentCategory = null;
        document.querySelectorAll('.category-filter-btn').forEach(b => b.classList.remove('active'));
        allBtn.classList.add('active');
        renderTodos();
    });
    categoryFiltersEl.appendChild(allBtn);
    
    // Add category buttons
    categories.forEach(category => {
        const btn = document.createElement('button');
        btn.className = `category-filter-btn ${currentCategory === category ? 'active' : ''}`;
        btn.textContent = category;
        btn.addEventListener('click', () => {
            currentCategory = category;
            document.querySelectorAll('.category-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderTodos();
        });
        categoryFiltersEl.appendChild(btn);
    });
}

addButton.addEventListener('click', async () => {
    const title = todoTitleInput.value.trim();
    const description = todoDescriptionInput.value.trim();
    const priority = document.querySelector('input[name="priority"]:checked').value;
    const dueDate = document.getElementById('todoDueDate').value;
    const category = todoCategoryInput.value.trim();

    if (!title) {
        alert('请输入任务标题');
        return;
    }

    const success = await createTodo(title, description, priority, dueDate, category);
    if (success) {
        todoTitleInput.value = '';
        todoDescriptionInput.value = '';
        todoCategoryInput.value = '';
        document.getElementById('todoDueDate').value = '';
        document.querySelector('input[name="priority"][value="MEDIUM"]').checked = true;
        todoTitleInput.focus();
    }
});

todoTitleInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        addButton.click();
    }
});

filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTodos();
    });
});

// Search input
searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderTodos();
});

// Batch actions
document.getElementById('batchCompleteBtn').addEventListener('click', async () => {
    const activeTodos = todos.filter(t => !t.completed);
    if (activeTodos.length === 0) {
        alert('没有进行中的任务');
        return;
    }
    if (!confirm(`确定要标记所有 ${activeTodos.length} 个任务为已完成吗？`)) {
        return;
    }
    for (const todo of activeTodos) {
        await toggleTodo(todo.id);
    }
});

document.getElementById('batchClearBtn').addEventListener('click', async () => {
    const completedTodos = todos.filter(t => t.completed);
    if (completedTodos.length === 0) {
        alert('没有已完成的任务');
        return;
    }
    if (!confirm(`确定要删除所有 ${completedTodos.length} 个已完成任务吗？此操作不可恢复！`)) {
        return;
    }
    for (const todo of completedTodos) {
        await deleteTodo(todo.id);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    fetchTodos();
    todoTitleInput.focus();
});
