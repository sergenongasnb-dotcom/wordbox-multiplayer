// Stockage en mémoire (pour le prototype)
let games = {};

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method === 'GET') {
        const { gameId } = req.query;
        
        if (!gameId || !games[gameId]) {
            return res.status(404).json({ error: 'Partie non trouvée' });
        }
        
        return res.status(200).json(games[gameId]);
    }
    
    if (req.method === 'POST') {
        // Créer une nouvelle partie
        const gameId = 'WB_' + Math.random().toString(36).substr(2, 6).toUpperCase();
        
        games[gameId] = {
            gameId,
            players: {},
            gameState: {
                grid: generateGrid(),
                turn: 'player1',
                scores: { player1: 0, player2: 0 },
                foundWords: { player1: [], player2: [] },
                timeLeft: 120,
                turnTimeLeft: 30,
                gameActive: false,
                createdAt: new Date().toISOString()
            }
        };
        
        return res.status(200).json({ gameId });
    }
}

function generateGrid() {
    // Générer une grille 5x5
    const grid = [];
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    for (let i = 0; i < 5; i++) {
        grid[i] = [];
        for (let j = 0; j < 5; j++) {
            // Fréquence française approximative
            const letterPool = 'AAAAAEEEEEIIIIIOOOOONNNNRRRRSSSSTTTTLLLLUUUUDDDDMMMPPPGGGCCBBFFHHVVJQKWXYZ';
            grid[i][j] = letterPool[Math.floor(Math.random() * letterPool.length)];
        }
    }
    
    return grid;
}
