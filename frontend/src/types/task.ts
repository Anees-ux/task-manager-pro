export enum TaskItemStatus {
  Todo = 'Todo',
  InProgress = 'InProgress',
  Done = 'Done',
}

export enum Priority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
}

export interface TaskItem {
  id: number;
  title: string;
  description: string | null;
  status: TaskItemStatus;
  priority: Priority;
  projectId: number;
  projectName: string | null;
  dueDate: string | null;
  createdAt: string;
  isOverdue: boolean;
}

export interface CreateTaskRequest {
  title: string;
  description: string | null;
  status: TaskItemStatus;
  priority: Priority;
  projectId: number;
  dueDate: string | null;
}

export interface UpdateTaskRequest {
  title: string;
  description: string | null;
  status: TaskItemStatus;
  priority: Priority;
  projectId: number;
  dueDate: string | null;
}
