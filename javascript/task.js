//CLI APPLICATION FOR TASK MANAGEMENT

const fs = require("fs");
const currentDir = process.cwd();
const path = require("path");
const taskFile = path.join(currentDir, "task.txt");
const completedFile = path.join(currentDir, "completed.txt");

// Main function that handles different commands
function Main() {
  //to get the command from the command line arguments
  const command = process.argv[2];
  switch (command) {
    case "add":
      addNewTask();
      break;
    case "ls":
      showTaskList();
      break;
    case "del":
      deleteTask();
      break;
    case "done":
      markCompleteTask();
      break;
    case "report":
      showReport();
      break;
    case "help":
    default:
      displayHelp();
  }
}
// show the commands available in the application
function displayHelp() {
  console.log("Usage :-");
  console.log(
    '$ ./task add PRIORITY "TASK"  # Add a new item with priority PRIORITY and text "TASK" to the list'
  );
  console.log(
    "$ ./task ls                   # Show incomplete priority list items sorted by priority in ascending order"
  );
  console.log(
    "$ ./task del NUMBER           # Delete the incomplete item with the given priority number"
  );
  console.log(
    "$ ./task done NUMBER          # Mark the incomplete item with the given PRIORITY_NUMBER as complete"
  );
  console.log("$ ./task help                 # Show usage");
  console.log("$ ./task report               # Statistics");
}

// Get the list of tasks from the task file
function getTaskList() {
  if (!fs.existsSync(taskFile)) return [];

  try {
    const fileContent = fs.readFileSync(taskFile, "utf8");
    const lines = fileContent.trim().split("\n");
    const tasks = [];

    for (let i = 0; i < lines.length; i++) {
      const firstSpace = lines[i].indexOf(" ");

      if (firstSpace > 0) {
        const priority = parseInt(lines[i].substring(0, firstSpace));
        const text = lines[i].substring(firstSpace + 1);
        tasks.push({ priority: priority, text: text });
      }
    }

    // sort() function sorts the tasks by priority
    tasks.sort(function (a, b) {
      return a.priority - b.priority;
    });

    return tasks;
  } catch (err) {
    console.log("Something went wrong reading the task file");
    return [];
  }
}

// Gets the list of completed tasks from the completed file.
function getCompletedTasks() {
  if (!fs.existsSync(completedFile)) {
    return [];
  }

  try {
    const fileContent = fs.readFileSync(completedFile, "utf8");
    return fileContent.trim().split("\n");
  } catch (err) {
    return [];
  }
}

// Saves tasks to the task file considering their priority
function saveTaskList(tasks) {
  tasks.sort((a, b) => a.priority - b.priority);

  // Create file content , in the format "priority task"
  let fileContent = "";
  for (let i = 0; i < tasks.length; i++) {
    fileContent += tasks[i].priority + " " + tasks[i].text;
    if (i < tasks.length - 1) {
      fileContent += "\n";
    }
  }

  // write filecontent to task file
  fs.writeFileSync(taskFile, fileContent);
}

// Saves completed tasks to completed file
function saveCompletedTasks(tasks) {
  let fileContent = "";
  for (let i = 0; i < tasks.length; i++) {
    fileContent += tasks[i];
    if (i < tasks.length - 1) {
      fileContent += "\n";
    }
  }

  fs.writeFileSync(completedFile, fileContent);
}

// Adds a new task with priority
function addNewTask() {
  const priority = process.argv[3];
  const task = process.argv[4];
  const tasks = getTaskList();

  // Add the new task to tasks array
  tasks.push({
    priority: parseInt(priority),
    text: task,
  });
  // Save the updated list to task file
  saveTaskList(tasks);

  console.log(`Added task: "${task}" with priority ${priority}`);
}

// Shows all incomplete tasks
function showTaskList() {
  const tasks = getTaskList();

  if (tasks.length === 0) {
    console.log("There are no pending tasks!");
    return;
  }

  // Show listed  tasks and priority with index number
  for (let i = 0; i < tasks.length; i++) {
    console.log(`${i + 1}. ${tasks[i].text} [${tasks[i].priority}]`);
  }
}

// Deletes a task by its index
function deleteTask() {
  const s = parseInt(process.argv[3]);

  // Check if the index is valid
  if (isNaN(s)) {
    console.log(
      `Error: task with index #${process.argv[3]} does not exist. Nothing deleted.`
    );
    return;
  }
  const tasks = getTaskList();

  //Checking the validity of the index (in between 1 and length of tasks)
  if (s < 1 || s > tasks.length) {
    console.log(
      `Error: task with index #${s} does not exist. Nothing deleted.`
    );
    return;
  }
  // Remove the task using splice()
  tasks.splice(s - 1, 1);

  // Save updated list to task file
  saveTaskList(tasks);
  console.log(`Deleted task #${s}`);
}

// Marks a task as complete
function markCompleteTask() {
  const s = parseInt(process.argv[3]);

  // Checking the validity of the index
  if (isNaN(s)) {
    console.log(
      `Error: no incomplete item with index #${process.argv[3]} exists.`
    );
    return;
  }

  // Load tasks
  const tasks = getTaskList();

  // Make sure the index is valid
  if (s < 1 || s > tasks.length) {
    console.log(`Error: no incomplete item with index #${s} exists.`);
    return;
  }

  // Get the task to complete
  const completedTask = tasks[s - 1].text;

  // Add to completed list
  const completedList = getCompletedTasks();
  completedList.push(completedTask);
  saveCompletedTasks(completedList);

  // Remove the done task from the tasks list
  tasks.splice(s - 1, 1);
  saveTaskList(tasks);

  console.log("Marked item as done.");
}

// Shows stats on completed and pending tasks
function showReport() {
  const pendingTasks = getTaskList();
  const completedTasks = getCompletedTasks();

  // Show pending tasks
  console.log(`Pending : ${pendingTasks.length}`);
  for (let i = 0; i < pendingTasks.length; i++) {
    console.log(
      `${i + 1}. ${pendingTasks[i].text} [${pendingTasks[i].priority}]`
    );
  }

  // Show completed tasks
  console.log(`\nCompleted : ${completedTasks.length}`);
  for (let i = 0; i < completedTasks.length; i++) {
    console.log(`${i + 1}. ${completedTasks[i]}`);
  }
}

// start the program
Main();
