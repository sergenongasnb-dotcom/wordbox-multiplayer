// DÉBUT DU FICHIER - LIGNE 1
const games = {};

export default function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method === 'POST') {
        const gameId = 'WB_' + Math.random().toString(36).substr(2, 6).toUpperCase();
        
        games[gameId] = {
            gameId: gameId,
            players: {},
            gameState: {
                turn: 'player1',
                scores: { player1: 0, player2: 0 },
                foundWords: { player1: [], player2: [] },
                gameActive: false
            },
            createdAt: Date.now()
        };
        
        console.log('Partie créée:', gameId);
        
        return res.json({ 
            success: true, 
            gameId: gameId 
        });
    }
    
    if (req.method === 'GET') {
        const { gameId } = req.query;
        
        if (!gameId || !games[gameId]) {
            return res.status(404).json({ error: 'Partie non trouvée' });
        }
        
        return res.json(games[gameId].gameState);
    }
    
    return res.status(405).json({ error: 'Méthode non autorisée' });
}
