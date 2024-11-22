"use client";
import React, { useEffect, useState } from "react";
import { Task, ViewMode, Gantt, StylingOption } from "gantt-task-react";
import { v4 as uuidv4 } from "uuid";
import "gantt-task-react/dist/index.css";
import "./globals.css";
import { ViewSwitcher } from "@/component/viewSwitcher";
import { getStartEndDateForProject, initTasks } from "@/libs/helper";
import { Height } from "@mui/icons-material";

type TaskListTableProps = {
  rowHeight: number;
  rowWidth: string;
  fontFamily: string;
  fontSize: string;
  locale: string;
  tasks: Task[];
  selectedTaskId: string;
  setSelectedTask: (taskId: string) => void;
  onExpanderClick: (task: Task) => void;
  handleAddTask: (task: Task) => void;
  handleAddProject: () => void;
  projectStates: Record<string, boolean>;
};

const TaskListTable = ({
  tasks,
  rowWidth,
  rowHeight,
  onExpanderClick,
  handleAddTask,
  handleAddProject,
  projectStates,
}: TaskListTableProps) => {
  return (
    <div style={{ border: "1px solid #dfe1e5" }}>
      {tasks.map((item, i) => {
        const isProject = item.type === "project";
        return (
          <div
            key={item.id}
            style={{
              height: rowHeight,
              width: rowWidth,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: isProject ? "pointer" : "auto",
              fontFamily: "sans-serif",
              background: i % 2 === 0 ? "#ffffff" : "#f4f5f7",
              padding: 10,
              paddingLeft: isProject ? 10 : 40,
            }}
          >
            <p
              onClick={() => {
                onExpanderClick(item);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                margin: 0,
              }}
            >
              {isProject ? "> " : ""}
              {item.name}
              {isProject && (
                <span>
                  -{projectStates[item.id] == true ? "Expanded" : "Collapsed"}
                </span>
              )}
            </p>
            {isProject && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: 20,
                  height: 20,
                  padding: "3px",
                  backgroundColor: "#dfe1e5",
                  borderRadius: 5,
                }}
                onClick={() => handleAddTask(item)}
              >
                +
              </div>
            )}
          </div>
        );
      })}
      <p onClick={handleAddProject}>Add section</p>
    </div>
  );
};

// Init
const App = () => {
  const [view, setView] = React.useState<ViewMode>(ViewMode.Day);
  const [tasks, setTasks] = React.useState<Task[]>([
    {
      start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      end: new Date(new Date().getFullYear(), new Date().getMonth(), 15),
      name: "Kitchen",
      id: "check1",
      progress: 100,
      type: "project",
      hideChildren: false,
    },
  ]);
  const [projectStates, setProjectStates] = useState<Record<string, boolean>>(
    {}
  );
  const [initialTask, setInitialTask] = useState<any[]>([]);
  const [intialRender, setInitialRender] = useState(true);
  console.log(projectStates, "dsfdsf");

  // Initialize state with project IDs from tasks
  useEffect(() => {
    if (
      !intialRender &&
      JSON.stringify(initialTask) === JSON.stringify(tasks)
    ) {
      const initialStates = tasks
        .filter((task) => task.type === "project") // Filter only "project" types
        .reduce((acc, project) => {
          acc[project.id] = true; // Set the initial value to true
          return acc;
        }, {} as Record<string, boolean>);
      setProjectStates(initialStates);
    }
  }, [tasks, initialTask]);
  // useEffect(() => {
  //   if (!intialRender && initialTask?.length != tasks?.length) {
  //     setInitialTask(tasks);
  //   }
  // }, [intialRender, tasks]);
  // Function to toggle the value of a project ID
  const toggleProjectState = (taskId: string) => {
    console.log(taskId, projectStates[taskId]);
    setProjectStates((prevStates) => ({
      ...prevStates,
      [taskId]: !prevStates[taskId], // Toggle the value for the given task ID
    }));
  };

  console.log(projectStates, "sdfadsfe");
  const [isChecked, setIsChecked] = React.useState(true);
  const [hoveredTask, setHoveredTask] = React.useState<Task | null>(null);
  let columnWidth = 105;
  if (view === ViewMode.Year) {
    columnWidth = 350;
  } else if (view === ViewMode.Month) {
    columnWidth = 250;
  } else if (view === ViewMode.Week) {
    columnWidth = 250;
  }

  const fetchTasks = async () => {
    const response = await fetch("/api/task");
    const data = await response.json();

    const flattenedTasks = data.projects.flatMap((project: any) => {
      // Convert project start and end timestamps to Date objects
      const projectStart = new Date(project.start);
      const projectEnd = new Date(project.end);

      // Add the project as an element with type "project"
      const projectElement = {
        id: project.id,
        name: project.name,
        type: "project", // Set the type to "project"
        progress: 100,
        start: projectStart, // Convert project start timestamp to Date object
        end: projectEnd, // Convert project end timestamp to Date object
        hideChildren: false, // Expandable/collapsible property
        height: 10,
      };

      // Flatten the subtasks (tasks) and add them with type "task"
      const subtasks = project.subtasks.map(
        (subtask: any, i: number, arr: any[]) => {
          const subtaskStart = new Date(subtask.start);
          const subtaskEnd = new Date(subtask.end);
          console.log(arr[i - 1]);
          return {
            ...subtask,
            start: subtaskStart,
            end: subtaskEnd,
            type: "task", // Set the type to "task"
            project: project.id,
            progress: 100,
            assignee: "Mani",
            scheduleName: project.name,
            dependencies: i != 0 ? [arr[i - 1].id] : null,
          };
        }
      );

      return [projectElement, ...subtasks];
    });

    setTasks(flattenedTasks);
    setInitialTask(flattenedTasks);
  };

  useEffect(() => {
    // setTasks(initTasks());
    fetchTasks();
    setInitialRender(false);
  }, []);

  useEffect(() => {
    // Select the rect in the 'today' group
    const todayRect = document.querySelector(".today rect");

    if (todayRect) {
      // Get the x value from the rect
      const rectX = todayRect.getAttribute("x");

      // Change the rect's fill color to white
      todayRect.setAttribute("fill", "white");

      // Find the corresponding line with matching x1
      const matchingLine = document.querySelector(`line[x1="${rectX}"]`);

      if (matchingLine) {
        const svgLine = matchingLine as SVGLineElement;

        // **IMPORTANT**: Change the line's stroke color to blue
        svgLine.style.setProperty("stroke", "blue", "important");

        // **IMPORTANT**: Adjust stroke width to make the line more prominent
        svgLine.style.setProperty("stroke-width", "5", "important");

        // Get the SVG's bounding box
        const svg = svgLine.closest("svg") as SVGElement;
        const boundingBox = svgLine.getBoundingClientRect();

        // Ensure the parent container of the SVG is relatively positioned
        const parentContainer = svg.parentElement as HTMLElement;
        if (parentContainer) {
          parentContainer.style.position = "relative";

          // Create the overlay div
          const labelDiv = document.createElement("div");

          // Set the label's text
          labelDiv.textContent = "Today";

          // Style the div
          labelDiv.style.position = "absolute";
          labelDiv.style.left = `${
            boundingBox.x - svg.getBoundingClientRect().x + 25
          }px`; // Align with the line
          labelDiv.style.top = `${
            boundingBox.y - svg.getBoundingClientRect().y + 2
          }px`; // Place above the line
          labelDiv.style.backgroundColor = "blue";
          labelDiv.style.color = "white";
          labelDiv.style.padding = "4px 10px";
          labelDiv.style.borderRadius = "4px";
          labelDiv.style.fontSize = "14px";
          labelDiv.style.fontWeight = "normal";
          labelDiv.style.transform = "translateX(-50%)";
          labelDiv.style.pointerEvents = "none";

          // Append the div to the parent container
          parentContainer.appendChild(labelDiv);
        }
      }
    }
  }, []);

  useEffect(() => {
    // Get all line elements inside the rowLines group
    const lines = document.querySelectorAll(".rowLines > line");

    // Clear previous styles
    lines.forEach((line) => line.classList.remove("highlighted-line"));

    // Filter tasks to find where type is 'project'
    const projectIndexes = tasks
      .map((task, index) => (task.type === "project" ? index : null))
      .filter((index) => index !== null);

    // Apply custom stroke to the appropriate lines
    projectIndexes.forEach((index) => {
      if (index > 0 && lines[index]) {
        // `nth-child` starts at 1; array index starts at 0
        lines[index].classList.add("highlighted-line");
      }
    });
  }, [tasks]);

  const handleTaskChange = async (task: Task) => {
    try {
      const response = await fetch("/api/task", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ task }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Task and project updated successfully:", data);
        await fetchTasks();
      } else {
        console.error("Error updating task:", data.message);
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleTaskDelete = (task: Task) => {
    const conf = window.confirm("Are you sure about " + task.name + " ?");
    if (conf) {
      setTasks(tasks.filter((t) => t.id !== task.id));
    }
    return conf;
  };

  const handleProgressChange = async (task: Task) => {
    setTasks(tasks.map((t) => (t.id === task.id ? task : t)));
    console.log("On progress change Id:" + task.id);
  };

  const handleDblClick = (task: Task) => {
    alert("On Double Click event Id:" + task.id);
  };

  const handleClick = (task: Task) => {
    console.log("On Click event Id:" + task.id);
  };

  const handleSelect = (task: Task, isSelected: boolean) => {
    console.log(task.name + " has " + (isSelected ? "selected" : "unselected"));
  };

  const handleExpanderClick = (task: Task) => {
    setTasks(tasks.map((t) => (t.id === task.id ? task : t)));
    toggleProjectState(task.id);
    // console.log(tasks.map((t) => (t.id === task.id ? task : t)));
    // console.log("On expander click Id:" + task.id);
  };

  // Function to handle adding a task under a selected project
  const handleAddTask = async (selectedProject: Task) => {
    const currentDate = new Date();

    // Create the new task object
    const newTask = {
      name: `New Task 1`, // Generate task name with task number
      type: "task",
      // progress: 100,
      id: uuidv4(),
      start: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        2
      ).getTime(),
      end: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        4,
        0,
        0
      ).getTime(),
      project: selectedProject.id, // Associate with the selected project
      // styles: {
      //   backgroundColor: "#33FF57", // Assign color for tasks
      //   progressColor: "#33FF57",
      // },
    };

    // Make an API call to add the task under the selected project
    try {
      const response = await fetch("/api/task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: selectedProject.id,
          task: newTask,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log("Task added successfully:", data);
        await fetchTasks();
      } else {
        console.error("Error adding task:", data.message);
      }
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  // Function to handle adding a new project
  const handleAddProject = async () => {
    const projectCount = tasks.filter((task) => task.type === "project").length;
    const newProjectName = `Project ${projectCount + 1}`;

    // Create the new project task object
    const newProject = {
      name: newProjectName,
      type: "project",
      progress: 0,
      id: uuidv4(), // Generate a unique ID for the project
      start: new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      ).getTime(),
      end: new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        15
      ).getTime(),
    };

    // Make an API call to create the project
    try {
      const response = await fetch("/api/task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ project: newProject }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log("Project added successfully:", data);
        // After successful API response, update the state to include the new project
        // setTasks((prevTasks) => [...prevTasks, data.project]);
        await fetchTasks();
      } else {
        console.error("Error adding project:", data.message);
      }
    } catch (error) {
      console.error("Error adding project:", error);
    }
  };

  const handleMouseOver = (task: Task) => {
    setHoveredTask(task);
  };

  const handleMouseOut = () => {
    setHoveredTask(null);
  };
  return (
    <div className="Wrapper">
      <ViewSwitcher
        onViewModeChange={(viewMode) => setView(viewMode)}
        onViewListChange={setIsChecked}
        isChecked={isChecked}
      />
      <h3>Gantt With Unlimited Height</h3>
      <Gantt
        tasks={tasks}
        viewMode={view}
        preStepsCount={3}
        // barFill={40}

        onDateChange={handleTaskChange}
        // arrowColor="red"
        arrowIndent={10}
        onDelete={handleTaskDelete}
        onProgressChange={handleProgressChange}
        onDoubleClick={handleDblClick}
        onClick={handleClick}
        onSelect={handleSelect}
        todayColor="blue"
        onExpanderClick={handleExpanderClick}
        listCellWidth={isChecked ? "295px" : ""}
        columnWidth={55}
        rowHeight={40}
        // todayColor="rgba(246, 246, 247, .6)"
        timeStep={100}
        TooltipContent={({ task, fontSize, fontFamily }) =>
          task?.type == "task" ? (
            <div
              style={{
                background: "red",
                color: "white",
                maxWidth: "300px",
                padding: "5px",
              }}
            >
              <p>Scheduler: {task.scheduleName}</p>
              <p>Task:{task.name}</p>
              <p> {task.assignee}</p>
            </div>
          ) : (
            <></>
          )
        }
        handleWidth={9}
        TaskListHeader={({ headerHeight }) => (
          <div
            style={{
              height: headerHeight,
              fontFamily: "sans-serif",
              fontWeight: "bold",
              paddingLeft: 10,
              margin: 0,
              marginBottom: -1,
              display: "flex",
              alignItems: "center",
            }}
          >
            Jobs
          </div>
        )}
        TaskListTable={(props) => (
          <TaskListTable
            {...props}
            handleAddTask={handleAddTask}
            handleAddProject={handleAddProject}
            projectStates={projectStates}
          />
        )}
      />
    </div>
  );
};

export default App;
