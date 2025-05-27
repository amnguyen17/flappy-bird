// Canvas and game variables
var canvas, ctx;
var canvasWidth = 360;
var canvasHeight = 640;

// Game images
var bgImage = new Image();
var birdImage = new Image();
var topPipeImage = new Image();
var bottomPipeImage = new Image();
var playBtnImage = new Image();
var logoImage = new Image();
var gameOverImage = new Image();

// Load all images
bgImage.src = "./flappybirdbg.png";
birdImage.src = "./flappybird.png";
topPipeImage.src = "./toppipe.png";
bottomPipeImage.src = "./bottompipe.png";
playBtnImage.src = "./flappyBirdPlayButton.png";
logoImage.src = "./flappyBirdLogo.png";
gameOverImage.src = "./flappy-gameover.png";

// Game states
var gameStates = {
    menu: "menu",
    playing: "playing",
    gameOver: "gameOver"
};
var gameState = gameStates.menu;

// Bird properties
var birdX = 50;
var birdY = canvasHeight / 2;
var birdWidth = 40;
var birdHeight = 30;
var birdVelocityY = 0;
var birdStartY = canvasHeight / 2;

// Pipe properties
var pipes = [];
var pipeSpeed = -2;
var pipeWidth = 50;
var pipeGap = 200;
var pipeTimer;

// Game mechanics
var gravityForce = 0.5;
var jumpStrength = -6;
var gameScore = 0;
var inputBlocked = false;

// UI elements
var playButtonX = canvasWidth / 2 - 115.5 / 2;
var playButtonY = canvasHeight / 2 - 64 / 2;
var playButtonWidth = 115;
var playButtonHeight = 64;

var logoX = canvasWidth / 2 - 300 / 2;
var logoY = canvasHeight / 4;
var logoWidth = 300;
var logoHeight = 100;

// Initialize game when page loads
window.onload = function() {
    setupCanvas();
    setupControls();
    startGameLoop();
};

function setupCanvas() {
    canvas = document.getElementById("board");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    ctx = canvas.getContext("2d");
}

function setupControls() {
    document.addEventListener("keydown", function(event) {
        handleKeyPress(event);
    });
}

function handleKeyPress(event) {
    if (inputBlocked) return;
    
    if (event.code === "Space") {
        if (gameState === gameStates.menu) {
            beginGame();
        } else if (gameState === gameStates.gameOver) {
            restartGame();
        } else if (gameState === gameStates.playing) {
            makeBirdJump();
        }
    }
}

function beginGame() {
    gameState = gameStates.playing;
    resetBird();
    clearPipes();
    gameScore = 0;
    startPipeGeneration();
}

function restartGame() {
    resetBird();
    clearPipes();
    gameScore = 0;
    gameState = gameStates.menu;
}

function resetBird() {
    birdY = birdStartY;
    birdVelocityY = 0;
}

function makeBirdJump() {
    birdVelocityY = jumpStrength;
}

function clearPipes() {
    pipes = [];
    if (pipeTimer) {
        clearInterval(pipeTimer);
    }
}

function startPipeGeneration() {
    if (pipeTimer) {
        clearInterval(pipeTimer);
    }
    pipeTimer = setInterval(generatePipes, 1500);
}

function generatePipes() {
    var maxTopPipeHeight = canvasHeight - pipeGap - 50;
    var topPipeHeight = Math.floor(Math.random() * maxTopPipeHeight);
    var bottomPipeY = topPipeHeight + pipeGap;
    var bottomPipeHeight = canvasHeight - bottomPipeY;

    var newTopPipe = {
        x: canvasWidth,
        y: 0,
        width: pipeWidth,
        height: topPipeHeight,
        image: topPipeImage,
        scored: false
    };

    var newBottomPipe = {
        x: canvasWidth,
        y: bottomPipeY,
        width: pipeWidth,
        height: bottomPipeHeight,
        image: bottomPipeImage,
        scored: false
    };

    pipes.push(newTopPipe);
    pipes.push(newBottomPipe);
}

function startGameLoop() {
    requestAnimationFrame(gameLoop);
}

function gameLoop() {
    clearCanvas();
    
    if (gameState === gameStates.menu) {
        drawMenuScreen();
    } else if (gameState === gameStates.playing) {
        updateGameplay();
        drawGameplay();
    } else if (gameState === gameStates.gameOver) {
        drawGameOverScreen();
    }
    
    requestAnimationFrame(gameLoop);
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawMenuScreen() {
    if (bgImage.complete) {
        ctx.drawImage(bgImage, 0, 0, canvasWidth, canvasHeight);
    }

    if (playBtnImage.complete) {
        ctx.drawImage(playBtnImage, playButtonX, playButtonY, playButtonWidth, playButtonHeight);
    }

    if (logoImage.complete) {
        var scaledWidth = logoWidth;
        var scaledHeight = (logoImage.height / logoImage.width) * scaledWidth;
        ctx.drawImage(logoImage, logoX, logoY, scaledWidth, scaledHeight);
    }
}

function updateGameplay() {
    updateBird();
    updatePipes();
    checkCollisions();
    removeOffscreenPipes();
}

function updateBird() {
    birdVelocityY += gravityForce;
    birdY = Math.max(birdY + birdVelocityY, 0);
    
    if (birdY > canvas.height) {
        endGame();
    }
}

function updatePipes() {
    for (var i = 0; i < pipes.length; i++) {
        var pipe = pipes[i];
        pipe.x += pipeSpeed;

        if (!pipe.scored && birdX > pipe.x + pipe.width) {
            gameScore += 0.5;
            pipe.scored = true;
        }
    }
}

function removeOffscreenPipes() {
    while (pipes.length > 0 && pipes[0].x < -pipeWidth) {
        pipes.shift();
    }
}

function checkCollisions() {
    for (var i = 0; i < pipes.length; i++) {
        if (isColliding(getBirdBounds(), pipes[i])) {
            endGame();
            break;
        }
    }
}

function getBirdBounds() {
    return {
        x: birdX,
        y: birdY,
        width: birdWidth,
        height: birdHeight
    };
}

function isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function endGame() {
    gameState = gameStates.gameOver;
    inputBlocked = true;
    setTimeout(function() {
        inputBlocked = false;
    }, 1000);
}

function drawGameplay() {
    ctx.drawImage(birdImage, birdX, birdY, birdWidth, birdHeight);

    for (var i = 0; i < pipes.length; i++) {
        var pipe = pipes[i];
        ctx.drawImage(pipe.image, pipe.x, pipe.y, pipe.width, pipe.height);
    }

    drawScore();
}

function drawScore() {
    ctx.fillStyle = "white";
    ctx.font = "45px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(gameScore, 5, 45);
}

function drawGameOverScreen() {
    if (gameOverImage.complete) {
        var imgWidth = 400;
        var imgHeight = 80;
        var x = (canvasWidth - imgWidth) / 2;
        var y = canvasHeight / 3;

        ctx.drawImage(gameOverImage, x, y, imgWidth, imgHeight);

        var scoreText = "Your score: " + Math.floor(gameScore);
        ctx.fillStyle = "white";
        ctx.font = "45px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(scoreText, canvasWidth / 2, y + imgHeight + 50);
    }
}