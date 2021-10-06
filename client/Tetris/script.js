// Configuration
const squareCount = 200;
const width = 10;
const displayWidth = 4;
const lTetromino = [
  [1, width + 1, width * 2 + 1, 2],
  [width, width + 1, width + 2, width * 2 + 2],
  [1, width + 1, width * 2 + 1, width * 2],
  [width, width * 2, width * 2 + 1, width * 2 + 2]
];
const zTetromino = [
  [0, width, width + 1, width * 2 + 1],
  [width + 1, width + 2, width * 2, width * 2 + 1],
  [0, width, width + 1, width * 2 + 1],
  [width + 1, width + 2, width * 2, width * 2 + 1]
];
const tTetromino = [
  [1, width, width + 1, width + 2],
  [1, width + 1, width + 2, width * 2 + 1],
  [width, width + 1, width + 2, width * 2 + 1],
  [1, width, width + 1, width * 2 + 1]
];
const oTetromino = [
  [0, 1, width, width + 1],
  [0, 1, width, width + 1],
  [0, 1, width, width + 1],
  [0, 1, width, width + 1]
];
const iTetromino = [
  [1, width + 1, width * 2 + 1, width * 3 + 1],
  [width, width + 1, width + 2, width + 3],
  [1, width + 1, width * 2 + 1, width * 3 + 1],
  [width, width + 1, width + 2, width + 3]
];

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  // Variables
  const tetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino];
  const upNextTetrominos = [
    [1, displayWidth + 1, displayWidth * 2 + 1, 2], /* lTetromino */
    [0, displayWidth, displayWidth + 1, displayWidth * 2 + 1], /* zTetromino */
    [1, displayWidth, displayWidth + 1, displayWidth + 2], /* tTetromino */
    [0, 1, displayWidth, displayWidth + 1], /* oTetromino */
    [1, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 3 + 1] /* iTetromino */
  ];
  const grid = document.querySelector('.grid');
  const miniGrid = document.querySelector('.mini-grid');
  const startBtn = document.querySelector("#start-button");
  const difficulty = 500;
  let squares = Array.from(buildUIGrids(grid, squareCount, squareCount - 10));
  let miniSquares = Array.from(buildUIGrids(miniGrid, 20, 0));
  let currentPosition = 4;
  let currentRotation = 0;
  let nextRandom = 0;
  let random = 0;
  let current = tetrominoes[0][0];
  let timerID = null;
  let displayIndex = 0;
  let score = 0;

  /**
   * Redraw the current tetromino position
   *
   * @author Alec M. <https://amattu.com>
   * @date 2021-10-06T11:11:44-040
   */
  function draw() {
    // Loop through new position and add class
    current.forEach((i) => {
      squares[currentPosition + i].classList.add("tetromino");
    });
  }

  /**
   * Remove the current tetromino divs
   *
   * @author Alec M. <https://amattu.com>
   * @date 2021-10-06T11:11:29-040
   */
  function undraw() {
    // Loop through current position and remove class
    current.forEach((i) => {
      squares[currentPosition + i].classList.remove("tetromino");
    });
  }

  /**
   * Move tetromino downward
   *
   * @author Alec M. <https://amattu.com>
   * @date 2021-10-06T11:11:18-040
   */
  function moveDown() {
    // Undraw div
    undraw();

    // Move down
    currentPosition += width;

    // Redraw and recalculate
    draw();
    freeze();
  }

  /**
   * Generate a new tetromino
   *
   * @author Alec M. <https://amattu.com>
   * @date 2021-10-06T11:11:06-040
   */
  function freeze() {
    // Iterate through current pieces, find end of game grid
    if (current.some((i) => squares[currentPosition + i + width].classList.contains("taken"))) {
      // Update classes for finished piece
      current.forEach((i) => squares[currentPosition + i].classList.add("taken"));

      // Find new tetromino piece
      random = nextRandom;
      nextRandom = Math.floor(Math.random() * tetrominoes.length);
      current = tetrominoes[random][currentRotation];
      currentPosition = 4;

      // Perorm recalculations
      draw();
      displayNext();
      addScore();
      gameOver();
    }
  }

  /**
   * Move the current tetromino left
   *
   * @author Alec M. <https://amattu.com>
   * @date 2021-10-06T11:10:54-040
   */
  function moveLeft() {
    // Undraw position
    undraw();

    // Move left if possible
    if (!current.some((i) => (currentPosition + i) % width === 0)) {
      currentPosition -= 1;
    }
    if (current.some((i) => squares[currentPosition + i].classList.contains("taken"))) {
      currentPosition += 1;
    }

    // Redraw
    draw();
  }

  /**
   * Move the current tetromino right
   *
   * @author Alec M. <https://amattu.com>
   * @date 2021-10-06T11:10:42-040
   */
  function moveRight() {
    // Undraw position
    undraw();

    // Move right if possible
    if (!current.some((i) => (currentPosition + i) % width === width - 1)) {
      currentPosition += 1;
    }
    if (current.some((i) => squares[currentPosition + i].classList.contains("taken"))) {
      currentPosition -= 1;
    }

    // Redraw position
    draw();
  }

  /**
   * Rotate the current tetromino
   *
   * @author Alec M. <https://amattu.com>
   * @date 2021-10-06T11:10:25-040
   */
  function rotate() {
    // Undraw piece
    undraw();

    // Rotate clockwise
    currentRotation++;
    if (currentRotation === current.length) {
      currentRotation = 0;
    }

    // Update rotation
    current = tetrominoes[random][currentRotation];

    // Redraw piece
    draw();
  }

  /**
   * Handle IO controls
   *
   * @param {Event} input event
   * @author Alec M. <https://amattu.com>
   * @date 2021-10-06T11:09:59-040
   */
  function control(e) {
    switch (e.keyCode) {
      case 37:
        moveLeft();
        break;
      case 38:
        rotate();
        break;
      case 39:
        moveRight();
        break;
      case 40:
        moveDown();
        break;
    }
  }

  /**
   * Display a upcoming tetromino
   *
   * @author Alec M. <https://amattu.com>
   * @date 2021-10-06T11:09:36-040
   */
  function displayNext() {
    // Remove current tetromino piece
    miniSquares.forEach((div) => {
      div.classList.remove("tetromino");
    });

    // Redraw upcoming tetromino piece
    upNextTetrominos[nextRandom].forEach((i) => {
      miniSquares[displayIndex + i].classList.add("tetromino");
    });
  }

  // Event listeners
  document.addEventListener("keyup", control);
  startBtn.addEventListener("click", () => {
    if (timerID) {
      clearInterval(timerID);
      timerID = null;
      startBtn.textContent = "Start Game";
    } else {
      draw();
      timerID = setInterval(moveDown, difficulty);
      nextRandom = Math.floor(Math.random() * tetrominoes.length);
      startBtn.textContent = "Pause Game";
      displayNext();
    }
  });

  /**
   * Keep track of game score
   *
   * @author Alec M. <https://amattu.com>
   * @date 2021-10-06T11:09:07-040
   */
  function addScore() {
    // Iterate through each grid div
    for (let i = 0; i < squareCount; i ++) {
      const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9];

      // Check if tetromino is at the end
      if (row.every(idx => squares[idx].classList.contains("taken") && !squares[idx].classList.contains("immutable"))) {
        score += 10;
        document.querySelector("#score").textContent = score;
        row.forEach(idx => {
          squares[idx].classList.remove("taken", "tetromino");
        });
        const squaresRemoved = squares.splice(i, width);
        squares = squaresRemoved.concat(squares);
        squares.forEach(cell => grid.appendChild(cell));
      }
    }
  }

  /**
   * Determine the end of the game
   * @author Alec M. <https://amattu.com>
   * @date 2021-10-06T11:08:30-040
   */
  function gameOver() {
    // Check if tetromino is at the top of the grid
    if (current.some(index => squares[currentPosition + index].classList.contains("taken"))) {
      document.querySelector("#score").textContent = "Over";
      clearInterval(timerID);
    }
  }
});

/**
 * Append 200 divs to the game grid
 *
 * @param {DOMElement} container
 * @param {integer} number of squares
 * @param {integer} pad the last N elements with class "taken"
 * @return {HTMLCollection} grid children
 * @author Alec M. <https://amattu.com>
 * @date 2021-10-06T09:15:17-040
 */
function buildUIGrids(container, number, pad) {
  // Create a placeholder fragment
  const fragment = document.createDocumentFragment();

  // Create N elements
  for (let i = 0; i < number; i++) {
    const div = document.createElement('div');

    // Add classes to element if needed
    if (pad && i >= pad)
      div.classList.add('taken', 'immutable');

    // Append to fragment
    fragment.appendChild(div);
  }

  // Append fragment to container (grid)
  container.appendChild(fragment);

  // Return children
  return container.children;
}