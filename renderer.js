// State
let tasks = [];
let nextId = 1;
let currentLang = 'zh';
let currentList = 'inbox'; // inbox, today, tomorrow, next7, or custom list id
let calendarView = 'day'; // day, week, month, schedule
let currentSelectedDate = new Date();
let customLists = [];
let editingListId = null; 
let currentEditingTaskId = null;
let workHours = [{start: '09:00', end: '12:00'}, {start: '13:00', end: '18:00'}];
let draggedTaskId = null;
let searchQuery = '';

// I18n Dictionaries
const i18n = {
  en: {
    navTasks: "Tasks", navCalendar: "Calendar", navSettings: "Settings",
    inbox: "Inbox", today: "Today", tomorrow: "Tomorrow", next7: "Next 7 Days",
    completed: "Completed", trash: "Trash", listsHeader: "Lists", addListBtn: "Add List",
    searchPlaceholder: "Search tasks...", aiScheduleBtn: "AI Auto Schedule",
    newTaskPlaceholder: "What needs to be done?", newTaskEstPlaceholder: "Time (e.g. 30m)",
    priorityMed: "Medium", priorityHigh: "High", priorityLow: "Low",
    addTaskBtn: "Add", aiParseBtn: "AI Parse",
    calTodayBtn: "Today", viewDay: "Day", viewWeek: "Week", viewMonth: "Month", viewSchedule: "Schedule",
    settingsHeader: "Settings", appThemeLabel: "Appearance", themeSystem: "System Default", themeDark: "Dark Mode", themeLight: "Light Mode",
    appLangLabel: "Language", aiBaseUrlLabel: "API Base URL", aiModelLabel: "Model Name", aiApiKeyLabel: "API Key",
    workHoursLabel: "Work Hours Settings", btnCancel: "Cancel", btnSave: "Save Changes", btnAdd: "Add",
    listModalAdd: "Add List", listModalEdit: "Edit List", listNameLabel: "List Name", listNamePlaceholder: "e.g. Work Project", listColorLabel: "Color Accent", btnDelete: "Delete", btnSaveList: "Save List",
    editScheduleHeader: "Edit Detail", priorityLabel: "Priority", estTimeLabel: "Estimated Time", dueDateLabel: "Due Date", startTimeLabel: "Start Time", btnClearSchedule: "Clear Schedule", btnSaveSchedule: "✓ Save",
    calCreateHeader: "Create Task in Calendar", taskNameLabel: "Task Name", calCreateBtn: "Create Task", calAiParseBtn: "AI Parse",
    alertDeleteTask: "Delete this task?", alertNoTasks: "No tasks in the current list to schedule.",
    confirmReschedule: "All tasks here are already scheduled.\nDo you want to clear their schedules and let AI reschedule them?",
    aiSchedulingStatus: "✨ Scheduling...", aiParsingStatus: "...", aiParseSuccess: "AI Parsed!",
    searchTitle: "Search Results", deleteListConfirm: "Are you sure you want to delete this list and all its tasks?",
    unscheduledHeader: "Unscheduled Tasks", emptySchedule: "No scheduled tasks for this month", emptyUnscheduled: "No unscheduled tasks",
    themeColorLabel: "Accent Theme Color"
  },
  zh: {
    navTasks: "任务", navCalendar: "日历", navSettings: "设置",
    inbox: "收件箱", today: "今天", tomorrow: "明天", next7: "未来 7 天",
    completed: "已完成", trash: "垃圾桶", listsHeader: "清单", addListBtn: "添加清单",
    searchPlaceholder: "搜索任务...", aiScheduleBtn: "AI 自动排期",
    newTaskPlaceholder: "准备做点什么？", newTaskEstPlaceholder: "时间 (如 30m)",
    priorityMed: "中", priorityHigh: "高", priorityLow: "低",
    addTaskBtn: "添加", aiParseBtn: "AI 识别",
    calTodayBtn: "今天", viewDay: "日", viewWeek: "周", viewMonth: "月", viewSchedule: "日程",
    settingsHeader: "设置", appThemeLabel: "外观主题", themeSystem: "跟随系统", themeDark: "深色模式", themeLight: "浅色模式",
    appLangLabel: "显示语言", aiBaseUrlLabel: "API 接口地址", aiModelLabel: "模型名称", aiApiKeyLabel: "API 密钥",
    workHoursLabel: "工作时间设置", btnCancel: "取消", btnSave: "保存更改", btnAdd: "添加",
    listModalAdd: "新建清单", listModalEdit: "编辑清单", listNameLabel: "清单名称", listNamePlaceholder: "例如：工作项目", listColorLabel: "主题颜色", btnDelete: "删除", btnSaveList: "保存清单",
    editScheduleHeader: "编辑详情", priorityLabel: "优先级", estTimeLabel: "预估时长", dueDateLabel: "截止日期", startTimeLabel: "开始时间", btnClearSchedule: "清除排期", btnSaveSchedule: "✓ 保存",
    calCreateHeader: "在日历中创建任务", taskNameLabel: "任务名称", calCreateBtn: "创建任务", calAiParseBtn: "AI 解析",
    alertDeleteTask: "确定要删除这个任务吗？", alertNoTasks: "当前列表没有任务可排期。",
    confirmReschedule: "当前列表的所有任务都已排期。\n要清除现有排期并使用 AI 重新排程吗？",
    aiSchedulingStatus: "✨ 正在排期...", aiParsingStatus: "...", aiParseSuccess: "解析完成！",
    searchTitle: "搜索结果", deleteListConfirm: "确定要删除此清单及其所有任务吗？",
    unscheduledHeader: "待安排任务", emptySchedule: "本月无排期日程", emptyUnscheduled: "暂无待安排任务",
    themeColorLabel: "个性化主题色"
  }
};

// DOM Elements - Navigation
const navTasksBtn = document.getElementById('navTasksBtn');
const navCalendarBtn = document.getElementById('navCalendarBtn');
const taskLayout = document.getElementById('taskLayout');
const calendarPage = document.getElementById('calendarPage');

// DOM Elements - Task View
const newTaskInput = document.getElementById('newTaskInput');
const newTaskEst = document.getElementById('newTaskEst');
const newTaskPriority = document.getElementById('newTaskPriority');
const newTaskDueDate = document.getElementById('newTaskDueDate');
const addTaskBtn = document.getElementById('addTaskBtn');
const mainTaskList = document.getElementById('main-task-list');
const currentListTitle = document.getElementById('current-list-title');

// DOM Elements - Calendar
const calendarTitle = document.getElementById('calendar-title');
const calendarGrid = document.getElementById('calendar-grid');
const calPrevBtn = document.getElementById('calPrevBtn');
const calNextBtn = document.getElementById('calNextBtn');
const calTodayBtn = document.getElementById('calTodayBtn');

// Modals
const scheduleModal = document.getElementById('scheduleModal');
const calNewTaskModal = document.getElementById('calNewTaskModal');
const settingsModal = document.getElementById('settingsModal');

function getContrastColor(hex) {
  if (!hex || !hex.startsWith('#')) return '#000000';
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? '#000000' : '#ffffff';
}

// ── Initialization ────────────────────────────────────────────────────────────

async function init() {
  // Load tasks
  tasks = await window.api.getTasks();
  if (tasks.length > 0) {
    nextId = Math.max(...tasks.map(t => t.id)) + 1;
  }
  
  // Load settings
  const settings = await window.api.getSettings();
  if (settings.lang) currentLang = settings.lang;
  if (settings.customLists) customLists = settings.customLists;
  if (settings.workHours) workHours = settings.workHours;
  
  // Apply Active Theme
  if (settings.theme) {
    if (settings.theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else if (settings.theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  // Apply Accent Theme Color
  if (settings.themeColor) {
    document.documentElement.style.setProperty('--accent', settings.themeColor);
    document.documentElement.style.setProperty('--accent-hover', settings.themeColor + 'cc');
    const textCol = getContrastColor(settings.themeColor);
    document.documentElement.style.setProperty('--accent-text', textCol);
  }

  // Set default dates
  newTaskDueDate.value = getTodayStr();
  
  // UI Setup
  applyLanguage(currentLang);
  renderCustomLists();
  switchPage('tasks');
  renderAll();
  
  setupListeners();
}

function setupListeners() {
  // Navigation
  navTasksBtn.addEventListener('click', () => switchPage('tasks'));
  navCalendarBtn.addEventListener('click', () => switchPage('calendar'));
  
  // Inline Search
  const sectionSearchInput = document.getElementById('sectionSearchInput');
  sectionSearchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim();
    renderTaskList();
  });
  
  // Task Creation
  addTaskBtn.addEventListener('click', createTask);
  newTaskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') createTask();
  });
  
  // List switching
  document.querySelectorAll('.list-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.list-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      currentList = item.dataset.list;
      currentListTitle.innerText = item.querySelector('.label').innerText;
      searchQuery = ''; // Clear search when switching lists
      document.getElementById('sectionSearchInput').value = '';
      renderAll();
    });
  });

  // Calendar Controls
  calPrevBtn.onclick = () => { navigateCalendar(-1); };
  calNextBtn.onclick = () => { navigateCalendar(1); };
  calTodayBtn.onclick = () => { currentSelectedDate = new Date(); renderAll(); };
  
  document.querySelectorAll('.cal-switcher .btn-segment').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.cal-switcher .btn-segment').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      calendarView = btn.dataset.view;
      renderAll();
    };
  });

  // Modal Buttons
  document.getElementById('closeScheduleBtn').onclick = () => scheduleModal.classList.remove('active');
  document.getElementById('saveScheduleBtn').onclick = saveManualSchedule;
  document.getElementById('clearScheduleBtn').onclick = clearTaskSchedule;
  
  document.getElementById('closeCalNewTaskBtn').onclick = () => calNewTaskModal.classList.remove('active');
  document.getElementById('saveCalNewTaskBtn').onclick = saveCalendarNewTask;
  
  document.getElementById('aiAutoScheduleBtn').onclick = aiAutoSchedule;
  document.getElementById('aiParseBtn').onclick = aiParseFast;
  
  // Settings
  document.getElementById('settingsBtn').onclick = async () => {
      const settings = await window.api.getSettings();
      document.getElementById('appTheme').value = settings.theme || 'system';
      document.getElementById('appLang').value = settings.lang || 'zh';
      document.getElementById('aiBaseUrl').value = settings.baseUrl || '';
      document.getElementById('aiModel').value = settings.model || '';
      document.getElementById('aiApiKey').value = settings.apiKey || '';
      
      const themeColorInput = document.getElementById('themeColor');
      const themeColorText = document.getElementById('themeColorText');
      if (themeColorInput && themeColorText) {
        themeColorInput.value = settings.themeColor || '#60CDFF';
        themeColorText.innerText = (settings.themeColor || '#60CDFF').toUpperCase();
      }

      renderWorkHoursSettings();
      settingsModal.classList.add('active');
  };
  document.getElementById('closeSettingsBtn').onclick = () => settingsModal.classList.remove('active');
  document.getElementById('saveSettingsBtn').onclick = saveSettings;
  document.getElementById('addWorkHourBtn').onclick = addWorkHour;

  const themeColorInput = document.getElementById('themeColor');
  const themeColorText = document.getElementById('themeColorText');
  if (themeColorInput && themeColorText) {
    themeColorInput.addEventListener('input', (e) => {
      themeColorText.innerText = e.target.value.toUpperCase();
    });
  }

  const calSidebarSearch = document.getElementById('calSidebarSearch');
  if (calSidebarSearch) {
    calSidebarSearch.addEventListener('input', () => {
      renderCalendarSidebar();
    });
  }
}

// ── Core Actions ──────────────────────────────────────────────────────────────

function switchPage(page) {
  navTasksBtn.classList.remove('active');
  navCalendarBtn.classList.remove('active');
  taskLayout.classList.remove('active');
  calendarPage.classList.remove('active');
  
  if (page === 'tasks') {
    navTasksBtn.classList.add('active');
    taskLayout.classList.add('active');
  } else {
    navCalendarBtn.classList.add('active');
    calendarPage.classList.add('active');
  }
}

async function createTask() {
  const title = newTaskInput.value.trim();
  if (!title) return;
  
  const newTask = {
    id: nextId++,
    title,
    listId: currentList,
    completed: false,
    priority: newTaskPriority.value || 'Medium',
    estimatedTime: newTaskEst.value || '30m',
    dueDate: newTaskDueDate.value || getTodayStr(),
    scheduledStart: null,
    scheduledEnd: null,
    createdAt: Date.now()
  };
  
  tasks.push(newTask);
  await window.api.saveTasks(tasks);
  
  newTaskInput.value = '';
  renderAll();
}

async function toggleCompleted(id) {
  const t = tasks.find(x => x.id === id);
  if (t) {
    if (!t.completed) {
      const domItem = document.querySelector(`.task-item[data-id="${id}"]`);
      if (domItem) {
        domItem.classList.add('completing');
        setTimeout(async () => {
          t.completed = true;
          await window.api.saveTasks(tasks);
          renderAll();
        }, 1500);
      } else {
        t.completed = true;
        await window.api.saveTasks(tasks);
        renderAll();
      }
    } else {
      t.completed = false;
      await window.api.saveTasks(tasks);
      renderAll();
    }
  }
}

async function deleteTask(id) {
  if (confirm(i18n[currentLang].alertDeleteTask)) {
    tasks = tasks.filter(x => x.id !== id);
    await window.api.saveTasks(tasks);
    renderAll();
  }
}

// ── Modal Handlers ────────────────────────────────────────────────────────────

function openScheduleModal(id) {
  const t = tasks.find(x => x.id === id);
  if (!t) return;
  
  currentEditingTaskId = id;
  document.getElementById('scheduleTaskTitle').innerText = t.title;
  document.getElementById('schedPriority').value = t.priority;
  document.getElementById('schedEstTime').value = t.estimatedTime;
  document.getElementById('schedDueDate').value = t.dueDate;
  document.getElementById('schedStart').value = t.scheduledStart ? t.scheduledStart.slice(0, 16) : '';
  
  scheduleModal.classList.add('active');
}

async function saveManualSchedule() {
  const t = tasks.find(x => x.id === currentEditingTaskId);
  if (!t) return;
  
  t.priority = document.getElementById('schedPriority').value;
  t.estimatedTime = document.getElementById('schedEstTime').value;
  t.dueDate = document.getElementById('schedDueDate').value;
  
  const startVal = document.getElementById('schedStart').value;
  if (startVal) {
    t.scheduledStart = new Date(startVal).toISOString();
    // Calculate end time
    const durationMin = parseDuration(t.estimatedTime);
    const end = new Date(new Date(startVal).getTime() + durationMin * 60000);
    t.scheduledEnd = end.toISOString();
  } else {
    t.scheduledStart = null;
    t.scheduledEnd = null;
  }
  
  await window.api.saveTasks(tasks);
  scheduleModal.classList.remove('active');
  renderAll();
}

async function clearTaskSchedule() {
  const t = tasks.find(x => x.id === currentEditingTaskId);
  if (t) {
    t.scheduledStart = null;
    t.scheduledEnd = null;
    await window.api.saveTasks(tasks);
    renderAll();
  }
  scheduleModal.classList.remove('active');
}

function openCalNewTaskModal(dateStr, timeStr) {
  document.getElementById('calTaskTitle').value = '';
  document.getElementById('calTaskPriority').value = 'Medium';
  document.getElementById('calTaskEst').value = '30m';
  document.getElementById('calTaskDue').value = dateStr;
  
  const localDT = dateStr + 'T' + timeStr;
  document.getElementById('calTaskStart').value = localDT;
  
  calNewTaskModal.classList.add('active');
  setTimeout(() => document.getElementById('calTaskTitle').focus(), 100);
}

async function saveCalendarNewTask() {
  const title = document.getElementById('calTaskTitle').value.trim();
  if (!title) return;
  
  const startVal = document.getElementById('calTaskStart').value;
  const est = document.getElementById('calTaskEst').value || '30m';
  
  const startTime = new Date(startVal);
  const durationMin = parseDuration(est);
  const endTime = new Date(startTime.getTime() + durationMin * 60000);
  
  const newTask = {
    id: nextId++,
    title,
    listId: 'inbox',
    completed: false,
    priority: document.getElementById('calTaskPriority').value,
    estimatedTime: est,
    dueDate: document.getElementById('calTaskDue').value,
    scheduledStart: startTime.toISOString(),
    scheduledEnd: endTime.toISOString(),
    createdAt: Date.now()
  };
  
  tasks.push(newTask);
  await window.api.saveTasks(tasks);
  calNewTaskModal.classList.remove('active');
  renderAll();
}

function getTaskColor(t) {
  if (t.listId && t.listId !== 'inbox' && t.listId !== 'today' && t.listId !== 'tomorrow') {
    const list = customLists.find(l => l.id === t.listId);
    if (list) return list.color;
  }
  if (t.priority === 'High') return 'var(--danger)';
  if (t.priority === 'Medium') return 'var(--warning)';
  return 'var(--success)';
}

function renderCalendarSidebar() {
  const sidebarList = document.getElementById('calendar-sidebar-list');
  if (!sidebarList) return;
  sidebarList.innerHTML = '';

  const searchVal = document.getElementById('calSidebarSearch') ? document.getElementById('calSidebarSearch').value.toLowerCase() : '';

  let unscheduled = tasks.filter(t => !t.scheduledStart && !t.completed && t.listId !== 'trash');

  if (searchVal) {
    unscheduled = unscheduled.filter(t => t.title.toLowerCase().includes(searchVal));
  }

  unscheduled.sort((a, b) => {
    const priMap = { High: 3, Medium: 2, Low: 1 };
    return priMap[b.priority] - priMap[a.priority];
  });

  if (unscheduled.length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.style.textAlign = 'center';
    emptyMsg.style.padding = '20px 10px';
    emptyMsg.style.color = 'var(--text-tertiary)';
    emptyMsg.style.fontSize = '0.8rem';
    emptyMsg.innerText = i18n[currentLang].emptyUnscheduled;
    sidebarList.appendChild(emptyMsg);
    return;
  }

  unscheduled.forEach(t => {
    const card = document.createElement('div');
    card.className = `cal-sidebar-card priority-${t.priority}`;
    card.draggable = true;
    card.dataset.id = t.id;

    let listDot = '';
    if (t.listId && t.listId !== 'inbox' && t.listId !== 'today' && t.listId !== 'tomorrow') {
      const list = customLists.find(l => l.id === t.listId);
      if (list) {
        listDot = `<span style="color:${list.color}; font-size:10px; margin-right:4px;">●</span>`;
      }
    }

    card.innerHTML = `
      <div style="display:flex; align-items:flex-start; gap:6px; margin-bottom:4px;">
        <span class="drag-handle" style="font-family:var(--font-icons); font-size:12px; color:var(--text-tertiary); cursor:grab; margin-top:2px;">&#xE8CB;</span>
        <div style="flex:1;">
          <div style="font-size:0.85rem; font-weight:500; color:var(--text-primary); line-height:1.2; overflow:hidden; text-overflow:ellipsis; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;">
            ${listDot}${t.title}
          </div>
        </div>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-left:18px;">
        <span class="badge" style="font-size:0.7rem; padding:1px 4px;">${t.estimatedTime}</span>
        <button class="btn-icon" style="font-size:11px; padding:2px; color:var(--accent);" onclick="openScheduleModal(${t.id})">&#xE787;</button>
      </div>
    `;

    card.ondragstart = (e) => {
      draggedTaskId = t.id;
      e.dataTransfer.setData('text/plain', t.id.toString());
      e.dataTransfer.effectAllowed = 'move';
      card.classList.add('dragging');
    };

    card.ondragend = () => {
      card.classList.remove('dragging');
      draggedTaskId = null;
    };

    card.ondblclick = () => {
      openScheduleModal(t.id);
    };

    sidebarList.appendChild(card);
  });
}

// ── Rendering ─────────────────────────────────────────────────────────────────

function renderAll() {
  updateSidebarCounts();
  renderTaskList();
  renderCalendar();
  renderCalendarSidebar();
}

function updateSidebarCounts() {
  const todayStr = getTodayStr();
  document.getElementById('count-inbox').innerText = tasks.filter(t => !t.completed).length;
  document.getElementById('count-today').innerText = tasks.filter(t => !t.completed && t.dueDate === todayStr).length;
}

function renderTaskList() {
  mainTaskList.innerHTML = '';
  
  let filtered = tasks;
  
  if (searchQuery) {
    filtered = tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));
  } else if (currentList === 'completed') {
    filtered = tasks.filter(t => t.completed);
  } else if (currentList === 'trash') {
    filtered = tasks.filter(t => t.listId === 'trash'); // Setup trash logic later if needed
  } else {
    // Only show uncompleted in normal lists
    filtered = tasks.filter(t => !t.completed);
    if (currentList === 'today') filtered = filtered.filter(t => t.dueDate === getTodayStr());
    else if (currentList === 'tomorrow') filtered = filtered.filter(t => t.dueDate === getTomorrowStr());
    else if (currentList === 'inbox') filtered = filtered.filter(t => t.listId === 'inbox');
    else if (currentList !== 'next7') filtered = filtered.filter(t => t.listId === currentList);
  }

  // Sorting
  filtered.sort((a,b) => (a.order || 0) - (b.order || 0));

  filtered.forEach(t => {
    const item = document.createElement('div');
    item.className = `task-item ${t.completed ? 'completed' : ''}`;
    // Reorder dragging
    item.draggable = true;
    item.dataset.id = t.id;
    
    // Distinguish between reorder drag and calendar drag
    item.ondragstart = (e) => { 
        draggedTaskId = t.id;
        e.dataTransfer.setData('text/plain', t.id); 
    };
    
    item.ondragover = (e) => {
        e.preventDefault();
        item.style.borderTop = '2px solid var(--accent)';
    };
    item.ondragleave = (e) => {
        item.style.borderTop = 'none';
    };
    item.ondrop = async (e) => {
        e.preventDefault();
        item.style.borderTop = 'none';
        
        if (draggedTaskId && draggedTaskId !== t.id) {
            // Found drop target
            const fromIdx = filtered.findIndex(x => x.id === draggedTaskId);
            const toIdx = filtered.findIndex(x => x.id === t.id);
            
            // Reassign orders
            const itemToMove = filtered.splice(fromIdx, 1)[0];
            filtered.splice(toIdx, 0, itemToMove);
            
            filtered.forEach((ft, i) => { ft.order = i; });
            await window.api.saveTasks(tasks);
            renderTaskList();
        }
        draggedTaskId = null;
    };

    item.innerHTML = `
      <div class="drag-handle" title="Drag to reorder">&#xE8CB;</div>
      <div class="task-checkbox" onclick="toggleCompleted(${t.id})">
        ${t.completed ? '&#xE73E;' : ''}
      </div>
      <div class="task-content">
        <div class="task-title" onclick="openScheduleModal(${t.id})">${t.title}</div>
        <div class="task-meta">
          <span class="badge priority-${t.priority}">${t.priority}</span>
          <span class="badge"><span class="icon">&#xE787;</span> ${t.dueDate}</span>
          <span class="badge"><span class="icon">&#xE823;</span> ${t.estimatedTime}</span>
          ${t.scheduledStart ? '<span class="badge" style="color:var(--accent)">● Scheduled</span>' : ''}
        </div>
      </div>
      <div class="task-actions">
        <button class="btn-icon" title="Schedule" onclick="openScheduleModal(${t.id})">&#xE787;</button>
        <button class="btn-icon" style="color:var(--danger)" onclick="deleteTask(${t.id})">&#xE74D;</button>
      </div>
    `;
    mainTaskList.appendChild(item);
  });
}

function renderScheduleView() {
  const container = document.createElement('div');
  container.className = 'schedule-view-container';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.overflowY = 'auto';
  container.style.padding = '20px 24px';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.gap = '20px';

  const targetYear = currentSelectedDate.getFullYear();
  const targetMonth = currentSelectedDate.getMonth();
  
  const monthTasks = tasks.filter(t => {
    if (!t.scheduledStart || t.listId === 'trash') return false;
    const startDate = new Date(t.scheduledStart);
    return startDate.getFullYear() === targetYear && startDate.getMonth() === targetMonth;
  });

  monthTasks.sort((a, b) => new Date(a.scheduledStart) - new Date(b.scheduledStart));

  if (monthTasks.length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.className = 'schedule-empty-state';
    emptyMsg.style.textAlign = 'center';
    emptyMsg.style.padding = '40px';
    emptyMsg.style.color = 'var(--text-secondary)';
    emptyMsg.style.fontSize = '0.9rem';
    emptyMsg.innerText = i18n[currentLang].emptySchedule;
    container.appendChild(emptyMsg);
    calendarGrid.appendChild(container);
    return;
  }

  const groups = {};
  monthTasks.forEach(t => {
    const d = new Date(t.scheduledStart);
    const dateStr = d.toLocaleDateString(currentLang === 'zh' ? 'zh-CN' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    if (!groups[dateStr]) groups[dateStr] = [];
    groups[dateStr].push(t);
  });

  Object.keys(groups).forEach(dateStr => {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'schedule-group';
    groupDiv.style.display = 'flex';
    groupDiv.style.flexDirection = 'column';
    groupDiv.style.gap = '8px';

    const groupHeader = document.createElement('div');
    groupHeader.className = 'schedule-group-header';
    groupHeader.style.fontSize = '0.9rem';
    groupHeader.style.fontWeight = '600';
    groupHeader.style.color = 'var(--accent)';
    groupHeader.style.borderBottom = '1px solid var(--border)';
    groupHeader.style.paddingBottom = '4px';
    groupHeader.innerText = dateStr;
    groupDiv.appendChild(groupHeader);

    groups[dateStr].forEach(t => {
      const item = document.createElement('div');
      item.className = `schedule-item priority-${t.priority} ${t.completed ? 'completed' : ''}`;
      
      const startTime = new Date(t.scheduledStart).toLocaleTimeString(currentLang === 'zh' ? 'zh-CN' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      const endTime = t.scheduledEnd ? new Date(t.scheduledEnd).toLocaleTimeString(currentLang === 'zh' ? 'zh-CN' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }) : '';

      const color = getTaskColor(t);
      item.style.borderLeft = `4px solid ${color}`;
      item.onclick = () => openScheduleModal(t.id);

      const leftSide = document.createElement('div');
      leftSide.style.display = 'flex';
      leftSide.style.alignItems = 'center';
      leftSide.style.gap = '12px';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = t.completed;
      checkbox.style.cursor = 'pointer';
      checkbox.onclick = async (e) => {
        e.stopPropagation();
        t.completed = checkbox.checked;
        await window.api.saveTasks(tasks);
        renderAll();
      };
      leftSide.appendChild(checkbox);

      const info = document.createElement('div');
      info.style.display = 'flex';
      info.style.flexDirection = 'column';
      
      const titleSpan = document.createElement('span');
      titleSpan.innerText = t.title;
      titleSpan.style.fontSize = '0.9rem';
      titleSpan.style.color = t.completed ? 'var(--text-tertiary)' : 'var(--text-primary)';
      if (t.completed) titleSpan.style.textDecoration = 'line-through';
      
      const timeSpan = document.createElement('span');
      timeSpan.innerText = `${startTime}${endTime ? ' - ' + endTime : ''}  (${t.estimatedTime})`;
      timeSpan.style.fontSize = '0.75rem';
      timeSpan.style.color = 'var(--text-secondary)';
      
      info.appendChild(titleSpan);
      info.appendChild(timeSpan);
      leftSide.appendChild(info);

      item.appendChild(leftSide);
      
      const actions = document.createElement('div');
      actions.className = 'schedule-actions';
      actions.style.display = 'flex';
      actions.style.gap = '8px';
      
      const delBtn = document.createElement('button');
      delBtn.className = 'btn-icon';
      delBtn.style.color = 'var(--danger)';
      delBtn.innerHTML = '&#xE74D;';
      delBtn.onclick = async (e) => {
        e.stopPropagation();
        await deleteTask(t.id);
      };
      
      actions.appendChild(delBtn);
      item.appendChild(actions);

      groupDiv.appendChild(item);
    });

    container.appendChild(groupDiv);
  });

  calendarGrid.appendChild(container);
}

function renderCalendar() {
  const lang = currentLang === 'zh' ? 'zh-CN' : 'en-US';
  
  if (calendarView === 'day') {
    calendarTitle.innerText = currentSelectedDate.toLocaleDateString(lang, { year: 'numeric', month: 'long', day: 'numeric' });
  } else if (calendarView === 'week') {
    const start = new Date(currentSelectedDate);
    start.setDate(start.getDate() - start.getDay());
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    if (currentLang === 'zh') {
      calendarTitle.innerText = `${start.getFullYear()}年${start.getMonth()+1}月${start.getDate()}日 - ${end.getMonth()+1}月${end.getDate()}日`;
    } else {
      const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      calendarTitle.innerText = `${startStr} - ${endStr}`;
    }
  } else {
    calendarTitle.innerText = currentSelectedDate.toLocaleDateString(lang, { year: 'numeric', month: 'long' });
  }

  calendarGrid.innerHTML = '';

  if (calendarView === 'month') {
    renderMonthView();
  } else if (calendarView === 'schedule') {
    renderScheduleView();
  } else {
    renderTimeGridView();
  }
}

function formatDuration(minutes) {
  if (minutes < 60) return `${minutes}m`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h${mins}m` : `${hrs}h`;
}

function renderTimeGridView() {
  const container = document.createElement('div');
  container.className = 'time-grid-container';
  
  // Ruler
  const ruler = document.createElement('div');
  ruler.className = 'time-ruler';
  for(let i=0; i<24; i++) {
    const label = document.createElement('div');
    label.className = 'time-label';
    label.innerText = `${i}:00`;
    ruler.appendChild(label);
  }
  container.appendChild(ruler);

  // Columns
  const columns = document.createElement('div');
  columns.className = 'day-columns';
  
  const daysCount = calendarView === 'week' ? 7 : 1;
  const start = new Date(currentSelectedDate);
  if (calendarView === 'week') start.setDate(start.getDate() - start.getDay());

  const today = getTodayStr();

  for(let i=0; i<daysCount; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    
    const isToday = dateStr === today;
    const isSelected = dateStr === currentSelectedDate.toISOString().split('T')[0];

    const col = document.createElement('div');
    col.className = `day-col ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`;
    col.dataset.date = dateStr;
    col.innerHTML = `
      <div class="day-col-header ${isToday ? 'today-header' : ''}">
        <div class="day-name">${d.toLocaleDateString(currentLang === 'zh' ? 'zh-CN' : 'en-US', {weekday: 'short'})}</div>
        <div class="day-number">${d.getDate()}</div>
      </div>
    `;
    
    // Draw Current Time Indicator Line
    if (isToday) {
      const now = new Date();
      const currentHour = now.getHours() + now.getMinutes() / 60;
      const topPos = currentHour * 60 + 40; // +40 for header offset
      const timeIndicator = document.createElement('div');
      timeIndicator.className = 'current-time-indicator';
      timeIndicator.style.top = `${topPos}px`;
      col.appendChild(timeIndicator);
    }

    // Render Non-Work Hours
    let currentMin = 0;
    const sortedWH = [...workHours].sort((a,b) => a.start.localeCompare(b.start));
    sortedWH.forEach(wh => {
      const partsS = wh.start.split(':');
      const startMin = parseInt(partsS[0])*60 + parseInt(partsS[1]);
      
      if (startMin > currentMin) {
        drawNonWorkBlock(col, currentMin, startMin);
      }
      
      const partsE = wh.end.split(':');
      const endMin = parseInt(partsE[0])*60 + parseInt(partsE[1]);
      currentMin = Math.max(currentMin, endMin);
    });
    if (currentMin < 24*60) {
      drawNonWorkBlock(col, currentMin, 24*60);
    }
    
    // Manual Click-to-Create Logic (only when clicking column body itself)
    col.onclick = (e) => {
      if (e.target === col || e.target.classList.contains('non-work-hour')) {
        const rect = col.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const hour = Math.floor(y / 60);
        const timeStr = `${hour.toString().padStart(2,'0')}:00`;
        openCalNewTaskModal(dateStr, timeStr);
      }
    };

    // Render blocks
    const dayTasks = tasks.filter(t => t.scheduledStart && t.scheduledStart.startsWith(dateStr));
    dayTasks.forEach(t => {
      const start = new Date(t.scheduledStart);
      const end = t.scheduledEnd ? new Date(t.scheduledEnd) : new Date(start.getTime() + 3600000);
      
      const startHour = start.getHours() + start.getMinutes()/60;
      const durationHours = (end - start) / 3600000;
      
      const block = document.createElement('div');
      block.className = `time-block priority-${t.priority} ${t.completed ? 'completed' : ''}`;
      block.style.top = `${startHour * 60 + 40}px`; // +40 for header
      block.style.height = `${Math.max(30, durationHours * 60)}px`;
      
      // Override background and border color for custom lists
      if (t.listId && t.listId !== 'inbox' && t.listId !== 'today' && t.listId !== 'tomorrow') {
        const list = customLists.find(l => l.id === t.listId);
        if (list && list.color) {
          block.style.borderLeftColor = list.color;
          if (list.color.startsWith('#')) {
            block.style.backgroundColor = list.color + '26'; // 15% opacity hex-alpha
          }
        }
      }

      const titleHtml = t.completed ? `✓ <s>${t.title}</s>` : `<strong>${t.title}</strong>`;
      block.innerHTML = `${titleHtml}<br><small>${t.estimatedTime}</small>`;
      
      // Add Resize Handle
      const resizeHandle = document.createElement('div');
      resizeHandle.className = 'time-block-resize-handle';
      block.appendChild(resizeHandle);

      // Mouse drag-to-move & drag-to-resize logic
      block.onmousedown = (e) => {
        if (e.button !== 0) return; // Left click only
        
        const isResize = e.target.classList.contains('time-block-resize-handle');
        e.preventDefault();
        e.stopPropagation();
        
        const startY = e.clientY;
        const startTop = parseFloat(block.style.top);
        const startHeight = parseFloat(block.style.height);
        let currentTop = startTop;
        let currentHeight = startHeight;
        let dragged = false;
        
        const onMouseMove = (moveEvent) => {
          const deltaY = moveEvent.clientY - startY;
          if (Math.abs(deltaY) > 3) dragged = true;
          
          if (isResize) {
            const newHeight = startHeight + deltaY;
            // Snap to 15 mins (15px)
            const snappedHeight = Math.round(newHeight / 15) * 15;
            currentHeight = Math.max(15, snappedHeight);
            block.style.height = `${currentHeight}px`;
          } else {
            const newTop = startTop + deltaY;
            // Snap to 15 mins (15px) relative to header offset 40px
            const gridTop = newTop - 40;
            const snappedGridTop = Math.round(gridTop / 15) * 15;
            const clampedGridTop = Math.max(0, Math.min(24 * 60 - currentHeight, snappedGridTop));
            currentTop = clampedGridTop + 40;
            block.style.top = `${currentTop}px`;
          }
        };
        
        const onMouseUp = async () => {
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
          
          if (!dragged) {
            openScheduleModal(t.id);
            return;
          }
          
          if (isResize) {
            const durationMin = currentHeight;
            t.estimatedTime = formatDuration(durationMin);
            const startDT = new Date(t.scheduledStart);
            t.scheduledEnd = new Date(startDT.getTime() + durationMin * 60000).toISOString();
          } else {
            const startHour = (currentTop - 40) / 60;
            const hour = Math.floor(startHour);
            const minute = Math.round((startHour - hour) * 60);
            
            const origStart = new Date(t.scheduledStart);
            const origEnd = t.scheduledEnd ? new Date(t.scheduledEnd) : new Date(origStart.getTime() + 3600000);
            const durationMs = origEnd - origStart;
            
            const newStart = new Date(origStart);
            newStart.setHours(hour, minute, 0, 0);
            t.scheduledStart = newStart.toISOString();
            t.scheduledEnd = new Date(newStart.getTime() + durationMs).toISOString();
          }
          
          await window.api.saveTasks(tasks);
          renderAll();
        };
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      };

      col.appendChild(block);
    });

    columns.appendChild(col);
  }
  
  container.appendChild(columns);
  calendarGrid.appendChild(container);

  // Global Drop target on container to handle drops anywhere (including ruler / left boundary)
  container.ondragover = (e) => e.preventDefault();
  container.ondrop = async (e) => {
    e.preventDefault();
    const id = parseInt(e.dataTransfer.getData('text/plain'));
    
    const colList = container.querySelectorAll('.day-col');
    if (colList.length === 0) return;
    
    // Find target column based on X coordinate
    let targetCol = colList[0];
    let closestDist = Infinity;
    
    colList.forEach(colEl => {
      const rect = colEl.getBoundingClientRect();
      if (e.clientX >= rect.left && e.clientX <= rect.right) {
        targetCol = colEl;
        closestDist = 0;
      } else {
        const dist = Math.min(Math.abs(e.clientX - rect.left), Math.abs(e.clientX - rect.right));
        if (dist < closestDist) {
          closestDist = dist;
          targetCol = colEl;
        }
      }
    });
    
    if (targetCol) {
      const dateStr = targetCol.dataset.date;
      const rect = targetCol.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const hour = Math.floor(y / 60);
      
      const t = tasks.find(x => x.id === id);
      if (t) {
        const startDT = new Date(dateStr + 'T' + hour.toString().padStart(2,'0') + ':00');
        t.scheduledStart = startDT.toISOString();
        const duration = parseDuration(t.estimatedTime);
        t.scheduledEnd = new Date(startDT.getTime() + duration * 60000).toISOString();
        await window.api.saveTasks(tasks);
        renderAll();
      }
    }
  };

  // Auto-scroll calendar-body to earliest work hour
  let earliestWH = 8;
  if (workHours && workHours.length > 0) {
    const hours = workHours.map(wh => parseInt(wh.start.split(':')[0]));
    earliestWH = Math.min(...hours);
  }
  const scrollPos = Math.max(0, earliestWH * 60 - 60);
  const calendarBody = document.querySelector('.calendar-body');
  if (calendarBody) {
    setTimeout(() => {
      calendarBody.scrollTop = scrollPos;
    }, 50);
  }
}

function renderMonthView() {
  const container = document.createElement('div');
  container.className = 'month-grid';
  
  const startOfMonth = new Date(currentSelectedDate.getFullYear(), currentSelectedDate.getMonth(), 1);
  const startDay = startOfMonth.getDay();
  const daysInMonth = new Date(currentSelectedDate.getFullYear(), currentSelectedDate.getMonth() + 1, 0).getDate();
  
  // Previous month padding
  for (let i=0; i<startDay; i++) {
    const cell = document.createElement('div');
    cell.className = 'month-cell';
    container.appendChild(cell);
  }
  
  const today = getTodayStr();
  const selectedDateStr = currentSelectedDate.toISOString().split('T')[0];

  for (let i=1; i<=daysInMonth; i++) {
    const d = new Date(currentSelectedDate.getFullYear(), currentSelectedDate.getMonth(), i);
    const dateStr = d.toISOString().split('T')[0];
    
    const isSelected = dateStr === selectedDateStr;
    const cell = document.createElement('div');
    cell.className = `month-cell ${dateStr === today ? 'today' : ''} ${isSelected ? 'selected' : ''}`;
    cell.innerHTML = `<div class="month-day-num">${i}</div>`;
    
    cell.onclick = (e) => {
      if (e.target.classList.contains('month-cell') || e.target.classList.contains('month-day-num') || e.target.classList.contains('month-tasks')) {
        currentSelectedDate = new Date(dateStr);
        renderAll();
      }
    };

    cell.ondblclick = (e) => {
      if (e.target.classList.contains('month-cell') || e.target.classList.contains('month-day-num') || e.target.classList.contains('month-tasks')) {
        currentSelectedDate = new Date(dateStr);
        calendarView = 'day';
        document.querySelectorAll('.cal-switcher .btn-segment').forEach(b => {
          b.classList.toggle('active', b.dataset.view === 'day');
        });
        renderAll();
      }
    };

    const tasksToday = tasks.filter(t => t.scheduledStart && t.scheduledStart.startsWith(dateStr) && t.listId !== 'trash');
    const tasksDir = document.createElement('div');
    tasksDir.className = 'month-tasks';
    
    tasksToday.forEach(t => {
      const dot = document.createElement('div');
      dot.className = `month-task-dot priority-${t.priority} ${t.completed ? 'completed' : ''}`;
      
      const timeStr = new Date(t.scheduledStart).toLocaleTimeString(currentLang === 'zh' ? 'zh-CN' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      dot.innerText = `${timeStr} ${t.title}`;
      
      // Override colors for custom lists dynamically
      if (t.listId && t.listId !== 'inbox' && t.listId !== 'today' && t.listId !== 'tomorrow') {
        const list = customLists.find(l => l.id === t.listId);
        if (list && list.color) {
          dot.style.borderLeftColor = list.color;
          if (list.color.startsWith('#')) {
            dot.style.backgroundColor = list.color + '1a'; // 10% opacity hex-alpha
          }
        }
      }

      dot.style.cursor = 'pointer';
      dot.onclick = (e) => {
        e.stopPropagation();
        openScheduleModal(t.id);
      };

      tasksDir.appendChild(dot);
    });
    
    cell.appendChild(tasksDir);
    container.appendChild(cell);
  }
  
  calendarGrid.appendChild(container);
}

// ── AI Logic ──────────────────────────────────────────────────────────────────

async function aiAutoSchedule() {
  let visibleTasks = tasks.filter(t => !t.completed);
  if (currentList === 'today') visibleTasks = visibleTasks.filter(t => t.dueDate === getTodayStr());
  else if (currentList === 'tomorrow') visibleTasks = visibleTasks.filter(t => t.dueDate === getTomorrowStr());
  else if (currentList === 'inbox') visibleTasks = visibleTasks.filter(t => t.listId === 'inbox');
  else if (currentList !== 'next7' && currentList !== 'completed' && currentList !== 'trash') {
      visibleTasks = visibleTasks.filter(t => t.listId === currentList);
  }

  if (visibleTasks.length === 0) return alert(i18n[currentLang].alertNoTasks);

  let unscheduled = visibleTasks.filter(t => !t.scheduledStart);

  if (unscheduled.length === 0) {
      const resp = confirm(i18n[currentLang].confirmReschedule);
      if (!resp) return;
      unscheduled = visibleTasks;
      // Clear their schedules temporarily for the UI, will be overwritten by AI
      unscheduled.forEach(t => { t.scheduledStart = null; t.scheduledEnd = null; });
  }
  
  const btn = document.getElementById('aiAutoScheduleBtn');
  const oldText = btn.innerHTML;
  btn.innerHTML = i18n[currentLang].aiSchedulingStatus;
  
  const context = {
    today: getTodayStr(),
    tasks: unscheduled.map(t => ({ id: t.id, title: t.title, priority: t.priority, est: t.estimatedTime, due: t.dueDate }))
  };
  
  const prompt = currentLang === 'zh' ? `
    你是一个全能日程助手。请将以下任务安排到用户的日历中。
    规则:
    1. 任务时间不可冲突。
    2. 工作时间: 09:00 到 18:00。12:00-13:00 为午休时间（不排课）。
    3. 任务之间留出 10 分钟休息时间。
    4. 从今天开始排程: ${context.today}。
    5. 优先级顺序: "High" > "Medium" > "Low"。
    6. 必须尊重截止日期 (dueDate)。
    
    待排期任务:
    ${JSON.stringify(context.tasks)}
    
    仅返回一个有效的 JSON 数组对象:
    [{"id": number, "scheduledStart": "ISOString", "scheduledEnd": "ISOString"}]
  ` : `
    You are a calendar assistant. Schedule these tasks into the user's calendar.
    RULES:
    1. NO OVERLAPPING.
    2. Working hours: 09:00 to 18:00 only. Lunch break at 12:00-13:00 (no tasks).
    3. Add 10-minute breaks between tasks.
    4. Start scheduling from today: ${context.today}.
    5. Prioritize "High", then "Medium", then "Low".
    6. Respect the dueDate (Deadline).
    
    TASKS TO SCHEDULE:
    ${JSON.stringify(context.tasks)}
    
    RETURN ONLY A VALID JSON ARRAY OF OBJECTS:
    [{"id": number, "scheduledStart": "ISOString", "scheduledEnd": "ISOString"}]
  `;
  
  try {
    const res = await window.api.fetchAI(prompt);
    if (!res.error) {
      const match = res.result.match(/\[.*\]/s);
      if (match) {
        const schedule = JSON.parse(match[0]);
        schedule.forEach(item => {
          const t = tasks.find(x => x.id === item.id);
          if (t) {
            t.scheduledStart = item.scheduledStart;
            t.scheduledEnd = item.scheduledEnd;
          }
        });
        await window.api.saveTasks(tasks);
        renderAll();
      } else {
        alert("AI Response Format Error");
      }
    } else {
      alert("AI Error: " + res.error);
    }
  } catch (e) { console.error(e); alert("Error: " + e.message); }
  btn.innerHTML = oldText;
}

async function aiParseFast() {
  const title = newTaskInput.value.trim();
  if (!title) return;
  const btn = document.getElementById('aiParseBtn');
  btn.innerHTML = i18n[currentLang].aiParsingStatus;
  const prompt = `Parse this task: "${title}". Current date: ${getTodayStr()}. Return JSON: {"est": "30m", "due": "YYYY-MM-DD", "pri": "High|Medium|Low"}`;
  try {
    const res = await window.api.fetchAI(prompt);
    if (!res.error) {
      const data = JSON.parse(res.result.match(/{.*}/)[0]);
      if (data.est) newTaskEst.value = data.est;
      if (data.pri) newTaskPriority.value = data.pri;
      if (data.due) newTaskDueDate.value = data.due;
    }
  } catch (e) {}
  btn.innerHTML = '&#xE81C;';
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getTodayStr() { return new Date().toISOString().split('T')[0]; }
function getTomorrowStr() { 
  const d = new Date(); d.setDate(d.getDate() + 1); 
  return d.toISOString().split('T')[0]; 
}

function parseDuration(str) {
  let total = 0;
  const h = str.match(/(\d+)h/);
  const m = str.match(/(\d+)m/);
  if (h) total += parseInt(h[1]) * 60;
  if (m) total += parseInt(m[1]);
  return total || 30;
}

function navigateCalendar(dir) {
  if (calendarView === 'day') currentSelectedDate.setDate(currentSelectedDate.getDate() + dir);
  else if (calendarView === 'week') currentSelectedDate.setDate(currentSelectedDate.getDate() + (dir * 7));
  else if (calendarView === 'month') currentSelectedDate.setMonth(currentSelectedDate.getMonth() + dir);
  renderAll();
}

function drawNonWorkBlock(col, startMin, endMin) {
  const block = document.createElement('div');
  block.className = 'non-work-hour';
  block.style.top = `${startMin + 40}px`; // +40 for header offset
  block.style.height = `${endMin - startMin}px`;
  col.appendChild(block);
}

function applyLanguage(lang) {
  const dict = i18n[lang] || i18n['en'];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      // Handle text content
      if (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA') {
        el.innerText = dict[key];
      }
      
      // Handle placeholder
      if (el.hasAttribute('placeholder') || el.hasAttribute('data-i18n-placeholder')) {
        el.placeholder = dict[key];
      }
      
      // Handle title
      if (el.hasAttribute('title') || el.hasAttribute('data-i18n-title')) {
        el.title = dict[key];
      }
    }
  });
}

async function saveSettings() {
  const settings = {
    lang: document.getElementById('appLang').value,
    theme: document.getElementById('appTheme').value,
    themeColor: document.getElementById('themeColor').value,
    baseUrl: document.getElementById('aiBaseUrl').value,
    apiKey: document.getElementById('aiApiKey').value,
    model: document.getElementById('aiModel').value,
    workHours: workHours
  };
  await window.api.saveSettings(settings);
  location.reload();
}

function renderWorkHoursSettings() {
  const list = document.getElementById('workHoursList');
  list.innerHTML = '';
  workHours.forEach((wh, index) => {
    const div = document.createElement('div');
    div.style.display = 'flex';
    div.style.justifyContent = 'space-between';
    div.style.fontSize = '0.85rem';
    div.innerHTML = `<span>${wh.start} - ${wh.end}</span> 
                     <button class="btn-icon" style="color:var(--danger); padding:0;" onclick="removeWorkHour(${index})">&#xE74D;</button>`;
    list.appendChild(div);
  });
}

function addWorkHour() {
    const s = document.getElementById('whStart').value;
    const e = document.getElementById('whEnd').value;
    if (s && e) {
        workHours.push({start: s, end: e});
        renderWorkHoursSettings();
    }
}

function removeWorkHour(idx) {
    workHours.splice(idx, 1);
    renderWorkHoursSettings();
}

function renderCustomLists() {
  const container = document.getElementById('custom-lists-container');
  container.innerHTML = '';
  customLists.forEach(list => {
    const item = document.createElement('div');
    item.className = `list-item ${currentList === list.id ? 'active' : ''}`;
    item.dataset.list = list.id;
    item.innerHTML = `
      <span class="icon" style="color:${list.color}">●</span>
      <span class="label">${list.name}</span>
    `;
    item.onclick = () => {
      currentList = list.id;
      currentListTitle.innerText = list.name;
      searchQuery = '';
      document.getElementById('sectionSearchInput').value = '';
      renderAll();
    };
    container.appendChild(item);
  });
}

init();
