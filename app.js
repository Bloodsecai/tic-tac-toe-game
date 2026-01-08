const board = document.getElementById("board");
const cells = Array.from(document.querySelectorAll(".cell"));
const status = document.getElementById("status");
const resetButton = document.getElementById("reset");

const WINNING_COMBOS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

let boardState = Array(9).fill("");
let currentPlayer = "X";
let gameActive = true;

const updateStatus = (message) => {
  status.textContent = message;
};

const handleWin = (combo) => {
  combo.forEach((index) => {
    cells[index].classList.add("winning");
  });
  updateStatus(`Winner: ${currentPlayer}!`);
  gameActive = false;
};

const handleDraw = () => {
  updateStatus("It's a draw!");
  gameActive = false;
};

const checkResult = () => {
  for (const combo of WINNING_COMBOS) {
    const [a, b, c] = combo;
    if (
      boardState[a] &&
      boardState[a] === boardState[b] &&
      boardState[a] === boardState[c]
    ) {
      handleWin(combo);
      return;
    }
  }

  if (boardState.every((cell) => cell)) {
    handleDraw();
  }
};

const handleCellClick = (event) => {
  const cell = event.currentTarget;
  const index = Number(cell.dataset.index);

  if (!gameActive || boardState[index]) {
    return;
  }

  boardState[index] = currentPlayer;
  cell.textContent = currentPlayer;
  cell.classList.add(currentPlayer.toLowerCase());

  checkResult();

  if (gameActive) {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    updateStatus(`Current player: ${currentPlayer}`);
  }
};

const resetGame = () => {
  boardState = Array(9).fill("");
  currentPlayer = "X";
  gameActive = true;

  cells.forEach((cell) => {
    cell.textContent = "";
    cell.classList.remove("x", "o", "winning");
  });

  updateStatus("Current player: X");
};

cells.forEach((cell) => {
  cell.addEventListener("click", handleCellClick);
});

resetButton.addEventListener("click", resetGame);
