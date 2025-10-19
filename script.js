let currentTaskId = null;
let currentDate = new Date();
let selectedDate = null;
let tasks = [];

const tasksContainer = document.getElementById('tasksContainer');
const calendarGrid = document.getElementById('calendarGrid');
const modalOverlay = document.getElementById('modalOverlay');
const modalTitle = document.getElementById('modalTitle');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const saveBtn = document.getElementById('saveBtn');
const taskTitleInput = document.getElementById('taskTitle');
const taskDateInput = document.getElementById('taskDate');
const taskPriorityInput = document.getElementById('taskPriority');

const addTaskBtn = document.getElementById('addTaskBtn');
const editTaskBtn = document.getElementById('editTaskBtn');
const deleteTaskBtn = document.getElementById('deleteTaskBtn');
const completeTaskBtn = document.getElementById('completeTaskBtn');
const fixedButtons = document.getElementById('fixedButtons');

const prevYear = document.getElementById('prevYear');
const nextYear = document.getElementById('nextYear');
const prevMonth = document.getElementById('prevMonth');
const nextMonth = document.getElementById('nextMonth');
const currentYear = document.getElementById('currentYear');
const currentMonth = document.getElementById('currentMonth');
const backButton = document.getElementById('backButton');
const menuButton = document.getElementById('menuButton');
const homeIcon = document.getElementById('homeIcon');

// Инициализация
function init() {
    loadFromStorage();
    renderCalendar();
    renderTasks();
    setupEventListeners();
    fixedButtons.style.opacity = '1';
    fixedButtons.style.visibility = 'visible';
    fixedButtons.style.transform = 'translateY(0)';
}

// Загрузка данных из localStorage
function loadFromStorage() {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
    }
    
    const defaultIcon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSIgc3Ryb2tlPSJub25lIj48cmVjdCB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHg9IjAiIHk9IjAiIHJ4PSI0IiByeT0iNCIvPjwvc3ZnPg==';
    homeIcon.style.backgroundImage = `url(${defaultIcon})`;
}

// Сохранение данных в localStorage
function saveToStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Рендеринг календаря (исходный вид: 3 дня)
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    currentYear.textContent = year;
    currentMonth.textContent = getMonthName(month);
    
    calendarGrid.innerHTML = '';
    
    const daysData = [
        { label: 'ПТ', date: null, type: 'weekday' },
        { label: 'СБ', date: null, type: 'weekday' },
        { label: 'ВС', date: null, type: 'weekday' },
        { label: '17', date: '2025-10-17', type: 'day' },
        { label: '18', date: '2025-10-18', type: 'day' },
        { label: '19', date: '2025-10-19', type: 'day' }
    ];
    
    daysData.forEach(item => {
        const dayCell = document.createElement('div');
        dayCell.className = `day-cell ${item.type === 'weekday' ? 'weekday' : ''}`;
        dayCell.textContent = item.label;
        
        if (item.date) {
            dayCell.dataset.date = item.date;
            
            const tasksOnDate = tasks.filter(task => task.date === item.date);
            if (tasksOnDate.length > 0) {
                dayCell.classList.add('has-tasks');
            }
            
            const today = new Date();
            const isToday = today.getFullYear() === 2025 && 
                           today.getMonth() === 9 && 
                           today.getDate() === parseInt(item.label);
            if (isToday) {
                dayCell.classList.add('today');
            }
            
            if (selectedDate && selectedDate.toISOString().split('T')[0] === item.date) {
                dayCell.classList.add('selected');
            }
            
            dayCell.addEventListener('click', () => {
                selectDateFromFixed(item.date);
            });
        }
        
        calendarGrid.appendChild(dayCell);
    });
}

function getMonthName(monthIndex) {
    const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
                   'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    return months[monthIndex];
}

function selectDateFromFixed(dateStr) {
    document.querySelectorAll('.day-cell').forEach(el => {
        el.classList.remove('selected');
    });
    
    const selectedDay = document.querySelector(`.day-cell[data-date="${dateStr}"]`);
    if (selectedDay) {
        selectedDay.classList.add('selected');
    }
    
    const [year, month, day] = dateStr.split('-').map(Number);
    selectedDate = new Date(year, month - 1, day);
    renderTasks();
}

function renderTasks() {
    tasksContainer.innerHTML = '';
    
    let filteredTasks = [];
    if (selectedDate) {
        const selectedDateString = selectedDate.toISOString().split('T')[0];
        filteredTasks = tasks.filter(task => task.date === selectedDateString);
    } else {
        filteredTasks = tasks;
    }
    
    if (filteredTasks.length === 0) {
        const noTasksDiv = document.createElement('div');
        noTasksDiv.className = 'no-tasks';
        noTasksDiv.innerHTML = `
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2">
                <path d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2v4a2 2 0 002 2h6a2 2 0 002-2v-4h2a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 002-2h2a2 2 0 002 2m-3 7h3m-3 4h3m-6-4h6m-6 4h6"></path>
            </svg>
            <p>На эту дату нет задач</p>
        `;
        tasksContainer.appendChild(noTasksDiv);
        return;
    }
    
    filteredTasks.forEach(task => {
        const taskElement = document.createElement('div');
        // Цвет в зависимости от приоритета
        taskElement.className = `task-circle ${task.completed ? 'completed' : ''} ${task.priority}`;
        taskElement.textContent = task.title;
        taskElement.dataset.id = task.id;
        taskElement.dataset.date = task.date;
        
        taskElement.addEventListener('click', () => {
            selectTask(task.id);
        });
        
        tasksContainer.appendChild(taskElement);
    });
}

function selectTask(id) {
    document.querySelectorAll('.task-circle').forEach(el => {
        el.classList.remove('selected');
    });
    
    const selectedTask = document.querySelector(`.task-circle[data-id="${id}"]`);
    if (selectedTask) {
        selectedTask.classList.add('selected');
        selectedTask.classList.add('task-animation');
        setTimeout(() => {
            selectedTask.classList.remove('task-animation');
        }, 500);
    }
    
    currentTaskId = id;
    editTaskBtn.style.display = 'inline-block';
    deleteTaskBtn.style.display = 'inline-block';
    completeTaskBtn.style.display = 'inline-block';
}

function deselectTask() {
    if (currentTaskId) {
        const selectedTask = document.querySelector(`.task-circle[data-id="${currentTaskId}"]`);
        if (selectedTask) {
            selectedTask.classList.remove('selected');
        }
        currentTaskId = null;
    }
    editTaskBtn.style.display = 'none';
    deleteTaskBtn.style.display = 'none';
    completeTaskBtn.style.display = 'none';
}

function openModal(mode = 'add') {
    modalOverlay.style.display = 'flex';
    currentTaskId = null;
    
    if (mode === 'add') {
        modalTitle.textContent = 'Добавить задачу';
        taskTitleInput.value = '';
        taskDateInput.value = selectedDate ? selectedDate.toISOString().split('T')[0] : '2025-10-18';
        taskPriorityInput.value = 'medium';
    } else if (mode === 'edit' && currentTaskId) {
        modalTitle.textContent = 'Изменить задачу';
        const task = tasks.find(t => t.id === currentTaskId);
        if (task) {
            taskTitleInput.value = task.title;
            taskDateInput.value = task.date;
            taskPriorityInput.value = task.priority;
        }
    }
}

function closeModalWindow() {
    modalOverlay.style.display = 'none';
    currentTaskId = null;
}

function saveTask() {
    const title = taskTitleInput.value.trim();
    const date = taskDateInput.value;
    const priority = taskPriorityInput.value;
    
    if (!title || !date) {
        alert('Пожалуйста, заполните все поля');
        return;
    }
    
    if (currentTaskId) {
        // Обновляем существующую задачу (включая дату!)
        const index = tasks.findIndex(t => t.id === currentTaskId);
        if (index !== -1) {
            tasks[index] = { ...tasks[index], title, date, priority };
        }
    } else {
        // Добавляем новую
        const newId = Math.max(...tasks.map(t => t.id), 0) + 1;
        tasks.push({ id: newId, title, date, priority, completed: false });
    }
    
    saveToStorage();
    renderTasks();
    renderCalendar(); // Обновляем индикаторы задач на датах
    closeModalWindow();
}

function deleteTask() {
    if (!currentTaskId) {
        alert('Пожалуйста, выберите задачу для удаления');
        return;
    }
    
    if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
        tasks = tasks.filter(task => task.id !== currentTaskId);
        saveToStorage();
        renderTasks();
        renderCalendar();
        deselectTask();
    }
}

function toggleTaskStatus() {
    if (!currentTaskId) {
        alert('Пожалуйста, выберите задачу');
        return;
    }
    
    const index = tasks.findIndex(t => t.id === currentTaskId);
    if (index !== -1) {
        tasks[index].completed = !tasks[index].completed;
        saveToStorage();
        renderTasks();
        renderCalendar();
        deselectTask();
    }
}

function setupEventListeners() {
    prevYear.addEventListener('click', () => {
        currentDate.setFullYear(currentDate.getFullYear() - 1);
        renderCalendar();
    });
    nextYear.addEventListener('click', () => {
        currentDate.setFullYear(currentDate.getFullYear() + 1);
        renderCalendar();
    });
    prevMonth.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });
    nextMonth.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });
    
    addTaskBtn.addEventListener('click', () => openModal('add'));
    editTaskBtn.addEventListener('click', () => {
        if (currentTaskId) openModal('edit');
        else alert('Выберите задачу');
    });
    deleteTaskBtn.addEventListener('click', deleteTask);
    completeTaskBtn.addEventListener('click', toggleTaskStatus);
    
    closeModal.addEventListener('click', closeModalWindow);
    cancelBtn.addEventListener('click', closeModalWindow);
    saveBtn.addEventListener('click', saveTask);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModalWindow();
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModalWindow();
            deselectTask();
        }
    });
    
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.task-circle') && !e.target.closest('.fixed-buttons')) {
            deselectTask();
        }
    });
    
    backButton.addEventListener('click', () => alert('Назад'));
    menuButton.addEventListener('click', () => alert('Меню'));
    homeIcon.addEventListener('click', () => alert('Домой'));
}

document.addEventListener('DOMContentLoaded', init);