let maze = document.querySelector(".maze");
let ctx = maze.getContext("2d");
let generationComplete = false;
let current_dfs;
let set_global = []; 

// You can do some addition by doing a DSU in ellers to maybe !


function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) { 
 
      // Generate random number 
      var j = Math.floor(Math.random() * (i + 1));
                 
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
  }
     
  return array;
}
class DSU {
  constructor(sz){
      this.parents = Object.create(null);
      for (let num = 0; num < sz; num ++)
          this.parents[num] = num;
  }
  find(x){
      if (this.parents[x] !== x)
          this.parents[x] = this.find(this.parents[x]);
      return this.parents[x];
  }
  union(x, y) {
      this.parents[this.find(x)] = this.find(y);
  }
  groups(){
      let res = {};
      for (let num in this.parents) {
          let parent = this.find(num);
          res[parent] = res[parent] || [];
          res[parent].push(num);
      }
      return res;
  }
}
class Maze {
  constructor(size, rows, columns) {
    this.size = size;
    this.columns = columns;
    this.rows = rows;
    this.grid = [];
    this.stack = [];
    this.wallList = [];
    this.startCell;
    this.randomStartCell; 
  }

  // Set up the grid and initialize the maze generation
  setup() {
    for (let r = 0; r < this.rows; r++) {
      let row = [];
      for (let c = 0; c < this.columns; c++) {
        let cell = new Cell(r, c, this.grid, this.size);
        row.push(cell);
      }
      this.grid.push(row);
    }

    // Set the starting cell for DFS
    current_dfs = this.grid[0][0];


    // Set the starting cell for Prim's algorithm
    this.startCell = this.grid[Math.floor(Math.random() * this.rows)][Math.floor(Math.random() * this.columns)];
    this.addWallsToList(this.startCell);

    // Set the goal cell
    this.grid[this.rows - 1][this.columns - 1].goal = true;
  }
  async draw_aldous_broder(){
    maze.width = this.size;
    maze.height = this.size;
    maze.style.background = "black";
    let randomStartCell = this.grid[Math.floor(Math.random() * this.rows)][Math.floor(Math.random() * this.columns)];
    randomStartCell.visited = true;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.columns; c++) {
        this.grid[r][c].show(this.size, this.rows, this.columns);
      }
    }
    let unvisited = this.rows * this.columns;
    unvisited --;
    let prev = undefined;
    let current = randomStartCell
    while(unvisited > 0){
    if(prev){
      prev.dehighlight(this.columns);
      }
      current.highlight(this.columns);
      prev = current;
        if(prev){
          prev.dehighlight(this.columns);
          }
        let next = current.checkNeighboursAny();
      current.highlight(this.columns);
      if (next) {
        if (!next.visited) {
          unvisited--;
          next.visited = true;
          current.removeWalls(current, next);
          current.printCommonWall(current, next, this.size, this.columns, this.rows);
        }
      prev = current;
      current = next;
        }
      await new Promise(resolve => setTimeout(resolve, 25));
    }

    generationComplete = true;
    complete.style.display = "block";
  }
  // Draw the maze using DFS
  async draw_dfs() {
    current_dfs.visited = true;
    maze.width = this.size;
    maze.height = this.size;
    maze.style.background = "black";

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.columns; c++) {
        this.grid[r][c].show(this.size, this.rows, this.columns);
      }
    }

    let next = current_dfs.checkNeighbours();

    if (next) {
      next.visited = true;
      this.stack.push(current_dfs);
      current_dfs.highlight(this.columns);
      current_dfs.removeWalls(current_dfs, next);
      current_dfs = next;
    } else if (this.stack.length > 0) {
      let cell = this.stack.pop();
      current_dfs = cell;
      current_dfs.highlight(this.columns);
    }

    if (this.stack.length === 0) {
      generationComplete = true;
      complete.style.display = "block";
      return;
    }

    setTimeout(() => {
      window.requestAnimationFrame(() => {
        this.draw_dfs();
      });
    }, 50);
  }
  async draw_ellers() {

    // an important change i did was that if a set doesnt have a vertical connection then i choose at random a cell from that set !
    // also that the last row can have random horizontal connections !
    maze.width  = this.size;
    maze.height = this.size;
    maze.style.background = "black";

    let sets = [];
    let nextRowSets = [];
    let setHasVerticalConnection =  new Array( this.rows * this.columns  + 1).fill(false);

    for (let i = 0; i < this.columns; i++) {
      sets.push(i + 1);
      nextRowSets.push(this.columns + i);
    }

    for (let r = 0; r < this.rows; r++) {
      if (r === this.rows - 1) {
        this.connectLastRow(sets);
      } else {
        this.connectRow(sets, r);
        this.createVerticalConnections(sets, nextRowSets, setHasVerticalConnection, r);
        for (let c = 0; c < this.columns; c++) {
          sets[c] = nextRowSets[c];
        }
        this.prepareNextRow(nextRowSets, r);
      }

      for (let c = 0; c < this.columns; c++) {
        if(r > 0)this.grid[r - 1][c].dehighlight(this.columns);
        this.grid[r][c].highlight(this.columns);
        this.grid[r][c].show(this.size, this.rows, this.columns);
      }

      await new Promise(resolve => setTimeout(resolve, 50));
    }
    for (let c = 0; c < this.columns - 1; c++) {
    this.grid[this.rows - 1][c].dehighlight(this.columns);
    }
    for (let c = 0; c < this.columns; c++) {
      this.grid[this.rows - 1][c].show(this.size, this.rows, this.columns);
    }
    console.log('hi')
    generationComplete = true;
    complete.style.display = "block";
  }

  connectRow(sets, r) {
    for (let c = 0; c < this.columns - 1; c++) {
      if ((sets[c] !== sets[c + 1]) && (Math.random() > 0.5)) {
        this.grid[r][c].removeWalls(this.grid[r][c], this.grid[r][c + 1]);
        this.mergeSets(sets, sets[c], sets[c + 1]);
      }
    }
  }

  createVerticalConnections(sets, nextRowSets, setHasVerticalConnection, r) {
    for(let c = 0; c < this.columns; c++){
      setHasVerticalConnection[sets[c]] = false;
    }
    for (let c = 0; c < this.columns; c++) {
      if (Math.random() > 0.5) {
        this.grid[r][c].removeWalls(this.grid[r][c], this.grid[r + 1][c]);
        nextRowSets[c] = sets[c];
        setHasVerticalConnection[sets[c]] = true;
      }
    }
    let revisedSets = [];
    for(let i = 0; i < this.columns; i++){
      if(setHasVerticalConnection[sets[i]] == false){
        revisedSets.push(sets[i]);
      }
    }
    for(let st = 0; st < revisedSets.length; st++){
      let curSet = revisedSets[st];
      let indices = [];
      for(let i = 0; i < this.columns; i++){
        if(sets[i] == curSet){
          indices.push(i);
        }
      }
      let randomIndex = Math.floor(Math.random() * indices.length);
      this.grid[r][indices[randomIndex]].removeWalls(this.grid[r][indices[randomIndex]], this.grid[r + 1][indices[randomIndex]]);
      nextRowSets[indices[randomIndex]] = curSet;
      setHasVerticalConnection[curSet] = true;
    }



  }

  

  prepareNextRow(nextRowSets, r) {
    for (let i = 0; i < this.columns; i++) {
      nextRowSets[i] = r * this.columns + i;
      // if (nextRowSets[i] === 0) {
      //   if(i === 0){
      //     nextRowSets[i] = (this.columns * r) + 1;
      //   }
      //   else{
      //   nextRowSets[i] = Math.max(...nextRowSets) + 1;}
      // }
    }
  }

  connectLastRow(sets) {
    for (let c = 0; c < this.columns - 1; c++) {
      if (sets[c] !== sets[c + 1]){
        this.grid[this.rows - 1][c].removeWalls(this.grid[this.rows - 1][c], this.grid[this.rows - 1][c + 1]);
        this.mergeSets(sets, sets[c], sets[c + 1]);
      }
    }
  }

  mergeSets(sets, set1, set2) {
    for (let i = 0; i < sets.length; i++) {
      if (sets[i] === set2) {
        sets[i] = set1;
      }
    }
  }

  // ...existing code...

  async draw_kruskall(){
    maze.width = this.size;
    maze.height = this.size;
    maze.style.background = "black";

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.columns; c++) {
        this.grid[r][c].show(this.size, this.rows, this.columns);
      }
    }
    let dsu = new DSU(this.rows * this.columns + 10);
    let walls = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.columns; c++) {
        let cell = this.grid[r][c];
        if (r > 0) walls.push([cell, this.grid[r - 1][c]]);
        if (c > 0) walls.push([cell, this.grid[r][c - 1]]);
        if (r+1 < this.rows) walls.push([cell, this.grid[r + 1][c]]);
        if (c+1 < this.columns) walls.push([cell, this.grid[r][c + 1]]);

      }
    }
    walls = shuffleArray(walls);

    for (let i = 0; i < walls.length; i++) {
      let [cell1, cell2] = walls[i];
      let set1 = dsu.find(cell1.rowNum * this.columns + cell1.colNum);
      let set2 = dsu.find(cell2.rowNum * this.columns + cell2.colNum);
      if (set1 !== set2) {
       cell1.removeWalls(cell1, cell2);
       dsu.union(cell1.rowNum * this.columns + cell1.colNum, cell2.rowNum * this.columns + cell2.colNum);
       cell1.printCommonWall(cell1, cell2, this.size, this.columns, this.rows);
       await new Promise(resolve => setTimeout(resolve, 20));
       }
    }
    // for(let r = 0; r < this.rows; r++){
    //   for(let c = 0; c < this.columns; c++){
    //   console.log(dsu.find(r * this.columns + c));
    //   }}
    generationComplete = true;
    complete.style.display = "block";
  }

  // Draw the maze using Prim's algorithm
  async draw_prims() {
    maze.width = this.size;
    maze.height = this.size;
    maze.style.background = "black";
    this.startCell.visited = true;

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.columns; c++) {
        this.grid[r][c].show(this.size, this.rows, this.columns);
      }
    }
    
    if (this.wallList.length > 0) {
      let randomIndex = Math.floor(Math.random() * this.wallList.length);
      let wall = this.wallList[randomIndex];
      let [cell1, cell2] = wall;
      cell1.highlight(this.columns);
      // highlightWall(cell1, cell2);
      // cell2.highlight(this.columns);
      let c1 = cell1.visited; 
      let c2 = cell2.visited;
      if (c1 && !c2) {
        cell1.removeWalls(cell1, cell2);
        cell2.visited = true;
        this.addWallsToList(cell2);
      }
      else if (!c1 && c2) {
        cell2.removeWalls(cell1, cell2);
        cell1.visited = true;
        this.addWallsToList(cell1);
      }

      this.wallList.splice(randomIndex, 1);
    }

    if (this.wallList.length === 0) {
      generationComplete = true;
      complete.style.display = "block";
      return;
    }

    setTimeout(() => {
      window.requestAnimationFrame(() => {
        this.draw_prims();
      });
    }, 30);
  }

  // Add the walls of a cell to the wall list
  addWallsToList(cell) {
    let { rowNum, colNum } = cell;
    let grid = this.grid;

    if (rowNum > 0) {
      this.wallList.push([cell, grid[rowNum - 1][colNum]]);
    }
    if (colNum < this.columns - 1) {
      this.wallList.push([cell, grid[rowNum][colNum + 1]]);
    }
    if (rowNum < this.rows - 1) {
      this.wallList.push([cell, grid[rowNum + 1][colNum]]);
    }
    if (colNum > 0) {
      this.wallList.push([cell, grid[rowNum][colNum - 1]]);
    }
  }
}

class Cell {
  constructor(rowNum, colNum, parentGrid, parentSize) {
    this.rowNum = rowNum;
    this.colNum = colNum;
    this.visited = false;
    this.walls = {
      topWall: true,
      rightWall: true,
      bottomWall: true,
      leftWall: true,
    };
    this.goal = false;
    this.parentGrid = parentGrid;
    this.randomStart = false;
    this.parentSize = parentSize;
  }

  checkNeighbours() {
    let grid = this.parentGrid;
    let row = this.rowNum;
    let col = this.colNum;
    let neighbours = [];

    let top = row !== 0 ? grid[row - 1][col] : undefined;
    let right = col !== grid.length - 1 ? grid[row][col + 1] : undefined;
    let bottom = row !== grid.length - 1 ? grid[row + 1][col] : undefined;
    let left = col !== 0 ? grid[row][col - 1] : undefined;

    if (top && !top.visited) neighbours.push(top);
    if (right && !right.visited) neighbours.push(right);
    if (bottom && !bottom.visited) neighbours.push(bottom);
    if (left && !left.visited) neighbours.push(left);

    if (neighbours.length !== 0) {
      let random = Math.floor(Math.random() * neighbours.length);
      return neighbours[random];
    } else {
      return undefined;
    }
  }
  checkNeighboursAny() {
    let grid = this.parentGrid;
    let row = this.rowNum;
    let col = this.colNum;
    let neighbours = [];

    let top = row !== 0 ? grid[row - 1][col] : undefined;
    let right = col !== grid.length - 1 ? grid[row][col + 1] : undefined;
    let bottom = row !== grid.length - 1 ? grid[row + 1][col] : undefined;
    let left = col !== 0 ? grid[row][col - 1] : undefined;

    if (top ) neighbours.push(top);
    if (right) neighbours.push(right);
    if (bottom) neighbours.push(bottom);
    if (left) neighbours.push(left);

    if (neighbours.length !== 0) {
      let random = Math.floor(Math.random() * neighbours.length);
      return neighbours[random];
    } else {
      return undefined;
    }
  }
  eraseTopWall(x, y, size, columns, rows) {
    ctx.beginPath();
    ctx.moveTo(x + 1, y);
    ctx.lineTo(x + size / columns - 1, y);
    ctx.stroke();
  }
  eraseRightWall(x, y, size, columns, rows) {
    ctx.beginPath();
    ctx.moveTo(x + size / columns, y + 1);
    ctx.lineTo(x + size / columns, y + size / rows - 1);
    ctx.stroke();
  }
  eraseBottomWall(x, y, size, columns, rows) {
    ctx.beginPath();
    ctx.moveTo(x + 1,  y + size / rows);
    ctx.lineTo(x + size / columns - 1 , y + size / rows);
    ctx.stroke();
  }

  eraseLeftWall(x, y, size, columns, rows) {
    ctx.beginPath();
    ctx.moveTo(x, y + 1);
    ctx.lineTo(x, y + size / rows - 1);
    ctx.stroke();
  }

  drawTopWall(x, y, size, columns, rows) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + size / columns, y);
    ctx.stroke();
  }

  drawRightWall(x, y, size, columns, rows) {
    ctx.beginPath();
    ctx.moveTo(x + size / columns, y);
    ctx.lineTo(x + size / columns, y + size / rows);
    ctx.stroke();
  }

  drawBottomWall(x, y, size, columns, rows) {
    ctx.beginPath();
    ctx.moveTo(x, y + size / rows);
    ctx.lineTo(x + size / columns, y + size / rows);
    ctx.stroke();
  }

  drawLeftWall(x, y, size, columns, rows) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + size / rows);
    ctx.stroke();
  }

  highlight(columns) {
    if(this.randomStart == true || this.goal == true){return;}
    let x = (this.colNum * this.parentSize) / columns + 1;
    let y = (this.rowNum * this.parentSize) / columns + 1;
    ctx.fillStyle = "purple";
    ctx.fillRect(
      x,
      y,
      this.parentSize / columns - 3,
      this.parentSize / columns - 3
    );
  }
  dehighlight(columns) {
    if(this.randomStart == true || this.goal == true){return;}
    let x = (this.colNum * this.parentSize) / columns + 1;
    let y = (this.rowNum * this.parentSize) / columns + 1;
    ctx.fillStyle = "black";
    ctx.fillRect(
      x,
      y,
      this.parentSize / columns - 3,
      this.parentSize / columns - 3
    );
  }
  highlightWall(cell1, cell2) {
    let x = (this.colNum * this.parentSize) / columns + 1;
    let y = (this.rowNum * this.parentSize) / columns + 1;
    ctx.fillStyle = "purple";
    ctx.fillRect(
      x,
      y,
      this.parentSize / columns - 3,
      this.parentSize / columns - 3
    );
  }
  printCommonWall(cell1, cell2, size, columns, rows) {
    ctx.strokeStyle = "black";
    ctx.fillStyle = "black";
    ctx.lineWidth = 2;
    let x = cell1.colNum - cell2.colNum;
    let x1 = (cell1.colNum * size) / columns;
    let y1 = (cell1.rowNum * size) / rows;
    if (x === 1 && cell1.walls['leftWall'] == false) {
      cell1.eraseLeftWall(x1, y1, size, columns, rows);
    } 
    else if (x === -1 && cell1.walls['rightWall'] === false) {
      cell1.eraseRightWall(x1, y1, size, columns, rows);
    }
    let y = cell1.rowNum - cell2.rowNum;
    if (y === 1 && cell1.walls['topWall'] === false) {
      cell1.eraseTopWall(x1, y1, size, columns, rows);

    } else if (y === -1 && cell1.walls['bottomWall'] === false) {
      cell1.eraseBottomWall(x1, y1, size, columns, rows);
    }

  }
  removeWalls(cell1, cell2) {
    let x = cell1.colNum - cell2.colNum;    // console.log('removed')
    if (x === 1) {
      cell1.walls.leftWall = false;
      cell2.walls.rightWall = false;
    } else if (x === -1) {
      cell1.walls.rightWall = false;
      cell2.walls.leftWall = false;
    }
    let y = cell1.rowNum - cell2.rowNum;
    if (y === 1) {
      cell1.walls.topWall = false;
      cell2.walls.bottomWall = false;
    } else if (y === -1) {
      cell1.walls.bottomWall = false;
      cell2.walls.topWall = false;
    }

  }

  show(size, rows, columns) {
    let x = (this.colNum * size) / columns;
    let y = (this.rowNum * size) / rows;
    ctx.strokeStyle = "#ffffff";
    ctx.fillStyle = "black";
    ctx.lineWidth = 2;
    if (this.walls.topWall) this.drawTopWall(x, y, size, columns, rows);
    if (this.walls.rightWall) this.drawRightWall(x, y, size, columns, rows);
    if (this.walls.bottomWall) this.drawBottomWall(x, y, size, columns, rows);
    if (this.walls.leftWall) this.drawLeftWall(x, y, size, columns, rows);
    if (this.visited) {
      ctx.fillRect(x + 1, y + 1, size / columns - 2, size / rows - 2);
    }
    if (this.goal) {
      ctx.fillStyle = "rgb(83, 247, 43)";
      ctx.fillRect(x + 1, y + 1, size / columns - 2, size / rows - 2);
    }
    // if (this.randomStart) {
    //   ctx.fillStyle = "red";
    //   ctx.fillRect(x + 1, y + 1, size / columns - 2, size / rows - 2);
    // }
  }
}

// // Initialize and draw the maze with DFS
// let newMaze = new Maze(600, 50, 50);
// newMaze.setup();
// // Call the desired draw method here
// // newMaze.draw_dfs();
// newMaze.draw_prims();
