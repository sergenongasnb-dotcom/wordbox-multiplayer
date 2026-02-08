let currentGame = null;

window.createGame = async function() {
    const res = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create' })
    });
    
    const data = await res.json();
    
    if (data.success) {
        currentGame = data.gameId;
        alert('🎮 Code: ' + currentGame);
        
        // Auto-join comme joueur 1
        joinGame(currentGame);
    }
};

window.joinGame = async function() {
    const gameId = currentGame || document.getElementById('game-code-input').value;
    
    const res = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            action: 'join',
            gameId: gameId 
        })
    });
    
    const data = await res.json();
    
    if (data.success) {
        alert('✅ Vous êtes Joueur ' + data.playerNumber);
        currentGame = gameId;
        
        // Vérifier si 2 joueurs
        if (data.players === 2) {
            setTimeout(() => {
                document.getElementById('lobby-screen').classList.remove('active');
                document.getElementById('game-screen').classList.add('active');
            }, 1000);
        } else {
            // Attendre le 2ème joueur
            waitForSecondPlayer();
        }
    } else {
        alert('❌ ' + data.error);
    }
};

function waitForSecondPlayer() {
    const check = setInterval(async () => {
        const res = await fetch(`/api/game?gameId=${currentGame}`);
        const data = await res.json();
        
        if (data.players && data.players.length === 2) {
            clearInterval(check);
            document.getElementById('lobby-screen').classList.remove('active');
            document.getElementById('game-screen').classList.add('active');
        }
    }, 2000);
}
