const screenSize = Math.min(window.innerWidth, window.innerHeight, 720);

const colorPalettes = ['blue', 'yellow', 'pink', 'red', 'green'];

let frame;
let score;
let blockFreq;
let gameEnds;

let blocks;
let palette;

setup = () => {
	createCanvas(screenSize, screenSize);

	gameInit();
}

function gameInit() {
	frame = 0;
	score = 0;
	blockFreq = 10;
	gameEnds = false;

	blocks = [];
	blocks.push(new Block());
	palette = new Palette();
}

function draw() {
	if (!gameEnds) frame++;
	clear();
	fill('black');
	noStroke();
	square(0, 0, screenSize);
	scale(screenSize / 720);

	if (blocks[0].isDead()) {
		if (palette.isMatching(blocks[0].type, blocks[0].x)) {
			blocks.splice(0, 1);
			score++;
			if (score % 10 === 0) {
				blockFreq--;
			}
		} else {
			gameEnds = true;
		}
	}

	showScore();

	if (frame % (blockFreq * 10) === 0) {
		blocks.push(new Block());
	}
	for (let i = 0; i < blocks.length; i++) {
		blocks[i].update();
		blocks[i].draw();
	}

	palette.draw();

	if (gameEnds || score >= 100) {
		showResult();
	}
}

function keyPressed() {
	palette.update(keyCode);

	if (key === ' ') gameInit();
}

function showScore() {
	noFill();
	stroke('aqua');
	strokeWeight(2.5);
	arc(360, 360, 125, 125, -PI / 2, PI / 5 * score - PI / 2);
	fill('aqua');
	noStroke();
	textSize(36);
	textAlign(CENTER, CENTER);
	text(nf(score, 2), 360, 360);
}

function showResult() {
	background(0, 192);
	textAlign(CENTER, CENTER);
	fill('aqua');
	noStroke();
	textSize(65);
	text(score >= 100 ? "Perfect!!!" : "Try again!", 360, 310);
	textSize(45);
	text(`Result: ${score}`, 360, 410);
}

class Block {
	constructor() {
		this.type = int(random(5));
		this.x = int(random(5));
		this.y = 0;
		this.vel = 24;
	}

	isDead() {
		return (this.y >= 696);
	}

	update() {
		if (frame % blockFreq === 0) {
			this.y += 24;
		}
	}

	draw() {
		fill(colorPalettes[this.type]);
		noStroke();
		rect(this.x * 144, this.y, 144, 24);
	}
}

class Palette {
	constructor() {
		this.order = [0, 1, 2, 3, 4];
	}

	isMatching(type, idx) {
		return (type === this.order[idx]);
	}

	update(dir) {
		if (dir !== LEFT_ARROW && dir !== RIGHT_ARROW) return;
		else if (dir === LEFT_ARROW) {
			const tmp = this.order[0];
			for (let i = 0; i < 4; i++) {
				this.order[i] = this.order[i + 1];
			}
			this.order[4] = tmp;
		} else {
			const tmp = this.order[4];
			for (let i = 4; i > 0; i--) {
				this.order[i] = this.order[i - 1];
			}
			this.order[0] = tmp;
		}
	}

	draw() {
		noStroke();
		for (let i = 0; i < 5; i++) {
			fill(colorPalettes[this.order[i]]);
			rect(144 * i, 696, 144, 24);
		}
	}
}