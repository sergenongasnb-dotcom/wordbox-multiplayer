class MultiplayerGame {
    constructor() {
        this.socket = null;
        this.gameId = null;
        this.playerId = null;
        this.playerNumber = null;
        this.players = {};
        this.gameState = {
            grid: [],
            turn: 'player1',
            scores: { player1: 0, player2: 0 },
            foundWords: { player1: [], player2: [] },
            timeLeft: 120,
            turnTimeLeft: 30,
            gameActive: false
        };
        
        this.selectedLetters = [];
        this.selectedCells = [];
        this.isDragging = false;
        
        this.init();
    }
    
    async init() {
        // Charger le dictionnaire
        await this.loadDictionary();
        
        // Configuration des événements
        this.setupEventListeners();
        
        // Polling pour les mises à jour
        this.startPolling();
    }
    
    async loadDictionary() {
        // Utiliser un dictionnaire en ligne
        try {
            const response = await fetch('https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt');
            const text = await response.text();
            const words = text.split('\n').map(w => w.trim().toUpperCase());
            this.dictionary = new Set(words.filter(w => w.length >= 3));
        } catch (error) {
            // Dictionnaire de secours
            this.dictionary = new Set([
                'ABLE', 'ABRI', 'ACRE', 'ACTION', 'ANIMAL', 'BATEAU', 'CHAISE',
                'DINER', 'ECOLE', 'FLEUR', 'GARAGE', 'HOTEL', 'IMAGE', 'JARDIN',
                'LIVRE', 'MAISON', 'NOURRITURE', 'OBJET', 'PAPIER', 'QUARTIER',
                'RIVIERE', 'SALLE', 'TABLE', 'UNIVERS', 'VILLAGE', 'WAGON', 'XYLOPHONE'
            ]);
        }
    }
    
    async createGame() {
        try {
            const response = await fetch('/api/game', {
                method: 'POST'
            });
            const data = await response.json();
            
            this.gameId = data.gameId;
            this.playerNumber = 'player1';
            
            this.updateUI();
            showScreen('game-info');
            document.getElementById('current-game-id').textContent = this.gameId;
            
            // Rejoindre automatiquement en tant que joueur 1
            this.joinGame();
        } catch (error) {
            console.error('Erreur création partie:', error);
            showFeedback('Erreur création partie', true);
        }
    }
    
    async joinGame() {
        const gameIdInput = document.getElementById('game-id-input');
        const gameId = gameIdInput.value || this.gameId;
        
        if (!gameId) {
            showFeedback('Code de partie requis', true);
            return;
        }
        
        try {
            const response = await fetch('/api/players', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gameId })
            });
            
            const data = await response.json();
            
            if (data.error) {
                showFeedback(data.error, true);
                return;
            }
            
            this.gameId = gameId;
            this.playerId = data.playerId;
            this.playerNumber = data.isPlayer1 ? 'player1' : 'player2';
            this.players = data.players;
            
            showScreen('game-info');
            document.getElementById('current-game-id').textContent = this.gameId;
            this.updatePlayersList();
            
            // Si deux joueurs sont présents, activer le bouton commencer
            if (Object.keys(this.players).length === 2 && this.playerNumber === 'player1') {
                document.getElementById('start-game-btn').disabled = false;
            }
            
        } catch (error) {
            console.error('Erreur rejoindre partie:', error);
            showFeedback('Partie non trouvée', true);
        }
    }
    
    async startGame() {
        try {
            const response = await fetch('/api/game/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gameId: this.gameId })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.gameState = data.gameState;
                showScreen('game-screen');
                this.initGrid();
                this.updateGameUI();
            }
        } catch (error) {
            console.error('Erreur démarrage:', error);
        }
    }
    
    async submitWord() {
        if (!this.isMyTurn()) {
            showFeedback("Ce n'est pas votre tour!", true);
            return;
        }
        
        const word = this.selectedLetters.join('').toUpperCase();
        
        // Validation locale
        if (word.length < 3) {
            showFeedback('Minimum 3 lettres', true);
            return;
        }
        
        if (!this.dictionary.has(word)) {
            showFeedback('Mot non valide', true);
            return;
        }
        
        // Vérifier si déjà trouvé
        const allWords = [...this.gameState.foundWords.player1, ...this.gameState.foundWords.player2];
        if (allWords.includes(word)) {
            showFeedback('Mot déjà utilisé', true);
            return;
        }
        
        // Envoyer au serveur
        try {
            const response = await fetch('/api/move', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    gameId: this.gameId,
                    playerId: this.playerId,
                    word: word,
                    letters: this.selectedCells.map(cell => ({
                        row: parseInt(cell.dataset.row),
                        col: parseInt(cell.dataset.col)
                    }))
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                showFeedback(`+${data.points} points!`, false);
                this.clearSelection();
                // Le serveur mettra à jour l'état
            } else {
                showFeedback(data.error || 'Erreur de validation', true);
            }
        } catch (error) {
            console.error('Erreur soumission:', error);
        }
    }
    
    async updateGameState() {
        if (!this.gameId || !this.gameState.gameActive) return;
        
        try {
            const response = await fetch(`/api/game?gameId=${this.gameId}`);
            const data = await response.json();
            
            if (data) {
                this.gameState = data;
                this.updateGameUI();
                
                // Vérifier si la partie est terminée
                if (data.winner) {
                    this.showEndScreen(data.winner);
                }
            }
        } catch (error) {
            console.error('Erreur mise à jour:', error);
        }
    }
    
    updateGameUI() {
        // Scores
        document.getElementById('score-player1').textContent = this.gameState.scores.player1;
        document.getElementById('score-player2').textContent = this.gameState.scores.player2;
        
        // Tour actuel
        document.getElementById('current-turn').textContent = 
            this.gameState.turn === 'player1' ? 'Joueur 1' : 'Joueur 2';
        
        // Indicateurs de tour
        document.getElementById('turn-indicator-1').classList.toggle('active', this.gameState.turn === 'player1');
        document.getElementById('turn-indicator-2').classList.toggle('active', this.gameState.turn === 'player2');
        document.getElementById('player1-header').classList.toggle('active', this.gameState.turn === 'player1');
        document.getElementById('player2-header').classList.toggle('active', this.gameState.turn === 'player2');
        
        // Timer
        const minutes = Math.floor(this.gameState.timeLeft / 60);
        const seconds = this.gameState.timeLeft % 60;
        document.getElementById('time').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        document.getElementById('turn-time').textContent = this.gameState.turnTimeLeft;
        
        // Mots trouvés
        this.updateWordsList();
    }
    
    updateWordsList(player = 'all') {
        const wordsList = document.getElementById('words-list');
        wordsList.innerHTML = '';
        
        let words = [];
        if (player === 'player1') {
            words = this.gameState.foundWords.player1;
        } else if (player === 'player2') {
            words = this.gameState.foundWords.player2;
        } else {
            words = [...this.gameState.foundWords.player1, ...this.gameState.foundWords.player2];
        }
        
        words.forEach(word => {
            const wordItem = document.createElement('div');
            wordItem.className = 'word-item';
            wordItem.textContent = word;
            wordsList.appendChild(wordItem);
        });
    }
    
    isMyTurn() {
        return this.gameState.turn === this.playerNumber;
    }
    
    setupEventListeners() {
        // Boutons lobby
        window.createGame = () => this.createGame();
        window.joinGame = () => this.joinGame();
        window.startGame = () => this.startGame();
        window.submitWord = () => this.submitWord();
        window.clearSelection = () => this.clearSelection();
        window.showWords = (player) => this.updateWordsList(player);
        window.backToLobby = () => showScreen('lobby-screen');
        
        // Gestion de la grille (garder votre code existant adapté)
        this.setupGridEvents();
    }
    
    setupGridEvents() {
        const grid = document.getElementById('grid-container');
        
        grid.addEventListener('mousedown', (e) => this.startDragging(e));
        grid.addEventListener('touchstart', (e) => this.startDragging(e));
        grid.addEventListener('mouseover', (e) => this.handleDragOver(e));
        grid.addEventListener('mouseup', () => this.stopDragging());
        grid.addEventListener('touchend', () => this.stopDragging());
    }
    
    // Garder vos fonctions de drag & drop existantes mais avec vérification de tour
    startDragging(e) {
        if (!this.gameState.gameActive || !this.isMyTurn()) return;
        
        const cell = this.getCellFromEvent(e);
        if (!cell) return;
        
        this.isDragging = true;
        this.clearSelection();
        
        if (cell) {
            this.addToSelection(cell);
            this.drawSelectionLine();
        }
    }
    
    // ... (les autres fonctions de drag & drop restent similaires)
    
    startPolling() {
        setInterval(() => {
            if (this.gameId && this.gameState.gameActive) {
                this.updateGameState();
            }
        }, 1000);
    }
    
    updatePlayersList() {
        const list = document.getElementById('players-list');
        list.innerHTML = '';
        
        Object.entries(this.players).forEach(([id, player]) => {
            const badge = document.createElement('div');
            badge.className = 'player-badge';
            badge.textContent = `Joueur ${player.isPlayer1 ? '1' : '2'}`;
            list.appendChild(badge);
        });
        
        const playerCount = Object.keys(this.players).length;
        document.getElementById('player-status').textContent = 
            playerCount === 2 ? 'Prêt!' : `En attente (${playerCount}/2)...`;
    }
    
    showEndScreen(winner) {
        showScreen('end-screen');
        const winnerDisplay = document.getElementById('winner-display');
        
        if (winner === 'draw') {
            winnerDisplay.innerHTML = `
                <h2>🤝 Match nul!</h2>
                <p>Scores: ${this.gameState.scores.player1} - ${this.gameState.scores.player2}</p>
            `;
        } else {
            const winnerName = winner === 'player1' ? 'Joueur 1' : 'Joueur 2';
            winnerDisplay.innerHTML = `
                <h2>🏆 ${winnerName} gagne!</h2>
                <p>Score: ${this.gameState.scores[winner]}</p>
            `;
        }
    }
}

// Fonctions globales
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function showFeedback(message, isError = false) {
    const feedback = document.getElementById('feedback-message');
    feedback.textContent = message;
    feedback.className = 'feedback-message';
    
    if (isError) {
        feedback.classList.add('error');
    }
    
    feedback.classList.add('show');
    
    setTimeout(() => {
        feedback.classList.remove('show');
    }, 2000);
}

// Initialiser le jeu
const game = new MultiplayerGame();
