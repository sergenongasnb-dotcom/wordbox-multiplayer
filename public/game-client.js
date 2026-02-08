window.createGame = async function() {
    const res = await fetch('/api/game?action=create', { method: 'POST' });
    const data = await res.json();
    
    if (data.gameId) {
        localStorage.setItem('gameCode', data.gameId);
        alert('Partie: ' + data.gameId);
        joinGame(data.gameId);
    }
};

window.joinGame = async function(code) {
    const gameId = code || document.getElementById('game-code-input').value;
    
    const res = await fetch('/api/game?action=join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId })
    });
    
    const data = await res.json();
    
    if (data.success) {
        alert('Joueur ' + (data.isPlayer1 ? '1' : '2'));
        startGame();
    } else {
        alert(data.error);
    }
};

let gameId = '';
let playerId = '';
let isPlayer1 = false;
let checkInterval = null;

window.createGame = async function() {
    const res = await fetch('/api/game?action=create', { method: 'POST' });
    const data = await res.json();
    
    if (data.gameId) {
        gameId = data.gameId;
        localStorage.setItem('gameCode', gameId);
        document.getElementById('code-display').textContent = gameId;
        document.getElementById('game-code').style.display = 'block';
        
        // Auto-join
        joinGame(gameId);
    }
};

window.joinGame = async function() {
    const inputCode = document.getElementById('game-code-input').value;
    gameId = inputCode || gameId;
    
    if (!gameId) {
        alert('Entre un code');
        return;
    }
    
    const res = await fetch('/api/game?action=join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId })
    });
    
    const data = await res.json();
    
    if (data.success) {
        playerId = data.playerId;
        isPlayer1 = data.isPlayer1;
        
        alert('Vous êtes Joueur ' + (isPlayer1 ? '1' : '2'));
        
        // Démarrer la vérification
        startChecking();
    } else {
        alert(data.error);
    }
};

function startChecking() {
    // Vérifier toutes les 2 secondes
    checkInterval = setInterval(async () => {
        const res = await fetch(`/api/game?action=check&gameId=${gameId}`);
        const data = await res.json();
        
        if (data.ready) {
            clearInterval(checkInterval);
            startGame();
        }
    }, 2000);
}

function startGame() {
    document.getElementById('lobby-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
    
    // Initialiser la grille
    initGrid();
}
