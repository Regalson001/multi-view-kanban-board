
"use strict";

/* ==========================================
   NEXUS PROJECT MANAGEMENT APPLICATION
========================================== */

const STORAGE_KEY = "nexus-kanban-tasks-v1";

const columns = [
  { id: "todo", title: "To Do", dot: "dot-todo" },
  { id: "progress", title: "In Progress", dot: "dot-progress" },
  { id: "review", title: "In Review", dot: "dot-review" },
  { id: "done", title: "Completed", dot: "dot-done" }
];

const initialTasks = [
  {
    id: "task-1",
    title: "Research competitor websites",
    description: "Analyze competitor layouts, features and user experiences.",
    status: "todo",
    priority: "high",
    assignee: "Sarah",
    dueDate: "2026-11-15"
  },
  {
    id: "task-2",
    title: "Create brand moodboard",
    description: "Establish the visual direction and brand identity.",
    status: "todo",
    priority: "medium",
    assignee: "David",
    dueDate: "2026-11-17"
  },
  {
    id: "task-3",
    title: "Design homepage wireframes",
    description: "Create responsive wireframes for the homepage.",
    status: "progress",
    priority: "urgent",
    assignee: "Stephen",
    dueDate: "2026-11-12"
  },
  {
    id: "task-4",
    title: "Build navigation system",
    description: "Implement the responsive navigation experience.",
    status: "progress",
    priority: "high",
    assignee: "Michael",
    dueDate: "2026-11-18"
  },
  {
    id: "task-5",
    title: "Review typography system",
    description: "Check font hierarchy, spacing and readability.",
    status: "review",
    priority: "medium",
    assignee: "Sarah",
    dueDate: "2026-11-20"
  },
  {
    id: "task-6",
    title: "Set up project repository",
    description: "Initialize project structure and version control.",
    status: "done",
    priority: "low",
    assignee: "Stephen",
    dueDate: "2026-11-08"
  },
  {
    id: "task-7",
    title: "Define project requirements",
    description: "Document the product scope and technical requirements.",
    status: "done",
    priority: "high",
    assignee: "David",
    dueDate: "2026-11-09"
  }
];

/* ==========================================
   APPLICATION STATE
========================================== */

function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved === null) {
      return structuredClone(initialTasks);
    }

    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return structuredClone(initialTasks);
    }

    return parsed.filter(task =>
      task &&
      typeof task.id === "string" &&
      typeof task.title === "string" &&
      columns.some(column => column.id === task.status) &&
      ["low", "medium", "high", "urgent"].includes(task.priority)
    );
  } catch (error) {
    console.error("Unable to load saved tasks:", error);
    return structuredClone(initialTasks);
  }
}

let tasks = loadTasks();
let activeView = "board";
let searchQuery = "";
let priorityFilter = "all";
let draggedTaskId = null;

let calendarDate = new Date();
calendarDate.setDate(1);

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error("Unable to save tasks:", error);
    showToast("Could not save changes in this browser.");
  }
}

/* ==========================================
   DOM REFERENCES
========================================== */

const boardView = document.getElementById("boardView");
const listView = document.getElementById("listView");
const calendarView = document.getElementById("calendarView");

const taskDialog = document.getElementById("taskDialog");
const taskForm = document.getElementById("taskForm");

const taskIdInput = document.getElementById("taskId");
const taskTitleInput = document.getElementById("taskTitle");
const taskDescriptionInput = document.getElementById("taskDescription");
const taskStatusInput = document.getElementById("taskStatus");
const taskPriorityInput = document.getElementById("taskPriority");
const taskAssigneeInput = document.getElementById("taskAssignee");
const taskDateInput = document.getElementById("taskDate");

const searchInput = document.getElementById("searchInput");
const prioritySelect = document.getElementById("priorityFilter");
const toast = document.getElementById("toast");

/* ==========================================
   UTILITIES
========================================== */

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function getInitials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (!parts.length) return "NA";

  return parts.slice(0, 2).map(part => part[0]).join("").toUpperCase();
}

function formatDate(dateString) {
  if (!dateString) return "No due date";

  const date = new Date(dateString + "T00:00:00");

  if (Number.isNaN(date.getTime())) return "Invalid date";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  });
}

function isOverdue(dateString, status) {
  if (!dateString || status === "done") return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return new Date(dateString + "T00:00:00") < today;
}

function getFilteredTasks() {
  return tasks.filter(task => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery) ||
      (task.description || "").toLowerCase().includes(searchQuery) ||
      (task.assignee || "").toLowerCase().includes(searchQuery);

    const matchesPriority =
      priorityFilter === "all" ||
      task.priority === priorityFilter;

    return matchesSearch && matchesPriority;
  });
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  window.clearTimeout(showToast.timeout);

  showToast.timeout = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

/* ==========================================
   STATISTICS
========================================== */

function renderStats() {
  const total = tasks.length;
  const progress = tasks.filter(task => task.status === "progress").length;
  const completed = tasks.filter(task => task.status === "done").length;

  const percentage = total
    ? Math.round((completed / total) * 100)
    : 0;

  document.getElementById("totalTasks").textContent = total;
  document.getElementById("inProgressTasks").textContent = progress;
  document.getElementById("completedTasks").textContent = completed;
  document.getElementById("completionRate").textContent = percentage + "%";

  document.getElementById("progressBar").style.width = percentage + "%";
}

/* ==========================================
   TASK CARD
========================================== */

function createTaskCard(task) {
  const overdue = isOverdue(task.dueDate, task.status);

  return `
    <article
      class="task-card"
      draggable="true"
      tabindex="0"
      role="group"
      aria-label="${escapeHTML(task.title)}. ${escapeHTML(task.priority)} priority. Press Enter to edit."
      data-id="${escapeHTML(task.id)}"
    >
      <div class="task-meta">
        <span class="priority priority-${escapeHTML(task.priority)}">
          ${escapeHTML(task.priority)}
        </span>
        <button
          class="task-menu"
          type="button"
          data-edit="${escapeHTML(task.id)}"
          aria-label="Edit ${escapeHTML(task.title)}"
        >•••</button>
      </div>

      <h3>${escapeHTML(task.title)}</h3>
      <p>${escapeHTML(task.description || "No description provided.")}</p>

      <div class="task-footer">
        <div class="assignee">
          <span class="assignee-avatar">
            ${escapeHTML(getInitials(task.assignee || "Unassigned"))}
          </span>
          <span>${escapeHTML(task.assignee || "Unassigned")}</span>
        </div>
        <span class="due-date ${overdue ? "overdue" : ""}">
          ◷ ${escapeHTML(formatDate(task.dueDate))}
        </span>
      </div>
    </article>
  `;
}

/* ==========================================
   KANBAN BOARD
========================================== */

function renderBoard() {
  const filtered = getFilteredTasks();

  boardView.innerHTML = columns.map(column => {
    const columnTasks = filtered.filter(
      task => task.status === column.id
    );

    return `
      <section
        class="kanban-column"
        data-status="${column.id}"
        aria-label="${column.title} column"
      >
        <div class="column-heading">
          <div class="column-title">
            <span class="column-dot ${column.dot}"></span>
            ${column.title}
            <span class="task-count">${columnTasks.length}</span>
          </div>

          <button
            class="add-column-task"
            type="button"
            data-add="${column.id}"
            aria-label="Add task to ${column.title}"
          >＋ Add</button>
        </div>

        <div class="task-list" data-dropzone="${column.id}">
          ${
            columnTasks.length
              ? columnTasks.map(createTaskCard).join("")
              : `<div class="empty-column">Drop tasks here or add a new task.</div>`
          }
        </div>
      </section>
    `;
  }).join("");
}

/* ==========================================
   LIST VIEW
========================================== */

function renderList() {
  const filtered = getFilteredTasks();

  if (!filtered.length) {
    listView.innerHTML = `<div class="empty-column">No tasks found.</div>`;
    return;
  }

  listView.innerHTML = `
    <table class="task-table">
      <thead>
        <tr>
          <th>Task</th>
          <th>Assignee</th>
          <th>Priority</th>
          <th>Status</th>
          <th>Due Date</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        ${filtered.map(task => {
          const status = columns.find(
            column => column.id === task.status
          );

          return `
            <tr>
              <td class="table-task-title">${escapeHTML(task.title)}</td>
              <td>${escapeHTML(task.assignee || "Unassigned")}</td>
              <td>
                <span class="priority priority-${task.priority}">
                  ${escapeHTML(task.priority)}
                </span>
              </td>
              <td>
                <span class="status-badge">${status.title}</span>
              </td>
              <td>${escapeHTML(formatDate(task.dueDate))}</td>
              <td>
                <button
                  class="row-action"
                  data-edit="${escapeHTML(task.id)}"
                  type="button"
                >Edit</button>
              </td>
            </tr>
          `;
        }).join("")}
      </tbody>
    </table>
  `;
}

/* ==========================================
   CALENDAR VIEW
========================================== */

function renderCalendar() {
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const today = new Date();

  const monthName = calendarDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric"
  });

  let daysHTML = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    .map(day => `<div class="calendar-day-name">${day}</div>`)
    .join("");

  for (let i = 0; i < firstDay; i++) {
    daysHTML += `<div class="calendar-day"></div>`;
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateString = [
      year,
      String(month + 1).padStart(2, "0"),
      String(day).padStart(2, "0")
    ].join("-");

    const dayTasks = getFilteredTasks().filter(
      task => task.dueDate === dateString
    );

    const isToday =
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day;

    daysHTML += `
      <div class="calendar-day ${isToday ? "today" : ""}">
        <strong>${day}</strong>
        ${dayTasks.map(task => `
          <div
            class="calendar-event"
            title="${escapeHTML(task.title)}"
          >
            ${escapeHTML(task.title)}
          </div>
        `).join("")}
      </div>
    `;
  }

  calendarView.innerHTML = `
    <div class="calendar-header">
      <h2>${monthName}</h2>
      <div class="calendar-nav">
        <button type="button" data-calendar="prev" aria-label="Previous month">‹</button>
        <button type="button" data-calendar="today">Today</button>
        <button type="button" data-calendar="next" aria-label="Next month">›</button>
      </div>
    </div>
    <div class="calendar-grid">${daysHTML}</div>
  `;
}

/* ==========================================
   VIEW SWITCHING
========================================== */

function switchView(view) {
  if (!["board", "list", "calendar"].includes(view)) return;

  activeView = view;

  boardView.classList.toggle("hidden", view !== "board");
  listView.classList.toggle("hidden", view !== "list");
  calendarView.classList.toggle("hidden", view !== "calendar");

  document.querySelectorAll(".view-tab").forEach(button => {
    const active = button.dataset.view === view;

    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  document.querySelectorAll(".main-nav [data-view]").forEach(link => {
    link.classList.toggle("active", link.dataset.view === view);
  });

  renderCurrentView();
}

function renderCurrentView() {
  if (activeView === "board") renderBoard();
  if (activeView === "list") renderList();
  if (activeView === "calendar") renderCalendar();
}

function renderApp() {
  renderStats();
  renderCurrentView();
}

/* ==========================================
   TASK DIALOG
========================================== */

function openTaskDialog(status = "todo", task = null) {
  taskForm.reset();

  taskIdInput.value = task ? task.id : "";
  taskTitleInput.value = task ? task.title : "";
  taskDescriptionInput.value = task ? task.description : "";
  taskStatusInput.value = task ? task.status : status;
  taskPriorityInput.value = task ? task.priority : "medium";
  taskAssigneeInput.value = task ? task.assignee : "";
  taskDateInput.value = task ? task.dueDate : "";

  document.getElementById("dialogTitle").textContent =
    task ? "Edit task" : "Create a task";

  taskDialog.showModal();
  taskTitleInput.focus();
}

function closeTaskDialog() {
  taskDialog.close();
}

taskForm.addEventListener("submit", event => {
  event.preventDefault();

  if (!taskForm.reportValidity()) return;

  const id = taskIdInput.value;

  const taskData = {
    id: id || "task-" + crypto.randomUUID(),
    title: taskTitleInput.value.trim(),
    description: taskDescriptionInput.value.trim(),
    status: taskStatusInput.value,
    priority: taskPriorityInput.value,
    assignee: taskAssigneeInput.value.trim(),
    dueDate: taskDateInput.value
  };

  if (!taskData.title) return;

  if (id) {
    const index = tasks.findIndex(task => task.id === id);

    if (index !== -1) {
      tasks[index] = taskData;
      showToast("Task updated successfully.");
    }
  } else {
    tasks.push(taskData);
    showToast("New task created successfully.");
  }

  saveTasks();
  closeTaskDialog();
  renderApp();
});

/* ==========================================
   DELETE TASK
========================================== */

function deleteTask(id) {
  const task = tasks.find(item => item.id === id);

  if (!task) return;

  const confirmed = window.confirm(
    `Delete "${task.title}"? This action cannot be undone.`
  );

  if (!confirmed) return;

  tasks = tasks.filter(item => item.id !== id);

  saveTasks();
  renderApp();
  showToast("Task deleted.");
}

/* ==========================================
   DRAG AND DROP
========================================== */

function handleDragStart(event) {
  const card = event.target.closest(".task-card");

  if (!card) return;

  draggedTaskId = card.dataset.id;
  card.classList.add("dragging");

  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", draggedTaskId);
}

function handleDragOver(event) {
  const column = event.target.closest(".kanban-column");

  if (!column) return;

  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
  column.classList.add("drag-over");
}

function handleDragLeave(event) {
  const column = event.target.closest(".kanban-column");

  if (!column || column.contains(event.relatedTarget)) return;

  column.classList.remove("drag-over");
}

function handleDrop(event) {
  const column = event.target.closest(".kanban-column");

  if (!column) return;

  event.preventDefault();

  const taskId = event.dataTransfer.getData("text/plain") || draggedTaskId;
  const newStatus = column.dataset.status;

  const task = tasks.find(item => item.id === taskId);

  if (task && columns.some(item => item.id === newStatus)) {
    task.status = newStatus;

    saveTasks();
    renderApp();
    showToast(`Task moved to ${column.querySelector(".column-title").childNodes[2].textContent.trim()}.`);
  }

  document.querySelectorAll(".kanban-column").forEach(item => {
    item.classList.remove("drag-over");
  });

  draggedTaskId = null;
}

function handleDragEnd() {
  document.querySelectorAll(".task-card").forEach(card => {
    card.classList.remove("dragging");
  });

  document.querySelectorAll(".kanban-column").forEach(column => {
    column.classList.remove("drag-over");
  });

  draggedTaskId = null;
}

/* ==========================================
   EVENT DELEGATION
========================================== */

boardView.addEventListener("dragstart", handleDragStart);
boardView.addEventListener("dragover", handleDragOver);
boardView.addEventListener("dragleave", handleDragLeave);
boardView.addEventListener("drop", handleDrop);
boardView.addEventListener("dragend", handleDragEnd);

function handleTaskAction(event) {
  const editButton = event.target.closest("[data-edit]");
  const addButton = event.target.closest("[data-add]");

  if (editButton) {
    const task = tasks.find(item => item.id === editButton.dataset.edit);

    if (task) openTaskDialog(task.status, task);
  }

  if (addButton) {
    openTaskDialog(addButton.dataset.add);
  }
}

boardView.addEventListener("click", handleTaskAction);
listView.addEventListener("click", handleTaskAction);

boardView.addEventListener("keydown", event => {
  const card = event.target.closest(".task-card");

  if (
    card &&
    (event.key === "Enter" || event.key === " ") &&
    event.target === card
  ) {
    event.preventDefault();

    const task = tasks.find(item => item.id === card.dataset.id);

    if (task) openTaskDialog(task.status, task);
  }
});

/* ==========================================
   CALENDAR NAVIGATION
========================================== */

calendarView.addEventListener("click", event => {
  const button = event.target.closest("[data-calendar]");

  if (!button) return;

  if (button.dataset.calendar === "prev") {
    calendarDate.setMonth(calendarDate.getMonth() - 1);
  }

  if (button.dataset.calendar === "next") {
    calendarDate.setMonth(calendarDate.getMonth() + 1);
  }

  if (button.dataset.calendar === "today") {
    calendarDate = new Date();
    calendarDate.setDate(1);
  }

  renderCalendar();
});

/* ==========================================
   SEARCH AND FILTER
========================================== */

searchInput.addEventListener("input", () => {
  searchQuery = searchInput.value.trim().toLowerCase();
  renderCurrentView();
});

prioritySelect.addEventListener("change", () => {
  priorityFilter = prioritySelect.value;
  renderCurrentView();
});

/* ==========================================
   BUTTON EVENTS
========================================== */

document.getElementById("addTaskBtn").addEventListener("click", () => {
  openTaskDialog();
});

document.getElementById("closeDialog").addEventListener("click", closeTaskDialog);

document.getElementById("cancelDialog").addEventListener("click", closeTaskDialog);

document.querySelectorAll("[data-view]").forEach(button => {
  button.addEventListener("click", event => {
    event.preventDefault();
    switchView(button.dataset.view);
  });
});

/* ==========================================
   INITIALIZE APPLICATION
========================================== */

renderApp();
switchView("board");
