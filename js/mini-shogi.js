const screenSize = Math.min(window.innerWidth, window.innerHeight / 8.5 * 5, 720);
const	halfScreen = screenSize / 2;
const	blockSize = screenSize / 5;

// 歩:P 香:L 桂:N 銀:S 金:G 飛:R 角:B
const P = 1, S = 2, R = 3, B = 4, G = 5;
// と:pP 成香:pL 成桂:pN 成銀:pS 竜:pR 馬:pB 王:K 玉:pK
const pP = 6, pS = 7, pR = 8, pB = 9, K = 10, pK = 11;

const stockOrder = [P, S, G, R, B];

let board = [
	[-R, -B, -S, -G, -pK],
	[0, 0, 0, 0, -P],
	[0, 0, 0, 0, 0],
	[+P, 0, 0, 0, 0],
	[+K, +G, +S, +B, +R]
];
let movables = Array.from(new Array(5), () => new Array(5).fill(false));
let checkedPieces = [];
let turn = +P;
let pieceX = Number.NaN, pieceY = Number.NaN;
let promoX = Number.NaN, promoY = Number.NaN;

let promoting = false;
let gameEnds = false;
let pieceImages = Array(pK - P + 1);
let stocks = new Map([
	[+P, new Array(G + 1).fill(0)],
	[-P, new Array(G + 1).fill(0)]
]);
let stockIndex = Number.NaN;

const isOutOfRange = (w, h) => {
	return (isNaN(w) || isNaN(h)) || (w < 0 || h < 0 || w >= 5 || h >= 5);
}

const pieceType = (w, h) => {
	return abs(board[h][w]);
}

const pieceSign = (w, h) => {
	return Math.sign(board[h][w]);
}

const initMovables = () => {
	movables = Array.from(new Array(5), () => new Array(5).fill(false));
}

const showStocks = (n) => {
	push();
	const isSelf = n === P;
	translate((4 * blockSize * int(!isSelf)) + blockSize / 2,
		isSelf ? screenSize + blockSize * 5 / 2 : blockSize * 3 / 2);
	rotate(PI * int(!isSelf));

	fill('black');
	stroke('white');
	textSize(blockSize / 4);
	for (let i = P; i <= G; i++) {
		const order = stockOrder[i - 1];
		const stockCount = stocks.get(n)[order];
		if (stockCount) {
			push();
			translate((i - 1) * blockSize, 0);
			scale(0.75);
			image(pieceImages[order], 0, 0);
			text(`×${stockCount}`, blockSize / 3, blockSize / 3 /*(i + 0.3) * blockSize, blockSize / 3*/ );
			pop();
		}
	}
	pop();
}

const showTurn = () => {
	const message = (turn === +P ? "王" : "玉") +
		(gameEnds ? "の勝ちです" : "のターンです") +
		(isChecked() ? "\n王手されています" : "");

	push();
	noStroke();
	rectMode(CORNER);
	textSize(blockSize / 2.75);
	textAlign(LEFT, TOP);
	fill('black');
	text(message, 0, 0);
	pop();
}

const promote = (w, h, sign) => {
	const type = pieceType(w, h);
	if (type >= P && type <= B) {
		board[h][w] = sign * (type + 5);
	}
}

const askPromote = () => {
	if (window.confirm("成りますか？")) {
		promote(promoX, promoY, -turn);
		promoX = promoY = Number.NaN;
	}
	promoting = false;
	redraw();
}

const updateMovable = (w, h) => {
	const dx = [1, 1, 0, -1, -1, -1, 0, 1];
	const dy = [0, 1, 1, 1, 0, -1, -1, -1];

	initMovables();
	const type = pieceType(w, h);
	const sign = pieceSign(w, h);

	if (type === P) {
		if (pieceSign(w, h - sign) !== turn) {
			movables[h - sign][w] = true;
		}
	}

	if (type === S) {
		for (let i = 0; i < 8; i++) {
			if ([0, 4, 6].includes(i)) continue;
			const r = -sign * dx[i] + w;
			const c = -sign * dy[i] + h;

			if (isOutOfRange(r, c) || pieceSign(r, c) === sign) {
				continue;
			}
			movables[c][r] = true;
		}
	}

	if ([R, pR].includes(type)) {
		for (let i = 0; i < 8; i += 2) {
			for (let distance = 1; distance < 9; distance++) {
				const r = distance * dx[i] + w;
				const c = distance * dy[i] + h;

				if (isOutOfRange(r, c) || pieceSign(r, c) === sign) {
					break;
				}
				movables[c][r] = true;
				if (pieceSign(r, c) !== 0) {
					break;
				}
			}
		}
	}

	if ([B, pB].includes(type)) {
		for (let i = 1; i < 9; i += 2) {
			for (let distance = 1; distance < floor(9 * sqrt(2)); distance++) {
				const r = distance * dx[i] + w;
				const c = distance * dy[i] + h;

				if (isOutOfRange(r, c) || pieceSign(r, c) === sign) break;
				movables[c][r] = true;
				if (pieceSign(r, c) !== 0) {
					break;
				}
			}
		}
	}

	if ([G, pP, pS].includes(type)) {
		for (let i = 0; i < 8; i++) {
			if (i === 5 || i === 7) continue;
			const r = -sign * dx[i] + w;
			const c = -sign * dy[i] + h;

			if (isOutOfRange(r, c) || pieceSign(r, c) === sign) {
				continue;
			}
			movables[c][r] = true;
		}
	}

	if ([pR, pB, K, pK].includes(type)) {
		for (let i = 0; i < 8; i++) {
			const r = dx[i] + w;
			const c = dy[i] + h;

			if (isOutOfRange(r, c) || pieceSign(r, c) === sign) {
				continue;
			}
			movables[c][r] = true;
		}
	}

	pieceX = w; pieceY = h;
}

const checkPiece = (w, h) => {
	const dx = [1, 1, 0, -1, -1, -1, 0, 1];
	const dy = [0, 1, 1, 1, 0, -1, -1, -1];

	const type = pieceType(w, h);
	const sign = pieceSign(w, h);

	if (type === P) {
		if (pieceSign(w, h - sign) === turn) {
			checkedPieces.push(board[h - sign][w]);
		}
	}

	if (type === S) {
		for (let i = 0; i < 8; i++) {
			if ([0, 4, 6].includes(i)) continue;
			const r = -sign * dx[i] + w;
			const c = -sign * dy[i] + h;

			if (isOutOfRange(r, c) || pieceSign(r, c) === sign) {
				continue;
			}
			checkedPieces.push(board[c][r]);
		}
	}

	if ([R, pR].includes(type)) {
		for (let i = 0; i < 8; i += 2) {
			for (let distance = 1; distance < 9; distance++) {
				const r = distance * dx[i] + w;
				const c = distance * dy[i] + h;

				if (isOutOfRange(r, c) || pieceSign(r, c) === sign) {
					break;
				}
				checkedPieces.push(board[c][r]);
				if (pieceSign(r, c) !== 0) {
					break;
				}
			}
		}
	}

	if ([B, pB].includes(type)) {
		for (let i = 1; i < 9; i += 2) {
			for (let distance = 1; distance < floor(9 * sqrt(2)); distance++) {
				const r = distance * dx[i] + w;
				const c = distance * dy[i] + h;

				if (isOutOfRange(r, c) || pieceSign(r, c) === sign) {
					break;
				}
				checkedPieces.push(board[c][r]);
				if (pieceSign(r, c) !== 0) {
					break;
				}
			}
		}
	}

	if ([G, pP, pS].includes(type)) {
		for (let i = 0; i < 8; i++) {
			if ([5, 7].includes(i)) continue;
			const r = -sign * dx[i] + w;
			const c = -sign * dy[i] + h;

			if (isOutOfRange(r, c) || pieceSign(r, c) === sign) {
				continue;
			}
			checkedPieces.push(board[c][r]);
		}
	}

	if ([pR, pB, K, pK].includes(type)) {
		for (let i = 0; i < 8; i++) {
			const r = dx[i] + w;
			const c = dy[i] + h;

			if (isOutOfRange(r, c) || pieceSign(r, c) === sign) {
				continue;
			}
			checkedPieces.push(board[c][r]);
		}
	}
}

const isChecked = () => {
	if (gameEnds) return false;

	checkedPieces = [];
	for (let y = 0; y < 5; y++) {
		for (let x = 0; x < 5; x++) {
			if (pieceSign(x, y) !== turn) {
				checkPiece(x, y);
			}
		}
	}

	return (checkedPieces.includes(+K) || checkedPieces.includes(-pK));
}

const putStock = () => {
	const piece = stockOrder[stockIndex];

	if (stocks.get(turn)[piece] === 0) {
		return;
	}

	initMovables();
	for (let y = 0; y < 5; y++) {
		for (let x = 0; x < 5; x++) {
			movables[y][x] = (board[y][x] === 0);
		}
	}

	if (piece === P) {
		const b = JSON.parse(JSON.stringify(board));
		for (let y = 0; y < 5; y++) {
			for (let x = y; x < 5; x++) {
				const tmp = b[y][x];
				b[y][x] = b[x][y];
				b[x][y] = tmp;
			}
		}

		for (let y = 0; y < 5; y++) {
			for (let x = 0; x < 5; x++) {
				if (b[x].includes(turn * P)) {
					movables[y][x] = false;
				}
			}
			const z = (turn === +P ? 0 : 4);
			movables[z][y] = false;
		}
	}

	pieceX = pieceY = Number.NaN;
}

preload = () => {
	const imageSrcs = [
		"https://1.bp.blogspot.com/-53589yGRcUU/U82w_DNh1RI/AAAAAAAAjGU/0ve7q56YmcI/s800/syougi14_fuhyou.png",
		"https://4.bp.blogspot.com/-CHmBXtrO_zc/U82w8BF3O-I/AAAAAAAAjFs/eHbceViqSes/s800/syougi08_ginsyou.png",
		"https://1.bp.blogspot.com/-52sD36-S3nQ/U82w4zREVII/AAAAAAAAjEw/HzythHxpYYM/s800/syougi03_hisya.png",
		"https://3.bp.blogspot.com/-bq3gmx2ylTA/U82w53WmfHI/AAAAAAAAjFA/n0ha_4JYOIc/s800/syougi05_gakugyou.png",
		"https://3.bp.blogspot.com/-ljsFK13guAo/U82w7BfkkdI/AAAAAAAAjFU/V0sajYGvgZU/s800/syougi07_kinsyou.png",
		"https://2.bp.blogspot.com/-amjFdOxkQjI/U82w_lwHJNI/AAAAAAAAjGg/mk5j9lbp5DA/s800/syougi15_tokin.png",
		"https://3.bp.blogspot.com/-GW2BKIP77pI/U82w8XOtiJI/AAAAAAAAjFw/2ACHTS2thfQ/s800/syougi09_narigin.png",
		"https://1.bp.blogspot.com/-5N26c_Qz-S8/U82w5qZvpwI/AAAAAAAAjFE/A0efCoYymKI/s800/syougi04_ryuuou.png",
		"https://1.bp.blogspot.com/-n9yzuJR_EZU/U82w69_r1uI/AAAAAAAAjFY/_89I2XToJxA/s800/syougi06_ryuuma.png",
		"https://4.bp.blogspot.com/-fFzYwmdMYPE/U82w35c5DnI/AAAAAAAAjEs/CrITxcRP29w/s150/syougi01_ousyou.png",
		"https://2.bp.blogspot.com/-T6I2J8xV6Jo/U82w4ZPbWQI/AAAAAAAAjE8/IBiAdKwv3EA/s150/syougi02_gyokusyou.png",
	];
	for (let i = P; i <= pK; i++) {
		pieceImages[i] = loadImage(imageSrcs[i - 1]);
	}
}

setup = () => {
	createCanvas(screenSize, 8 * blockSize);
	rectMode(CENTER);
	imageMode(CENTER);
	textSize(blockSize * 3 / 4);
	textAlign(CENTER, CENTER);

	initMovables();
	promoting = gameEnds = false;

	for (let i = P; i <= pK; i++) {
		pieceImages[i].resize(blockSize - 10, blockSize - 10);
	}

	noLoop();
}
draw = () => {
	clear();

	fill('green');
	noStroke();
	rect(halfScreen, 1.5 * blockSize, screenSize + 2, blockSize);
	rect(halfScreen, 7.5 * blockSize, screenSize + 2, blockSize);
	showStocks(+P);
	showStocks(-P);

	for (let y = 0; y < 5; y++) {
		for (let x = 0; x < 5; x++) {
			push();
			translate((x + 0.5) * blockSize, (y + 2.5) * blockSize);
			fill((x === pieceX && y === pieceY) || movables[y][x] ?
				'forestgreen' :
				'goldenrod');
			stroke('black');
			rect(0, 0, blockSize, blockSize);

			const piece = board[y][x];
			if (piece !== 0) {
				rotate(PI * int(piece < 0));
				image(pieceImages[abs(piece)], 0, 0);
			}
			pop();
		}
	}

	noFill();
	square((pieceX + 0.5) * blockSize, (pieceY + 2.5) * blockSize, blockSize);

	showTurn();
}

mousePressed = () => {
	if (gameEnds || promoting) return;

	const r = floor(mouseX / blockSize);
	const c = floor(mouseY / blockSize) - 2;

	if ((turn === +P && c === 5) || (turn === -P && c === -1)) {
		stockIndex = (turn === +P ? r : abs(r - 4));
		if (stocks.get(turn)[stockOrder[stockIndex]] > 0) {
			putStock();
			redraw();
			push();
			noFill();
			stroke('blue');
			square((r + 0.5) * blockSize, (c + 2.5) * blockSize, blockSize * 0.8);
			pop();
		}
	}

	if (isOutOfRange(r, c)) {
		return;
	}

	if (board[c][r] !== 0 && pieceSign(r, c) === turn) {
		updateMovable(r, c);
	}

	if (movables[c][r]) {
		if (board[c][r] !== 0) {
			let type = pieceType(r, c);
			if (type >= pP && type <= pB) {
				type -= 5;
			}

			stocks.get(turn)[type]++;
		}

		if (!isOutOfRange(pieceX, pieceY) && board[pieceY][pieceX] !== 0) {
			if (pieceType(pieceX, pieceY) <= B &&
				((turn === +P && c === 0) || (turn === -P && c === 4))) {
				promoting = true;
				promoX = r;
				promoY = c;
			}
		}

		gameEnds = pieceType(r, c) >= K;
		initMovables();

		if (isOutOfRange(pieceX, pieceY)) {
			const piece = turn * stockOrder[stockIndex];
			board[c][r] = piece;
			stocks.get(turn)[abs(piece)]--;
		} else {
			board[c][r] = board[pieceY][pieceX];
			board[pieceY][pieceX] = 0;
			pieceX = pieceY = 10;
		}

		const piece = board[c][r];
		if ((piece === +P && c === 0) ||
			(piece === -P && c === 4)) {
			promote(r, c, turn);
			promoting = false;
		}

		if (!gameEnds && !promoting) {
			turn = -turn;
		}
	}

	redraw();

	if (!gameEnds && promoting) {
		turn = -turn;
		askPromote();
	}
}