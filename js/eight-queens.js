const screenSize = Math.min(window.innerWidth, window.innerHeight / 9 * 8, 720);
const blockSize = screenSize / 8;

// 1:移動済み 2:移動可能 3:移動不可能
const CellState = {
	placed: 0,
	movable: 1,
	immovable: 2
};
const palettes = ['silver', 'snow', 'lightgrey'];

let score = 0;
let boardX = Number.NaN, boardY = Number.NaN;

let board;
let cellStates;

const isInRange = (w, h) => {
	return (w >= 0 && h < 8 && w < 8 && h >= 0);
}

const create2dArray = (value) => {
	return Array.from(new Array(8), () => new Array(8).fill(value));
}

const updateCellStates = (state) => {
	const dx = [1, 1, 0, -1, -1, -1, 0, 1];
	const dy = [0, 1, 1, 1, 0, -1, -1, -1];
	for (let i = 0; i < 8; i++) {
		for (let distance = 1; distance < 11; distance++) {
			const p = distance * dx[i] + boardX;
			const q = distance * dy[i] + boardY;
			if (isInRange(p, q)) {
				cellStates[q][p] = state;
			}
		}
	}
}

const showMessage = (message, textColor) => {
	fill('gainsboro');
	rect(0, 0, screenSize, blockSize);
	fill(textColor);
	textSize(screenSize / 15);
	text(message, screenSize / 2, blockSize / 2);
}

setup = () => {
	createCanvas(screenSize, screenSize + blockSize);
	textAlign(CENTER, CENTER);
	noLoop();

	board = create2dArray('-');
	cellStates = create2dArray(CellState.movable);

	redraw();
}

draw = () => {
	clear();
	fill('gainsboro');
	noStroke();
	square(0, 0, screenSize);

	let gameEnds = true;
	for (let y = 0; y < 8; y++) {
		for (let x = 0; x < 8; x++) {
			fill(palettes[cellStates[y][x]]);
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

	const status = score === 8 ? `Clear!` : `${gameEnds ? "Result" : "Score"}: ${score}`;
	showMessage(status, gameEnds ? 'red' : 'black');
}

mousePressed = () => {
	const p = floor(mouseX / blockSize);
	const q = floor(mouseY / blockSize) - 1;
	if (!isInRange(p, q)) return;

	if (cellStates[q][p] === CellState.movable) {
		boardX = p; boardY = q;
		updateCellStates(CellState.immovable);
		board[q][p] = '♛';
		cellStates[q][p] = CellState.placed;

		score++;
		redraw();
	}
}