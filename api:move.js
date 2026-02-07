let games = {};
const DICTIONARY = new Set(['ABLE', 'ABRI', 'ACRE', 'ACTION', 'ANIMAL', 'BATEAU', 'CHAISE']);

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method === 'POST') {
        try {
            const { gameId, playerId, word, letters } = req.body;
            
            if (!gameId || !games[gameId]) {
                return res.status(404).json({ error: 'Partie non trouvée' });
            }
            
            const game = games[gameId];
            
            // Vérifier le tour
            const player = game.players[playerId];
            if (!player) return res.status(400).json({ error: 'Joueur non trouvé' });
            
            const playerKey = player.isPlayer1 ? 'player1' : 'player2';
            
            if (game.gameState.turn !== playerKey) {
                return res.status(400).json({ error: "Ce n'est pas votre tour" });
            }
            
            // Validation du mot
            word = word.toUpperCase();
            
            if (word.length < 3) {
                return res.status(400).json({ error: 'Minimum 3 lettres' });
            }
            
            if (!DICTIONARY.has(word)) {
                return res.status(400).json({ error: 'Mot non valide' });
            }
            
            // Vérifier si déjà utilisé
            const allWords = [
                ...game.gameState.foundWords.player1,
                ...game.gameState.foundWords.player2
            ];
            
            if (allWords.includes(word)) {
                return res.status(400).json({ error: 'Mot déjà utilisé' });
            }
            
            // Calculer les points
            const points = word.length;
            let bonus = 0;
            if (word.length >= 6) bonus += 2;
            if (word.length >= 8) bonus += 3;
            
            const totalPoints = points + bonus;
            
            // Mettre à jour l'état
            game.gameState.scores[playerKey] += totalPoints;
            game.gameState.foundWords[playerKey].push(word);
            
            // Changer de tour
            game.gameState.turn = playerKey === 'player1' ? 'player2' : 'player1';
            game.gameState.turnTimeLeft = 30;
            
            // Vérifier si la partie est terminée
            if (game.gameState.timeLeft <= 0) {
                game.gameState.gameActive = false;
                game.gameState.winner = determineWinner(game.gameState.scores);
            }
            
            return res.status(200).json({
                success: true,
                points: totalPoints,
                gameState: game.gameState
            });
            
        } catch (error) {
            return res.status(500).json({ error: 'Erreur serveur' });
        }
    }
}

function determineWinner(scores) {
    if (scores.player1 > scores.player2) return 'player1';
    if (scores.player2 > scores.player1) return 'player2';
    return 'draw';
}