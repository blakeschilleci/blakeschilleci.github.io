
document.addEventListener('DOMContentLoaded', function() {
    const gameContainer = document.querySelector('.game-container');
    const restartBtn = document.getElementById('restart-btn');
    const scoreDisplay = document.getElementById('score');
    const highScoreDisplay = document.getElementById('high-score');
    
    // Create the canvas element for the game
    let canvas, ctx, plane, clouds, stars, gameRunning, score, highScore, gameStarted;
    
    function setupGame() {
        // Create canvas element
        canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 480;
        canvas.style.display = 'block';
        canvas.style.margin = '0 auto';
        canvas.style.backgroundColor = 'var(--accent-color)';
        canvas.style.boxShadow = 'var(--card-shadow)';
        canvas.style.borderRadius = '10px';
        
        // Append canvas to game container
        const gameArea = document.querySelector('.memory-game');
        gameArea.innerHTML = '';
        gameArea.appendChild(canvas);
        
        // Get canvas context
        ctx = canvas.getContext('2d');
        
        // Initialize game variables
        plane = {
            x: 60,
            y: 240,
            width: 60,
            height: 30,
            speed: 4
        };
        
        clouds = [];
        stars = [];
        score = 0;
        highScore = localStorage.getItem('flightSimHighScore') || 0;
        gameRunning = false;
        gameStarted = false;
        
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
        // Draw sky background
        drawBackground();
        
        ctx.fillStyle = 'white';
        ctx.font = '20px Poppins, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Click or press SPACE to Start', canvas.width / 2, canvas.height / 2);
        
        // Draw the plane
        drawPlane();
    }
    
    function drawBackground() {
        // Create a gradient sky
        const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        skyGradient.addColorStop(0, '#1a73e8');
        skyGradient.addColorStop(1, '#87ceeb');
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw mountains at the bottom
        ctx.fillStyle = '#3d7d41';
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);
        ctx.lineTo(0, canvas.height - 80);
        
        // Create bumpy mountain range
        for (let i = 0; i <= canvas.width; i += 30) {
            const height = Math.random() * 30 + 50;
            ctx.lineTo(i, canvas.height - height);
        }
        
        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();
        ctx.fill();
    }
    
    function startGame() {
        if (!gameStarted) {
            gameStarted = true;
            gameRunning = true;
            plane.y = 240;
            clouds = [];
            stars = [];
            score = 0;
            scoreDisplay.textContent = score;
            
            // Create initial clouds and stars
            for (let i = 0; i < 5; i++) {
                createCloud();
            }
            
            createStar();
            
            // Start the game loop
            requestAnimationFrame(updateGame);
        }
    }
    
    function handleCanvasClick() {
        if (!gameStarted) {
            startGame();
        } else {
            movePlaneUp();
        }
    }
    
    function handleKeyDown(e) {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
            if (!gameStarted) {
                startGame();
            } else {
                movePlaneUp();
            }
        } else if (e.code === 'ArrowDown') {
            movePlaneDown();
        }
    }
    
    function movePlaneUp() {
        if (gameRunning && plane.y > 30) {
            plane.y -= plane.speed * 2;
        }
    }
    
    function movePlaneDown() {
        if (gameRunning && plane.y < canvas.height - plane.height - 30) {
            plane.y += plane.speed * 2;
        }
    }
    
    function createCloud() {
        const cloud = {
            x: canvas.width + Math.random() * 200,
            y: Math.random() * (canvas.height / 2),
            width: Math.random() * 70 + 50,
            height: Math.random() * 30 + 20,
            speed: Math.random() * 1 + 0.5
        };
        
        clouds.push(cloud);
    }
    
    function createStar() {
        const star = {
            x: canvas.width + Math.random() * 200,
            y: Math.random() * (canvas.height - 100) + 50,
            radius: 10,
            speed: 2,
            collected: false
        };
        
        stars.push(star);
    }
    
    function updateGame() {
        if (!gameRunning) return;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background
        drawBackground();
        
        // Update and draw clouds
        updateClouds();
        
        // Update and draw stars
        updateStars();
        
        // Auto-float the plane gently down
        if (plane.y < canvas.height - plane.height - 30) {
            plane.y += 0.5;
        }
        
        // Draw plane
        drawPlane();
        
        // Check for new cloud creation
        if (clouds.length < 5) {
            createCloud();
        }
        
        // Check for new star creation
        if (stars.length < 2) {
            createStar();
        }
        
        // Continue the game loop
        if (gameRunning) {
            requestAnimationFrame(updateGame);
        }
    }
    
    function drawPlane() {
        ctx.save();
        
        // Plane body
        ctx.fillStyle = 'var(--secondary-color)';
        ctx.fillRect(plane.x, plane.y, plane.width, plane.height);
        
        // Plane tail
        ctx.fillStyle = 'var(--primary-color)';
        ctx.beginPath();
        ctx.moveTo(plane.x, plane.y);
        ctx.lineTo(plane.x - 15, plane.y - 10);
        ctx.lineTo(plane.x, plane.y + 10);
        ctx.fill();
        
        // Plane wings
        ctx.fillStyle = 'var(--primary-color)';
        ctx.beginPath();
        ctx.moveTo(plane.x + 20, plane.y);
        ctx.lineTo(plane.x + 30, plane.y - 15);
        ctx.lineTo(plane.x + 40, plane.y);
        ctx.fill();
        
        // Window
        ctx.fillStyle = 'white';
        ctx.fillRect(plane.x + 10, plane.y + 5, 15, 10);
        
        ctx.restore();
    }
    
    function updateClouds() {
        // Filter out clouds that have gone off screen
        clouds = clouds.filter(cloud => cloud.x + cloud.width > 0);
        
        for (let i = 0; i < clouds.length; i++) {
            clouds[i].x -= clouds[i].speed;
            
            // Draw cloud
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath();
            ctx.arc(clouds[i].x, clouds[i].y, clouds[i].height/2, 0, Math.PI * 2);
            ctx.arc(clouds[i].x + clouds[i].width/3, clouds[i].y - clouds[i].height/4, clouds[i].height/2, 0, Math.PI * 2);
            ctx.arc(clouds[i].x + clouds[i].width/1.5, clouds[i].y, clouds[i].height/2, 0, Math.PI * 2);
            ctx.arc(clouds[i].x + clouds[i].width/3, clouds[i].y + clouds[i].height/4, clouds[i].height/2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    function updateStars() {
        // Filter out stars that have gone off screen
        stars = stars.filter(star => star.x + star.radius > 0 && !star.collected);
        
        for (let i = 0; i < stars.length; i++) {
            stars[i].x -= stars[i].speed;
            
            // Draw star
            ctx.fillStyle = 'gold';
            drawStar(stars[i].x, stars[i].y, stars[i].radius);
            
            // Check if plane collected the star
            if (
                plane.x + plane.width > stars[i].x - stars[i].radius &&
                plane.x < stars[i].x + stars[i].radius &&
                plane.y + plane.height > stars[i].y - stars[i].radius &&
                plane.y < stars[i].y + stars[i].radius
            ) {
                stars[i].collected = true;
                score++;
                scoreDisplay.textContent = score;
                
                // Create a small visual effect when scoring
                createScoreEffect();
            }
        }
    }
    
    function drawStar(x, y, radius) {
        const spikes = 5;
        const outerRadius = radius;
        const innerRadius = radius / 2;
        
        ctx.beginPath();
        ctx.translate(x, y);
        ctx.moveTo(0, -outerRadius);
        
        for (let i = 0; i < spikes; i++) {
            ctx.rotate(Math.PI / spikes);
            ctx.lineTo(0, -innerRadius);
            ctx.rotate(Math.PI / spikes);
            ctx.lineTo(0, -outerRadius);
        }
        
        ctx.closePath();
        ctx.fill();
        ctx.resetTransform();
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
            localStorage.setItem('flightSimHighScore', highScore);
            highScoreDisplay.textContent = highScore;
        }
        
        // Draw game over text
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'var(--secondary-color)';
        ctx.font = 'bold 30px Poppins, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Flight Complete!', canvas.width / 2, canvas.height / 2 - 50);
        
        ctx.fillStyle = 'white';
        ctx.font = '16px Poppins, sans-serif';
        ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2);
        ctx.fillText('Click or press SPACE to fly again', canvas.width / 2, canvas.height / 2 + 40);
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
