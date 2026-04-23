/**
 * Todo List 前端JavaScript主程序
 * 原生JavaScript实现，无需第三方框架
 * 功能：任务增删改查、筛选、搜索、批量操作
 */

// API 基础路径，后端REST接口地址
const API_BASE = '/api/todos';

// 全局状态管理
let currentFilter = 'all';       // 当前状态筛选: all(全部)/active(进行中)/completed(已完成)
let currentCategory = null;      // 当前分类筛选，null表示不筛选
let searchQuery = '';             // 搜索关键词
let todos = [];                  // 所有任务数据数组
let darkTheme = false;           // 深色主题状态
let displayMode = 'list';        // 显示模式: list(普通列表)/group(按日期分组)

// DOM 元素缓存，获取页面中需要操作的元素
const todoListEl = document.getElementById('todoList');         // 任务列表容器
const emptyStateEl = document.getElementById('emptyState');     // 空状态提示元素
const todoTitleInput = document.getElementById('todoTitle');     // 任务标题输入框
const todoDescriptionInput = document.getElementById('todoDescription');  // 任务描述输入框
const todoCategoryInput = document.getElementById('todoCategory');  // 分类输入框
const searchInput = document.getElementById('searchInput');     // 搜索框
const addButton = document.getElementById('addButton');         // 添加按钮
const filterButtons = document.querySelectorAll('.filter-btn'); // 状态筛选按钮
const categoryFiltersEl = document.getElementById('categoryFilters'); // 分类筛选容器
const todoCountEl = document.getElementById('todoCount');       // 页脚任务计数器
const template = document.getElementById('todoItemTemplate');  // 任务项HTML模板
const themeToggleBtn = document.getElementById('themeToggle');  // 主题切换按钮
// 统计面板元素
const statTotalEl = document.getElementById('statTotal');       // 总任务数
const statActiveEl = document.getElementById('statActive');     // 进行中任务数
const statCompletedEl = document.getElementById('statCompleted'); // 已完成任务数
const statTodayEl = document.getElementById('statToday');       // 今日完成任务数
const progressPercentEl = document.getElementById('progressPercent'); // 进度百分比
const progressFillEl = document.getElementById('progressFill');   // 进度条填充
const groupedTodoListEl = document.getElementById('groupedTodoList'); // 分组列表容器
const modeButtons = document.querySelectorAll('.mode-btn');    // 显示模式切换按钮

// 拖拽排序相关全局变量
let draggedItem = null;  // 当前正在拖拽的元素

/**
 * 从后端API获取所有任务
 * 成功后更新界面、计数器和分类筛选
 */
async function fetchTodos() {
    try {
        const response = await fetch(`${API_BASE}`);
        todos = await response.json();
        renderTodos();
        updateCount();
        updateStats();
        rebuildCategoryFilters();
    } catch (error) {
        console.error('Failed to fetch todos:', error);
    }
}

/**
 * 创建新任务
 * @param {string} title - 任务标题
 * @param {string} description - 任务描述
 * @param {string} priority - 优先级 LOW/MEDIUM/HIGH
 * @param {string} dueDate - 截止日期
 * @param {string} category - 分类
 * @returns {boolean} 创建成功返回true，失败返回false
 */
async function createTodo(title, description, priority, dueDate, category) {
    // 构造请求体，空值处理
    const todo = {
        title,
        description: description || '',
        completed: false,
        priority: priority || 'MEDIUM',
        dueDate: dueDate || null,
        category: category || null
    };

    try {
        // 发送POST请求创建任务
        const response = await fetch(`${API_BASE}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(todo)
        });
        const newTodo = await response.json();
        // 添加到本地数组并更新界面
        todos.push(newTodo);
        renderTodos();
        updateCount();
        updateStats();
        return true;
    } catch (error) {
        console.error('Failed to create todo:', error);
        alert('创建任务失败，请重试');
        return false;
    }
}

/**
 * 切换任务完成状态（翻转）
 * 未完成 → 已完成，已完成 → 未完成
 * @param {number} id - 任务ID
 */
async function toggleTodo(id) {
    try {
        const response = await fetch(`${API_BASE}/${id}/toggle`, {
            method: 'PATCH'
        });
        if (response.ok) {
            const updatedTodo = await response.json();
            // 更新本地数组中的任务
            const index = todos.findIndex(t => t.id === id);
            if (index !== -1) {
                todos[index] = updatedTodo;
            }
            renderTodos();
            updateCount();
            updateStats();
        }
    } catch (error) {
        console.error('Failed to toggle todo:', error);
    }
}

/**
 * 删除指定任务
 * @param {number} id - 要删除的任务ID
 */
async function deleteTodo(id) {
    try {
        await fetch(`${API_BASE}/${id}`, {
            method: 'DELETE'
        });
        // 从本地数组中移除
        todos = todos.filter(t => t.id !== id);
        renderTodos();
        updateCount();
        updateStats();
    } catch (error) {
        console.error('Failed to delete todo:', error);
    }
}

/**
 * 根据任务数据创建DOM元素
 * 使用HTML模板克隆，绑定事件处理器
 * @param {Object} todo - 任务对象
 * @returns {HTMLElement} 创建好的任务元素
 */
function createTodoElement(todo) {
    // 克隆模板内容
    const clone = document.importNode(template.content, true);
    const itemEl = clone.querySelector('.todo-item');
    
    // 设置基本属性和CSS类
    itemEl.dataset.id = todo.id;
    itemEl.classList.add(`priority-${todo.priority?.toLowerCase() || 'medium'}`);

    // 如果已完成，添加完成样式（删除线+透明）
    if (todo.completed) {
        itemEl.classList.add('completed');
    }

    // 检查是否过期（未完成且截止日期在今天之前）
    if (!todo.completed && todo.dueDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(todo.dueDate);
        due.setHours(0, 0, 0, 0);
        if (due < today) {
            itemEl.classList.add('overdue');
        }
    }

    // 设置任务标题
    const titleEl = clone.querySelector('.todo-title');
    titleEl.textContent = todo.title;

    // 设置任务描述
    const descEl = clone.querySelector('.todo-description');
    descEl.textContent = todo.description;

    // 设置分类标签，如果没有分类则隐藏
    const categoryBadge = clone.querySelector('.category-badge');
    if (todo.category) {
        categoryBadge.textContent = todo.category;
    } else {
        categoryBadge.style.display = 'none';
    }

    // 设置优先级标签，不同优先级不同颜色
    const priorityBadge = clone.querySelector('.priority-badge');
    const priority = todo.priority || 'MEDIUM';
    priorityBadge.textContent = {
        'LOW': '低',
        'MEDIUM': '中',
        'HIGH': '高'
    }[priority];
    priorityBadge.classList.add(`priority-${priority.toLowerCase()}`);

    // 设置状态标签
    const statusEl = clone.querySelector('.todo-status');
    statusEl.textContent = todo.completed ? '已完成' : '进行中';
    statusEl.classList.add(todo.completed ? 'completed' : 'active');

    // 显示截止日期，处理过期状态
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

    // 显示创建时间
    const dateEl = clone.querySelector('.todo-date');
    if (todo.createdAt) {
        const date = new Date(todo.createdAt);
        dateEl.textContent = '创建: ' + date.toLocaleString('zh-CN');
    }

    // 绑定切换状态按钮事件
    const toggleBtn = clone.querySelector('.btn-toggle');
    toggleBtn.addEventListener('click', () => toggleTodo(todo.id));

    // 绑定删除按钮事件，删除前确认
    const deleteBtn = clone.querySelector('.btn-delete');
    deleteBtn.addEventListener('click', () => {
        if (confirm('确定要删除这个任务吗？')) {
            deleteTodo(todo.id);
        }
    });

    // 绑定拖拽事件
    itemEl.addEventListener('dragstart', handleDragStart);
    itemEl.addEventListener('dragenter', handleDragEnter);
    itemEl.addEventListener('dragover', handleDragOver);
    itemEl.addEventListener('dragleave', handleDragLeave);
    itemEl.addEventListener('drop', handleDrop);
    itemEl.addEventListener('dragend', handleDragEnd);

    return itemEl;
}

/**
 * 根据当前筛选条件过滤任务并重新渲染
 * 支持两种显示模式：普通列表 / 按日期分组
 */
function renderTodos() {
    let filteredTodos = todos;
    
    // 第一步：按完成状态筛选
    if (currentFilter === 'active') {
        filteredTodos = filteredTodos.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        filteredTodos = filteredTodos.filter(t => t.completed);
    }
    
    // 第二步：按分类筛选
    if (currentCategory) {
        filteredTodos = filteredTodos.filter(t => t.category === currentCategory);
    }
    
    // 第三步：按关键词搜索，搜索标题、描述、分类
    if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        filteredTodos = filteredTodos.filter(t => 
            t.title.toLowerCase().includes(q) || 
            (t.description && t.description.toLowerCase().includes(q)) ||
            (t.category && t.category.toLowerCase().includes(q))
        );
    }

    // 清空两种容器
    todoListEl.innerHTML = '';
    groupedTodoListEl.innerHTML = '';

    if (filteredTodos.length === 0) {
        emptyStateEl.classList.add('show');
        return;
    }
    
    emptyStateEl.classList.remove('show');

    // 根据显示模式选择渲染方式
    if (displayMode === 'list') {
        // 普通列表模式
        todoListEl.style.display = 'flex';
        groupedTodoListEl.style.display = 'none';
        filteredTodos.forEach(todo => {
            const el = createTodoElement(todo);
            todoListEl.appendChild(el);
        });
    } else {
        // 按日期分组模式
        todoListEl.style.display = 'none';
        groupedTodoListEl.style.display = 'flex';
        renderGroupedTodos(filteredTodos);
    }
}

/**
 * 按截止日期分组渲染任务
 * 分组规则：
 *  - 今天：截止日期是今天
 *  - 明天：截止日期是明天
 *  - 本周：截止日期在本周内（不包含今天明天）
 *  - 下周：截止日期在下周
 *  - 以后：截止日期在下周之后
 *  - 无截止日期：没有设置截止日期的任务
 * @param {Array} filteredTodos - 已过滤的任务列表
 */
function renderGroupedTodos(filteredTodos) {
    // 分组定义
    const groups = {
        today: { name: '今天', todos: [] },
        tomorrow: { name: '明天', todos: [] },
        thisWeek: { name: '本周', todos: [] },
        nextWeek: { name: '下周', todos: [] },
        later: { name: '以后', todos: [] },
        noDueDate: { name: '无截止日期', todos: [] }
    };

    // 获取今天、明天、本周、下周的时间范围
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const startOfWeek = new Date(today);
    const day = today.getDay(); // 0=周日, 1=周一...
    const diff = day === 0 ? 0 : 1 - day;
    const startOfWeekDate = new Date(today);
    startOfWeekDate.setDate(startOfWeekDate.getDate() + diff);
    
    const endOfWeek = new Date(startOfWeekDate);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    
    const startOfNextWeek = new Date(endOfWeek);
    startOfNextWeek.setDate(startOfNextWeek.getDate() + 1);
    const endOfNextWeek = new Date(startOfNextWeek);
    endOfNextWeek.setDate(endOfNextWeek.getDate() + 7);

    // 将每个任务分到对应组
    filteredTodos.forEach(todo => {
        if (!todo.dueDate) {
            groups.noDueDate.todos.push(todo);
            return;
        }
        
        const due = new Date(todo.dueDate);
        due.setHours(0, 0, 0, 0);
        
        if (due.getTime() === today.getTime()) {
            groups.today.todos.push(todo);
        } else if (due.getTime() === tomorrow.getTime()) {
            groups.tomorrow.todos.push(todo);
        } else if (due >= startOfWeekDate && due <= endOfWeek) {
            groups.thisWeek.todos.push(todo);
        } else if (due >= startOfNextWeek && due <= endOfNextWeek) {
            groups.nextWeek.todos.push(todo);
        } else if (due > endOfNextWeek) {
            groups.later.todos.push(todo);
        } else {
            // 过期的也放在今天
            groups.today.todos.push(todo);
        }
    });

    // 渲染分组，只渲染有任务的分组
    Object.values(groups).forEach(group => {
        if (group.todos.length === 0) return;

        // 创建分组容器
        const groupEl = document.createElement('div');
        groupEl.className = 'date-group';
        
        // 分组头部（标题+计数）
        const headerEl = document.createElement('div');
        headerEl.className = 'date-group-header';
        headerEl.innerHTML = `
            <h3 class="date-group-title">${group.name}</h3>
            <span class="date-group-count">${group.todos.length} 个任务</span>
        `;
        
        // 分组任务列表容器
        const todosContainer = document.createElement('div');
        todosContainer.className = 'date-group-todos';
        
        // 添加任务
        group.todos.forEach(todo => {
            const el = createTodoElement(todo);
            todosContainer.appendChild(el);
        });
        
        // 组装分组
        groupEl.appendChild(headerEl);
        groupEl.appendChild(todosContainer);
        groupedTodoListEl.appendChild(groupEl);
    });
}

/**
 * 更新底部任务计数器，显示进行中的任务数量
 */
function updateCount() {
    const activeCount = todos.filter(t => !t.completed).length;
    todoCountEl.textContent = `${activeCount} 个进行中`;
}

/**
 * 更新统计面板数据
 * 统计：总任务数、进行中、已完成、今日完成
 * 同时更新完成进度条
 */
function updateStats() {
    const total = todos.length;
    const active = todos.filter(t => !t.completed).length;
    const completed = todos.filter(t => t.completed).length;
    
    // 统计今天完成的任务：完成时间在今天（通过updatedAt判断，因为完成时会更新）
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayCompleted = todos.filter(t => {
        if (!t.completed) return false;
        if (!t.updatedAt) return false;
        const updatedDate = new Date(t.updatedAt);
        return updatedDate >= today && updatedDate < tomorrow;
    }).length;
    
    // 更新DOM
    statTotalEl.textContent = total;
    statActiveEl.textContent = active;
    statCompletedEl.textContent = completed;
    statTodayEl.textContent = todayCompleted;
    
    // 更新进度条
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    progressPercentEl.textContent = `${percent}%`;
    progressFillEl.style.width = `${percent}%`;
}

/**
 * 重新构建分类筛选按钮
 * 从现有任务中提取所有不重复的分类，动态生成按钮
 */
function rebuildCategoryFilters() {
    // 获取所有不重复的分类名称
    const categories = [...new Set(todos.map(t => t.category).filter(c => c))];
    categoryFiltersEl.innerHTML = '';
    
    // 如果没有分类，隐藏分类筛选区域
    if (categories.length === 0) {
        document.querySelector('.extra-filters').style.display = 'none';
        return;
    }
    
    // 有分类则显示筛选区域
    document.querySelector('.extra-filters').style.display = 'flex';
    
    // 添加"全部"按钮，清除分类筛选
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
    
    // 为每个分类创建一个筛选按钮
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

/**
 * 添加按钮点击事件处理器
 * 从输入框获取值，验证后调用createTodo创建任务
 */
addButton.addEventListener('click', async () => {
    const title = todoTitleInput.value.trim();
    const description = todoDescriptionInput.value.trim();
    const priority = document.querySelector('input[name="priority"]:checked').value;
    const dueDate = document.getElementById('todoDueDate').value;
    const category = todoCategoryInput.value.trim();

    // 标题不能为空
    if (!title) {
        alert('请输入任务标题');
        return;
    }

    // 创建成功后清空表单，聚焦标题输入框
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

/**
 * 标题输入框键盘事件，按Enter直接添加任务
 * 按住Shift+Enter不会触发，允许换行输入
 */
todoTitleInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        addButton.click();
    }
});

/**
 * 状态筛选按钮事件绑定
 * 点击切换当前筛选状态，高亮当前选中的按钮
 */
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTodos();
    });
});

/**
 * 搜索框输入事件，实时搜索过滤
 * 每次输入更新搜索关键词并重新渲染
 */
searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderTodos();
});

/**
 * 批量操作：标记所有进行中的任务为已完成
 * 需要用户确认，防止误操作
 */
document.getElementById('batchCompleteBtn').addEventListener('click', async () => {
    const activeTodos = todos.filter(t => !t.completed);
    if (activeTodos.length === 0) {
        alert('没有进行中的任务');
        return;
    }
    if (!confirm(`确定要标记所有 ${activeTodos.length} 个任务为已完成吗？`)) {
        return;
    }
    // 逐个切换状态
    for (const todo of activeTodos) {
        await toggleTodo(todo.id);
    }
    updateStats();
});

/**
 * 批量操作：删除所有已完成的任务
 * 此操作不可恢复，需要二次确认
 */
document.getElementById('batchClearBtn').addEventListener('click', async () => {
    const completedTodos = todos.filter(t => t.completed);
    if (completedTodos.length === 0) {
        alert('没有已完成的任务');
        return;
    }
    if (!confirm(`确定要删除所有 ${completedTodos.length} 个已完成任务吗？此操作不可恢复！`)) {
        return;
    }
    // 逐个删除
    for (const todo of completedTodos) {
        await deleteTodo(todo.id);
    }
    updateStats();
});

/**
 * 切换主题（浅色/深色）
 * 切换后保存用户偏好到localStorage
 */
function toggleTheme() {
    darkTheme = !darkTheme;
    if (darkTheme) {
        document.body.classList.add('dark-theme');
        document.querySelector('.theme-icon').textContent = '☀️';
    } else {
        document.body.classList.remove('dark-theme');
        document.querySelector('.theme-icon').textContent = '🌙';
    }
    // 保存到本地存储，下次打开页面记住用户选择
    localStorage.setItem('todo-theme', darkTheme ? 'dark' : 'light');
}

/**
 * 初始化主题，从localStorage读取用户偏好
 * 如果没有保存偏好，默认使用浅色主题
 */
function initTheme() {
    const savedTheme = localStorage.getItem('todo-theme');
    if (savedTheme === 'dark') {
        darkTheme = true;
        document.body.classList.add('dark-theme');
        document.querySelector('.theme-icon').textContent = '☀️';
    } else {
        darkTheme = false;
        document.body.classList.remove('dark-theme');
        document.querySelector('.theme-icon').textContent = '🌙';
    }
}

// 绑定主题切换按钮事件
themeToggleBtn.addEventListener('click', toggleTheme);

// 绑定显示模式切换事件
modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        modeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        displayMode = btn.dataset.mode;
        renderTodos();
    });
});

/**
 * 拖拽开始 - 记录被拖拽的元素，添加样式
 */
function handleDragStart(e) {
    draggedItem = this;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
    this.classList.add('dragging');
}

/**
 * 拖拽进入目标区域 - 添加悬停样式
 */
function handleDragEnter(e) {
    e.preventDefault();
    if (this !== draggedItem) {
        this.classList.add('drag-over');
    }
}

/**
 * 拖拽在目标区域上方 - 阻止默认行为允许放置
 */
function handleDragOver(e) {
    e.preventDefault(); // 必须阻止默认才能触发drop
    return false;
}

/**
 * 拖拽离开目标区域 - 移除悬停样式
 */
function handleDragLeave(e) {
    if (e.target === this || e.target.parentNode === this) {
        this.classList.remove('drag-over');
    }
}

/**
 * 放置 - 完成拖拽交换位置
 */
async function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    
    if (this !== draggedItem) {
        // 获取拖拽元素和放置目标的索引
        const items = [...todoListEl.children];
        const fromIndex = items.indexOf(draggedItem);
        const toIndex = items.indexOf(this);
        
        // 从全局todos数组中交换
        const draggedId = parseInt(draggedItem.dataset.id);
        const targetId = parseInt(this.dataset.id);
        const fromTodoIndex = todos.findIndex(t => t.id === draggedId);
        const toTodoIndex = todos.findIndex(t => t.id === targetId);
        
        // 交换位置
        const [removed] = todos.splice(fromTodoIndex, 1);
        todos.splice(toTodoIndex, 0, removed);
        
        // 重新渲染
        renderTodos();
        // 保存新顺序到后端
        await saveOrder();
        updateStats();
    }
    
    return false;
}

/**
 * 拖拽结束 - 清理样式
 */
function handleDragEnd(e) {
    this.classList.remove('dragging');
    [...todoListEl.children].forEach(item => {
        item.classList.remove('drag-over');
    });
}

/**
 * 保存当前顺序到后端数据库
 */
async function saveOrder() {
    // 获取当前显示顺序的ID列表
    const orderedIds = [...todoListEl.children].map(item => parseInt(item.dataset.id));
    
    try {
        await fetch(`${API_BASE}/reorder`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderedIds)
        });
    } catch (error) {
        console.error('Failed to save order:', error);
    }
}

/**
 * 页面加载完成后初始化
 * 拉取任务列表，聚焦标题输入框
 */
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    fetchTodos();
    todoTitleInput.focus();
});
