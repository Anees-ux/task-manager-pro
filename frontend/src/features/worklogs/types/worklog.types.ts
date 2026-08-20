// ─── WorkLog Feature Types (mirrors WorkLogDto in TaskItemDto.cs) ────────

export interface WorkLogDto {
  id: string;
  taskId: string;
  taskTitle: string;
  taskCode: string;
  userId: string;
  userName: string;
  logDate: string;
  hoursWorked: number;
  description: string | null;
  createdAtUtc: string;
}

export interface LogWorkRequest {
  taskId: string;
  logDate: string;
  hoursWorked: number;
  description?: string | null;
}
