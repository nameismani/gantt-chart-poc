// gantt-task-react-extensions.d.ts
import "gantt-task-react";

declare module "gantt-task-react" {
  interface Task {
    /**
     * Name of the person assigned to the task
     */
    assignee?: string;

    /**
     * Name of the scheduler
     */
    scheduleName?: string;
  }
}
