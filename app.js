const cells = Array.from(document.querySelectorAll(".cell"));
const status = document.getElementById("status");
const resetButton = document.getElementById("reset");
const scoreX = document.getElementById("score-x");
const scoreO = document.getElementById("score-o");
const scoreDraw = document.getElementById("score-draw");

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

const HUMAN_PLAYER = "X";
const COMPUTER_PLAYER = "O";

let boardState = Array(9).fill("");
let currentPlayer = HUMAN_PLAYER;
let gameActive = true;
let scores = {
  X: 0,
  O: 0,
  draw: 0,
};

let audioContext;

const updateStatus = (message) => {
  status.textContent = message;
};

const updateScoreboard = () => {
  scoreX.textContent = scores.X;
  scoreO.textContent = scores.O;
  scoreDraw.textContent = scores.draw;
};

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
};

const playTone = (frequency, duration = 0.15, type = "sine") => {
  const context = getAudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.value = 0.08;

  oscillator.connect(gain);
  gain.connect(context.destination);

  oscillator.start();
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
  oscillator.stop(context.currentTime + duration);
};

const playClickSound = () => playTone(520, 0.12, "triangle");
const playWinSound = () => {
  playTone(660, 0.18, "triangle");
  setTimeout(() => playTone(880, 0.2, "triangle"), 120);
};
const playDrawSound = () => {
  playTone(330, 0.18, "sine");
  setTimeout(() => playTone(260, 0.2, "sine"), 120);
};

const handleWin = (combo) => {
  combo.forEach((index) => {
    cells[index].classList.add("winning");
  });

  if (currentPlayer === HUMAN_PLAYER) {
    scores.X += 1;
  } else {
    scores.O += 1;
  }

  updateScoreboard();
  updateStatus(`Winner: ${currentPlayer}!`);
  playWinSound();
  gameActive = false;
};

const handleDraw = () => {
  scores.draw += 1;
  updateScoreboard();
  updateStatus("It's a draw!");
  playDrawSound();
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
      return true;
    }
  }

  if (boardState.every((cell) => cell)) {
    handleDraw();
    return true;
  }

  return false;
};

const applyMove = (index, player) => {
  boardState[index] = player;
  cells[index].textContent = player;
  cells[index].classList.add(player.toLowerCase());
};

const getAvailableMoves = () =>
  boardState
    .map((value, index) => (value ? null : index))
    .filter((value) => value !== null);

const getBestMove = () => {
  const available = getAvailableMoves();

  const findComboMove = (player) => {
    for (const combo of WINNING_COMBOS) {
      const marks = combo.map((index) => boardState[index]);
      const playerCount = marks.filter((mark) => mark === player).length;
      const emptyIndex = combo.find((index) => boardState[index] === "");

      if (playerCount === 2 && emptyIndex !== undefined) {
        return emptyIndex;
      }
    }
    return null;
  };

  const winningMove = findComboMove(COMPUTER_PLAYER);
  if (winningMove !== null) {
    return winningMove;
  }

  const blockingMove = findComboMove(HUMAN_PLAYER);
  if (blockingMove !== null) {
    return blockingMove;
  }

  if (available.includes(4)) {
    return 4;
  }

  const corners = available.filter((index) => [0, 2, 6, 8].includes(index));
  if (corners.length > 0) {
    return corners[Math.floor(Math.random() * corners.length)];
  }

  return available[Math.floor(Math.random() * available.length)];
};

const handleComputerTurn = () => {
  if (!gameActive || currentPlayer !== COMPUTER_PLAYER) {
    return;
  }

  const move = getBestMove();
  if (move === undefined) {
    return;
  }

  applyMove(move, COMPUTER_PLAYER);
  playClickSound();

  if (!checkResult()) {
    currentPlayer = HUMAN_PLAYER;
    updateStatus("Your turn: X");
  }
};

const handleCellClick = (event) => {
  const cell = event.currentTarget;
  const index = Number(cell.dataset.index);

  if (!gameActive || currentPlayer !== HUMAN_PLAYER || boardState[index]) {
    return;
  }

  applyMove(index, HUMAN_PLAYER);
  playClickSound();

  if (checkResult()) {
    return;
  }

  currentPlayer = COMPUTER_PLAYER;
  updateStatus("Computer thinking...");
  setTimeout(handleComputerTurn, 400);
};

const resetGame = () => {
  boardState = Array(9).fill("");
  currentPlayer = HUMAN_PLAYER;
  gameActive = true;

  cells.forEach((cell) => {
    cell.textContent = "";
    cell.classList.remove("x", "o", "winning");
  });

  updateStatus("Your turn: X");
};

cells.forEach((cell) => {
  cell.addEventListener("click", handleCellClick);
});

resetButton.addEventListener("click", resetGame);
updateScoreboard();
updateStatus("Your turn: X");
