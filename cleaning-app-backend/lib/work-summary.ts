import {
  workSessionsStorage,
  workersStorage,
  inventoryLogsStorage,
  issuesStorage,
  taskCompletionsStorage,
} from '@/lib/storage';
import { APARTMENTS, TASK_CATEGORIES } from '@/lib/catalog';
import type { Apartment, WorkSummary, TaskWithStatus, TaskCompletion } from '@/lib/types';

export function buildWorkSummary(sessionId: string): WorkSummary | null {
  const session = workSessionsStorage.findById<any>(sessionId);
  if (!session) {
    return null;
  }

  const worker = workersStorage.findById<any>(session.workerId);
  if (!worker) {
    return null;
  }

  const apartment: Apartment =
    APARTMENTS.find((apt) => apt.id === session.apartmentId) ?? {
      id: session.apartmentId,
      name: `דירה ${session.apartmentId}`,
      icon: '🏠',
    };

  const inventoryUsed = inventoryLogsStorage.findMany<any>(
    (log: any) => log.workSessionId === sessionId
  );

  const issuesReported = issuesStorage.findMany<any>(
    (issue: any) => issue.workSessionId === sessionId
  );

  const taskCompletions = taskCompletionsStorage.findMany<TaskCompletion>(
    (completion: TaskCompletion) => completion.workSessionId === sessionId
  );

  const completedTaskIds = new Set(taskCompletions.map((c) => c.taskId));

  const tasks: TaskWithStatus[] = [];
  let totalTasks = 0;

  TASK_CATEGORIES.forEach((category) => {
    category.tasks.forEach((task) => {
      totalTasks++;
      tasks.push({
        ...task,
        categoryName: category.name,
        completed: completedTaskIds.has(task.id),
      });
    });
  });

  const tasksCompleted = completedTaskIds.size;

  let duration = 0;
  if (session.startTime && session.endTime) {
    duration = Math.floor(
      (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 1000
    );
  }

  return {
    workSessionId: session.id,
    worker,
    apartment,
    startTime: session.startTime,
    endTime: session.endTime,
    duration,
    tasksCompleted,
    totalTasks,
    tasks,
    inventoryUsed,
    issuesReported,
  };
}
