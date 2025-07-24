let form = document.querySelector("#settings");
let size = document.querySelector("#size");
let rowsCols = document.querySelector("#number");
let complete = document.querySelector(".complete");
let replay = document.querySelector(".replay");
let close = document.querySelector(".close");
let newMaze;

// form.addEventListener("submit", generateMaze);
form.dfs.addEventListener("click", generateMazeDfs);
form.prims.addEventListener("click", generateMazePrims);
form.ellers.addEventListener("click", generateMazeEllers);
form.kruskal.addEventListener("click", generateMazeKruskal);
form.ab.addEventListener("click", generateMazeAb);



document.addEventListener("keydown", move);
replay.addEventListener("click", () => {
  location.reload();
});

close.addEventListener("click", () => {
  complete.style.display = "none";
});

// async function generateMaze(e) {
//   e.preventDefault();
//   if (rowsCols.value == "" || size.value == "") {
//     return alert("Please enter all fields");
//   }

//   let mazeSize = size.value;
//   let number = rowsCols.value;
//   // if (mazeSize > 600 || number > 50) {
//   //   alert("Maze too large!");
//   //   return;
//   // }

//   form.style.display = "none";
//   newMaze = new Maze(mazeSize, number, number);
//   newMaze.setup();
//  newMaze.draw_dfs();
 
//   // if(p1.ok){
//   //   complete.style.display = "block";

//   // }

// }
async function generateMazeAb(e) {
  e.preventDefault();

  if (rowsCols.value == "" || size.value == "") {
    return alert("Please enter all fields");
  }

  let mazeSize = size.value;
  let number = rowsCols.value;
  // if (mazeSize > 600 || number > 50) {
  //   alert("Maze too large!");
  //   return;
  // }

  form.style.display = "none";
  newMaze = new Maze(mazeSize, number, number);
  newMaze.setup();
  newMaze.draw_aldous_broder();
}
async function generateMazeEllers(e) {
  e.preventDefault();

  if (rowsCols.value == "" || size.value == "") {
    return alert("Please enter all fields");
  }

  let mazeSize = size.value;
  let number = rowsCols.value;
  // if (mazeSize > 600 || number > 50) {
  //   alert("Maze too large!");
  //   return;
  // }

  form.style.display = "none";
  newMaze = new Maze(mazeSize, number, number);
  newMaze.setup();
  newMaze.draw_ellers();
}
async function generateMazeDfs(e) {
  e.preventDefault();

  if (rowsCols.value == "" || size.value == "") {
    return alert("Please enter all fields");
  }

  let mazeSize = size.value;
  let number = rowsCols.value;
  // if (mazeSize > 600 || number > 50) {
  //   alert("Maze too large!");
  //   return;
  // }

  form.style.display = "none";
  newMaze = new Maze(mazeSize, number, number);
  newMaze.setup();
  newMaze.draw_dfs();
}
async function generateMazeKruskal(e) {
  e.preventDefault();

  if (rowsCols.value == "" || size.value == "") {
    return alert("Please enter all fields");
  }

  let mazeSize = size.value;
  let number = rowsCols.value;
  // if (mazeSize > 600 || number > 50) {
  //   alert("Maze too large!");
  //   return;
  // }

  form.style.display = "none";
  newMaze = new Maze(mazeSize, number, number);
  newMaze.setup();
  newMaze.draw_kruskall();
}
async function generateMazePrims(e) {
  e.preventDefault();

  if (rowsCols.value == "" || size.value == "") {
    return alert("Please enter all fields");
  }

  let mazeSize = size.value;
  let number = rowsCols.value;
  // if (mazeSize > 600 || number > 50) {
  //   alert("Maze too large!");
  //   return;
  // }

  form.style.display = "none";
  newMaze = new Maze(mazeSize, number, number);
  newMaze.setup();
 newMaze.draw_prims();
 
  // if(p1.ok){
  //   complete.style.display = "block";

  // }

}
function move(e) {
  if (!generationComplete) return;
  let key = e.key;
  let row = current.rowNum;
  let col = current.colNum;

  switch (key) {
    case "ArrowUp":
      if (!current.walls.topWall) {
        let next = newMaze.grid[row - 1][col];
        current = next;
        newMaze.draw();
        current.highlight(newMaze.columns);
        // not required if goal is in bottom right
        if (current.goal) complete.style.display = "block";
      }
      break;

    case "ArrowRight":
      if (!current.walls.rightWall) {
        let next = newMaze.grid[row][col + 1];
        current = next;
        newMaze.draw();
        current.highlight(newMaze.columns);
        if (current.goal) complete.style.display = "block";
      }
      break;

    case "ArrowDown":
      if (!current.walls.bottomWall) {
        let next = newMaze.grid[row + 1][col];
        current = next;
        newMaze.draw();
        current.highlight(newMaze.columns);
        if (current.goal) complete.style.display = "block";
      }
      break;

    case "ArrowLeft":
      if (!current.walls.leftWall) {
        let next = newMaze.grid[row][col - 1];
        current = next;
        newMaze.draw();
        current.highlight(newMaze.columns);
        // not required if goal is in bottom right
        if (current.goal) complete.style.display = "block";
      }
      break;
  }
}
