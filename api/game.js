const games = {};
const VALID_WORDS = new Set(['ABLE', 'ABRI', 'ACRE', 'AIRE', 'AVION', 'BANC', 'BLEU', 'CHAISE', 'TABLE']);

export default function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    
    try {
        const body = req.body || {};
        const { action, gameId, word, playerId } = body;
        
        // CRÉER
        if (action === 'create') {
            const newId = 'WB' + Math.random().toString(36).substr(2, 4).toUpperCase();
            const grid = [];
            for (let i = 0; i < 25; i++) {
                grid.push(String.fromCharCode(65 + Math.floor(Math.random() * 26)));
            }
            
            games[newId] = {
                grid: grid,
                players: {},
                scores: {'1':0, '2':0},
                words: {'1':[], '2':[]},
                timeLeft: 120,
                active: false,
                startTime: null
            };
            
            return res.json({success: true, gameId: newId, grid: grid});
        }
        
        // REJOINDRE
        if (action === 'join') {
            if (!gameId || !games[gameId]) {
                return res.json({error: 'Partie non trouvée'});
            }
            
            const game = games[gameId];
            const count = Object.keys(game.players).length;
            
            if (count >= 2) {
                return res.json({error: 'Partie pleine'});
            }
            
            const playerNum = count === 0 ? '1' : '2';
            const newPid = 'P' + Date.now();
            
            game.players[newPid] = {id: newPid, num: playerNum};
            
            if (Object.keys(game.players).length === 2) {
                game.active = true;
                game.startTime = Date.now();
            }
            
            return res.json({
                success: true,
                playerId: newPid,
                playerNumber: playerNum,
                grid: game.grid
            });
        }
        
        // SOUMETTRE
        if (action === 'submit') {
            if (!gameId || !games[gameId]) {
                return res.json({error: 'Partie non trouvée'});
            }
            
            const game = games[gameId];
            const player = Object.values(game.players).find(p => p.id === playerId);
            
            if (!player) {
                return res.json({error: 'Joueur invalide'});
            }
            
            const pNum = player.num;
            const wUpper = word.toUpperCase();
            
            if (wUpper.length < 3) {
                return res.json({error: '3 lettres minimum'});
            }
            
            if (game.words[pNum].includes(wUpper)) {
                return res.json({error: 'Déjà utilisé'});
            }
            
            if (!VALID_WORDS.has(wUpper)) {
                return res.json({error: 'Mot invalide'});
            }
            
            // Points
            let pts = wUpper.length;
            if (wUpper.length >= 6) pts += 2;
            if (wUpper.length >= 8) pts += 3;
            
            game.scores[pNum] += pts;
            game.words[pNum].push(wUpper);
            
            return res.json({success: true, points: pts});
        }
        
        // GET STATE
        if (action === 'get') {
            if (!gameId || !games[gameId]) {
                return res.json({error: 'Partie non trouvée'});
            }
            
            const game = games[gameId];
            
            // Timer
            if (game.active && game.startTime) {
                const elapsed = Math.floor((Date.now() - game.startTime) / 1000);
                game.timeLeft = Math.max(0, 120 - elapsed);
                if (game.timeLeft <= 0) game.active = false;
            }
            
            return res.json({
                grid: game.grid,
                scores: game.scores,
                words: game.words,
                timeLeft: game.timeLeft,
                active: game.active
            });
        }
        
        return res.json({error: 'Action invalide'});
        
    } catch (error) {
        console.log('ERREUR:', error);
        return res.json({error: 'Erreur serveur'});
    }
}
