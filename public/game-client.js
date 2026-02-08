class GameClient {
    constructor() {
        this.gameId = null;
        this.playerId = null;
        this.isPlayer1 = false;
        this.gameState = null;
    }
    
    async createGame() {
        try {
            console.log('Création partie...');
            const response = await fetch('/api/game', {
                method: 'POST'
            });
            
            const data = await response.json();
            console.log('Réponse:', data);
            
            if (data.gameId) {
                this.gameId = data.gameId;
                alert('Partie créée! Code: ' + this.gameId);
                return this.joinGame();
            } else {
                alert('Erreur création: ' + (data.error || 'Inconnue'));
            }
        } catch (error) {
            console.error('Erreur fetch:', error);
            alert('Erreur réseau');
        }
    }
    
    async joinGame() {
        try {
            const response = await fetch('/api/players', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    gameId: this.gameId
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.playerId = data.playerId;
                this.isPlayer1 = data.isPlayer1;
                alert('Vous êtes Joueur ' + (this.isPlayer1 ? '1' : '2'));
                return true;
            }
        } catch (error) {
            console.error('Erreur join:', error);
        }
        return false;
    }
}

// Crée une instance globale
const game = new GameClient();

// Expose les fonctions globalement
window.createGame = () => game.createGame();
window.joinGame = () => game.joinGame();
let currentGameCode = '';

window.createGame = async function() {
    try {
        const response = await fetch('/api/game', {
            method: 'POST'
        });
        const data = await response.json();
        
        if (data.gameId) {
            currentGameCode = data.gameId;
            document.getElementById('code-display').textContent = data.gameId;
            document.getElementById('game-code').style.display = 'block';
            alert('✅ Partie créée! Code: ' + data.gameId);
            
            // Auto-join
            joinGame();
        }
    } catch (error) {
        alert('❌ Erreur création');
    }
};

window.joinGame = async function() {
    const gameId = currentGameCode || document.getElementById('game-code-input').value;
    
    if (!gameId) {
        alert('❌ Entre un code de partie');
        return;
    }
    
    try {
        const response = await fetch('/api/players', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gameId: gameId })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('✅ Vous êtes Joueur ' + (data.isPlayer1 ? '1' : '2'));
            // Passe à l'écran de jeu
            startGame();
        } else {
            alert('❌ ' + (data.error || 'Erreur'));
        }
    } catch (error) {
        alert('❌ Partie non trouvée');
    }
};

function startGame() {
    // Passe à l'écran de jeu
    document.getElementById('lobby-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
}
