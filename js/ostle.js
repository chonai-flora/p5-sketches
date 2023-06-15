const screenSize = Math.min(window.innerWidth, window.innerHeight / 6 * 5, 720);
const blockSize = screenSize / 5 - 1.25;

const dx = [1, 0, -1, 0];
const dy = [0, 1, 0, -1];

const S = +1, G = -1, H = +2;
const players = new Map([
	[S, {
		palette: 'snow',
		score: 0
	}],
	[G, {
		palette: 'grey',
		score: 0
	}]
]);

let board = [
	[S, S, S, S, S],
	[0, 0, 0, 0, 0],
	[0, 0, H, 0, 0],
	[0, 0, 0, 0, 0],
	[G, G, G, G, G]
];
let prevBoard = null;
let turn = S;
let winner = 0;
let currentX = Number.NaN, currentY = Number.NaN;
let legalMoves = Array.from(new Array(5), () => new Array(5).fill(false));

const initLegalMoves = () => {
	legalMoves = legalMoves.map((line) => line.fill(false));
}

const getScore = (player) => {
	return players.get(player).score;
}

const changeTurn = () => {
	turn = -turn;
	currentX = Number.NaN; currentY = Number.NaN;

	if (getScore(S) >= 2) {
		winner = S;
	} else if (getScore(G) >= 2) {
		winner = G;
	}
}

const isOutOfRange = (w, h) => {
	return (w < 0 || h < 0 || w >= 5 || h >= 5);
}

const isHole = (w, h) => {
	return (board[h][w] === H);
}

const increaseScore = (w, h) => {
	players.get(-board[h][w]).score++;
}

const isPrevPosition = (fromX, fromY, toX, toY)=>{
	if (!prevBoard) return false;
	
	const b = structuredClone(board);
	shiftPieces(b, fromX, fromY, toX, toY, false);
	
	return (b.flat().toString() === prevBoard.flat().toString());
}

const updateMoves = (w, h) => {
	initLegalMoves();
	if (!isHole(w, h) && board[h][w] !== turn) return;
	
	for (let i = 0; i < 4; i++) {
		const p = dx[i] + w;
		const q = dy[i] + h;

		if (isOutOfRange(p, q)) continue;
		if (isHole(p, q)) continue;
		if (isHole(w, h) && board[q][p]) continue;
		if (isPrevPosition(w, h, p, q)) continue;

		legalMoves[q][p] = true;
	}
	
	currentX = w; currentY = h;
}

const shiftPieces = (b, fromX, fromY, toX, toY, countScore = true) => {
	if (countScore) initLegalMoves();

	if (isOutOfRange(toX, toY)) {
		if (countScore) {
			increaseScore(fromX, fromY);
		}
		return;
	} else if (isHole(toX, toY)) {
		if (countScore) {
			increaseScore(fromX, fromY);
			b[toY][toX] = H;
			b[fromY][fromX] = 0;
		}
		return;
	} else if (b[toY][toX]) {
		shiftPieces(b, toX, toY, 2 * toX - fromX, 2 * toY - fromY, countScore);
	}

	b[toY][toX] = b[fromY][fromX];
	b[fromY][fromX] = 0;
}

const showTurn = () => {
	fill(players.get(winner || turn).palette);
	stroke('black');
	strokeWeight(5);
	textSize(blockSize / 4);
	text("■", 10, blockSize / 2);
	fill('black');
	noStroke();
	if (winner) {
		text(`　の勝利です`, 10, blockSize / 2);
	} else {
		text(`　のターンです`, 10, blockSize / 2);
		text(`あと${2 - getScore(turn)}取れば勝利です`, 10, blockSize / 1.25);
	}
}

setup = () => {
	createCanvas(screenSize, screenSize + blockSize);
	rectMode(CENTER);
	textAlign(LEFT, BASELINE);
	noLoop();
}

draw = () => {
	clear();
	showTurn();

	for (let c = 0; c < 5; c++) {
		for (let r = 0; r < 5; r++) {
			const x = (r + 0.5) * blockSize + 3;
			const y = (c + 1.5) * blockSize + 3;

			fill(legalMoves[c][r] ? 'darkgrey' : 'lightgrey');
			stroke('black');
			strokeWeight(5);
			square(x, y, blockSize);

			if (abs(board[c][r]) === 1) {
				fill(players.get(board[c][r]).palette);
				strokeWeight(blockSize / 20);
				square(x, y, blockSize / 2, blockSize / 20);
			} else if (isHole(r, c)) {
				fill('black');
				noStroke();
				circle(x, y, blockSize / 1.5);
			}
		}
	}

	fill('lightgrey');
	noStroke();
	for (let c = 0; c <= 5; c++) {
		for (let r = 0; r <= 5; r++) {
			const x = r * blockSize + 3;
			const y = (c + 1) * blockSize + 3;
			for (let i = 0; i < 2; i++) {
				square(blockSize / 2 * dx[i] + x, blockSize / 2 * dy[i] + y, 6);
			}
		}
	}
}

mouseClicksed = () => {
	const p = floor(mouseX / blockSize);
	const q = floor(mouseY / blockSize) - 1;
	if (winner || isOutOfRange(p, q)) return;

	if (legalMoves[q][p]) {
		prevBoard = structuredClone(board);
		shiftPieces(board, currentX, currentY, p, q);
		initLegalMoves();
		changeTurn();
	} else {
		updateMoves(p, q);
	}
	
	redraw();
}