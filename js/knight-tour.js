const screenSize = Math.min(window.innerWidth, window.innerHeight / 9 * 8, 720);
const blockSize = screenSize / 8;

// 0:♞ 1:移動済み 2:移動可能 3:移動不可能
const CellState = {
	current: 0,
	placed: 1,
	movable: 2,
	immovable: 3
};
const palettes = ['silver', 'lightgrey', 'snow'];

let score;
let boardX, boardY;

let board;
let cellStates;

const isInRange = (w, h) => {
	return (w >= 0 && h < 8 && w < 8 && h >= 0);
}

const create2dArray = (value) => {
	return Array.from(new Array(8), () => new Array(8).fill(value));
}


const updateCellStates = (state) => {
	const dx = [2, 1, -1, -2, -2, -1, 1, 2];
	const dy = [1, 2, 2, 1, -1, -2, -2, -1];
	for (let i = 0; i < 8; i++) {
		const p = dx[i] + boardX;
		const q = dy[i] + boardY;
		if (isInRange(p, q) && cellStates[q][p] !== CellState.placed) {
			cellStates[q][p] = state;
		}
	}
}

const showMessage = (message, textColor) => {
	fill('gainsboro');
	textSize(screenSize / 15);
	rect(0, 0, screenSize, blockSize);
	fill(textColor);
	textSize(screenSize / 15);
	text(message, screenSize / 2, blockSize / 2);
}

setup = () => {
	createCanvas(screenSize, screenSize + blockSize);
	textAlign(CENTER, CENTER);
	noLoop();

	score = 1;
	boardX = int(random(8));
	boardY = int(random(8));

	board = create2dArray('-');
	cellStates = create2dArray(CellState.immovable);
	board[boardY][boardX] = '♞';
	cellStates[boardY][boardX] = CellState.current;

	redraw();
}

draw = () => {
	clear();
	fill('gainsboro');
	noStroke();
	square(0, 0, screenSize);
	updateCellStates(CellState.movable);

	let gameEnds = true;
	for (let y = 0; y < 8; y++) {
		for (let x = 0; x < 8; x++) {
			fill(palettes[min(cellStates[y][x], CellState.movable)]);
			stroke('gainsboro');
			square(x * blockSize, (y + 1) * blockSize, blockSize);
			
			fill('silver');
			noStroke();
			if (cellStates[y][x] === CellState.movable) {
				if (gameEnds) {
					gameEnds = false;
				}

				circle((x + 0.5) * blockSize, (y + 1.5) * blockSize, blockSize / 2);
			}
			
			fill('black');
			textSize(screenSize / 16);
			text(board[y][x], (x + 0.5) * blockSize, (y + 1.5) * blockSize - 2);
			
			textSize(screenSize / 50);
			if (x === 0) {
				text(8 - y, (x + 0.1) * blockSize, (y + 1.15) * blockSize);
			}
			if (y === 7) {
				text(char('a'.charCodeAt(0) + x), (x + 0.9) * blockSize, (y + 1.85) * blockSize);
			}
		}
	}
	
	const status = score === 64 ? `Perfect!` : `${gameEnds ? "Result": "Score"}: ${score}`;
	showMessage(status, gameEnds ? 'red' : 'black');
}

mousePressed = () => {
	const p = floor(mouseX / blockSize);
	const q = floor(mouseY / blockSize) - 1;
	if (!isInRange(p, q)) return;

	if (cellStates[q][p] === CellState.movable) {
		updateCellStates(CellState.immovable);
		board[boardY][boardX] = score.toString();
		board[q][p] = '♞';
		cellStates[boardY][boardX] = 1;
		cellStates[q][p] = 0;
		boardX = p;
		boardY = q;

		score++;
		redraw();
	}
}