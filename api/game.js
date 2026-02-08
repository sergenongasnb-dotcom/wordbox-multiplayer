const games = {};

export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    
    if (req.method === 'POST') {
        const { gameId, action } = req.body || {};
        
        if (action === 'create') {
            // CRÉER
            const newGameId = 'WB' + Math.random().toString(36).substr(2, 4).toUpperCase();
            games[newGameId] = { players: [], turn: 1 };
            return res.json({ success: true, gameId: newGameId });
        }
        
        if (action === 'join' && gameId && games[gameId]) {
            // REJOINDRE
            const game = games[gameId];
            const playerNumber = game.players.length + 1;
            
            if (playerNumber > 2) {
                return res.json({ error: 'Partie pleine' });
            }
            
            game.players.push(playerNumber);
            
            return res.json({ 
                success: true, 
                playerNumber: playerNumber,
                players: game.players.length
            });
        }
    }
    
    if (req.method === 'GET') {
        const { gameId } = req.query;
        if (gameId && games[gameId]) {
            return res.json(games[gameId]);
        }
    }
    
    return res.json({ error: 'Erreur' });
}

const games = {};

export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    
    if (req.method === 'POST') {
        const { gameId, action } = req.body || {};
        
        if (action === 'create') {
            const newGameId = 'WB' + Math.random().toString(36).substr(2, 4).toUpperCase();
            const grid = generateGrid(); // MÊME GRILLE POUR TOUS
            
            games[newGameId] = {
                grid: grid,
                players: [],
                turn: 1,
                scores: {1: 0, 2: 0},
                timeLeft: 120,
                gameActive: false
            };
            
            return res.json({ success: true, gameId: newGameId, grid: grid });
        }
        
        if (action === 'join' && gameId && games[gameId]) {
            const game = games[gameId];
            const playerNumber = game.players.length + 1;
            
            if (playerNumber > 2) return res.json({ error: 'Partie pleine' });
            
            game.players.push(playerNumber);
            
            // Démarrer la partie si 2 joueurs
            if (game.players.length === 2) {
                game.gameActive = true;
                game.startTime = Date.now();
            }
            
            return res.json({ 
                success: true, 
                playerNumber: playerNumber,
                grid: game.grid,
                gameState: game
            });
        }
        
        if (action === 'submit') {
            // Soumettre un mot
            const game = games[gameId];
            if (game) {
                // Changer de tour
                game.turn = game.turn === 1 ? 2 : 1;
                return res.json({ success: true, gameState: game });
            }
        }
    }
    
    if (req.method === 'GET') {
        const { gameId } = req.query;
        if (gameId && games[gameId]) {
            return res.json(games[gameId]);
        }
    }
    
    return res.json({ error: 'Erreur' });
}

function generateGrid() {
    // MÊME GRILLE POUR TOUS
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const grid = [];
    for (let i = 0; i < 25; i++) {
        grid.push(letters[Math.floor(Math.random() * letters.length)]);
    }
    return grid;
}
