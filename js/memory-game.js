const	screenSize = Math.min(window.innerWidth, window.innerHeight, 720);
const	halfScreen = screenSize / 2;
const	marginTop = screenSize * 0.1125;

let turn = +1;
let trumps = [];
let cardCount = 52;
let cardX = Number.NaN, cardY = Number.NaN;
let score = new Array(2).fill(0);

const toIndex = (r, c) => {
	return r % 13 + c * 13;
}

const toTrumpId = (r, c) => {
	return trumps[toIndex(r, c)].id;
}

const setHidden = (r, c, isHidden) => {
	return trumps[toIndex(r, c)].isHidden = isHidden;
}

const showScore = (role) => {
	push();
	const x = halfScreen * (10 * role + 1) / 6 + 16;
	const y = halfScreen * (11 - 10 * role) / 6;
	fill(role === 0 ? 'blue' : 'green');
	textSize(halfScreen / 8);
	text("🂠", x - halfScreen / 8, y);
	fill('black');
	textSize(halfScreen / 12);
	text(`×${nf(score[role], 2)}`, x, y);
	pop();
}

const showTurn = () => {
	push();
	textAlign(LEFT, CENTER);
	const gameEnds = cardCount <= 0;
	const message = (gameEnds ? "の勝利です" : "のターンです");
	const fillStatus = (gameEnds ? score[0] < score[1] : turn === 1);

	if (gameEnds && score[0] === score[1]) {
		textSize(half / 10);
		text("引き分けです", 2, -half / 12);
		pop();
		return;
	}
	fill(fillStatus ? 'green' : 'blue');
	textSize(halfScreen / 6);
	text("🂠", 2, -halfScreen / 12 + marginTop);
	fill('black');
	textSize(halfScreen / 10);
	text(message, halfScreen / 6 - 6, -halfScreen / 12 + marginTop);
	pop();
}

const setCards = () => {
	const ids = shuffle([...Array(cardCount).keys()]);
	for (let c = 0; c < 4; c++) {
		for (let r = 0; r <= 13; r++) {
			if (r === 11) continue;

			const m = r - int(r > 11);
			const n = ids[toIndex(m, c)];
			const id = floor(n % 13);
			const mark = floor(n / 13);
			trumps.push({
				mark: mark,
				id: id + 1,
				isHidden: true,
				card: String.fromCodePoint(0x01F0A1 + 16 * mark + id + int(id > 10)),
				x: screenSize / 13 * m + halfScreen / 13,
				y: screenSize / 8 * (c + m / 3 + 0.5) + marginTop
			});
		}
	}
}

setup = () => {
	createCanvas(screenSize, screenSize + marginTop);

	setCards();
	textSize(screenSize / 9);
	textAlign(CENTER, CENTER);
	noLoop();
}

draw = () => {
	background('white');
	showTurn();
	showScore(0);
	showScore(1);

	for (const trump of trumps) {
		push();
		const mark = trump.mark;
		const isHidden = trump.isHidden;
		fill((isHidden || mark < 1 || mark > 2) ? 'black' : 'red');
		if (trump['id'] > 0) {
			text(isHidden ? "🂠" : trump['card'], trump.x, trump.y);
		}
		pop();
	}
}

mouseClicked = () => {
	const p = floor(13 * mouseX / screenSize);
	const q = floor((12 * mouseY - p * halfScreen) / (3 * halfScreen)) - 1;

	if (p < 0 || p > 13 || q < 0 || q > 3) return;

	const trump = trumps[toIndex(p, q)];
	if (trump.id < 1) return;

	trump.isHidden = false;
	redraw();

	if (cardX < 0 && cardY < 0) {
		cardX = p; cardY = q;
	} else if (p !== cardX || q !== cardY) {
		const isMathcing = toTrumpId(p, q) === toTrumpId(cardX, cardY);
		if (isMathcing) {
			score[int(turn === 1)] += 2;
			cardCount -= 2;
			redraw();
			
			trumps[toIndex(p, q)].id = 0;
			trumps[toIndex(cardX, cardY)].id = 0;
		} else {
			turn = -turn;
			redraw();
		}
		
		setHidden(p, q, !isMathcing);
		setHidden(cardX, cardY, !isMathcing);
		cardX = cardY = Number.NaN;
	}
}