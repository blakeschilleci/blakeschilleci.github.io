
document.addEventListener('DOMContentLoaded', function() {
    const gameContainer = document.querySelector('.game-container');
    const restartBtn = document.getElementById('restart-btn');
    const scoreDisplay = document.getElementById('score');
    const highScoreDisplay = document.getElementById('high-score');
    
    // Create the canvas element for the game
    let canvas, ctx, bird, pipes, gameRunning, score, highScore, gravity, speed, gap, gameStarted;
    
    function setupGame() {
        // Create canvas element
        canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 480;
        canvas.style.display = 'block';
        canvas.style.margin = '0 auto';
        canvas.style.backgroundColor = 'var(--card-bg)';
        canvas.style.boxShadow = 'var(--card-shadow)';
        canvas.style.borderRadius = '10px';
        
        // Append canvas to game container
        const gameArea = document.querySelector('.memory-game');
        gameArea.innerHTML = '';
        gameArea.appendChild(canvas);
        
        // Get canvas context
        ctx = canvas.getContext('2d');
        
        // Initialize game variables
        bird = {
            x: 80,
            y: 240,
            width: 30,
            height: 24,
            gravity: 0.5,
            velocity: 0,
            jump: -10
        };
        
        pipes = [];
        score = 0;
        highScore = localStorage.getItem('flappyHighScore') || 0;
        gameRunning = false;
        gameStarted = false;
        gravity = 0.5;
        speed = 2;
        gap = 120;
        
        // Update display
        scoreDisplay.textContent = score;
        highScoreDisplay.textContent = highScore;
        
        // Draw initial screen
        drawInitialScreen();
        
        // Event listeners
        canvas.addEventListener('click', handleCanvasClick);
        window.addEventListener('keydown', handleKeyDown);
    }
    
    function drawInitialScreen() {
        ctx.fillStyle = 'var(--primary-color)';
        ctx.font = '20px Poppins, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Click or press SPACE to Start', canvas.width / 2, canvas.height / 2);
        
        // Draw a little bird
        drawBird();
    }
    
    function startGame() {
        if (!gameStarted) {
            gameStarted = true;
            gameRunning = true;
            bird.velocity = 0;
            bird.y = 240;
            pipes = [];
            score = 0;
            scoreDisplay.textContent = score;
            
            // Create first pipe
            createPipe();
            
            // Start the game loop
            requestAnimationFrame(updateGame);
        }
    }
    
    function handleCanvasClick() {
        if (!gameStarted) {
            startGame();
        } else {
            flapBird();
        }
    }
    
    function handleKeyDown(e) {
        if (e.code === 'Space') {
            if (!gameStarted) {
                startGame();
            } else {
                flapBird();
            }
        }
    }
    
    function flapBird() {
        if (gameRunning) {
            bird.velocity = bird.jump;
        }
    }
    
    function createPipe() {
        const minHeight = 50;
        const maxHeight = canvas.height - gap - minHeight;
        const height = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
        
        const pipe = {
            x: canvas.width,
            y: 0,
            width: 50,
            height: height,
            passed: false
        };
        
        pipes.push(pipe);
    }
    
    function updateGame() {
        if (!gameRunning) return;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update bird position
        bird.velocity += gravity;
        bird.y += bird.velocity;
        
        // Check if bird hits the ground or ceiling
        if (bird.y + bird.height >= canvas.height || bird.y <= 0) {
            gameOver();
        }
        
        // Draw bird
        drawBird();
        
        // Update and draw pipes
        updatePipes();
        
        // Check for new pipe creation
        if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 180) {
            createPipe();
        }
        
        // Continue the game loop
        if (gameRunning) {
            requestAnimationFrame(updateGame);
        }
    }
    
    function drawBird() {
        ctx.save();
        ctx.fillStyle = 'var(--secondary-color)';
        ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
        
        // Draw wing
        ctx.fillStyle = 'var(--primary-color)';
        ctx.fillRect(bird.x, bird.y + 8, 10, 8);
        
        // Draw eye
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(bird.x + 22, bird.y + 8, 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(bird.x + 24, bird.y + 8, 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    function updatePipes() {
        // Filter out pipes that have gone off screen
        pipes = pipes.filter(pipe => pipe.x + pipe.width > 0);
        
        for (let i = 0; i < pipes.length; i++) {
            pipes[i].x -= speed;
            
            // Draw top pipe
            ctx.fillStyle = 'var(--primary-color)';
            ctx.fillRect(pipes[i].x, pipes[i].y, pipes[i].width, pipes[i].height);
            
            // Draw bottom pipe
            ctx.fillRect(
                pipes[i].x,
                pipes[i].height + gap,
                pipes[i].width,
                canvas.height - (pipes[i].height + gap)
            );
            
            // Check for collision
            if (
                bird.x + bird.width > pipes[i].x &&
                bird.x < pipes[i].x + pipes[i].width &&
                (bird.y < pipes[i].height || bird.y + bird.height > pipes[i].height + gap)
            ) {
                gameOver();
                break;
            }
            
            // Check if bird passed the pipe
            if (!pipes[i].passed && bird.x > pipes[i].x + pipes[i].width) {
                pipes[i].passed = true;
                score++;
                scoreDisplay.textContent = score;
                
                // Create a small visual effect when scoring
                createScoreEffect();
            }
        }
    }
    
    function createScoreEffect() {
        // Flash effect for score
        scoreDisplay.style.transform = 'scale(1.3)';
        setTimeout(() => {
            scoreDisplay.style.transform = 'scale(1)';
        }, 200);
    }
    
    function gameOver() {
        gameRunning = false;
        gameStarted = false;
        
        // Update high score if needed
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('flappyHighScore', highScore);
            highScoreDisplay.textContent = highScore;
        }
        
        // Draw game over text
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'var(--secondary-color)';
        ctx.font = 'bold 30px Poppins, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 50);
        
        ctx.fillStyle = 'white';
        ctx.font = '16px Poppins, sans-serif';
        ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2);
        ctx.fillText('Click or press SPACE to restart', canvas.width / 2, canvas.height / 2 + 40);
    }
    
    // Event listener for restart button
    if (restartBtn) {
        restartBtn.addEventListener('click', function() {
            setupGame();
        });
    }
    
    // Initialize the game
    setupGame();
});
