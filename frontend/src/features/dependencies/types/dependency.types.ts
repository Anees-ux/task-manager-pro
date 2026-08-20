// ─── Dependency Feature Types (mirrors TaskItemDto.cs dependency section) ─
import type { DependencyType } from '@shared/types/enums';

export interface TaskDependencyDto {
  id: string;
  predecessorTaskId: string;
  predecessorTaskTitle: string;
  predecessorTaskCode: string;
  successorTaskId: string;
  successorTaskTitle: string;
  successorTaskCode: string;
  type: DependencyType;
  lagDays: number;
}

export interface CreateTaskDependencyRequest {
  predecessorTaskId: string;
  successorTaskId: string;
  type?: DependencyType;
  lagDays?: number;
}
