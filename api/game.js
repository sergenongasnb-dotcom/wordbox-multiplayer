const games = {};

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    
    const { action } = req.query;
    
    if (req.method === 'POST') {
        try {
            const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
            
            if (action === 'create') {
                // CRÉER une partie
                const gameId = 'WB' + Math.random().toString(36).substr(2, 6).toUpperCase();
                
                games[gameId] = {
                    gameId,
                    players: {},
                    gameState: { scores: { p1: 0, p2: 0 }, turn: 'p1' }
                };
                
                return res.json({ success: true, gameId });
            }
            
            if (action === 'join') {
                // REJOINDRE une partie
                const { gameId } = body;
                
                if (!gameId || !games[gameId]) {
                    return res.status(404).json({ error: 'Partie non trouvée' });
                }
                
                const game = games[gameId];
                const playerCount = Object.keys(game.players).length;
                
                if (playerCount >= 2) {
                    return res.status(400).json({ error: 'Partie pleine' });
                }
                
                const playerId = 'P' + Date.now();
                const isPlayer1 = playerCount === 0;
                
                game.players[playerId] = { id: playerId, isPlayer1 };
                
                return res.json({ 
                    success: true, 
                    playerId, 
                    isPlayer1,
                    players: game.players 
                });
            }
        } catch (error) {
            return res.status(500).json({ error: 'Erreur serveur' });
        }
    }
    
    return res.status(405).json({ error: 'Méthode non autorisée' });
}

if (action === 'check') {
    const { gameId } = req.query;
    
    if (!gameId || !games[gameId]) {
        return res.json({ ready: false });
    }
    
    const game = games[gameId];
    const playerCount = Object.keys(game.players).length;
    
    // Prêt si 2 joueurs
    return res.json({ 
        ready: playerCount === 2,
        players: game.players 
    });
}
