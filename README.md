
# NEXUS — Multi-View Kanban & Project Management Board

A modern, responsive project management workspace built with HTML5, CSS3, and Vanilla JavaScript. NEXUS provides an interactive environment for organizing tasks, managing workflows, tracking project progress, and visualizing work across multiple views.

## Overview

NEXUS is a front-end project management application inspired by modern productivity platforms such as Trello, Jira, and Linear.

The application combines a responsive dashboard interface with dynamic task management, HTML5 drag-and-drop interactions, and persistent browser storage.

It demonstrates practical front-end engineering skills, including DOM manipulation, event delegation, application state management, responsive layouts, and interactive user interfaces.

## Key Features

### 1. Multi-View Project Management
- Kanban board with four workflow stages.
- List view for structured task management.
- Calendar view for deadline visualization.
- Seamless switching between views.

### 2. Interactive Task Management
- Create new tasks.
- Edit existing tasks.
- Delete tasks with confirmation.
- Assign tasks to team members.
- Set task descriptions and due dates.
- Update workflow stages and priorities.

### 3. Drag-and-Drop Functionality
- HTML5 Drag and Drop API.
- Move tasks between workflow columns.
- Visual drag-over feedback.
- Dynamic interface updates after task movement.

### 4. Task Prioritization
Four priority levels:
- Urgent
- High
- Medium
- Low

### 5. Search and Filtering
- Search tasks by title.
- Search descriptions and assignees.
- Filter tasks by priority.
- Dynamically update displayed results.

### 6. Project Analytics
- Total task count.
- In-progress task count.
- Completed task count.
- Overall completion percentage.
- Dynamic progress indicator.

### 7. Data Persistence
- Browser LocalStorage integration.
- Automatically save task changes.
- Restore saved tasks after page reload.
- Persistent task creation, editing, deletion, and movement.

### 8. Responsive User Interface
- CSS Grid and Flexbox layouts.
- Responsive dashboard.
- Mobile-friendly navigation.
- Adaptive Kanban columns.
- Accessible focus indicators.
- Reduced-motion support.

## Technology Stack

| Technology | Purpose |
|---|---|
| HTML5 | Semantic application structure |
| CSS3 | Styling and responsive layouts |
| JavaScript ES6+ | Application logic and interactions |
| CSS Grid | Dashboard and Kanban layouts |
| Flexbox | Component alignment |
| HTML5 Drag and Drop API | Interactive task movement |
| LocalStorage API | Browser-based data persistence |
| DOM API | Dynamic interface rendering |

## Project Structure

```text
multi-view-kanban-board/
│
├── index.html
├── style.css
├── script.js
└── README.md
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Regalson001/multi-view-kanban-board.git
```

### 2. Navigate into the project

```bash
cd multi-view-kanban-board
```

### 3. Open the project

Open `index.html` in your browser or use the Live Server extension in Visual Studio Code.

## How to Use

1. Open the NEXUS project dashboard.
2. Select the Board, List, or Calendar view.
3. Click Add Task to create a task.
4. Enter the task title and description.
5. Assign a priority and workflow stage.
6. Set an assignee and due date.
7. Drag and drop tasks between workflow columns.
8. Use the search field to locate specific tasks.
9. Filter tasks by priority.
10. Monitor project progress through the statistics dashboard.

## Engineering Concepts Demonstrated

This project demonstrates practical implementation of:

- Dynamic DOM rendering.
- JavaScript application state management.
- Event delegation.
- HTML5 Drag and Drop API.
- Data persistence using LocalStorage.
- Responsive CSS Grid and Flexbox.
- Reusable rendering functions.
- Form validation.
- Dynamic filtering and searching.
- Calendar date calculations.
- Accessible interactive controls.
- Defensive data parsing and HTML escaping.

## Future Improvements

Potential enhancements for future development:

- User authentication and role-based access.
- Backend integration using REST APIs.
- Real-time team collaboration.
- Database integration.
- Task comments and attachments.
- Advanced project analytics.
- Custom workflow columns.
- Notifications and reminders.
- Dark and light theme switching.
- Advanced task reordering within columns.

## Limitations

NEXUS currently operates as a client-side application.

Task data is stored in the browser's LocalStorage and is not synchronized between different devices or users. Authentication, backend services, and real-time collaboration are not currently implemented.

## Author

**Stephen Oyugi**

Front-End Developer | AI Automation Engineer | Machine Learning Practitioner

- GitHub: https://github.com/Regalson001
- LinkedIn: https://linkedin.com/in/stephenoyugi001
- Portfolio: Explore my GitHub repositories for additional projects.

## License

This project is licensed under the MIT License.

You are welcome to explore, learn from, and build upon this project.

---

**Built with precision, creativity, and modern front-end engineering.**
