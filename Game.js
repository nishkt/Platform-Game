/*
Description: Game.js, this script contains all the javascript required for the game to work on the JS_game html page.
New levels can be added by:
- Adding an extra array of objects in LEVEL_ENEMIES
- Adding an extra object to the array LEVEL_PLAYER_CHARACTERS
- Adding an extra object to the array LEVEL_CLOUDS
- Making a new background or copying an existing one and incrementing the number by 1
Author: Open Source - Contributor list can be seen in GitHub
*/


const userKeys = {
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    W: 87,
    A: 65,
    D: 68,
    SPACE: 32,
    P: 80,
    M: 77
};

const LEVEL_COMPLETION_TIME = 3000;

const LEVEL_ENEMIES = [
	[{
		name: "enemy2",
		x: 80,
		y: 60,
		y2: 200
	}, {
		name: "zombie",
		x: 40,
		y: 50,
		y2: 200
	}],
	[{
		name: "enemy2",
		x: 80,
		y: 60,
		y2: 200
	}, {
		name: "bad_guy",
		x: 60,
		y: 50,
		y2: 200
	}],
	[{
		name: "enemy2",
		x: 80,
		y: 60,
		y2: 200
	}, {
		name: "skull_baddie",
		x: 60,
		y: 50,
		y2: 200
	}],
	[{
		name: "enemy2",
		x: 80,
		y: 60,
		y2: 200
	}, {
		name: "newchar",
		x: 120,
		y: 120,
		y2: 170
	}],
	[{
		name: "enemy2",
		x: 80,
		y: 60,
		y2: 200
	}, {
		name: "newchar",
		x: 120,
		y: 120,
		y2: 170
	}, {
		name: "sword",
		x: 80,
		y: 14,
		y2: 170
	}, {
		name: "enemyGuy",
		x: 80,
		y: 73,
		y2: 190
	}]
];

const LEVEL_PLAYER_CHARACTERS = [{
	name: "good_guy",
	x2: 100,
	y2: 120
}, {
	name: "good_girl",
	x2: 100,
	y2: 120
}, {
	name: "good_girl",
	x2: 100,
	y2: 120
}, {
	name: "good_guy",
	x2: 100,
	y2: 120
}, {
	name: "ninja",
	x2: 450,
	y2: 120
}]

const LEVEL_CLOUDS = [{
	name: "cloud",
	x: 60,
	y: 34
}, {
	name: "cloud2",
	x: 65,
	y: 50
}, {
	name: "cloud3",
	x: 60,
	y: 40
}, {
	name: "cloud3",
	x: 60,
	y: 40
}, {
	name: "cloud3",
	x: 60,
	y: 40
}]
//END CONFIG

//flag to take care of y axis cordinate increase or decrease
//z to set a interval at which flag is changed
var flag = 1;
var z = 0;
// Add state to check if user is playing, complete or game-over
var state = 'instructions';

var currentLevel = 1;
var collectedCoins = 0;
var timeLeft = 30;
var score = 0;
var playerCharacter;
var background;
var background2;
var backgroundDx = 0;
var xPos = -5;
var scoreBoard;
var coinScoreBoard;

var startArrow1;
var startArrow2;
var startArrow3;
var switchArrow = 0;

var timeBoard;
var levelDisplay;
var enemyCharacters = [];
var coins = [];
var clouds = [];
var rotationCmp = 0;
var keysPressed = {
	LEFT: false,
	UP: false,
	RIGHT: false,
	P: false,
	M: false,
	W: false,
	A: false,
	D: false
};
var gamePaused = false;
let musicMuted = false;
let musicToggled = false; //this is just for muting music when game paused
let dir; // which way character faces. 1 is right, -1 is left

function KeyDown(event) {
	//avoid auto-repeated keydown event
	if (event.repeat) {
		return;
	}

	var key;
	key = event.which;
	console.log("key: " + key);
	keysPressed[key] = true;

	if ((keysPressed[userKeys.LEFT] || keysPressed[userKeys.A]) && playerCharacter.leftCooldown == false) {
		moveLeft();
                playerCharacter.leftCooldown = true;
	}
	if ((keysPressed[userKeys.RIGHT] || keysPressed[userKeys.D]) && playerCharacter.rightCooldown == false) {
		moveRight();
                playerCharacter.rightCooldown = true;
	}
	if ((keysPressed[userKeys.UP] || keysPressed[userKeys.W]) && playerCharacter.hitGround) {
            if(playerCharacter.jumpCooldown == false){
                    moveUp();
            }
	}
	if (keysPressed[userKeys.SPACE]) {
		restartGame();
	}
	if (keysPressed[userKeys.P]) {
		keysPressed[userKeys.P] = false;
		pauseGame();
	}

	if (keysPressed[userKeys.M]) {
		keysPressed[userKeys.M] = false;
		muteMusic();
	}
}

// Toggle music at 'M' key press
function muteMusic() {
	musicMuted = !musicMuted;
	var imgButton = document.getElementById("audioButton");
	if (musicMuted) {
		imgButton.src = "Pictures/audioOff.png";
		if (!gamePaused) { //If the game is running, just turn the audio off
			audio.pause();
		} else { //Otherwise, we need to change our musicToggled variable, so that the audio resumes properly with the game
			musicToggled = false;
		}
	} else {
		imgButton.src = "Pictures/audioOn.png";
		if (!gamePaused) {
			audio.load();
		} else {
			musicToggled = true;
		}
	}
}

function pauseGame() {
	gamePaused = !gamePaused;
}

function KeyUp(event) {
	var key;
	key = event.which;
	keysPressed[key] = false;
	switch (key) {
		case userKeys.UP:
		case userKeys.W:
			playerCharacter.speedY += playerCharacter.gravity;
                        playerCharacter.jumpCooldown = false;
			break;
		case userKeys.LEFT:
		case userKeys.A:
			if (keysPressed[userKeys.RIGHT]||keysPressed[userKeys.D]) {
				moveRight();
			} else {
				playerCharacter.speedX = 0;
			}
                        playerCharacter.leftCooldown = false;
			break;
		case userKeys.RIGHT:
		case userKeys.D:
			if (keysPressed[userKeys.LEFT]||keysPressed[userKeys.A]) {
				moveLeft();
			} else {
				playerCharacter.speedX = 0;
			}
                        playerCharacter.rightCooldown = false;
	}
  backgroundDx = 0;
}


function showInstructions(){
	gameArea.init();
	//background
	background = new component();
  background.init(900, 400, "Pictures/background_1.jpg", 0, 0, "image", 1, true);
	var modal = document.getElementById('instructionsModal');
	modal.style.display = "block";
}

function initialize_game() {
	currentLevel = 1;
	collectedCoins = 0;
        score = 0;

	audio = document.getElementById("bgm");
	audio.autoplay = true;
	audio.loop = true;

	if (!musicMuted) {
		audio.load();
	}

	//generating coins at random positions
	for (var i = 0; i < 100; i++) {
		var coinWidth = 40;
		var x = Math.floor((Math.random() * gameArea.canvas.width) + i * gameArea.canvas.width / 2);
		var y = Math.floor(Math.random() * 150 + 30); //150 is canvas height - baseline(150) - char height - 30 (space on top)

		coins[i] = new component();
		coins[i].init(coinWidth, coinWidth, "Pictures/coin.png", x, y, "image", 1);
	}

	startLevel(1);
}

function startLevel(levelNumber) {
	//to synchronize the start coordinates of enemy characters
	flag = 1;
	z = 0;
	dir = 1; //face in right direction
  xPos = -5;

	//player character
	playerCharacter = new component();
	let char = LEVEL_PLAYER_CHARACTERS[levelNumber - 1];
	playerCharacter.init(60, 70, `Pictures/${char.name}.png`, char.x2, char.y2, "image", 1, undefined, char.name);

        playerCharacter.jumpCooldown = false; //These cooldowns let our system know whether a certain key has recently been
        playerCharacter.leftCooldown = false; //pressed--"false" means that the key is not on cooldown and should be
        playerCharacter.rightCooldown = false;//acknowledged normally.
  
	//background
	background = new component();
  background2 = new component();
	background.init(900, 400, `Pictures/background_${levelNumber}.jpg`, -50, 0, "image", 1);
  background2.init(900, 400, `Pictures/background_${levelNumber}_reverse.jpg`,850, 0, "image", 1);

	//score
	scoreBoard = new component();
	scoreBoard.init("30px", "Consolas", "black", 20, 40, "text", 1);

	//collected Coins
	coinScoreBoard = new component();
	coinScoreBoard.init("30px", "Consolas", "black", 240, 40, "text", 1);

  //startArrow
  startArrow1 = new component();
  startArrow2 = new component();
  startArrow3 = new component();

  startArrow1.init(90,70,"Pictures/blackArrow.png",60,125,"image",1);
  startArrow2.init(90,70,"Pictures/blackArrow.png",30,125,"image",1);
  startArrow3.init(90,70,"Pictures/blackArrow.png",0,125,"image",1);

  //current time left in the given level
  timeBoard = new component ();
  timeBoard.init("30px", "Consolas", "black", 410, 40, "text", 1);

	//current level display
	levelDisplay = new component();
	levelDisplay.init("30px", "Consolas", "black", 620, 40, "text", 1);

	//loop for creating new enemy characters setting a random x coordinate for each
	for (var i = 0; i < 100; i++) {
		enemyCharacters[i] = new component();

		var x = Math.floor((Math.random() * (1400 + i * 500)) + (500 * i + 900));

		//enemyType is the type of enemy: flying (0), walking (1), rotating (2), entering from the left (3)..
		//when you want to add a new type of enemy, increment the number inside the Math.random and
		//insert in the correct case the enemy
		var enemyType = Math.floor(Math.random() * (LEVEL_ENEMIES[levelNumber - 1].length));

		let enemy = LEVEL_ENEMIES[levelNumber - 1][enemyType];
		if (enemy.name === "enemyGuy") {
			//in this case the x value is calculate as the clouds
			x = Math.floor((Math.random() * (900 - i * 300) + 1));
		}
		enemyCharacters[i].init(enemy.x, enemy.y, `Pictures/${enemy.name}.png`, x, enemy.y2, "image", enemyType);

	}

	//loop for creating new clouds setting a random x coordinate for each
	for (var i = 0; i < 100; i++) {
		var x = Math.floor((Math.random() * (900 - i * 300) + 1));
		clouds[i] = new component();

		let cloud = LEVEL_CLOUDS[levelNumber - 1];
		clouds[i].init(cloud.x, cloud.y, `Pictures/${cloud.name}.png`, x, 40, "image", 1);
	}

	//call start function
	gameArea.init();
	gameArea.start();
}

/**
 * @type {{canvas: Element, start: gameArea.start, clear: gameArea.clear, stop: gameArea.stop}}
 */
var gameArea = {
	init: function() {
		this.canvas = document.getElementById("canvas");

		this.canvas.width = 900;
		this.canvas.height = 400;
		this.context = this.canvas.getContext("2d");

		document.body.insertBefore(this.canvas, document.body.childNodes[0]);
		this.time = 0;
		this.bonusActiveTime = 0;
		this.coinScoreActiveTime = 0;
		this.coinScoreInterval = null;

	},

	start: function() {
		this.frameNo = 0;
		this.time = 0;
		// hide modals
		var modals = document.getElementsByClassName('modal');
		for (var i = 0; i < modals.length; i++) {
			var modal = modals[i];

			modal.style.display = "none";
		}

		//update interval
		this.interval = setInterval(updateGameArea, 20);
	},

	//function used for refreshing page
	clear: function() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	},

	//function used for stopping the game
	stop: function() {
		clearInterval(this.interval);
	}
};

function component() {
	this.init = function(width, height, color, x, y, type, h, initialShow = false, charName = undefined) {
		//h to test if it is enemy 1 or 2
		this.h = h;
		this.alive = true;
		this.alive = true;

		this.color = color;
		//test if component is image
		this.type = type;

		this.ctx = gameArea.context;

		if (type === "image") {
			this.image = new Image();
			this.image.src = this.color;
			this.image.width = width;
			this.image.height = height;

			if (charName) {
				this.imageMirror = new Image();
				this.imageMirror.src = `Pictures/${charName}_left.png`;
				this.imageMirror.width = width;
				this.imageMirror.height = height;
			}

			if (initialShow) {
				var imgCopy = this.image;
				var ctxCopy = this.ctx;
				this.image.onload = function() {
					ctxCopy.drawImage(imgCopy, this.x, this.y, this.width, this.height);
				}
			}
		}

		this.width = width;
		this.initHeight = height; // to get squeezed height later
		this.alpha = 1;
		this.height = height;

		//change components position
		this.speedX = 0;
		this.speedY = 0;
		this.x = x;
		this.y = y;
    this.orignX = x;
		this.gravity = 1.5;
		//indicates if the character is on the ground or not
		this.hitGround = true;
		this.doubleJumpAllowed = true;
		//angle
		this.angle = 0;
	}

	//function to decide to decide what to display on screen, text, image or fill color
	this.update = function(callback) {
		if (this.type === "image") {
			this.ctx.globalAlpha = this.alpha;
			if (this.angle != 0) {
				this.ctx.save();
				this.ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
				this.ctx.rotate(this.angle);
				this.ctx.translate(-this.x - this.width / 2, -this.y - this.height / 2);
				this.ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
				this.ctx.restore();
			} else {
				this.ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
			}
		} else if (this.type === "text") {
			this.ctx.font = this.width + " " + this.height;
			this.ctx.fillStyle = this.color;
			this.ctx.fillText(this.text, this.x, this.y);
		} else {
			this.ctx.fillStyle = color;
			this.ctx.fillRect(this.x, this.y, this.width, this.height);
		}
	};
  this.moveBackgrounds = function(background2){
    if(0 <= xPos){
        xPos += backgroundDx;
        this.x -= backgroundDx;
        background2.x -= backgroundDx;
    }else{
      backgroundDx = 0;
    }
		if(this.x <= -900){this.x = 900;}
    else if(background2.x <= -900){background2.x = 900;}
		else if(900 <= this.x){this.x = -900;}
    else if(900 <= background2.x){background2.x = -900;}
    else if(900 < Math.abs(this.x)+Math.abs(background2.x)){
      if(Math.abs(background2.x) < Math.abs(this.x)){
        this.x += (0 < this.x)?-5:5;
      }else{
        background2.x += (0 < background2.x)?-5:5;
      }
    }
	}
	//enemy character collision function
	this.crashWith = function(otherobj) {
		var left = this.x;
		var right = this.x + (this.width);
		var top = this.y;
		var bottom = this.y + (this.height);
		var otherleft = otherobj.x;
		var otherright = otherobj.x + (otherobj.width);
		var othertop = otherobj.y;
		var otherbottom = otherobj.y + (otherobj.height);
		var crash = true;
		if ((bottom < othertop + 10) ||
			(top > otherbottom - 20) ||
			(right < otherleft + 15) ||
			(left > otherright - 15)) {
			crash = false;
		}
		return crash;
	};

	this.jumpsOn = function(otherobj) {
		var bottomY = this.y + (this.height);
		var middleX = this.x + (this.width / 2);
		var otherleft = otherobj.x;
		var otherright = otherobj.x + (otherobj.width);
		var othertop = otherobj.y;
		var otherbottom = otherobj.y + (otherobj.height);
		var smoosh = false;
		if ((bottomY > othertop - 15) &&
			(bottomY < otherbottom - (otherobj.height - 10)) &&
			(middleX > otherleft) &&
			(middleX < otherright)) {
			smoosh = true;
			//When the player smooshes an enemy, we send them up
			moveUp("hit");
		}
		return smoosh;
	};

	//gravity property
	this.newPos = function() {
		this.y += this.speedY; //increment y position with his speed
		this.speedY += this.gravity; //increment the y speed with the gravity
		this.x += this.speedX;
		this.hitBottom();
		//console.log(`${this.x},${this.y}`);
	};

	//set floor on canvas
	this.hitBottom = function() {
		var rockbottom = gameArea.canvas.height - this.height - 150;
		if (this.y > rockbottom) {
			this.y = rockbottom;
			this.hitGround = true;
			this.doubleJumpAllowed = true;
		}
	}

	this.setAlive = function(alive) {
		this.alive = alive;
	}
	this.isAlive = function() {
		return this.alive;
	}
  this.setX = function(x){
    this.x = x;
  }
  this.getX = function(){
    return this.x;
  }
  this.getOrignX = function(){
    return this.orignX;
  }
	this.getImgSrc = function(){
		return this.image.src;
	}
	this.setSrc = function(src){
		this.image.src = src;
	}
	this.rotation = function(){
		rotationCmp++;
		if(rotationCmp < 1000){
			this.image.src = "Pictures/coin.png";
		}else if(rotationCmp < 2000){
			this.image.src = "Pictures/coin2.png";
		}else if(rotationCmp < 3000){
			this.image.src = "Pictures/coin4.png";
		}else if(rotationCmp < 4000){
			this.image.src = "Pictures/coin3.png";
			rotationCmp = 0;
		}
	}

	//check if there was a change in direction character is facing
	// newDir takes either -1 (left move) or 1 (right move)
	this.changeDir = function(newDir) {
		if (dir !== newDir) {
			[playerCharacter.image, playerCharacter.imageMirror] = [playerCharacter.imageMirror, playerCharacter.image];
			dir = newDir;
		}
	}

	this.coinDisappear = function(){
		this.y += -2;
		this.alpha -= 0.03;
		if(this.alpha < 0){
			this.alpha = 0;
		}
	}
}

function gameOver() {
	interval && clearInterval(interval);
	state = 'game-over';
	var modal = document.getElementById('gameOverModal');
	modal.style.display = "block";

	audio = document.getElementById("bgm");
	audio.pause();

	if (!musicMuted) {
		gameover = document.getElementById("gameover")
		gameover.autoplay = true;
		gameover.load();
	}
}

function restartGame() {
	gameArea.stop();
	initialize_game();
}

function gameComplete() {
	state = 'complete';
	var modal = document.getElementById('gameCompleteModal');
	modal.style.display = "block";
	gameArea.stop();

	if (!musicMuted) {
		audio = document.getElementById("bgm");
		audio.pause();
		gamewon = document.getElementById("gamewon")
		gamewon.autoplay = true;
		gamewon.load();
	}
}

//Adjust character to a valid position if it moves out of border
function correctCharacterPos() {
	if (playerCharacter.y < 0) {
		playerCharacter.speedY = 0;
		playerCharacter.y = 0;
	}
	if (playerCharacter.x < 0) {
		playerCharacter.speedX = 0;
		playerCharacter.x = 0;
	}
	if (playerCharacter.x > gameArea.canvas.width - playerCharacter.width) {
		playerCharacter.speedX = 0;
		playerCharacter.x = gameArea.canvas.width - playerCharacter.width;
	}
	if (playerCharacter.y > gameArea.canvas.height - playerCharacter.height) {
		playerCharacter.speedY = 0;
		playerCharacter.y = gameArea.canvas.height - playerCharacter.height;
	}
}

function startGameElements() {
	background.update();
}

function flashScore() {
	if (scoreBoard.color == "black") {
		scoreBoard.color = "white";
	} else {
		scoreBoard.color = "black";
	}

	if (gameArea.bonusActiveTime > 1200) {
		scoreBoard.color = "black";
		clearInterval(gameArea.bonusInterval);
	}
	gameArea.bonusActiveTime += 150;
}

function flashCoinScore() {
	if (coinScoreBoard.color === "black") {
		coinScoreBoard.color = "white";
	} else {
		coinScoreBoard.color = "black";
	};

	if (gameArea.coinScoreActiveTime > 1200) {
		coinScoreBoard.color = "black";
		clearInterval(gameArea.coinScoreInterval);
	};
	gameArea.coinScoreActiveTime += 150;
}


function flashStartArrow(){
  switchArrow++;
  if(switchArrow < 30){
    startArrow3.setSrc("Pictures/goldArrow.png");
    startArrow2.setSrc("Pictures/blackArrow.png");
    startArrow1.setSrc("Pictures/blackArrow.png");
  }else if(switchArrow < 60){
    startArrow3.setSrc("Pictures/blackArrow.png");
    startArrow2.setSrc("Pictures/goldArrow.png");
  }else if(switchArrow < 90){
    startArrow2.setSrc("Pictures/blackArrow.png");
    startArrow1.setSrc("Pictures/goldArrow.png");
  }else{
    switchArrow = 0;
  }
  startArrow1.setX(startArrow1.getOrignX()-xPos);
  startArrow2.setX(startArrow2.getOrignX()-xPos);
  startArrow3.setX(startArrow3.getOrignX()-xPos);
}

//Update game area for period defined in game area function, current 20th of a millisecond (50 times a second)
function updateGameArea() {
	//loop for enemy collision
	var pausemodal = document.getElementById('gamePauseModal');
	if (gamePaused) {
		pausemodal.style.display = "block";
		if (!musicMuted) { //Then mute music, and keep musicToggled on so that we know it's not muted for real
			audio.pause();
			musicToggled = true;
		}
		return;
	} else {
		pausemodal.style.display = "none";
		if (musicToggled) { //Then unmute the music, and cancel musicToggled so that this won't re-trigger
			audio.load();
			musicToggled = false;
		}
	}

	//when frame number reaches 3000 (point at which obstacles end) end level
	//check current level, if more than 5 (because there are five levels currently), show game complete modal
	if (gameArea.time >= LEVEL_COMPLETION_TIME) {
		gameArea.stop();
		currentLevel++;
		console.log(currentLevel);
		if (currentLevel > LEVEL_CLOUDS.length) gameComplete();
		else startLevel(currentLevel);
	}

	for (var i = 0; i < enemyCharacters.length; i++) {
		if (enemyCharacters[i].isAlive()) {
			if (playerCharacter.jumpsOn(enemyCharacters[i])) {
				enemyCharacters[i].setAlive(false);
				incrementScore(100*currentLevel);
				gameArea.bonusActiveTime = 0;
				gameArea.bonusInterval = setInterval(flashScore, 150);

			} else if (playerCharacter.crashWith(enemyCharacters[i])) {
        backgroundDx = 0;
        gameArea.stop();
				gameOver();
			}
		}
	}

	//loop for coin collision
	for (var i = 0; i < coins.length; i++) {
		if (coins[i].isAlive()){
			if (playerCharacter.crashWith(coins[i])){
				coins[i].setSrc("Pictures/stars.png");
				//increase collected coins counter
				collectedCoins++;
				incrementScore(50*currentLevel);
				coins[i].setAlive(false);
				//animate coin score board
				gameArea.coinScoreActiveTime = 0;
				gameArea.coinScoreInterval = setInterval(flashCoinScore, 150);
				coinpickup_audio=document.getElementById("coinpickup")
				coinpickup.autoplay = true;
				coinpickup.load();
			}else{
				coins[i].rotation();
			}
		}
	}
	//clear canvas before each update
	gameArea.clear();

	//update background
  background.moveBackgrounds(background2);
	background.update();
  background2.update();

	//score update
	scoreBoard.text = "SCORE: " + score;
	scoreBoard.update();

	//collected coins update
	coinScoreBoard.text = "COINS: " + collectedCoins;
	coinScoreBoard.update();

  //startArrow
  flashStartArrow();
  startArrow1.update();
  startArrow2.update();
  startArrow3.update();


  //Timer update
  timeBoard.text = "TIME: " + timeLeft;
  timeBoard.update();

	//increment frame number for timer
	incrementFrameNumber(2);
  incrementTime(2);

	//LevelDisplay update
	levelDisplay.text = "Level " + currentLevel;
	levelDisplay.update();

	//enemy update
	for (var i = 0; i < 100; i++) {
		enemyCharacters[i].update();
	}

	//coins update
	for (var i = 0; i < coins.length; i++) {
		coins[i].update();
	}

	//cloud update
	for (var i = 0; i < 100; i++) {
		clouds[i].x += 0.5 -backgroundDx;
		clouds[i].update();
	}

	//player character update
	playerCharacter.newPos();
	correctCharacterPos();
	playerCharacter.update();

	//if statement to reverse the flag so that the y cordinate of birds would be changed
	//z keeps the track and change flag after every 35 iteration
	if (z == 35) {
		flag = !flag;
		z = 0;
	}
	//z increased in every iteration
	z++;
	//loop to set speed of enemy characters
	for (var i = 0; i < enemyCharacters.length; i++) {
		if (enemyCharacters[i].isAlive()) {
			//check if level is 3 or greater
			//vary the speed of enemy characters if level is 3 or greater
			if (currentLevel >= 3 && enemyCharacters[i].h) {
				if (currentLevel === 5 && enemyCharacters[i].h === 3) {
					enemyCharacters[i].x -= -4+backgroundDx; //it enter from the left
				} else {
					enemyCharacters[i].x += -4-backgroundDx;
				}

			} else {
				enemyCharacters[i].x += -2-backgroundDx;
			}

			//if statement to check if y cordinate has to increase or decrease
			//should birds go up or down
			if (!enemyCharacters[i].h) {
				if (flag == 1) {
					enemyCharacters[i].y += -3;
				} else {
					enemyCharacters[i].y += +3;
				}
			}

			//if h===2 the enemy must rotate
			if (enemyCharacters[i].h === 2) {
				enemyCharacters[i].angle += 10 * Math.PI / 180;
			}

		} else { // if dead; enemy will be 'squeezed', fall to the ground and fade away. Feel free to improve by adding further animation.
			enemyCharacters[i].height = enemyCharacters[i].initHeight / 3;
      enemyCharacters[i].x -= backgroundDx;
      enemyCharacters[i].y += 10;
			enemyCharacters[i].alpha += -0.01;
			if (enemyCharacters[i].alpha < 0) {
				enemyCharacters[i].alpha = 0;
			}
			enemyCharacters[i].hitBottom();
		}
	}

	//loop to set speed of coin characters
	//if the coin is not alive and taken by player, make the coin disappear
	for (var i = 0; i < coins.length; i++) {
		if(coins[i].isAlive()){
			coins[i].x += -2-backgroundDx;
		}
		else{
			coins[i].coinDisappear();
		}
	}
}


function incrementFrameNumber(value) {
	gameArea.frameNo += value;
}

function incrementScore(value) {
	score += value;
}

function incrementTime(value) {//Both increments time and updates onscreen timer value
	gameArea.time += value;
        timeLeft = (LEVEL_COMPLETION_TIME - gameArea.time) / 100;
}

//Stops player character from constantly moving after button move pressed
function stopMove() {
	playerCharacter.speedX = 0;
	playerCharacter.speedY = 0;
	if (playerCharacter.y < 0) {
		playerCharacter.speedY = 0;
		playerCharacter.y = 0;
	}
	if (playerCharacter.x < 0) {
		playerCharacter.speedX = 0;
		playerCharacter.x = 0;
	}
	if (playerCharacter.x > gameArea.canvas.width - playerCharacter.width) {
		playerCharacter.speedX = 0;
		playerCharacter.x = gameArea.canvas.width - playerCharacter.width;
	}
}
function moveUp(state) {
	if(state == "hit"){
		playerCharacter.speedY = -5;
		playerCharacter.hitGround = false;
	}
	else if (playerCharacter.hitGround && playerCharacter.y >= 170){
		playerCharacter.speedY = -20;
		playerCharacter.hitGround = false;
                playerCharacter.jumpCooldown = true;
		if (!musicMuted) {
			jump.autoplay = true;
			jump.load();
		}
	}
	else if(playerCharacter.doubleJumpAllowed == true){ /* Currently doesn't do anything, since the initial UP/W 
     *      key logic won't allow for the moveUP function to be called. */
		playerCharacter.speedY = -7;
		playerCharacter.doubleJumpAllowed = false;
	}
}

function moveDown() {
	playerCharacter.speedY = 20;
}
function moveLeft() {
	playerCharacter.changeDir(-1);
	//playerCharacter.speedX = -5;
  backgroundDx = -5;
}

function moveRight(){
	playerCharacter.changeDir(1);
	//playerCharacter.speedX = 5;
  if(xPos <= -5){
    xPos = 0;
    background.setX(-50);
    background2.setX(850);
  }
  backgroundDx = 5;
}

var interval;

function moveLeftMouse() {
	interval = setInterval(moveLeft, 1);
  backgroundDx = -5;
}

function moveRightMouse() {
	interval = setInterval(moveRight, 1);
  if(xPos <= -5){
    xPos = 0;
    background.setX(-50);
    background2.setX(850);
  }
  backgroundDx = 5;

}
function onMouseUp() {
	clearInterval(interval);
	stopMove();
  backgroundDx = 0;
}
