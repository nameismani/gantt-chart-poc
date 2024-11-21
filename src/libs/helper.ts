import { Task, ViewMode, Gantt, StylingOption } from "gantt-task-react";
import { v4 as uuidv4 } from "uuid";

export function initTasks() {
  const currentDate = new Date();

  const tasks: Task[] = [
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
      name: "Kitchen",
      id: uuidv4(),
      progress: 100,
      type: "project",
      hideChildren: false,
      styles: {
        backgroundColor: "#FF5733", // Orange for projects
        progressColor: "#FF5733",
      },
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
      end: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        2,
        12,
        28
      ),
      name: "Plumbing",
      id: uuidv4(),
      progress: 100,
      type: "task",
      project: "Kitchen",
      styles: {
        backgroundColor: "#33FF57", // Green for tasks
        progressColor: "#33FF57",
      },
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
      name: "Bedroom",
      id: uuidv4(),
      progress: 100,
      type: "project",
      hideChildren: false,
      styles: {
        backgroundColor: "#3357FF", // Blue for projects
        progressColor: "#3357FF",
      },
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10),
      name: "Wardrobe",
      id: uuidv4(),
      progress: 20,
      type: "task",
      project: "Bedroom",
      styles: {
        backgroundColor: "#FF33A1", // Pink for tasks
        progressColor: "#FF33A1",
      },
    },
  ];
  return tasks;
}

export function getStartEndDateForProject(tasks: Task[], projectId: string) {
  const projectTasks = tasks.filter((t) => t.project === projectId);
  let start = projectTasks[0].start;
  let end = projectTasks[0].end;

  for (let i = 0; i < projectTasks.length; i++) {
    const task = projectTasks[i];
    if (start.getTime() > task.start.getTime()) {
      start = task.start;
    }
    if (end.getTime() < task.end.getTime()) {
      end = task.end;
    }
  }
  return [start, end];
}
