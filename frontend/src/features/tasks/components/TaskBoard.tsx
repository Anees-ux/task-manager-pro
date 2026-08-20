import React from 'react';
import type { TaskItem } from '../types/task.types';
import { TaskItemStatus } from '@shared/types/enums';
import { TaskColumn } from './TaskColumn';
import { useUpdateTaskStatus } from '../hooks/useTasks';
import {
  IconListCheck,
  IconClockPlay,
  IconEyeCheck,
  IconCircleCheck,
} from '@tabler/icons-react';

interface TaskBoardProps {
  tasks: TaskItem[];
  onNewTaskClick?: (initialStatus?: TaskItemStatus) => void;
  onCardClick?: (task: TaskItem) => void;
}

export function TaskBoard({ tasks, onNewTaskClick, onCardClick }: TaskBoardProps) {
  const updateStatusMutation = useUpdateTaskStatus();

  const handleDropTask = (taskId: string, newStatus: TaskItemStatus) => {
    updateStatusMutation.mutate({ taskId, status: newStatus });
  };

  // Partition tasks into respective columns
  const todoTasks = tasks.filter(
    (t) => t.status === TaskItemStatus.Todo || t.status === TaskItemStatus.Backlog
  );
  const inProgressTasks = tasks.filter((t) => t.status === TaskItemStatus.InProgress);
  const inReviewTasks = tasks.filter((t) => t.status === TaskItemStatus.InReview);
  const doneTasks = tasks.filter(
    (t) => t.status === TaskItemStatus.Done || t.status === TaskItemStatus.Cancelled
  );

  return (
    <div className="row g-3 flex-nowrap overflow-x-auto pb-3 pt-1">
      {/* 1. To Do Column */}
      <TaskColumn
        status={TaskItemStatus.Todo}
        title="To Do"
        icon={IconListCheck}
        tasks={todoTasks}
        colorVariant="secondary"
        onDropTask={handleDropTask}
        onNewTaskClick={onNewTaskClick}
        onCardClick={onCardClick}
      />

      {/* 2. In Progress Column */}
      <TaskColumn
        status={TaskItemStatus.InProgress}
        title="In Progress"
        icon={IconClockPlay}
        tasks={inProgressTasks}
        colorVariant="primary"
        onDropTask={handleDropTask}
        onNewTaskClick={onNewTaskClick}
        onCardClick={onCardClick}
      />

      {/* 3. In Review Column */}
      <TaskColumn
        status={TaskItemStatus.InReview}
        title="In Review"
        icon={IconEyeCheck}
        tasks={inReviewTasks}
        colorVariant="purple"
        onDropTask={handleDropTask}
        onNewTaskClick={onNewTaskClick}
        onCardClick={onCardClick}
      />

      {/* 4. Done Column */}
      <TaskColumn
        status={TaskItemStatus.Done}
        title="Completed"
        icon={IconCircleCheck}
        tasks={doneTasks}
        colorVariant="success"
        onDropTask={handleDropTask}
        onNewTaskClick={onNewTaskClick}
        onCardClick={onCardClick}
      />
    </div>
  );
}
