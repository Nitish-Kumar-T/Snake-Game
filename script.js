console.log("Script loaded");

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const difficultySelect = document.getElementById('difficultySelect');
const finalScoreElement = document.getElementById('finalScore');
const highScoreElement = document.getElementById('highScore');

const gridSize = 20;
let tileCount;
let snake, food, powerUp, obstacles, dx, dy, score, highScore, gameSpeed, gameLoop;

const difficulties = {
    easy: 150,
    medium: 100,
    hard: 50
};

const powerUpTypes = ['speed', 'grow', 'invincible'];

function resizeCanvas() {
    const container = document.getElementById('gameContainer');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    tileCount = Math.floor(canvas.width / gridSize);
}

function initGame() {
    snake = [{ x: Math.floor(tileCount / 2), y: Math.floor(tileCount / 2) }];
    food = generateFood();
    powerUp = null;
    obstacles = generateObstacles();
    dx = 0;
    dy = 0;
    score = 0;
    gameSpeed = difficulties[difficultySelect.value];
}

function startGame() {
    console.log("Starting game");
    resizeCanvas();
    initGame();
    startScreen.style.display = 'none';
    gameLoop = setInterval(drawGame, gameSpeed);
}

function gameOver() {
    clearInterval(gameLoop);
    updateHighScore();
    finalScoreElement.textContent = `Final Score: ${score}`;
    highScoreElement.textContent = `High Score: ${highScore}`;
    gameOverScreen.style.display = 'flex';
}

function restartGame() {
    console.log("Restart button clicked");
    gameOverScreen.style.display = 'none';
    startGame();
}

function drawGame() {
    clearCanvas();
    moveSnake();
    drawObstacles();
    drawSnake();
    drawFood();
    if (powerUp) drawPowerUp();
    checkCollision();
    drawScore();
}

function clearCanvas() {
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score++;
        food = generateFood();
        if (Math.random() < 0.1) powerUp = generatePowerUp();
    } else {
        snake.pop();
    }

    if (powerUp && head.x === powerUp.x && head.y === powerUp.y) {
        applyPowerUp(powerUp.type);
        powerUp = null;
    }
}

function drawSnake() {
    ctx.fillStyle = 'green';
    snake.forEach((segment, index) => {
        const x = segment.x * gridSize;
        const y = segment.y * gridSize;
        const size = gridSize - 2;
        const radius = size / 2;

        ctx.beginPath();
        ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2);
        ctx.fill();

        if (index === 0) {
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(x + radius + dx * 5, y + radius + dy * 5, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

function drawFood() {
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, gridSize / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
}

function drawPowerUp() {
    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    ctx.arc(powerUp.x * gridSize + gridSize / 2, powerUp.y * gridSize + gridSize / 2, gridSize / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
}

function drawObstacles() {
    ctx.fillStyle = 'gray';
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x * gridSize, obstacle.y * gridSize, gridSize, gridSize);
    });
}

function generateFood() {
    return generateRandomPosition();
}

function generatePowerUp() {
    return {
        ...generateRandomPosition(),
        type: powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)]
    };
}

function generateObstacles() {
    const obstacleCount = Math.floor(tileCount / 5);
    const obstacles = [];
    for (let i = 0; i < obstacleCount; i++) {
        obstacles.push(generateRandomPosition());
    }
    return obstacles;
}

function generateRandomPosition() {
    let position;
    do {
        position = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
    } while (
        snake.some(segment => segment.x === position.x && segment.y === position.y) ||
        obstacles.some(obstacle => obstacle.x === position.x && obstacle.y === position.y) ||
        (food && food.x === position.x && food.y === position.y) ||
        (powerUp && powerUp.x === position.x && powerUp.y === position.y)
    );
    return position;
}

function applyPowerUp(type) {
    switch (type) {
        case 'speed':
            clearInterval(gameLoop);
            gameLoop = setInterval(drawGame, gameSpeed * 0.5);
            setTimeout(() => {
                clearInterval(gameLoop);
                gameLoop = setInterval(drawGame, gameSpeed);
            }, 5000);
            break;
        case 'grow':
            for (let i = 0; i < 3; i++) {
                snake.push({ ...snake[snake.length - 1] });
            }
            break;
        case 'invincible':
            // Implement invincibility logic
            break;
    }
}

function checkCollision() {
    const head = snake[0];

    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
    }

    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
        }
    }

    obstacles.forEach(obstacle => {
        if (head.x === obstacle.x && head.y === obstacle.y) {
            gameOver();
        }
    });
}

function drawScore() {
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
}

function updateHighScore() {
    highScore = Math.max(score, parseInt(localStorage.getItem('snakeHighScore') || 0));
    localStorage.setItem('snakeHighScore', highScore);
}

document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp':
            if (dy === 0) { dx = 0; dy = -1; }
            break;
        case 'ArrowDown':
            if (dy === 0) { dx = 0; dy = 1; }
            break;
        case 'ArrowLeft':
            if (dx === 0) { dx = -1; dy = 0; }
            break;
        case 'ArrowRight':
            if (dx === 0) { dx = 1; dy = 0; }
            break;
    }
});

startButton.addEventListener('click', () => {
    console.log("Start button clicked");
    startGame();
});
restartButton.addEventListener('click', () => {
    console.log("Restart button clicked");
    restartGame();
});

window.addEventListener('resize', resizeCanvas);

// Initialize high score
highScore = parseInt(localStorage.getItem('snakeHighScore') || 0);
console.log("Event listeners added");
