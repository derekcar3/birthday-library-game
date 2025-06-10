class LibraryAdventureGame {
    constructor() {
        this.player = {
            x: 50,
            y: 50,
            energy: 100
        };
        
        this.gameState = {
            booksCollected: 0,
            totalBooks: 20,
            level: 1,
            gameActive: true
        };
        
        this.collections = {
            fiction: 0,
            health: 0,
            running: 0,
            kids: 0
        };
        
        this.completedChallenges = {
            fiction: false,
            health: false,
            running: false,
            kids: false
        };
        
        this.bookTypes = [
            { type: 'fiction', emoji: '📖', name: 'Classic Novel', points: 10 },
            { type: 'health', emoji: '🥗', name: 'Wellness Guide', points: 15 },
            { type: 'running', emoji: '🏃‍♀️', name: 'Running Manual', points: 15 },
            { type: 'kids', emoji: '👶', name: 'Cassian & Charlie\'s Book', points: 20 }
        ];
        
        this.challenges = {
            fiction: {
                title: "📖 Book Lover's Challenge!",
                question: "What's the most magical thing about reading?",
                options: ["Escaping to new worlds", "Learning new things", "Quiet peaceful moments", "All of these wonderful things!"],
                correct: 3,
                reward: 30
            },
            health: {
                title: "🥗 Health & Wellness Challenge!",
                question: "What's your secret to staying healthy and energized?",
                options: ["Nutritious meals", "Regular exercise", "Good sleep", "All of the above - balance!"],
                correct: 3,
                reward: 30
            },
            running: {
                title: "🏃‍♀️ Running Achievement Unlocked!",
                question: "What makes your runs so special and rewarding?",
                options: ["Fresh air and nature", "Personal reflection time", "Endorphin rush", "All of these amazing benefits!"],
                correct: 3,
                reward: 30
            },
            kids: {
                title: "👶 Cassian & Charlie's Special Challenge!",
                question: "What's the most precious thing about Cassian and Charlie?",
                options: ["Their curious questions", "Their infectious laughter", "Their warm cuddles", "Everything about them!"],
                correct: 3,
                reward: 40
            }
        };
        
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
        // Prevent double-tap zoom
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function (event) {
            var now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
        
        // Touch controls for mobile
        document.getElementById('moveUp').addEventListener('click', (e) => {
            e.preventDefault();
            this.movePlayer(0, -30);
        });
        document.getElementById('moveDown').addEventListener('click', (e) => {
            e.preventDefault();
            this.movePlayer(0, 30);
        });
        document.getElementById('moveLeft').addEventListener('click', (e) => {
            e.preventDefault();
            this.movePlayer(-30, 0);
        });
        document.getElementById('moveRight').addEventListener('click', (e) => {
            e.preventDefault();
            this.movePlayer(30, 0);
        });
        document.getElementById('collectBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.collectNearbyBook();
        });
        document.getElementById('playAgain').addEventListener('click', (e) => {
            e.preventDefault();
            this.resetGame();
        });
        
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
        
        // Clear existing books
        this.books = [];
        document.querySelectorAll('.book').forEach(book => book.remove());
        
        // Generate books ensuring good distribution
        const booksPerType = 3;
        const totalNewBooks = this.bookTypes.length * booksPerType;
        
        for (let i = 0; i < totalNewBooks; i++) {
            const bookType = this.bookTypes[i % this.bookTypes.length];
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
        this.collections[book.type]++;
        
        // Remove book element with animation
        const bookElement = document.getElementById(`book-${book.id}`);
        if (bookElement) {
            bookElement.style.transform = 'scale(1.5)';
            bookElement.style.opacity = '0';
            setTimeout(() => bookElement.remove(), 300);
        }
        
        // Restore energy
        this.player.energy = Math.min(100, this.player.energy + 10);
        
        // Check if we collected 5 of this type and haven't done the challenge yet
        if (this.collections[book.type] === 5 && !this.completedChallenges[book.type]) {
            setTimeout(() => {
                this.showChallenge(book.type);
            }, 500);
        }
        
        this.updateDisplay();
        this.checkWinCondition();
        
        // Generate new books if needed
        if (this.books.filter(b => !b.collected).length < 3) {
            this.generateBooks();
        }
    }
    
    showChallenge(bookType) {
        const challenge = this.challenges[bookType];
        const modal = document.getElementById('challengeModal');
        
        document.getElementById('challengeTitle').textContent = challenge.title;
        document.getElementById('challengeText').textContent = challenge.question;
        
        const optionsContainer = document.getElementById('challengeOptions');
        optionsContainer.innerHTML = '';
        
        challenge.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'challenge-option';
            button.textContent = option;
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleChallengeAnswer(index, challenge, bookType);
            });
            optionsContainer.appendChild(button);
        });
        
        modal.classList.remove('hidden');
    }
    
    handleChallengeAnswer(selectedIndex, challenge, bookType) {
        const modal = document.getElementById('challengeModal');
        modal.classList.add('hidden');
        
        this.completedChallenges[bookType] = true;
        
        if (selectedIndex === challenge.correct) {
            this.player.energy = Math.min(100, this.player.energy + challenge.reward);
            this.showMessage("Perfect! ✨ That's so true! Energy bonus earned!");
        } else {
            this.showMessage("Sweet answer! Keep going! 💪");
        }
        
        this.updateDisplay();
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
            text-align: center;
            max-width: 80%;
        `;
        message.textContent = text;
        document.body.appendChild(message);
        
        setTimeout(() => message.remove(), 2500);
    }
    
    updateDisplay() {
        document.getElementById('booksCollected').textContent = this.gameState.booksCollected;
        document.getElementById('currentLevel').textContent = this.gameState.level;
        document.getElementById('energyFill').style.width = this.player.energy + '%';
        
        // Update collection progress
        document.getElementById('fictionCount').textContent = Math.min(5, this.collections.fiction);
        document.getElementById('healthCount').textContent = Math.min(5, this.collections.health);
        document.getElementById('runningCount').textContent = Math.min(5, this.collections.running);
        document.getElementById('kidsCount').textContent = Math.min(5, this.collections.kids);
        
        // Mark completed collections
        const collectionItems = document.querySelectorAll('.collection-item');
        collectionItems.forEach((item, index) => {
            const type = ['fiction', 'health', 'running', 'kids'][index];
            if (this.collections[type] >= 5) {
                item.classList.add('completed');
            }
        });
    }
    
    checkWinCondition() {
        // Win condition: collect 5 of each type and complete all challenges
        const allCollectionsComplete = Object.values(this.collections).every(count => count >= 5);
        const allChallengesComplete = Object.values(this.completedChallenges).every(completed => completed);
        
        if (allCollectionsComplete && allChallengesComplete) {
            this.gameState.gameActive = false;
            setTimeout(() => {
                document.getElementById('victoryModal').classList.remove('hidden');
            }, 1000);
        }
    }
    
    resetGame() {
        this.gameState = {
            booksCollected: 0,
            totalBooks: 20,
            level: 1,
            gameActive: true
        };
        
        this.collections = {
            fiction: 0,
            health: 0,
            running: 0,
            kids: 0
        };
        
        this.completedChallenges = {
            fiction: false,
            health: false,
            running: false,
            kids: false
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
        
        // Remove completed styling
        document.querySelectorAll('.collection-item').forEach(item => {
            item.classList.remove('completed');
        });
        
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
