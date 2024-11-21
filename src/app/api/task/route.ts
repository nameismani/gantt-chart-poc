import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { NextResponse } from "next/server";
// Interfaces
interface Subtask {
  id: string;
  name: string;
  // progress: number;
  start: number;
  end: number;
  project: string;
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

// API Handler
export async function GET(req: Request) {
  try {
    const projectsData = readProjectsData();
    return new Response(JSON.stringify(projectsData), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Error reading data" }), {
      status: 500,
    });
  }
}

// API handler for adding a new project

export async function POST(req: Request) {
  try {
    const { projectId, task, project } = await req.json(); // Expecting { projectId, task?, project? }

    const projectsData = readProjectsData(); // Get the current projects data
    console.log(project, "fdgdfsgf");
    // Check if the task data is present
    if (task) {
      // Handle task creation
      if (!projectId) {
        return new Response(
          JSON.stringify({
            message: "Project ID is required for adding a task",
          }),
          { status: 400 }
        );
      }

      const projectD = projectsData.projects.find((p) => p.id === projectId);
      const { name, type, id, start, end, project } = task;
      if (!projectD) {
        return new Response(JSON.stringify({ message: "Project not found" }), {
          status: 404,
        });
      }

      projectD.subtasks.push({ name, id, start, end, project }); // Add the task to the project's subtasks

      // Save updated data
      writeProjectsData(projectsData);

      return new Response(
        JSON.stringify({ message: "Task added successfully", task }),
        { status: 200 }
      );
    }

    // If no task, assume it's a project creation
    if (project) {
      const newProject = {
        ...project,
        subtasks: [],
      }; // Assign new unique ID for the project
      projectsData.projects.push(newProject); // Add new project to the list

      // Save updated data
      writeProjectsData(projectsData);

      return new Response(
        JSON.stringify({
          message: "Project added successfully",
          project: newProject,
        }),
        { status: 200 }
      );
    }

    return new Response(
      JSON.stringify({
        message: "Invalid request, task or project data is required",
      }),
      { status: 400 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Error adding task or project" }),
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    // Parse the request body
    const { task } = await req.json();
    const { name, type, id, start, end, project } = task;
    if (!task || !task.id || !task.project) {
      return NextResponse.json(
        { message: "Task ID and associated project are required" },
        { status: 400 }
      );
    }

    // Read existing project data
    const projectsData = readProjectsData();

    // Find the project associated with the task
    const projectD = projectsData.projects.find((p) => p.id === task.project);

    if (!projectD) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }

    // Find the task within the project's subtasks
    const taskIndex = projectD.subtasks.findIndex((t) => t.id === task.id);

    if (taskIndex === -1) {
      return NextResponse.json(
        { message: "Task not found in the specified project" },
        { status: 404 }
      );
    }

    // Update the task with new values
    projectD.subtasks[taskIndex] = {
      ...projectD.subtasks[taskIndex],
      ...{
        name,
        id,
        start: new Date(start).getTime(),
        end: new Date(end).getTime(),
        project,
      },
    };

    // Recalculate the project's start and end dates
    let startD = new Date(projectD.subtasks[0].start).getTime();
    let endD = new Date(projectD.subtasks[0].end).getTime();

    for (const subtask of projectD.subtasks) {
      const taskStart = new Date(subtask.start).getTime();
      const taskEnd = new Date(subtask.end).getTime();

      if (taskStart < startD) startD = taskStart;
      if (taskEnd > endD) endD = taskEnd;
    }

    projectD.start = new Date(startD).getTime();
    projectD.end = new Date(endD).getTime();

    // Save the updated data back to the database or JSON file
    writeProjectsData(projectsData);

    // Return success response
    return NextResponse.json(
      { message: "Task and project updated successfully", projectD },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating task or project:", error);
    return NextResponse.json(
      { message: "An error occurred while updating the task" },
      { status: 500 }
    );
  }
}
