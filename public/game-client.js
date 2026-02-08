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
