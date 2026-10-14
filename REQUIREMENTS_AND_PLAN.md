# TaskFlow — Requirements and Implementation Plan

## 1. Project objective

Build a browser-based Task Tracking System that lets managers assign work and understand progress, while each employee has a private workspace for only the tasks assigned to them.

## 2. User roles and permissions

### Manager / Admin
- Sign in securely.
- View organization task metrics and activity.
- Create and assign tasks to active employees.
- Set title, description, project, priority, and due date.
- View all tasks, assignees, status, progress, and deadlines.
- Delete tasks, create projects, manage employee accounts, and enable/disable employee access.
- View reports and the workspace activity history.

### Employee
- Sign in using an individual account.
- View only tasks assigned to their own account.
- Update a task through **To Do → In Progress → Completed**.
- Update progress from 0–100%; 100% automatically marks a task completed.
- View projects and activity associated with their own tasks.
- Cannot assign/delete tasks, manage employees, or access another employee's tasks.

## 3. Task data and business rules

Each task includes title, description, assignee, project, priority (Low / Medium / High / Urgent), status, deadline, progress, creator, created timestamp, last-updated timestamp, start timestamp, and completion timestamp.

- Overdue = due date is before today and status is not Completed.
- Moving a task to In Progress records its start timestamp if it has not already started.
- Marking a task Completed sets progress to 100 and records completion time.
- Reopening a completed task clears the completion timestamp.
- Every significant user action is recorded in the activity feed.
- Managers control assignment; employees can change only status and progress.

## 4. Main pages

1. Sign in (role-specific manager/employee entry).
2. Overview dashboard (metrics, priority tasks, recent activity).
3. All tasks / My tasks (search, status filters, deadline, priority, progress).
4. Projects (project progress and task totals).
5. Team members (manager-only account administration and workload).
6. Activity log (recent user/task/project events).
7. Reports (status and priority distribution, completion rate, overdue/deadline watch).

## 5. Attractive usability features

- Modern dark-purple welcome banner and clear metric cards.
- Role-aware navigation and responsive layouts.
- Status/priority chips, progress bars, deadline warnings, and overdue labels.
- Search and status filters.
- Recent activity timeline and task detail panel.
- Success/error feedback, empty states, mobile sidebar, and clear onboarding demo accounts.

## 6. Technology

- Frontend: React, Vite, Lucide icons, CSS.
- Backend: Python, FastAPI, Pydantic.
- Persistence: SQLAlchemy with PostgreSQL support; SQLite is the zero-setup local default.
- Authentication: PBKDF2-HMAC-SHA256 password hashes and signed expiring bearer tokens.

## 7. Build and test plan

1. Create backend schema and demo seed data.
2. Add sign-in and server-side role authorization.
3. Add task creation, assignment, status/progress updates, and timestamps.
4. Add team and project management.
5. Add activity history, reports, and overdue metrics.
6. Connect the React UI to the API and build responsive states.
7. Validate manager/employee permissions, then configure PostgreSQL and production secrets.

## 8. Acceptance tests

- Manager credentials work; invalid credentials are rejected.
- Employee cannot load manager-only team endpoints.
- Employee task list and dashboard include only their own assigned tasks.
- Employee cannot patch a task assigned to another employee.
- Employee cannot change task assignment, priority, deadline, or delete tasks.
- Manager can assign a task, and the selected employee sees it after refresh.
- Status/progress changes update the activity feed and timestamps.
- Overdue and completion-rate counts match task data.
- Project and team member creation persists after server restart.

## 9. Production boundary

The included project is a feature-complete local MVP/reference build, not a claim of security-audited enterprise production readiness. Before real deployment, configure strong secrets, HTTPS, exact CORS origins, demo-account removal, migrations, backups, monitoring, rate limiting, password recovery/onboarding, and a security review.
