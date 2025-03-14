
document.addEventListener('DOMContentLoaded', function() {
    const memoryGame = document.querySelector('.memory-game');
    const restartBtn = document.getElementById('restart-btn');
    const movesDisplay = document.getElementById('moves');
    const timeDisplay = document.getElementById('time');
    
    let hasFlippedCard = false;
    let lockBoard = false;
    let firstCard, secondCard;
    let moves = 0;
    let matchedPairs = 0;
    let timer;
    let seconds = 0;
    let gameStarted = false;
    
    // Icons for the memory game cards
    const icons = [
        'fa-code', 'fa-laptop-code', 'fa-terminal', 'fa-server',
        'fa-database', 'fa-cloud', 'fa-bug', 'fa-robot'
    ];
    
    // Create the cards
    function createCards() {
        // Double the icons for pairs
        const doubledIcons = [...icons, ...icons];
        // Shuffle the icons
        const shuffledIcons = doubleAndShuffle(doubledIcons);
        
        // Clear existing cards
        memoryGame.innerHTML = '';
        
        // Create cards with the shuffled icons
        shuffledIcons.forEach(icon => {
            const card = document.createElement('div');
            card.classList.add('memory-card');
            card.setAttribute('data-icon', icon);
            
            const frontFace = document.createElement('div');
            frontFace.classList.add('front-face');
            const frontIcon = document.createElement('i');
            frontIcon.classList.add('fas', icon);
            frontFace.appendChild(frontIcon);
            
            const backFace = document.createElement('div');
            backFace.classList.add('back-face');
            const backIcon = document.createElement('i');
            backIcon.classList.add('fas', 'fa-question');
            backFace.appendChild(backIcon);
            
            card.appendChild(frontFace);
            card.appendChild(backFace);
            
            card.addEventListener('click', flipCard);
            memoryGame.appendChild(card);
        });
    }
    
    // Function to double and shuffle the icons array
    function doubleAndShuffle(array) {
        const shuffledArray = [...array];
        for (let i = shuffledArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
        }
        return shuffledArray;
    }
    
    // Flip card function
    function flipCard() {
        if (lockBoard) return;
        if (this === firstCard) return;
        
        this.classList.add('flip');
        
        if (!gameStarted) {
            startTimer();
            gameStarted = true;
        }
        
        if (!hasFlippedCard) {
            // First click
            hasFlippedCard = true;
            firstCard = this;
            return;
        }
        
        // Second click
        secondCard = this;
        checkForMatch();
        updateMoves();
    }
    
    // Check if the two flipped cards match
    function checkForMatch() {
        const isMatch = firstCard.dataset.icon === secondCard.dataset.icon;
        
        isMatch ? disableCards() : unflipCards();
    }
    
    // Update moves counter
    function updateMoves() {
        moves++;
        movesDisplay.textContent = moves;
    }
    
    // Start the timer
    function startTimer() {
        timer = setInterval(() => {
            seconds++;
            timeDisplay.textContent = seconds;
        }, 1000);
    }
    
    // Reset the timer
    function resetTimer() {
        clearInterval(timer);
        seconds = 0;
        timeDisplay.textContent = seconds;
    }
    
    // If cards match, keep them flipped
    function disableCards() {
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);
        
        matchedPairs++;
        if (matchedPairs === icons.length) {
            setTimeout(() => {
                endGame();
            }, 500);
        }
        
        resetBoard();
    }
    
    // If cards don't match, flip them back
    function unflipCards() {
        lockBoard = true;
        
        setTimeout(() => {
            firstCard.classList.remove('flip');
            secondCard.classList.remove('flip');
            
            resetBoard();
        }, 1000);
    }
    
    // Reset the board after each turn
    function resetBoard() {
        [hasFlippedCard, lockBoard] = [false, false];
        [firstCard, secondCard] = [null, null];
    }
    
    // End game function
    function endGame() {
        clearInterval(timer);
        alert(`Congratulations! You completed the game in ${moves} moves and ${seconds} seconds!`);
    }
    
    // Restart game function
    function restartGame() {
        // Reset variables
        hasFlippedCard = false;
        lockBoard = false;
        firstCard = null;
        secondCard = null;
        moves = 0;
        matchedPairs = 0;
        gameStarted = false;
        
        // Reset UI
        movesDisplay.textContent = moves;
        resetTimer();
        
        // Clear all cards and create new ones
        createCards();
    }
    
    // Event listener for restart button
    restartBtn.addEventListener('click', restartGame);
    
    // Initialize the game
    createCards();
});
