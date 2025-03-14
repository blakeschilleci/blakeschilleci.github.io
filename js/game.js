document.addEventListener('DOMContentLoaded', function() {
    const gameContainer = document.querySelector('.game-container');
    const restartBtn = document.getElementById('restart-btn');
    const scoreDisplay = document.getElementById('score');
    const highScoreDisplay = document.getElementById('high-score');

    let cards = [];
    let hasFlippedCard = false;
    let lockBoard = false;
    let firstCard, secondCard;
    let moves = 0;
    let matchedPairs = 0;
    let gameStarted = false;
    let timer;
    let seconds = 0;

    // Card images - emojis for simplicity
    const cardImages = [
        '🚀', '🌟', '🎮', '🎨', 
        '🎵', '🏆', '🎁', '🎯'
    ];

    function setupGame() {
        // Reset variables
        cards = [];
        hasFlippedCard = false;
        lockBoard = false;
        firstCard = null;
        secondCard = null;
        moves = 0;
        matchedPairs = 0;
        gameStarted = false;
        seconds = 0;

        // Clear any existing timer
        if (timer) clearInterval(timer);

        // Reset displays
        scoreDisplay.textContent = '0';
        const highScore = localStorage.getItem('memoryGameHighScore') || '0';
        highScoreDisplay.textContent = highScore;

        // Create memory game board
        const memoryGame = document.querySelector('.memory-game');
        memoryGame.innerHTML = '';

        // Create cards (8 pairs = 16 cards)
        const cardPairs = [...cardImages, ...cardImages];

        // Shuffle the cards
        const shuffledCards = shuffle(cardPairs);

        // Create card elements
        shuffledCards.forEach((image, index) => {
            const card = document.createElement('div');
            card.classList.add('memory-card');
            card.dataset.framework = image;
            card.dataset.id = index;

            card.innerHTML = `
                <div class="memory-card-inner">
                    <div class="memory-card-front"></div>
                    <div class="memory-card-back">${image}</div>
                </div>
            `;

            card.addEventListener('click', flipCard);
            memoryGame.appendChild(card);
            cards.push(card);
        });
    }

    function shuffle(array) {
        let currentIndex = array.length;
        let temporaryValue, randomIndex;

        // While there remain elements to shuffle
        while (currentIndex !== 0) {
            // Pick a remaining element
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }

    function startTimer() {
        if (!gameStarted) {
            gameStarted = true;
            timer = setInterval(() => {
                seconds++;
                // Optional: Display timer somewhere if needed
            }, 1000);
        }
    }

    function flipCard() {
        // Start timer on first card flip
        startTimer();

        if (lockBoard) return;
        if (this === firstCard) return;

        this.classList.add('flipped');

        if (!hasFlippedCard) {
            // First card flipped
            hasFlippedCard = true;
            firstCard = this;
            return;
        }

        // Second card flipped
        secondCard = this;
        moves++;

        checkForMatch();
    }

    function checkForMatch() {
        let isMatch = firstCard.dataset.framework === secondCard.dataset.framework;

        isMatch ? disableCards() : unflipCards();
    }

    function disableCards() {
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);

        matchedPairs++;
        updateScore();

        if (matchedPairs === cardImages.length) {
            setTimeout(() => {
                gameComplete();
            }, 500);
        }

        resetBoard();
    }

    function unflipCards() {
        lockBoard = true;

        setTimeout(() => {
            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');

            resetBoard();
        }, 1000);
    }

    function resetBoard() {
        [hasFlippedCard, lockBoard] = [false, false];
        [firstCard, secondCard] = [null, null];
    }

    function updateScore() {
        // Calculate score: more matches with fewer moves = higher score
        const baseScore = matchedPairs * 100;
        const movesPenalty = Math.max(0, moves - matchedPairs) * 10;
        const score = Math.max(0, baseScore - movesPenalty);

        scoreDisplay.textContent = score;

        // Visual feedback for matching
        scoreDisplay.style.transform = 'scale(1.2)';
        setTimeout(() => {
            scoreDisplay.style.transform = 'scale(1)';
        }, 200);
    }

    function gameComplete() {
        // Stop timer
        clearInterval(timer);
        gameStarted = false;

        // Calculate final score
        const baseScore = matchedPairs * 100;
        const movesPenalty = Math.max(0, moves - matchedPairs) * 10;
        const timeBonus = Math.max(0, 300 - seconds) * 2;
        const finalScore = Math.max(0, baseScore - movesPenalty + timeBonus);

        // Update display
        scoreDisplay.textContent = finalScore;

        // Check for high score
        const currentHighScore = parseInt(localStorage.getItem('memoryGameHighScore') || '0');
        if (finalScore > currentHighScore) {
            localStorage.setItem('memoryGameHighScore', finalScore.toString());
            highScoreDisplay.textContent = finalScore;
        }

        // Show completion message
        const memoryGame = document.querySelector('.memory-game');
        const completionMessage = document.createElement('div');
        completionMessage.classList.add('completion-message');
        completionMessage.innerHTML = `
            <h2>Congratulations!</h2>
            <p>You completed the game in ${moves} moves and ${seconds} seconds</p>
            <p>Final Score: ${finalScore}</p>
            <button class="play-again-btn">Play Again</button>
        `;

        memoryGame.appendChild(completionMessage);

        // Add event listener to the play again button
        const playAgainBtn = completionMessage.querySelector('.play-again-btn');
        playAgainBtn.addEventListener('click', () => {
            setupGame();
        });
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