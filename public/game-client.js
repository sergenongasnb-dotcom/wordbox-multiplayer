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

function initGame() {
    // Générer la grille
    const grid = document.getElementById('grid-container');
    grid.innerHTML = '<canvas id="selection-canvas"></canvas>';
    
    // Créer 5x5 cellules
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
            const cell = document.createElement('div');
            cell.className = 'letter-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.dataset.letter = getRandomLetter();
            cell.textContent = cell.dataset.letter;
            cell.onmousedown = startDragging;
            cell.ontouchstart = startDragging;
            grid.appendChild(cell);
        }
    }
    
    // Démarrer le timer
    startTimer(120); // 2 minutes
}

function getRandomLetter() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return letters[Math.floor(Math.random() * letters.length)];
}

function startTimer(seconds) {
    let time = seconds;
    const timerElement = document.getElementById('time');
    
    const interval = setInterval(() => {
        const minutes = Math.floor(time / 60);
        const secs = time % 60;
        timerElement.textContent = `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
        
        if (time <= 0) {
            clearInterval(interval);
            alert('Temps écoulé!');
        }
        time--;
    }, 1000);
}

// Ajoute ces fonctions de drag
function startDragging(e) {
    e.preventDefault();
    console.log('Drag commencé');
}

// Modifie startGame pour appeler initGame
function startGame() {
    document.getElementById('lobby-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
    initGame(); // <-- AJOUTE ÇA
}
