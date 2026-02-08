const games = {};

export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.method === 'POST') {
        // Créer une partie (sans paramètres)
        const gameId = 'WB' + Math.random().toString(36).substr(2, 4).toUpperCase();
        
        games[gameId] = {
            players: {}
        };
        
        return res.json({ success: true, gameId });
    }
    
    return res.json({ error: 'Méthode non supportée' });
}
