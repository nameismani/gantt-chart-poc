import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { NextResponse } from "next/server";
// Interfaces
interface Subtask {
  id: string;
  name: string;
  progress: number;
  start: number;
  end: number;
}

interface Project {
  id: string;
  name: string;
  start: number;
  end: number;
  subtasks: Subtask[];
}

// Path to the projects.json file
const projectsFilePath = path.join(process.cwd(), "src", "data", "task.json");
console.log(path.join(process.cwd(), "src", "data", "task.json"), "fgdfg");
// Function to read the current projects data
const readProjectsData = (): { projects: Project[] } => {
  const data = fs.readFileSync(projectsFilePath, "utf-8");
  return JSON.parse(data);
};

// Function to write the updated projects data back to the file
const writeProjectsData = (projectsData: { projects: Project[] }): void => {
  fs.writeFileSync(projectsFilePath, JSON.stringify(projectsData, null, 2));
};

export async function POST(req: Request) {
  try {
    const { projectId, updatedTask } = await req.json(); // Expecting { projectId, updatedTask }
    console.log(projectId, updatedTask, "fddfgdf");
    if (!projectId || !updatedTask) {
      return NextResponse.json(
        { message: "Project ID and updated task data are required" },
        { status: 400 }
      );
    }

    // Read the existing projects data
    const projectsData = readProjectsData();

    // Find the project by ID
    const project = projectsData.projects.find((p) => p.id === projectId);

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }

    // Update the specific task in the project's subtasks
    const taskIndex = project.subtasks.findIndex(
      (t) => t.id === updatedTask.id
    );
    if (taskIndex === -1) {
      return NextResponse.json(
        { message: "Task not found in the specified project" },
        { status: 404 }
      );
    }

    // Update the task
    project.subtasks[taskIndex] = {
      ...project.subtasks[taskIndex],
      ...updatedTask,
    };

    // Recalculate the project's start and end dates
    const projectTasks = project.subtasks;
    let start = new Date(projectTasks[0].start).getTime();
    let end = new Date(projectTasks[0].end).getTime();

    for (const task of projectTasks) {
      const taskStart = new Date(task.start).getTime();
      const taskEnd = new Date(task.end).getTime();
      if (taskStart < start) start = taskStart;
      if (taskEnd > end) end = taskEnd;
    }

    project.start = start;
    project.end = end;

    // Write the updated projects data back to the JSON file
    writeProjectsData(projectsData);

    return NextResponse.json(
      { message: "Task and project updated successfully", project },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { message: "Error updating project or task" },
      { status: 500 }
    );
  }
}
