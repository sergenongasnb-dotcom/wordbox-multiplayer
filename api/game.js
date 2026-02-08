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
        try {
            const { action, gameId, word, playerId } = req.body;
            
            // CRÉER une partie
            if (action === 'create') {
                const newGameId = 'WB' + Math.random().toString(36).substr(2, 4).toUpperCase();
                const grid = generateGrid();
                
                games[newGameId] = {
                    gameId: newGameId,
                    grid: grid,
                    players: {},
                    scores: { '1': 0, '2': 0 },
                    foundWords: { '1': [], '2': [] },
                    currentTurn: '1',
                    timeLeft: 120,
                    gameActive: false,
                    createdAt: Date.now()
                };
                
                return res.json({ 
                    success: true, 
                    gameId: newGameId,
                    grid: grid 
                });
            }
            
            // REJOINDRE une partie
            if (action === 'join') {
                if (!gameId || !games[gameId]) {
                    return res.status(404).json({ error: 'Partie non trouvée' });
                }
                
                const game = games[gameId];
                const playerCount = Object.keys(game.players).length;
                
                if (playerCount >= 2) {
                    return res.status(400).json({ error: 'Partie pleine' });
                }
                
                const playerNum = (playerCount === 0) ? '1' : '2';
                const newPlayerId = 'P' + Date.now();
                
                game.players[newPlayerId] = {
                    id: newPlayerId,
                    number: playerNum
                };
                
                // Démarrer la partie si 2 joueurs
                if (Object.keys(game.players).length === 2) {
                    game.gameActive = true;
                    game.startedAt = Date.now();
                }
                
                return res.json({
                success: true,
                playerId: newPlayerId,
                playerNumber: playerNum,
                grid: game.grid,
                gameState: {  // <-- CHANGÉ de gameActive à gameState
                    gameActive: game.gameActive,
                    scores: game.scores,
                    currentTurn: game.currentTurn
                }
            });
            }
            
            // VALIDER un mot
            if (action === 'submit') {
                if (!gameId || !games[gameId]) {
                    return res.status(404).json({ error: 'Partie non trouvée' });
                }
                
                const game = games[gameId];
                const player = Object.values(game.players).find(p => p.id === playerId);
                
                if (!player) {
                    return res.status(400).json({ error: 'Joueur non trouvé' });
                }
                
                // Vérifier que c'est son tour
                if (game.currentTurn !== player.number) {
                    return res.status(400).json({ error: "Ce n'est pas votre tour" });
                }
                
                // Calculer les points
                const points = word.length;
                if (word.length >= 6) points += 2;
                if (word.length >= 8) points += 3;
                
                // Mettre à jour
                game.scores[player.number] += points;
                game.foundWords[player.number].push(word.toUpperCase());
                
                // Changer de tour
                game.currentTurn = (game.currentTurn === '1') ? '2' : '1';
                
                return res.json({
                    success: true,
                    points: points,
                    gameState: {
                        scores: game.scores,
                        foundWords: game.foundWords,
                        currentTurn: game.currentTurn,
                        timeLeft: game.timeLeft,
                        gameActive: game.gameActive
                    }
                });
            }
            
            // OBTENIR l'état de la partie
            if (action === 'get') {
                if (!gameId || !games[gameId]) {
                    return res.status(404).json({ error: 'Partie non trouvée' });
                }
                
                const game = games[gameId];
                
                // Mettre à jour le timer
                if (game.gameActive && game.startedAt) {
                    const elapsed = Math.floor((Date.now() - game.startedAt) / 1000);
                    game.timeLeft = Math.max(0, 120 - elapsed);
                    
                    if (game.timeLeft <= 0) {
                        game.gameActive = false;
                    }
                }
                
                return res.json({
                    gameState: {
                        grid: game.grid,
                        scores: game.scores,
                        foundWords: game.foundWords,
                        currentTurn: game.currentTurn,
                        timeLeft: game.timeLeft,
                        gameActive: game.gameActive,
                        players: game.players
                    }
                });
            }
            
        } catch (error) {
            return res.status(500).json({ error: 'Erreur serveur' });
        }
    }
    
    return res.status(405).json({ error: 'Méthode non autorisée' });
}

// Génère la MÊME grille pour tous
function generateGrid() {
    const vowels = 'AAAAAEEEEEIIIIIOOOOUUU';
    const consonants = 'BBCCCDDDFFGGGHHJJKKLLLLMMNNNPPQQRRRRSSSSTTTTVWXYZ';
    
    let grid = [];
    
    // 25 lettres: ~40% voyelles, 60% consonnes
    for (let i = 0; i < 25; i++) {
        if (Math.random() < 0.4) {
            grid.push(vowels[Math.floor(Math.random() * vowels.length)]);
        } else {
            grid.push(consonants[Math.floor(Math.random() * consonants.length)]);
        }
    }
    
    return grid;
}
