import './style.css'

const screen = document.querySelector('#screen') as HTMLCanvasElement;
const ctx = screen.getContext('2d') as CanvasRenderingContext2D;
const hud = document.querySelector('#hud') as HTMLDivElement;

function setCanvasDimensions(heightRatio: number) {
  const cssHeight = window.getComputedStyle(screen).height;
  screen.height = parseInt(cssHeight, 10);
  screen.width = screen.height * heightRatio;
}

setCanvasDimensions(0.5);

const PIECES = [
  // I piece
  [[0, 0, 0, 0], 
   [1, 1, 1, 1], 
   [0, 0, 0, 0], 
   [0, 0, 0, 0]],
  // O piece
  [[0, 0, 0, 0], 
   [0, 1, 1, 0], 
   [0, 1, 1, 0], 
   [0, 0, 0, 0]],
  // T piece
  [[0, 0, 0, 0], 
   [0, 1, 0, 0],
   [1, 1, 1, 0], 
   [0, 0, 0, 0]],
  // L piece
  [[0, 0, 0, 0], 
   [1, 0, 0, 0], 
   [1, 1, 1, 0], 
   [0, 0, 0, 0]],
  // J piece 
  [[0, 0, 0, 0], 
   [0, 0, 1, 0], 
   [1, 1, 1, 0], 
   [0, 0, 0, 0]],
  // S piece
  [[0, 0, 0, 0], 
   [0, 1, 1, 0], 
   [1, 1, 0, 0], 
   [0, 0, 0, 0]],
  // Z piece 
  [[0, 0, 0, 0], 
   [1, 1, 0, 0], 
   [0, 1, 1, 0], 
   [0, 0, 0, 0]], 
];

const KICK_TABLE: [number, number][][] = [
  [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]], // Try no offset, then right, left, down, up
];


class Piece {
  colors: string[] = ['red', 'green', 'blue', 'purple', 'yellow'];
  colorVal: number;
  shape: number[][];
  coords: [number, number][] = [];
  position: [number, number];

  constructor(shape: number[][], color?: string) {
    if (color !== undefined && this.colors.includes(color)) {
      this.colorVal = this.colors.indexOf(color) + 1;
    } else {
      this.colorVal = Math.floor(Math.random() * this.colors.length) + 1;
    }
    this.shape = shape.map((row) => row.map((value) => value == 1 ? this.colorVal : value));
    this.position = [-1, 3]; // starting position
    this.updateCoords();
  }

  updateCoords() {
    this.coords = [];
    for (let row = 0; row < this.shape.length; row++) {
      for (let col = 0; col < this.shape[row].length; col++) {
        if (this.shape[row][col] !== 0) {
          this.coords.push([this.position[0] + row, this.position[1] + col]);
        }
      }
    }
  }

  rotate(grid: Grid) {
    const newShape = this.shape[0].map((_, colIndex) =>
      this.shape.map(row => row[colIndex]).reverse()
    );

    for (const [offsetX, offsetY] of KICK_TABLE[0]) { // Using the first set of offsets
      const newCoords = this.getNewCoords(newShape, offsetX, offsetY);
      if (this.isValidMove(newCoords, grid)) {
        this.shape = newShape;
        this.position[0] += offsetY;
        this.position[1] += offsetX;
        this.updateCoords();
        return;
      }
    }
  }

  getNewCoords(newShape: number[][], offsetX: number, offsetY: number): [number, number][] {
    const newCoords = [];
    for (let row = 0; row < newShape.length; row++) {
      for (let col = 0; col < newShape[row].length; col++) {
        if (newShape[row][col] !== 0) {
          newCoords.push([this.position[0] + row + offsetY, this.position[1] + col + offsetX] as [number, number]);
        }
      }
    }
    return newCoords;
  }

  move(x: number, y: number, grid: Grid) {
    const newCoords = this.coords.map((value) => [value[0] + y, value[1] + x] as [number, number]);
    if (this.isValidMove(newCoords, grid)) {
      this.position[0] += y;
      this.position[1] += x;
      this.updateCoords();
      return true;
    } else {
      return false;
    }
  }

  isValidMove(newCoords: [number, number][], grid: Grid) {
    return newCoords.every(([row, col]) => {
      return row >= 0 && row < grid.grid.length && col >= 0 && col < grid.grid[0].length && grid.grid[row][col] === 0;
    });
  }
}

class Grid {
  grid;
  squareSize: [number, number] = [0, 0];
  colors: string[] = ['red', 'green', 'blue', 'purple', 'yellow'];
  score: number = 0;
  // Normal Tetris Grid is 10x20
  constructor(rows: number, cols: number) {
    this.grid = Array.from({ length: rows }).map(() => Array.from({ length: cols }).map(() => 0));
    this.squareSize = [screen.width / cols, screen.height / rows];
  }

  addPiece(piece: Piece) {
    piece.updateCoords();
    piece.coords.forEach(([row, col]) => {
      this.grid[row][col] = piece.colorVal;
    });
  }

  clearPiece(piece: Piece) {
    piece.coords.forEach(([row, col]) => {
      this.grid[row][col] = 0;
    });
  }

  drawPiece(piece: Piece) {
    piece.coords.forEach(([row, col]) => {
      this.grid[row][col] = piece.colorVal;
    });
  }

  destroyBlocks(): number {
    const scores = [0, 40, 100, 300, 1200]
    const newGrid = this.grid.filter(row => row.some(cell => cell === 0));
    const fullRows = this.grid.length - newGrid.length;
    for (let i = 0; i < fullRows; i++) {
      newGrid.unshift(new Array(this.grid[0].length).fill(0));
    }
    this.grid = newGrid;
    this.score += scores[fullRows];
    return this.score;
  }

  drawGrid(fill: string, stroke: string, weight: number) {
    for (let row = 0; row < this.grid.length; row++) {
      for (let col = 0; col < this.grid[row].length; col++) {
        ctx.lineWidth = weight;
        ctx.strokeStyle = stroke;
        ctx.fillStyle = fill;
        for (let p = 0; p < this.colors.length; p++) {
          if (this.grid[row][col] == p + 1) {
            ctx.fillStyle = this.colors[p];
          }
        }
        ctx.fillRect(col * this.squareSize[0], row * this.squareSize[1], this.squareSize[0], this.squareSize[1]);
        ctx.strokeRect(col * this.squareSize[0], row * this.squareSize[1], this.squareSize[0], this.squareSize[1]);
      }
    }
  }
}

const game = new Grid(20, 10);
let currPiece = new Piece(PIECES[Math.floor(Math.random()*PIECES.length)]);
game.addPiece(currPiece);

function draw() {
  window.requestAnimationFrame(draw);
  ctx.clearRect(0, 0, screen.width, screen.height);
  game.clearPiece(currPiece);
  game.drawPiece(currPiece);
  game.drawGrid('black', 'white', 1);
  ctx.stroke();
}

function update() {
  if (!movePiece(0, 1)) {
    currPiece = new Piece(PIECES[Math.floor(Math.random()*PIECES.length)]);
    hud.textContent = "Score: " + game.destroyBlocks().toString();
  }
}
setInterval(update, 1000);

function movePiece(x: number, y: number) {
  game.clearPiece(currPiece);
  const result: boolean = currPiece.move(x, y, game);
  game.drawPiece(currPiece);
  return result;
}

function rotatePiece() {
  game.clearPiece(currPiece);
  currPiece.rotate(game);
  game.drawPiece(currPiece);
}

window.addEventListener('keydown', keyDown);
function keyDown(e: KeyboardEvent) {
  if (e?.defaultPrevented) {
    return;
  }
  switch(e.code) {
    case "ArrowDown":
    case "KeyS":
      movePiece(0, 1);
      break;
    case "ArrowUp":
    case "KeyW":
    case "KeyF":
      rotatePiece();
      break;
    case "ArrowLeft":
    case "KeyA":
      movePiece(-1, 0);
      break;
    case "ArrowRight":
    case "KeyD":
      movePiece(1, 0)
      break;
  }
  e.preventDefault();
}

draw();
