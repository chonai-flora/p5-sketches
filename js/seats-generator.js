const screenSize = Math.min(window.innerWidth, window.innerHeight * 1.125, 720);
const	marginTop = (window.innerHeight / 1.1 - screenSize) / 2;
const	marginSide = (window.innerWidth - screenSize) / 2;

let button;
let inputs = [];

let rowCount, colCount;
let seatExists;
let seatNumber;
let seatCount;
let seatOrder;

const initSeats = () => {
	const p = int(inputs[1].value());
	const q = int(inputs[0].value());
	if (isNaN(p) || isNaN(q)) return;

	if (rowCount !== p || colCount !== q) {
		rowCount = p; colCount = q;
		seatExists = Array.from(new Array(colCount), () => new Array(rowCount).fill(true));
		seatExists[0][0] = false;
	}
	seatNumber = JSON.parse(JSON.stringify(seatExists));
	seatCount = 0;
	for (let i = 0; i < rowCount; i++) {
		for (let j = 0; j < colCount; j++) {
			seatCount += int(seatNumber[j][i]);
		}
	}
	seatOrder = [];
	for (let i = 1; i <= seatCount; i++) {
		seatOrder.push(i);
	}
	seatOrder = shuffle(seatOrder);
}

setup = () => {
	createCanvas(screenSize, screenSize * 1.125);
	textAlign(LEFT, TOP);

	button = createButton("作成");
	button.size(45, 25);
	button.position(marginSide + 110, marginTop * 1.05);
	button.mousePressed(initSeats);
	for (let i = 0; i < 2; i++) {
		inputs[i] = createInput("7");
		inputs[i].size(25, 25);
		inputs[i].position(marginSide + i * 60 + 5, marginTop);
	}

	rowCount = colCount = 0;
	initSeats();
	noLoop();
}

draw = () => {
	background('white');
	textSize(min(screenSize / rowCount, screenSize / colCount) / 2);

	let seatIndex = 0;
	for (let i = 0; i < rowCount; i++) {
		for (let j = 0; j < colCount; j++) {
			const x = screenSize / rowCount * i;
			const y = screenSize / colCount * j + screenSize / 12;
			fill(seatExists[j][i] ? 'white' : 'grey');
			rect(x, y, screenSize / rowCount, screenSize / colCount);
			if (seatNumber[j][i]) {
				fill('black');
				text(nf(seatOrder[seatIndex], 2), x, y);
				seatIndex++;
			}
		}
	}

	fill('black');
	textSize(screenSize / 45);
	text("x", 45, screenSize / 70);
	text("半角数字のみを入力してください", 5, screenSize / 20);
	text("席をクリックして配置を調整してください", 5, screenSize * 1.1);
}

mouseClicked = () => {
	const p = floor(mouseX * rowCount / screenSize);
	const q = floor((mouseY - screenSize / 12) * colCount / screenSize);
	if (p >= 0 && p < rowCount && q >= 0 && q < colCount) {
		seatExists[q][p] = !seatExists[q][p];
	}
	redraw();
}