import { Universe, Cell } from "wasm-game-of-life";
import { memory } from "wasm-game-of-life/wasm_game_of_life_bg";

const CELL_SIZE = 5; // px
const GRID_COLOR = "#CCCCCC";
const DEAD_COLOR = "#FFFFFF";
const ALIVE_COLOR = "#06B6D4";

const h = 50;
const w = 50;

// Construct the universe, and get its width and height.
let universe = Universe.new(h,w);
let width = universe.width();
let height = universe.height();

// Give the canvas room for all of our cells and a 1px border
// around each of them.
const canvas = document.getElementById("game-of-life-canvas");
canvas.height = (CELL_SIZE + 1) * height + 1;
canvas.width = (CELL_SIZE + 1) * width + 1;

const ctx = canvas.getContext('2d');

let animationId = null;


const renderLoop = () => {
  drawGrid();
  drawCells();

  universe.tick()
  animationId = requestAnimationFrame(renderLoop);

};

const isPaused = () => {
  return animationId === null;
};

const playPauseButton = document.getElementById("play-pause");

const play = () => {
  playPauseButton.textContent = "Pause";
  renderLoop();
};

const pause = () => {
  playPauseButton.textContent = "Play";
  cancelAnimationFrame(animationId);
  animationId = null;
};

playPauseButton.addEventListener("click", event => {
  if (isPaused()) {
    play();
  } else {
    pause();
  }
});

let mouse_down = false;

canvas.addEventListener("mousedown", event => {
	mouse_down = true;
});

canvas.addEventListener("mouseup", event => {
	mouse_down = false;
});

canvas.addEventListener("mousemove", event => {
	if (!isPaused() || !mouse_down) {
		return;
	}
  const boundingRect = canvas.getBoundingClientRect();

  const scaleX = canvas.width / boundingRect.width;
  const scaleY = canvas.height / boundingRect.height;

  const canvasLeft = (event.clientX - boundingRect.left) * scaleX;
  const canvasTop = (event.clientY - boundingRect.top) * scaleY;

  const row = Math.min(Math.floor(canvasTop / (CELL_SIZE + 1)), height - 1);
  const col = Math.min(Math.floor(canvasLeft / (CELL_SIZE + 1)), width - 1);

  universe.revive_cell(row, col);


  drawCells();
});

const renderButton = document.getElementById("render-btn");
const randomizeButton = document.getElementById("randomize-btn");
const heightInput = document.getElementById("height");
const widthInput = document.getElementById("width");

renderButton.addEventListener("click", event => {
  let h = Number(heightInput.value)
  let w = Number(widthInput.value)
  universe = Universe.new(w,h);

  canvas.height = (CELL_SIZE + 1) * h + 1;
  canvas.width = (CELL_SIZE + 1) * w + 1;

  width = w
  height = h

  drawGrid();
  drawCells();
  
  
});

randomizeButton.addEventListener("click", event => {
  pause()
  universe.random_cells()
  drawCells();

});

const drawGrid = () => {
    ctx.beginPath();
    ctx.strokeStyle = GRID_COLOR;
  
    // Vertical lines.
    for (let i = 0; i <= width; i++) {
      ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
      ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1);
    }
  
    // Horizontal lines.
    for (let j = 0; j <= height; j++) {
      ctx.moveTo(0,                           j * (CELL_SIZE + 1) + 1);
      ctx.lineTo((CELL_SIZE + 1) * width + 1, j * (CELL_SIZE + 1) + 1);
    }
  
    ctx.stroke();
  };
  

  const getIndex = (row, column) => {
    return row * width + column;
  };

  const bitIsSet = (n, arr) => {
    const byte = Math.floor(n / 8);
    const mask = 1 << (n % 8);
    return (arr[byte] & mask) === mask;
  };
  
  const drawCells = () => {
    const cellsPtr = universe.cells();
  
    // This is updated!
    const cells = new Uint8Array(memory.buffer, cellsPtr, width * height / 8);
  
    ctx.beginPath();

    ctx.fillStyle = ALIVE_COLOR;
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        const idx = getIndex(row, col);
        if (!bitIsSet(idx, cells)) {
          continue;
        }

        ctx.fillRect(
          col * (CELL_SIZE + 1) + 1,
          row * (CELL_SIZE + 1) + 1,
          CELL_SIZE,
          CELL_SIZE
        );
      }
    }

    ctx.fillStyle = DEAD_COLOR;
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        const idx = getIndex(row, col);
        if (bitIsSet(idx, cells)) {
          continue;
        }

        ctx.fillRect(
          col * (CELL_SIZE + 1) + 1,
          row * (CELL_SIZE + 1) + 1,
          CELL_SIZE,
          CELL_SIZE
        );
      }
    }
  
    ctx.stroke();
  };
  
drawGrid();
drawCells();
requestAnimationFrame(renderLoop);
