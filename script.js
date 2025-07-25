const gameBoard = document.getElementById("game");
const statusText = document.getElementById("status");
const restartBtn = document.getElementById("restart");
const aiToggle = document.getElementById("aiToggle");
const scoreX = document.getElementById("scoreX");
const scoreO = document.getElementById("scoreO");

const clickSound = document.getElementById("clickSound");
const winSound = document.getElementById("winSound");
const drawSound = document.getElementById("drawSound");

let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let gameActive = true;
let useAI = false;
let scores = { X: 0, O: 0 };

const winConditions = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

// Create cells
function initBoard() {
  gameBoard.innerHTML = "";
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.classList.remove("winner"); // Clear winner class
    cell.dataset.index = i;
    cell.addEventListener("click", handleClick);
    gameBoard.appendChild(cell);
  }
}

function handleClick(e) {
  const index = e.target.dataset.index;
  // Prevent clicks during AI turn or if game is inactive or cell is taken
  if (!gameActive || board[index] !== "" || (useAI && currentPlayer === "O")) return;

  playSound(clickSound);
  board[index] = currentPlayer;
  e.target.textContent = currentPlayer;

  if (checkWinner(currentPlayer)) {
    highlightWinner(currentPlayer);
    statusText.textContent = `Player ${currentPlayer} wins!`;
    playSound(winSound);
    scores[currentPlayer]++;
    updateScores();
    gameActive = false;
    return;
  }

  if (board.every(cell => cell !== "")) {
    statusText.textContent = "It's a draw!";
    playSound(drawSound);
    gameActive = false;
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  statusText.textContent = `Player ${currentPlayer}'s turn`;

  if (useAI && currentPlayer === "O") {
    setTimeout(computerMove, 300); // Reduced delay for smoother experience
  }
}

function checkWinner(player) {
  return winConditions.some(condition =>
    condition.every(index => board[index] === player)
  );
}

function highlightWinner(player) {
  winConditions.forEach(condition => {
    if (condition.every(index => board[index] === player)) {
      condition.forEach(index => {
        gameBoard.children[index].classList.add("winner");
      });
    }
  });
}

function restartGame() {
  board = ["", "", "", "", "", "", "", "", ""];
  currentPlayer = "X";
  gameActive = true;
  statusText.textContent = `Player ${currentPlayer}'s turn`;
  initBoard();
}

function updateScores() {
  scoreX.textContent = scores["X"];
  scoreO.textContent = scores["O"];
}

function computerMove() {
  // Find best move using Minimax
  const bestMove = findBestMove();
  board[bestMove] = "O";
  const cell = gameBoard.children[bestMove];
  cell.textContent = "O";
  playSound(clickSound);

  if (checkWinner("O")) {
    highlightWinner("O");
    statusText.textContent = `Player O wins!`;
    playSound(winSound);
    scores["O"]++;
    updateScores();
    gameActive = false;
  } else if (board.every(cell => cell !== "")) {
    statusText.textContent = "It's a draw!";
    playSound(drawSound);
    gameActive = false;
  } else {
    currentPlayer = "X";
    statusText.textContent = `Player ${currentPlayer}'s turn`;
  }
}

// Minimax algorithm for AI
function findBestMove() {
  let bestScore = -Infinity;
  let bestMove;
  const available = board.map((val, idx) => val === "" ? idx : null).filter(i => i !== null);

  for (let i of available) {
    board[i] = "O";
    let score = minimax(board, 0, false);
    board[i] = "";
    if (score > bestScore) {
      bestScore = score;
      bestMove = i;
    }
  }
  return bestMove;
}

function minimax(board, depth, isMaximizing) {
  if (checkWinner("O")) return 10 - depth;
  if (checkWinner("X")) return depth - 10;
  if (board.every(cell => cell !== "")) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        board[i] = "O";
        let score = minimax(board, depth + 1, false);
        board[i] = "";
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        board[i] = "X";
        let score = minimax(board, depth + 1, true);
        board[i] = "";
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

// Audio error handling
function playSound(sound) {
  sound.play().catch(() => console.log("Audio playback failed"));
}

// Initialize game
restartBtn.addEventListener("click", restartGame);
aiToggle.addEventListener("change", () => {
  useAI = aiToggle.checked;
  restartGame();
});

initBoard();