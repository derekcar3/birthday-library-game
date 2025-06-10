class LibraryQuest {
    constructor() {
        this.gridSize = 10;
        this.timeLimit = 180; // 3 minutes
        this.timeRemaining = this.timeLimit;
        this.score = 0;
        this.hintsLeft = 3;
        this.gameActive = false;
        this.selectedCells = [];
        this.foundWords = new Set();
        
        // Personalized words for the birthday girl
        this.wordsToFind = [
            'BOOKS', 'NOVEL', 'READ', 'STORY',
            'RUNNING', 'HEALTH', 'FITNESS',
            'CASSIAN', 'CHARLIE',
            'BIRTHDAY', 'LIBRARY', 'THIRTY'
        ];
        
        this.grid = [];
        this.wordPositions = new Map();
        
        this.initializeElements();
        this.setupEventListeners();
        this.startNewGame();
    }
    
    initializeElements() {
        this.gridElement = document.getElementById('word-grid');
        this.scoreDisplay = document.getElementById('score-display');
        this.timeDisplay = document.getElementById('time-display');
        this.wordsContainer = document.getElementById('words-to-find');
        this.modal = document.getElementById('game-modal');
        this.modalTitle = document.getElementById('modal-title');
        this.modalMessage = document.getElementById('modal-message');
        this.newGameBtn = document.getElementById('new-game-btn');
        this.hintBtn = document.getElementById('hint-btn');
        this.modalBtn = document.getElementById('modal-btn');
    }
    
    setupEventListeners() {
        this.newGameBtn.addEventListener('click', () => this.startNewGame());
        this.hintBtn.addEventListener('click', () => this.giveHint());
        this.modalBtn.addEventListener('click', () => this.closeModal());
        
        // Touch/mouse events for word selection
        this.gridElement.addEventListener('mousedown', (e) => this.startSelection(e));
        this.gridElement.addEventListener('mouseover', (e) => this.continueSelection(e));
        this.gridElement.addEventListener('mouseup', () => this.endSelection());
        
        // Touch events for mobile
        this.gridElement.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startSelection(e.touches[0]);
        });
        this.gridElement.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const element = document.elementFromPoint(touch.clientX, touch.clientY);
            this.continueSelection({target: element});
        });
        this.gridElement.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.endSelection();
        });
    }
    
    startNewGame() {
        this.timeRemaining = this.timeLimit;
        this.score = 0;
        this.hintsLeft = 3;
        this.foundWords.clear();
        this.gameActive = true;
        this.selectedCells = [];
        
        this.generateGrid();
        this.placeWords();
        this.fillEmptySpaces();
        this.renderGrid();
        this.renderWordList();
        this.updateDisplay();
        this.startTimer();
        this.closeModal();
    }
    
    generateGrid() {
        this.grid = Array(this.gridSize).fill().map(() => 
            Array(this.gridSize).fill('')
        );
        this.wordPositions.clear();
    }
    
    placeWords() {
        const shuffledWords = [...this.wordsToFind].sort(() => Math.random() - 0.5);
        
        for (const word of shuffledWords) {
            let placed = false;
            let attempts = 0;
            
            while (!placed && attempts < 100) {
                const direction = Math.floor(Math.random() * 8); // 8 directions
                const position = this.getRandomPosition(word.length, direction);
                
                if (position && this.canPlaceWord(word, position, direction)) {
                    this.placeWord(word, position, direction);
                    placed = true;
                }
                attempts++;
            }
        }
    }
    
    getRandomPosition(wordLength, direction) {
        const directions = [
            [0, 1],   // horizontal right
            [1, 0],   // vertical down
            [1, 1],   // diagonal down-right
            [1, -1],  // diagonal down-left
            [0, -1],  // horizontal left
            [-1, 0],  // vertical up
            [-1, -1], // diagonal up-left
            [-1, 1]   // diagonal up-right
        ];
        
        const [dx, dy] = directions[direction];
        const maxRow = dx > 0 ? this.gridSize - wordLength : dx < 0 ? wordLength - 1 : this.gridSize - 1;
        const maxCol = dy > 0 ? this.gridSize - wordLength : dy < 0 ? wordLength - 1 : this.gridSize - 1;
        const minRow = dx < 0 ? wordLength - 1 : 0;
        const minCol = dy < 0 ? wordLength - 1 : 0;
        
        if (maxRow < minRow || maxCol < minCol) return null;
        
        return {
            row: Math.floor(Math.random() * (maxRow - minRow + 1)) + minRow,
            col: Math.floor(Math.random() * (maxCol - minCol + 1)) + minCol
        };
    }
    
    canPlaceWord(word, position, direction) {
        const directions = [
            [0, 1], [1, 0], [1, 1], [1, -1],
            [0, -1], [-1, 0], [-1, -1], [-1, 1]
        ];
        const [dx, dy] = directions[direction];
        
        for (let i = 0; i < word.length; i++) {
            const row = position.row + dx * i;
            const col = position.col + dy * i;
            
            if (row < 0 || row >= this.gridSize || col < 0 || col >= this.gridSize) {
                return false;
            }
            
            if (this.grid[row][col] !== '' && this.grid[row][col] !== word[i]) {
                return false;
            }
        }
        return true;
    }
    
    placeWord(word, position, direction) {
        const directions = [
            [0, 1], [1, 0], [1, 1], [1, -1],
            [0, -1], [-1, 0], [-1, -1], [-1, 1]
        ];
        const [dx, dy] = directions[direction];
        const positions = [];
        
        for (let i = 0; i < word.length; i++) {
            const row = position.row + dx * i;
            const col = position.col + dy * i;
            this.grid[row][col] = word[i];
            positions.push({row, col});
        }
        
        this.wordPositions.set(word, positions);
    }
    
    fillEmptySpaces() {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.grid[row][col] === '') {
                    this.grid[row][col] = letters[Math.floor(Math.random() * letters.length)];
                }
            }
        }
    }
    
    renderGrid() {
        this.gridElement.innerHTML = '';
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.textContent = this.grid[row][col];
                cell.dataset.row = row;
                cell.dataset.col = col;
                this.gridElement.appendChild(cell);
            }
        }
    }
    
    renderWordList() {
        this.wordsContainer.innerHTML = '';
        this.wordsToFind.forEach(word => {
            const wordElement = document.createElement('div');
            wordElement.className = 'word-item';
            wordElement.textContent = word;
            wordElement.dataset.word = word;
            this.wordsContainer.appendChild(wordElement);
        });
    }
    
    startSelection(event) {
        if (!this.gameActive) return;
        
        const cell = event.target.closest('.grid-cell');
        if (!cell) return;
        
        this.selectedCells = [cell];
        cell.classList.add('selected');
        this.isSelecting = true;
    }
    
    continueSelection(event) {
        if (!this.gameActive || !this.isSelecting) return;
        
        const cell = event.target.closest('.grid-cell');
        if (!cell || this.selectedCells.includes(cell)) return;
        
        // Check if the new cell is in line with the selection
        if (this.selectedCells.length > 1) {
            if (!this.isInLine(this.selectedCells[0], this.selectedCells[1], cell)) return;
        }
        
        this.selectedCells.push(cell);
        cell.classList.add('selected');
    }
    
    endSelection() {
        if (!this.gameActive || !this.isSelecting) return;
        
        this.isSelecting = false;
        const selectedWord = this.getSelectedWord();
        
        if (this.wordsToFind.includes(selectedWord) && !this.foundWords.has(selectedWord)) {
            this.foundWord(selectedWord);
        }
        
        this.clearSelection();
    }
    
    isInLine(cell1, cell2, cell3) {
        const row1 = parseInt(cell1.dataset.row);
        const col1 = parseInt(cell1.dataset.col);
        const row2 = parseInt(cell2.dataset.row);
        const col2 = parseInt(cell2.dataset.col);
        const row3 = parseInt(cell3.dataset.row);
        const col3 = parseInt(cell3.dataset.col);
        
        const dx1 = row2 - row1;
        const dy1 = col2 - col1;
        const dx2 = row3 - row2;
        const dy2 = col3 - col2;
        
        return dx1 === dx2 && dy1 === dy2;
    }
    
    getSelectedWord() {
        return this.selectedCells.map(cell => cell.textContent).join('');
    }
    
    foundWord(word) {
        this.foundWords.add(word);
        this.score++;
        
        // Mark cells as found
        this.selectedCells.forEach(cell => {
            cell.classList.add('found');
        });
        
        // Mark word in list as found
        const wordElement = document.querySelector(`[data-word="${word}"]`);
        if (wordElement) {
            wordElement.classList.add('found');
        }
        
        this.updateDisplay();
        
        // Check for win condition
        if (this.foundWords.size === this.wordsToFind.length) {
            this.gameWon();
        }
    }
    
    clearSelection() {
        this.selectedCells.forEach(cell => {
            if (!cell.classList.contains('found')) {
                cell.classList.remove('selected');
            }
        });
        this.selectedCells = [];
    }
    
    startTimer() {
        this.timer = setInterval(() => {
            this.timeRemaining--;
            this.updateDisplay();
            
            if (this.timeRemaining <= 0) {
                this.gameOver();
            }
        }, 1000);
    }
    
    updateDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        this.timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        this.scoreDisplay.textContent = `${this.score}/${this.wordsToFind.length}`;
        this.hintBtn.textContent = `Hint (${this.hintsLeft} left)`;
    }
    
    giveHint() {
        if (!this.gameActive || this.hintsLeft <= 0) return;
        
        const unFoundWords = this.wordsToFind.filter(word => !this.foundWords.has(word));
        if (unFoundWords.length === 0) return;
        
        const randomWord = unFoundWords[Math.floor(Math.random() * unFoundWords.length)];
        const positions = this.wordPositions.get(randomWord);
        
        if (positions) {
            // Highlight the first letter of the word for 2 seconds
            const firstCell = document.querySelector(`[data-row="${positions[0].row}"][data-col="${positions[0].col}"]`);
            if (firstCell) {
                firstCell.style.background = '#FF69B4';
                firstCell.style.animation = 'pulse 0.5s infinite';
                
                setTimeout(() => {
                    firstCell.style.background = '';
                    firstCell.style.animation = '';
                }, 2000);
            }
        }
        
        this.hintsLeft--;
        this.updateDisplay();
    }
    
    gameWon() {
        this.gameActive = false;
        clearInterval(this.timer);
        
        this.modalTitle.textContent = '🎉 Happy Birthday! 🎉';
        this.modalMessage.innerHTML = `
            Congratulations! You found all the words!<br>
            You're as amazing as the books you love to read,<br>
            as energetic as your morning runs,<br>
            and as wonderful as Cassian and Charlie think you are!<br><br>
            <strong>Have the most fantastic 33rd birthday! 📚🏃‍♀️💖</strong>
        `;
        this.showModal();
    }
    
    gameOver() {
        this.gameActive = false;
        clearInterval(this.timer);
        
        this.modalTitle.textContent = '⏰ Time\'s Up!';
        this.modalMessage.innerHTML = `
            You found ${this.score} out of ${this.wordsToFind.length} words!<br>
            But hey, it's your birthday - you're still amazing!<br><br>
            <strong>Happy 33rd Birthday! 🎂</strong>
        `;
        this.showModal();
    }
    
    showModal() {
        this.modal.classList.remove('hidden');
    }
    
    closeModal() {
        this.modal.classList.add('hidden');
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new LibraryQuest();
});
