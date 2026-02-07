let games = {};

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method === 'POST') {
        try {
            const { gameId } = req.body;
            
            if (!gameId || !games[gameId]) {
                return res.status(404).json({ error: 'Partie non trouvée' });
            }
            
            const game = games[gameId];
            const playerCount = Object.keys(game.players).length;
            
            if (playerCount >= 2) {
                return res.status(400).json({ error: 'Partie pleine' });
            }
            
            const playerId = 'P' + Math.random().toString(36).substr(2, 8);
            const isPlayer1 = playerCount === 0;
            
            game.players[playerId] = {
                id: playerId,
                isPlayer1,
                joinedAt: new Date().toISOString()
            };
            
            return res.status(200).json({
                playerId,
                isPlayer1,
                players: game.players,
                gameState: game.gameState
            });
        } catch (error) {
            return res.status(500).json({ error: 'Erreur serveur' });
        }
    }
}