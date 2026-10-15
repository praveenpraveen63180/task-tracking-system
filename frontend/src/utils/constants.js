import {
  FileChartColumn,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  Users
} from 'lucide-react';

export const navManager = [
  ['Overview', '/overview', LayoutDashboard, 'overview'],
  ['All tasks', '/tasks', ListTodo, 'tasks'],
  ['Projects', '/projects', FolderKanban, 'projects'],
  ['Team members', '/team', Users, 'team'],
  ['Reports', '/reports', FileChartColumn, 'reports']
];

export const navEmployee = [
  ['My workspace', '/overview', LayoutDashboard, 'overview'],
  ['My tasks', '/tasks', ListTodo, 'tasks'],
  ['Projects', '/projects', FolderKanban, 'projects']
];
