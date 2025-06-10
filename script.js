
class LibraryAdventureGame {
    constructor() {
        this.player = {
            x: 50,
            y: 50,
            energy: 100
        };
        
        this.gameState = {
            booksCollected: 0,
            totalBooks: 15,
            level: 1,
            gameActive: true
        };
        
        this.bookTypes = [
            { type: 'fiction', emoji: '📖', name: 'Classic Novel', points: 10 },
            { type: 'health', emoji: '🥗', name: 'Wellness Guide', points: 15 },
            { type: 'running', emoji: '🏃‍♀️', name: 'Running Manual', points: 15 },
            { type: 'kids', emoji: '👶', name: 'Cassian & Charlie\'s Book', points: 20 }
        ];
        
        this.challenges = [
            {
                title: "Health & Wellness Challenge!",
                question: "What's a great way to start a healthy day?",
                options: ["Morning run", "Meditation", "Healthy breakfast", "All of the above"],
                correct: 3,
                reward: 25
            },
            {
                title: "Running Achievement!",
                question: "What's the best part about running?",
                options: ["Fresh air", "Me time", "Endorphins", "All of these!"],
                correct: 3,
                reward: 25
            },
            {
                title: "Parenting Wisdom!",
                question: "What makes Cassian and Charlie special?",
                options: ["Their curiosity", "Their laughter", "Their hugs", "Everything!"],
                correct: 3,
                reward: 30
            },
            {
                title: "Book Lover's Quiz!",
                question: "What's the best reading spot?",
                options: ["Cozy corner", "Under a tree", "Comfortable bed", "Anywhere quiet"],
                correct: 3,
                reward: 20
            }
        ];
        
        this.books = [];
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.generateBooks();
        this.updateDisplay();
        this.startGameLoop();
    }
    
    setupEventListeners() {
        // Touch controls for mobile
        document.getElementById('moveUp').addEventListener('click', () => this.movePlayer(0, -30));
        document.getElementById('moveDown').addEventListener('click', () => this.movePlayer(0, 30));
        document.getElementById('moveLeft').addEventListener('click', () => this.movePlayer(-30, 0));
        document.getElementById('moveRight').addEventListener('click', () => this.movePlayer(30, 0));
        document.getElementById('collectBtn').addEventListener('click', () => this.collectNearbyBook());
        document.getElementById('playAgain').addEventListener('click', () => this.resetGame());
        
        // Keyboard controls for desktop
        document.addEventListener('keydown', (e) => {
            if (!this.gameState.gameActive) return;
            
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                    this.movePlayer(0, -30);
                    break;
                case 'ArrowDown':
                case 's':
                    this.movePlayer(0, 30);
                    break;
                case 'ArrowLeft':
                case 'a':
                    this.movePlayer(-30, 0);
                    break;
                case 'ArrowRight':
                case 'd':
                    this.movePlayer(30, 0);
                    break;
                case ' ':
                case 'Enter':
                    e.preventDefault();
                    this.collectNearbyBook();
                    break;
            }
        });
    }
    
    generateBooks() {
        const gameArea = document.getElementById('gameArea');
        const areaRect = gameArea.getBoundingClientRect();
        
        // Clear existing books
        this.books = [];
        document.querySelectorAll('.book').forEach(book => book.remove());
        
        // Generate books based on level
        const booksToGenerate = Math.min(5 + this.gameState.level, 8);
        
        for (let i = 0; i < booksToGenerate; i++) {
            const bookType = this.bookTypes[Math.floor(Math.random() * this.bookTypes.length)];
            const book = {
                id: Date.now() + i,
                ...bookType,
                x: Math.random() * 80 + 10, // Percentage position
                y: Math.random() * 80 + 10,
                collected: false
            };
            
            this.books.push(book);
            this.createBookElement(book);
        }
    }
    
    createBookElement(book) {
        const bookElement = document.createElement('div');
        bookElement.className = `book ${book.type}`;
        bookElement.id = `book-${book.id}`;
        bookElement.innerHTML = book.emoji;
        bookElement.style.left = book.x + '%';
        bookElement.style.top = book.y + '%';
        bookElement.title = book.name;
        
        document.getElementById('gameArea').appendChild(bookElement);
    }
    
    movePlayer(deltaX, deltaY) {
        if (!this.gameState.gameActive) return;
        
        const gameArea = document.getElementById('gameArea');
        const player = document.getElementById('player');
        const areaRect = gameArea.getBoundingClientRect();
        
        // Convert percentage to pixels for calculation
        const currentX = (this.player.x / 100) * areaRect.width;
        const currentY = (this.player.y / 100) * areaRect.height;
        
        const newX = Math.max(5, Math.min(95, this.player.x + (deltaX / areaRect.width) * 100));
        const newY = Math.max(5, Math.min(95, this.player.y + (deltaY / areaRect.height) * 100));
        
        this.player.x = newX;
        this.player.y = newY;
        
        // Update player position
        player.style.left = this.player.x + '%';
        player.style.top = this.player.y + '%';
        
        // Consume energy
        this.player.energy = Math.max(0, this.player.energy - 1);
        this.updateDisplay();
        
        // Auto-collect nearby books
        this.collectNearbyBook();
    }
    
    collectNearbyBook() {
        const nearbyBook = this.findNearbyBook();
        if (nearbyBook && !nearbyBook.collected) {
            this.collectBook(nearbyBook);
        }
    }
    
    findNearbyBook() {
        const threshold = 15; // Distance threshold for collection
        
        return this.books.find(book => {
            if (book.collected) return false;
            
            const distance = Math.sqrt(
                Math.pow(this.player.x - book.x, 2) + 
                Math.pow(this.player.y - book.y, 2)
            );
            
            return distance < threshold;
        });
    }
    
    collectBook(book) {
        book.collected = true;
        this.gameState.booksCollected++;
        
        // Remove book element
        const bookElement = document.getElementById(`book-${book.id}`);
        if (bookElement) {
            bookElement.style.transform = 'scale(1.5)';
            bookElement.style.opacity = '0';
            setTimeout(() => bookElement.remove(), 300);
        }
        
        // Restore energy
        this.player.energy = Math.min(100, this.player.energy + 10);
        
        // Show challenge for special books
        if (book.points >= 20 || Math.random() < 0.3) {
            this.showChallenge();
        }
        
        this.updateDisplay();
        this.checkWinCondition();
        
        // Generate new books if needed
        if (this.books.filter(b => !b.collected).length < 2) {
            this.gameState.level++;
            this.generateBooks();
        }
    }
    
    showChallenge() {
        const challenge = this.challenges[Math.floor(Math.random() * this.challenges.length)];
        const modal = document.getElementById('challengeModal');
        
        document.getElementById('challengeTitle').textContent = challenge.title;
        document.getElementById('challengeText').textContent = challenge.question;
        
        const optionsContainer = document.getElementById('challengeOptions');
        optionsContainer.innerHTML = '';
        
        challenge.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'challenge-option';
            button.textContent = option;
            button.addEventListener('click', () => {
                this.handleChallengeAnswer(index, challenge);
            });
            optionsContainer.appendChild(button);
        });
        
        modal.classList.remove('hidden');
    }
    
    handleChallengeAnswer(selectedIndex, challenge) {
        const modal = document.getElementById('challengeModal');
        modal.classList.add('hidden');
        
        if (selectedIndex === challenge.correct) {
            this.player.energy = Math.min(100, this.player.energy + challenge.reward);
            this.showMessage("Correct! ✨ Energy restored!");
        } else {
            this.showMessage("Good try! Keep going! 💪");
        }
    }
    
    showMessage(text) {
        // Create temporary message
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255,255,255,0.95);
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            z-index: 999;
            font-weight: bold;
            color: #8B4513;
        `;
        message.textContent = text;
        document.body.appendChild(message);
        
        setTimeout(() => message.remove(), 2000);
    }
    
    updateDisplay() {
        document.getElementById('booksCollected').textContent = this.gameState.booksCollected;
        document.getElementById('currentLevel').textContent = this.gameState.level;
        document.getElementById('energyFill').style.width = this.player.energy + '%';
    }
    
    checkWinCondition() {
        if (this.gameState.booksCollected >= this.gameState.totalBooks) {
            this.gameState.gameActive = false;
            setTimeout(() => {
                document.getElementById('victoryModal').classList.remove('hidden');
            }, 500);
        }
    }
    
    resetGame() {
        this.gameState = {
            booksCollected: 0,
            totalBooks: 15,
            level: 1,
            gameActive: true
        };
        
        this.player = {
            x: 50,
            y: 50,
            energy: 100
        };
        
        // Reset player position
        const player = document.getElementById('player');
        player.style.left = '50%';
        player.style.top = '50%';
        
        // Clear books
        document.querySelectorAll('.book').forEach(book => book.remove());
        
        // Hide modals
        document.querySelectorAll('.modal').forEach(modal => modal.classList.add('hidden'));
        
        // Restart game
        this.generateBooks();
        this.updateDisplay();
    }
    
    startGameLoop() {
        setInterval(() => {
            if (this.gameState.gameActive && this.player.energy > 0) {
                // Gradually restore energy
                if (this.player.energy < 100 && Math.random() < 0.1) {
                    this.player.energy = Math.min(100, this.player.energy + 1);
                    this.updateDisplay();
                }
            }
        }, 1000);
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new LibraryAdventureGame();
});
