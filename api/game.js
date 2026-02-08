const games = {};


export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method === 'POST') {
        // Créer une partie (sans paramètres)
        const gameId = 'WB' + Math.random().toString(36).substr(2, 4).toUpperCase();
        const { gameId, action } = req.body || {};

        games[gameId] = {
            players: {}
        };
        if (action === 'create') {
            // CRÉER
            const newGameId = 'WB' + Math.random().toString(36).substr(2, 4).toUpperCase();
            games[newGameId] = { players: [], turn: 1 };
            return res.json({ success: true, gameId: newGameId });
        }

        return res.json({ success: true, gameId });
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

    return res.json({ error: 'Méthode non supportée' });
    return res.json({ error: 'Erreur' });
}
