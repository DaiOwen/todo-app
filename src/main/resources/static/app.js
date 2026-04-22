const API_BASE = '/api/todos';
let currentFilter = 'all';
let todos = [];

const todoListEl = document.getElementById('todoList');
const emptyStateEl = document.getElementById('emptyState');
const todoTitleInput = document.getElementById('todoTitle');
const todoDescriptionInput = document.getElementById('todoDescription');
const addButton = document.getElementById('addButton');
const filterButtons = document.querySelectorAll('.filter-btn');
const todoCountEl = document.getElementById('todoCount');
const template = document.getElementById('todoItemTemplate');

async function fetchTodos() {
    try {
        const response = await fetch(`${API_BASE}`);
        todos = await response.json();
        renderTodos();
        updateCount();
    } catch (error) {
        console.error('Failed to fetch todos:', error);
    }
}

async function createTodo(title, description) {
    const todo = {
        title,
        description: description || '',
        completed: false
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

    if (todo.completed) {
        itemEl.classList.add('completed');
    }

    const titleEl = clone.querySelector('.todo-title');
    titleEl.textContent = todo.title;

    const descEl = clone.querySelector('.todo-description');
    descEl.textContent = todo.description;

    const statusEl = clone.querySelector('.todo-status');
    statusEl.textContent = todo.completed ? '已完成' : '进行中';
    statusEl.classList.add(todo.completed ? 'completed' : 'active');

    const dateEl = clone.querySelector('.todo-date');
    if (todo.createdAt) {
        const date = new Date(todo.createdAt);
        dateEl.textContent = date.toLocaleString('zh-CN');
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
    if (currentFilter === 'active') {
        filteredTodos = todos.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        filteredTodos = todos.filter(t => t.completed);
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

addButton.addEventListener('click', async () => {
    const title = todoTitleInput.value.trim();
    const description = todoDescriptionInput.value.trim();

    if (!title) {
        alert('请输入任务标题');
        return;
    }

    const success = await createTodo(title, description);
    if (success) {
        todoTitleInput.value = '';
        todoDescriptionInput.value = '';
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

document.addEventListener('DOMContentLoaded', () => {
    fetchTodos();
    todoTitleInput.focus();
});
