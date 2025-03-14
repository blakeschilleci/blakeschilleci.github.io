
document.addEventListener('DOMContentLoaded', function() {
    const gameContainer = document.querySelector('.game-container');
    const restartBtn = document.getElementById('restart-btn');
    const scoreDisplay = document.getElementById('score');
    const highScoreDisplay = document.getElementById('high-score');
    
    // Create the canvas element for the game
    let canvas, ctx, plane, terrain, clouds, stars, gameRunning, score, highScore, gameStarted;
    let cameraAngle = 0;
    let pitch = 0;
    let roll = 0;
    let altitude = 500;
    let speed = 5;
    
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
        terrain = generateTerrain();
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
    
    function generateTerrain() {
        const terrainPoints = [];
        const terrainSegments = 20;
        
        for (let i = 0; i < terrainSegments; i++) {
            terrainPoints.push({
                x: (i - terrainSegments/2) * 200,
                z: (i - terrainSegments/2) * 200,
                height: Math.random() * 200 - 100
            });
        }
        
        return terrainPoints;
    }
    
    function drawInitialScreen() {
        // Draw sky background
        drawBackground();
        
        ctx.fillStyle = 'white';
        ctx.font = '20px Poppins, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Click or press SPACE to Start', canvas.width / 2, canvas.height / 2);
        
        // Draw the plane
        drawPlane3D();
    }
    
    function drawBackground() {
        // Create a gradient sky
        const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        skyGradient.addColorStop(0, '#1a73e8');
        skyGradient.addColorStop(1, '#87ceeb');
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    function startGame() {
        if (!gameStarted) {
            gameStarted = true;
            gameRunning = true;
            altitude = 500;
            cameraAngle = 0;
            pitch = 0;
            roll = 0;
            clouds = [];
            stars = [];
            terrain = generateTerrain();
            score = 0;
            scoreDisplay.textContent = score;
            
            // Create initial clouds
            for (let i = 0; i < 10; i++) {
                createCloud();
            }
            
            for (let i = 0; i < 20; i++) {
                createStar();
            }
            
            // Start the game loop
            requestAnimationFrame(updateGame);
        }
    }
    
    function handleCanvasClick() {
        if (!gameStarted) {
            startGame();
        }
    }
    
    function handleKeyDown(e) {
        if (!gameStarted && e.code === 'Space') {
            startGame();
            return;
        }
        
        if (!gameRunning) return;
        
        switch(e.code) {
            case 'ArrowUp':
                pitch -= 0.05; // Pitch up
                break;
            case 'ArrowDown':
                pitch += 0.05; // Pitch down
                break;
            case 'ArrowLeft':
                roll -= 0.05; // Roll left
                cameraAngle -= 0.05;
                break;
            case 'ArrowRight':
                roll += 0.05; // Roll right
                cameraAngle += 0.05;
                break;
            case 'KeyW':
                speed += 0.5; // Increase speed
                break;
            case 'KeyS':
                speed -= 0.5; // Decrease speed
                break;
        }
        
        // Clamp values
        pitch = Math.max(-0.5, Math.min(0.5, pitch));
        roll = Math.max(-0.5, Math.min(0.5, roll));
        speed = Math.max(1, Math.min(10, speed));
    }
    
    function createCloud() {
        const z = Math.random() * 1000 + 500;
        const scale = 1000 / (z + 1);
        
        const cloud = {
            x: (Math.random() * 2000 - 1000),
            y: (Math.random() * 200 - 400),
            z: z,
            width: (Math.random() * 70 + 50) * scale,
            height: (Math.random() * 30 + 20) * scale,
            speed: Math.random() * 0.5 + 0.5
        };
        
        clouds.push(cloud);
    }
    
    function createStar() {
        const z = Math.random() * 500 + 800;
        
        const star = {
            x: (Math.random() * 2000 - 1000),
            y: (Math.random() * 300 - 500),
            z: z,
            radius: 2,
            collected: false
        };
        
        stars.push(star);
    }
    
    function updateGame() {
        if (!gameRunning) return;
        
        // Apply pitch to altitude
        altitude -= pitch * speed * 10;
        if (altitude < 50) {
            // Too low, game over
            gameOver("You crashed into the ground!");
            return;
        }
        
        // Increase score based on distance traveled
        score += Math.round(speed / 10);
        scoreDisplay.textContent = score;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background
        drawBackground();
        
        // Update and draw stars (for high altitude)
        if (altitude > 800) {
            updateStars();
        }
        
        // Draw horizon line based on pitch
        drawHorizon();
        
        // Draw 3D terrain
        drawTerrain();
        
        // Update and draw clouds
        updateClouds();
        
        // Draw plane
        drawPlane3D();
        
        // Draw HUD
        drawHUD();
        
        // Slowly return to level flight
        pitch *= 0.98;
        roll *= 0.98;
        
        // Check for new cloud creation
        if (Math.random() < 0.05 && clouds.length < 15) {
            createCloud();
        }
        
        // Check for new star creation
        if (Math.random() < 0.02 && stars.length < 25) {
            createStar();
        }
        
        // Continue the game loop
        if (gameRunning) {
            requestAnimationFrame(updateGame);
        }
    }
    
    function drawPlane3D() {
        // Draw cockpit view (first-person perspective)
        ctx.save();
        
        // Center of the screen
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Draw dashboard
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);
        ctx.lineTo(0, canvas.height - 100 + roll * 50);
        ctx.lineTo(canvas.width, canvas.height - 100 - roll * 50);
        ctx.lineTo(canvas.width, canvas.height);
        ctx.fill();
        
        // Draw control stick
        ctx.fillStyle = '#555';
        ctx.beginPath();
        ctx.arc(centerX, canvas.height - 50, 10, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw stick
        ctx.strokeStyle = '#777';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX, canvas.height - 50);
        ctx.lineTo(centerX + roll * 30, canvas.height - 70 + pitch * 40);
        ctx.stroke();
        
        ctx.restore();
    }
    
    function drawHorizon() {
        ctx.save();
        
        const horizonY = canvas.height / 2 + pitch * 200;
        
        // Sky above horizon
        ctx.fillStyle = '#1a73e8';
        ctx.beginPath();
        ctx.rect(0, 0, canvas.width, horizonY);
        ctx.fill();
        
        // Ground below horizon
        const groundGradient = ctx.createLinearGradient(0, horizonY, 0, canvas.height);
        groundGradient.addColorStop(0, '#3d7d41');
        groundGradient.addColorStop(1, '#2d5d31');
        ctx.fillStyle = groundGradient;
        ctx.beginPath();
        ctx.rect(0, horizonY, canvas.width, canvas.height - horizonY);
        ctx.fill();
        
        // Horizon line
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, horizonY);
        ctx.lineTo(canvas.width, horizonY);
        ctx.stroke();
        
        ctx.restore();
    }
    
    function drawTerrain() {
        ctx.save();
        
        const horizonY = canvas.height / 2 + pitch * 200;
        const centerX = canvas.width / 2;
        
        // Draw 3D terrain
        for (let i = 0; i < terrain.length; i++) {
            const point = terrain[i];
            
            // Apply camera angle to x-position
            const rotatedX = point.x * Math.cos(cameraAngle) - point.z * Math.sin(cameraAngle);
            const rotatedZ = point.x * Math.sin(cameraAngle) + point.z * Math.cos(cameraAngle);
            
            // Perspective projection
            const scale = 1000 / (rotatedZ + altitude + 1000);
            const projectedX = centerX + rotatedX * scale;
            const projectedY = horizonY + point.height * scale;
            
            // Only draw points in front of the camera and within screen
            if (rotatedZ > -altitude && projectedX > 0 && projectedX < canvas.width) {
                ctx.fillStyle = '#2d5d31';
                ctx.beginPath();
                ctx.arc(projectedX, projectedY, 4 * scale, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        ctx.restore();
    }
    
    function updateClouds() {
        ctx.save();
        
        const horizonY = canvas.height / 2 + pitch * 200;
        const centerX = canvas.width / 2;
        
        // Filter out clouds that are behind us
        clouds = clouds.filter(cloud => cloud.z > -altitude);
        
        // Sort clouds by z-depth for proper rendering
        clouds.sort((a, b) => b.z - a.z);
        
        for (let i = 0; i < clouds.length; i++) {
            const cloud = clouds[i];
            
            // Apply camera perspective and movement
            cloud.z -= speed;
            
            // Apply camera angle to x-position
            const rotatedX = cloud.x * Math.cos(cameraAngle) - cloud.z * Math.sin(cameraAngle);
            const rotatedZ = cloud.x * Math.sin(cameraAngle) + cloud.z * Math.cos(cameraAngle);
            
            // Perspective projection
            const scale = 1000 / (rotatedZ + altitude + 1);
            const projectedX = centerX + rotatedX * scale;
            const projectedY = horizonY + cloud.y * scale;
            const projectedWidth = cloud.width * scale;
            const projectedHeight = cloud.height * scale;
            
            // Only draw clouds that are in front of the camera
            if (rotatedZ > -altitude) {
                // Set opacity based on distance
                const opacity = Math.min(1, Math.max(0.1, 1 - rotatedZ / 2000));
                
                // Draw cloud
                ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
                ctx.beginPath();
                ctx.arc(projectedX, projectedY, projectedHeight, 0, Math.PI * 2);
                ctx.arc(projectedX + projectedWidth/3, projectedY - projectedHeight/4, projectedHeight, 0, Math.PI * 2);
                ctx.arc(projectedX + projectedWidth/1.5, projectedY, projectedHeight, 0, Math.PI * 2);
                ctx.arc(projectedX + projectedWidth/3, projectedY + projectedHeight/4, projectedHeight, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        ctx.restore();
    }
    
    function updateStars() {
        ctx.save();
        
        const horizonY = canvas.height / 2 + pitch * 200;
        const centerX = canvas.width / 2;
        
        // Filter out stars that are behind us
        stars = stars.filter(star => star.z > -altitude && !star.collected);
        
        for (let i = 0; i < stars.length; i++) {
            const star = stars[i];
            
            // Apply camera perspective and movement
            star.z -= speed;
            
            // Apply camera angle to x-position
            const rotatedX = star.x * Math.cos(cameraAngle) - star.z * Math.sin(cameraAngle);
            const rotatedZ = star.x * Math.sin(cameraAngle) + star.z * Math.cos(cameraAngle);
            
            // Perspective projection
            const scale = 1000 / (rotatedZ + altitude + 1);
            const projectedX = centerX + rotatedX * scale;
            const projectedY = horizonY + star.y * scale;
            const projectedRadius = star.radius * scale;
            
            // Only draw stars above the horizon and in front of the camera
            if (rotatedZ > -altitude && projectedY < horizonY) {
                // Set opacity based on distance
                const opacity = Math.min(1, Math.max(0.2, 1 - rotatedZ / 2000));
                
                // Draw star
                ctx.fillStyle = `rgba(255, 255, 100, ${opacity})`;
                drawStar(projectedX, projectedY, Math.max(1, projectedRadius));
                
                // Check if plane collected the star
                const distanceToStar = Math.hypot(
                    projectedX - centerX,
                    projectedY - (canvas.height / 2)
                );
                
                if (distanceToStar < 30 && rotatedZ < 100) {
                    stars[i].collected = true;
                    score += 100;
                    scoreDisplay.textContent = score;
                    createScoreEffect();
                }
            }
        }
        
        ctx.restore();
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
    
    function drawHUD() {
        ctx.save();
        
        // Draw altitude indicator
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(10, 10, 120, 30);
        ctx.fillStyle = 'white';
        ctx.font = '12px Poppins, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`Altitude: ${Math.round(altitude)} ft`, 15, 30);
        
        // Draw speed indicator
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(10, 50, 120, 30);
        ctx.fillStyle = 'white';
        ctx.fillText(`Speed: ${Math.round(speed * 50)} mph`, 15, 70);
        
        // Draw artificial horizon indicator (attitude indicator)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(canvas.width - 80, 10, 70, 70);
        
        // Draw horizon line in indicator
        const indicatorCenterX = canvas.width - 45;
        const indicatorCenterY = 45;
        const indicatorRadius = 25;
        
        // Draw sky half
        ctx.fillStyle = '#1a73e8';
        ctx.beginPath();
        ctx.arc(indicatorCenterX, indicatorCenterY, indicatorRadius, 0, Math.PI, true);
        ctx.fill();
        
        // Draw ground half
        ctx.fillStyle = '#3d7d41';
        ctx.beginPath();
        ctx.arc(indicatorCenterX, indicatorCenterY, indicatorRadius, 0, Math.PI, false);
        ctx.fill();
        
        // Draw artificial horizon line rotated by roll
        ctx.save();
        ctx.translate(indicatorCenterX, indicatorCenterY);
        ctx.rotate(roll);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-indicatorRadius, pitch * indicatorRadius * 2);
        ctx.lineTo(indicatorRadius, pitch * indicatorRadius * 2);
        ctx.stroke();
        ctx.restore();
        
        // Draw indicator border
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(indicatorCenterX, indicatorCenterY, indicatorRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw heading indicator
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(canvas.width / 2 - 40, 10, 80, 30);
        
        // Convert camera angle to degrees, adjust for proper heading display
        let heading = ((cameraAngle * 180 / Math.PI) + 360) % 360;
        
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText(`HDG: ${Math.round(heading)}°`, canvas.width / 2, 30);
        
        ctx.restore();
    }
    
    function createScoreEffect() {
        // Flash effect for score
        scoreDisplay.style.transform = 'scale(1.3)';
        setTimeout(() => {
            scoreDisplay.style.transform = 'scale(1)';
        }, 200);
    }
    
    function gameOver(message) {
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
        ctx.font = 'bold 24px Poppins, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Flight Complete!', canvas.width / 2, canvas.height / 2 - 50);
        
        ctx.fillStyle = 'white';
        ctx.font = '16px Poppins, sans-serif';
        ctx.fillText(message || "Flight ended", canvas.width / 2, canvas.height / 2 - 20);
        ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 10);
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
