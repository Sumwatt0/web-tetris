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
  constructor(shape: number[][], color?: string) {
    if (color !== undefined && this.colors.includes(color)) {this.colorVal = this.colors.indexOf(color)+1;}
    else {this.colorVal = Math.floor(Math.random()*this.colors.length)+1;}
    this.shape = shape.map((row) => row.map((value) => value == 1 ? this.colorVal : value));
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
        this.grid[row][startingCol+col] = piece.shape[row][col];
      }
    }
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


ctx.beginPath();
const game = new Grid(20, 10);
const one = new Piece(PIECES[Math.floor(Math.random()*PIECES.length)]);
game.addPiece(one);
game.drawGrid('black', 'white', 1);
ctx.stroke();

