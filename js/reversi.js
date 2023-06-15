const	screenSize = Math.min(window.innerWidth, window.innerHeight, 720);
const	blockSize = screenSize / 8;

const B = -1, W = +1;

const dx = [1, 1, 0, -1, -1, -1, 0, 1];
const dy = [0, 1, 1, 1, 0, -1, -1, -1];

let board = [
	[0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, B, W, 0, 0, 0],
	[0, 0, 0, W, B, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0]
];

let boardEvaluations = [
  [ 30, -12,  15,   4,   4,  15, -12,  30],
  [-12, -15,  -3,  -3,  -3,  -3, -15, -12],
  [ 15,  -3,  15,   3,   3,  15,  -3,  15],
  [  4,  -3,   3,   3,   3,   3,  -3,   4],
  [  4,  -3,   3,   3,   3,   3,  -3,   4],
  [ 15,  -3,  15,   3,   3,  15,  -3,  15],
  [-12, -15,  -3,  -3,  -3,  -3, -15, -12],
  [ 30, -12,  15,   4,   4,  15, -12,  30]
];

let turn = W;
let gameEnds = false;
let passed = false;

let cpuTiming = 0;
let cpuMod = 30;
let prevX = -1, prevY = -1;

let flipAngle = 0;
let flipSpeed = 9;
let flippings;

const isOutOfRange = (w, h) => {
	return (w < 0 || h < 0 || w > 7 || h > 7);
}

const isFlipping = () => {
	return flippings.flat().includes(true);
}

const initFlippings = () => {
	flippings = Array.from(new Array(8), () => new Array(8).fill(false));
}

const showTurn = () => {
	fill('black');
	noStroke();
	if (gameEnds) {
		const total = board.flat().reduce((sum, value) => sum + value, 0);
		if (total === 0) {
			text("引き分けです", 12, blockSize / 2);
		} else {
			const diff = abs(total);
			text(`${diff}枚差で${total > 0 ? "あなた" : "CPU"}の勝利です`, 12, blockSize / 2);
		}
	} else {
		if (turn === W) {
			text("あなたのターンです", 12, blockSize / 2);
		} else {
			const n = frameCount % cpuMod / 10 % 3 + 1;
			text(`CPUのターンです${". ".repeat(n)}`, 12, blockSize / 2);
		}
	}
}

const changeTurn = () => {
	flipAngle = 0;
	initFlippings();
	turn = -turn;
}

const updateBoard = (w, h) => {
	for (let i = 0; i < 8; i++) {
		let flippableDisks = [];
		for (let distance = 1; distance < 11; distance++) {
			const p = distance * dx[i] + w;
			const q = distance * dy[i] + h;

			if (isOutOfRange(p, q) || board[q][p] === 0) {
				flippableDisks = [];
				break;
			} else if (board[q][p] === turn) {
				break;
			} else {
				flippableDisks.push([p, q]);
			}
		}

		for (const disk of flippableDisks) {
			flippings[disk[1]][disk[0]] = true;
			if (board[h][w] === 0) {
				board[h][w] = turn;
              
				if (sq(ceil((w - 4) / 2)) + sq(ceil((h - 4) / 2)) === 8) {
					for (let j = 0; j < 8; j += 2) {
						const p = dx[j] + w;
						const q = dy[j] + h;

						if (!isOutOfRange(p, q)) {
							boardEvaluations[q][p] = -3;
						}
					}
				}
			}
		}
	}
}

const isFlippable = (w, h) => {
  for (let i = 0; i < 8; i++) {
    let count = 0;
    for (let distance = 1; distance < 11; distance++) {
      const p = distance * dx[i] + w;
      const q = distance * dy[i] + h;

      if (isOutOfRange(p, q) || board[q][p] === 0) {
        count = 0;
        break;
      } else if (board[q][p] === turn) {
        break; 
      } else {
        count++;
      }
    }
    
    if (count > 0) {
      return true;
    }
  }
  return false;
}

const countFlippable = (w, h) => {
  let sum = 0;

  for (let i = 0; i < 8; i++) {
    let count = 0;
    for (let distance = 1; distance < 11; distance++) {
      const p = distance * dx[i] + w;
      const q = distance * dy[i] + h;

      if (isOutOfRange(p, q) || board[q][p] === 0) {
        break;
      } else if (board[q][p] === turn) {
        sum += count;
        break;
      } else {
        count++;
      }
    }
  }

  return sum;
}


const cpu = () => {
  let p = -1, q = -1;
  let maxEvaluation = -15;
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      if (board[y][x] !== 0 || !isFlippable(x, y)) {
        continue;
      } 
      
      const boardEvaluation = boardEvaluations[y][x];
      if (maxEvaluation <= boardEvaluation) {
        if (maxEvaluation === boardEvaluation && random() < 0.5) {
          continue;
        }

        maxEvaluation = boardEvaluation;
        p = x; q = y;
      } else {
        const flippableCount = countFlippable(x, y);
        if (maxEvaluation <= flippableCount) {
          if (maxEvaluation === flippableCount && random() < 0.5) {
            continue;
          }

          maxEvaluation = flippableCount;
          p = x; q = y;
        }
      }
    }
  }
  
  if (p < 0 || q < 0) {
    changeTurn();
  } else {
    updateBoard(p, q);
    cpuTiming = -1;
    prevX = p; prevY = q;
  }
}

const updateCpu = () => {
  cpuMod = int(random(1, 4)) * 20;
  cpuTiming = frameCount % cpuMod;
}

setup = () => {
	createCanvas(screenSize, screenSize + blockSize);
	strokeWeight(2);
	textSize(blockSize / 2);
	textAlign(LEFT, CENTER);

	initFlippings();
}

draw = () => {
	background('snow');

	let blankExists = false;
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      let ratio = 1.0;
      fill(x === prevX && y === prevY ? 'green' : 'olivedrab');
      stroke('black');
      square(x * blockSize, (y + 1) * blockSize, blockSize);

      if (sq(x - 4) + sq(y - 4) === 8) {
        fill('black');
        noStroke();
        circle(x * blockSize, (y + 1) * blockSize, max(blockSize, 60) / 10);
      }

      if (board[y][x] === 0) {
        if (!blankExists) {
          blankExists = true;
        }
        continue;
      }

      if (flippings[y][x]) {
        ratio = cos(PI / 180 * flipAngle);
        if (flipAngle === 90) {
          board[y][x] = turn;
        } else if (flipAngle === 180) {
          changeTurn();
          passed = false;
        }
      }
      
      noStroke();
      fill(board[y][x] === W ? 'white' : 'black');
      ellipse((x + 0.5) * blockSize, (y + 1.5) * blockSize, ratio * (blockSize / 1.5), blockSize / 1.5);
    }
  }
  
  if (!blankExists && !isFlipping()) {
    gameEnds = true;
  }

  let passTurn = true;
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      if (board[y][x] !== 0) continue;

      if (isFlippable(x, y)) {
        if (passTurn) {
          passTurn = false;
        }

        if (turn === W && !isFlipping()) {
          noStroke();
          fill('silver');
          circle((x + 0.5) * blockSize, (y + 1.5) * blockSize, blockSize / 5);
        }
      }
    }
  }

  showTurn();

  if (gameEnds) return;

  if (turn === B && frameCount % cpuMod === cpuTiming) {
    cpu();
  }

  if (isFlipping()) {
    flipAngle += flipSpeed;
  } else if (passTurn) {
    if (passed) {
      gameEnds = true;
    } else {
      passed = true;
    }
    
    updateCpu();
    changeTurn();
  }
}

mousePressed = () => {
	const p = floor(mouseX / blockSize);
	const q = floor(mouseY / blockSize) - 1;

	if (gameEnds || isFlipping() || turn === B || isOutOfRange(p, q) || board[q][p] !== 0) {
		return;
	}

  updateBoard(p, q);
  updateCpu();
}