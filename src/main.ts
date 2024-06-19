import './style.css'

const screen = document.querySelector('#screen') as HTMLCanvasElement;
const ctx = screen.getContext('2d') as CanvasRenderingContext2D;

function setCanvasDimensions(heightRatio: number) {
  const cssHeight = window.getComputedStyle(screen).height;
  screen.height = parseInt(cssHeight, 10);
  screen.width = screen.height * heightRatio;
}

setCanvasDimensions(0.5);

const PIECES = [
    [[1, 1, 1, 1]],
    [[1, 1], [1, 1]],
    [[0, 1, 0], [1, 1, 1]],
    [[1, 0, 0], [1, 1, 1]],
    [[0, 0, 1], [1, 1, 1]],
    [[0, 1, 1], [1, 1, 0]],
    [[1, 1, 0], [0, 1, 1]],
]

class Piece {
  colors: string[] = ['red', 'green', 'blue', 'purple', 'yellow'];
  colorVal: number;
  shape: number[][];
  coords: [number, number][] = [];
  constructor(shape: number[][], color?: string) {
    if (color !== undefined && this.colors.includes(color)) {this.colorVal = this.colors.indexOf(color)+1;}
    else {this.colorVal = Math.floor(Math.random()*this.colors.length)+1;}
    this.shape = shape.map((row) => row.map((value) => value == 1 ? this.colorVal : value));
  }
  move(x: number, y: number, grid: Grid) {
    const newCoords = this.coords.map((value) => {return [value[0]+y, value[1]+x] as [number, number]});
    if (this.isValidMove(newCoords, grid)) {this.coords = newCoords; return true;}
    else {return false;}
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
  // Normal Tetris Grid is 10x20
  constructor(rows: number, cols: number) {
    this.grid = Array.from({ length: rows }).map(() => Array.from({ length: cols }).map(() => 0));
    this.squareSize = [screen.width/cols, screen.height/rows];
  }
  addPiece(piece: Piece) {
    const startingCol = Math.floor((this.grid[0].length - piece.shape[0].length) / 2);
    for (let row = 0; row < piece.shape.length; row++) {
      for (let col = 0; col < piece.shape[row].length; col++) {
        if (piece.shape[row][col] !== 0) {
          this.grid[row][startingCol+col] = piece.shape[row][col];
          piece.coords.push([row, (startingCol+col)])
        }
      }
    }
  }
  clearPiece(piece: Piece) {
    for (let coord = 0; coord < piece.coords.length; coord++) {
      this.grid[piece.coords[coord][0]][piece.coords[coord][1]] = 0;
    }
  }
  drawPiece(piece: Piece) {
    for (let coord = 0; coord < piece.coords.length; coord++) {
      this.grid[piece.coords[coord][0]][piece.coords[coord][1]] = piece.colorVal;
    }
  }
  updatePiece(piece: Piece) {
    this.clearPiece(piece);
    this.drawPiece(piece);
  }
  drawGrid(fill: string, stroke: string, weight: number) {
    for (let row = 0; row < this.grid.length; row++) {
    	for (let col = 0; col < this.grid[row].length; col++) {
        ctx.lineWidth = weight;
        ctx.strokeStyle = stroke;
        ctx.fillStyle = fill;
        for (let p = 0; p < this.colors.length; p++) {
          if (this.grid[row][col] == p+1) {
            ctx.fillStyle = this.colors[p];
          }
        }
        ctx.fillRect(col*this.squareSize[0], row*this.squareSize[1], this.squareSize[0], this.squareSize[1]);
        ctx.strokeRect(col*this.squareSize[0], row*this.squareSize[1], this.squareSize[0], this.squareSize[1]);
      }
    }
  }
}

const game = new Grid(20, 10);
const currPiece = new Piece(PIECES[Math.floor(Math.random()*PIECES.length)]);
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
  movePiece(0, 1);
}
setInterval(update, 1000);

function movePiece(x: number, y: number) {
  game.clearPiece(currPiece);
  currPiece.move(x, y, game);
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
      movePiece(0, -1);
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
