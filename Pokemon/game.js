const inquirer = require('inquirer');
const https = require('https');

// Helper function to make API requests
function fetchFromAPI(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

// Pokemon class
class Pokemon {
    constructor(data) {
        this.name = data.name;
        this.hp = 300;
        this.maxHp = 300;
        this.stats = {
            attack: data.stats.find(s => s.stat.name === 'attack').base_stat,
            defense: data.stats.find(s => s.stat.name === 'defense').base_stat,
            speed: data.stats.find(s => s.stat.name === 'speed').base_stat,
            specialAttack: data.stats.find(s => s.stat.name === 'special-attack').base_stat,
            specialDefense: data.stats.find(s => s.stat.name === 'special-defense').base_stat
        };
        this.moves = [];
        this.types = data.types.map(t => t.type.name);
    }

    async loadMoves(moveData) {
        // Get up to 5 moves
        const movesToLoad = moveData.slice(0, 5);
        
        for (let moveEntry of movesToLoad) {
            try {
                const moveDetails = await fetchFromAPI(moveEntry.move.url);
                
                // Only add moves that have power and pp
                if (moveDetails.power && moveDetails.pp) {
                    this.moves.push({
                        name: moveDetails.name,
                        power: moveDetails.power,
                        accuracy: moveDetails.accuracy || 100,
                        pp: moveDetails.pp,
                        currentPp: moveDetails.pp,
                        type: moveDetails.type.name,
                        damageClass: moveDetails.damage_class.name
                    });
                }
                
                if (this.moves.length >= 5) break;
            } catch (error) {
                console.log(`Erreur chargement du move: ${error.message}`);
            }
        }

        // If we don't have 5 moves, add a default tackle move
        while (this.moves.length < 5) {
            this.moves.push({
                name: 'tackle',
                power: 40,
                accuracy: 100,
                pp: 35,
                currentPp: 35,
                type: 'normal',
                damageClass: 'physical'
            });
        }
    }

    isAlive() {
        return this.hp > 0;
    }

    displayStatus() {
        console.log(`\n${this.name.toUpperCase()} - HP: ${this.hp}/${this.maxHp}`);
        console.log(`Types: ${this.types.join(', ')}`);
        console.log(`Attaque: ${this.stats.attack} | Defense: ${this.stats.defense} | Vitesse: ${this.stats.speed}`);
    }

    displayMoves() {
        console.log('\n--- MOVES DISPONIBLES ---');
        this.moves.forEach((move, index) => {
            console.log(`${index + 1}. ${move.name.toUpperCase()} - Puissance: ${move.power} | Précision: ${move.accuracy}% | PP: ${move.currentPp}/${move.pp} | Type: ${move.type}`);
        });
    }
}

// Battle system
class Battle {
    constructor(playerPokemon, enemyPokemon) {
        this.player = playerPokemon;
        this.enemy = enemyPokemon;
        this.turn = 1;
    }

    // Calculate type effectiveness
    getTypeEffectiveness(attackType, defenderTypes) {
        const typeChart = {
            'normal': { 'rock': 0.5, 'ghost': 0, 'steel': 0.5 },
            'fire': { 'fire': 0.5, 'water': 0.5, 'grass': 2, 'ice': 2, 'bug': 2, 'rock': 0.5, 'dragon': 0.5, 'steel': 2 },
            'water': { 'fire': 2, 'water': 0.5, 'grass': 0.5, 'ground': 2, 'rock': 2, 'dragon': 0.5 },
            'electric': { 'water': 2, 'electric': 0.5, 'grass': 0.5, 'ground': 0, 'flying': 2, 'dragon': 0.5 },
            'grass': { 'fire': 0.5, 'water': 2, 'grass': 0.5, 'poison': 0.5, 'ground': 2, 'flying': 0.5, 'bug': 0.5, 'rock': 2, 'dragon': 0.5, 'steel': 0.5 },
            'ice': { 'fire': 0.5, 'water': 0.5, 'grass': 2, 'ice': 0.5, 'ground': 2, 'flying': 2, 'dragon': 2, 'steel': 0.5 },
            'fighting': { 'normal': 2, 'ice': 2, 'poison': 0.5, 'flying': 0.5, 'psychic': 0.5, 'bug': 0.5, 'rock': 2, 'ghost': 0, 'dark': 2, 'steel': 2, 'fairy': 0.5 },
            'poison': { 'grass': 2, 'poison': 0.5, 'ground': 0.5, 'rock': 0.5, 'ghost': 0.5, 'steel': 0, 'fairy': 2 },
            'ground': { 'fire': 2, 'electric': 2, 'grass': 0.5, 'poison': 2, 'flying': 0, 'bug': 0.5, 'rock': 2, 'steel': 2 },
            'flying': { 'electric': 0.5, 'grass': 2, 'fighting': 2, 'bug': 2, 'rock': 0.5, 'steel': 0.5 },
            'psychic': { 'fighting': 2, 'poison': 2, 'psychic': 0.5, 'dark': 0, 'steel': 0.5 },
            'bug': { 'fire': 0.5, 'grass': 2, 'fighting': 0.5, 'poison': 0.5, 'flying': 0.5, 'psychic': 2, 'ghost': 0.5, 'dark': 2, 'steel': 0.5, 'fairy': 0.5 },
            'rock': { 'fire': 2, 'ice': 2, 'fighting': 0.5, 'ground': 0.5, 'flying': 2, 'bug': 2, 'steel': 0.5 },
            'ghost': { 'normal': 0, 'psychic': 2, 'ghost': 2, 'dark': 0.5 },
            'dragon': { 'dragon': 2, 'steel': 0.5, 'fairy': 0 },
            'dark': { 'fighting': 0.5, 'psychic': 2, 'ghost': 2, 'dark': 0.5, 'fairy': 0.5 },
            'steel': { 'fire': 0.5, 'water': 0.5, 'electric': 0.5, 'ice': 2, 'rock': 2, 'steel': 0.5, 'fairy': 2 },
            'fairy': { 'fire': 0.5, 'fighting': 2, 'poison': 0.5, 'dragon': 2, 'dark': 2, 'steel': 0.5 }
        };

        let effectiveness = 1;
        const attackTypeEffects = typeChart[attackType] || {};
        
        for (let defenderType of defenderTypes) {
            if (attackTypeEffects[defenderType] !== undefined) {
                effectiveness *= attackTypeEffects[defenderType];
            }
        }
        
        return effectiveness;
    }

    // Calculate damage
    calculateDamage(attacker, defender, move) {
        // Check accuracy
        if (Math.random() * 100 > move.accuracy) {
            return { damage: 0, missed: true };
        }

        // Base damage calculation
        const level = 50;
        const attack = move.damageClass === 'physical' ? attacker.stats.attack : attacker.stats.specialAttack;
        const defense = move.damageClass === 'physical' ? defender.stats.defense : defender.stats.specialDefense;
        
        // STAB (Same Type Attack Bonus)
        const stab = attacker.types.includes(move.type) ? 1.5 : 1;
        
        // Type effectiveness
        const typeEffectiveness = this.getTypeEffectiveness(move.type, defender.types);
        
        // Random factor (0.85 to 1.0)
        const random = 0.85 + Math.random() * 0.15;
        
        // Damage formula (simplified Pokemon damage formula)
        let damage = ((((2 * level / 5 + 2) * move.power * attack / defense) / 50) + 2);
        damage = Math.floor(damage * stab * typeEffectiveness * random);

        return { damage, missed: false, typeEffectiveness };
    }

    async executeTurn(playerMove, enemyMove) {
        console.log(`\n=== TOUR ${this.turn} ===`);
        
        // Determine who goes first based on speed
        let first, second, firstMove, secondMove;
        
        if (this.player.stats.speed > this.enemy.stats.speed) {
            first = this.player;
            second = this.enemy;
            firstMove = playerMove;
            secondMove = enemyMove;
        } else if (this.player.stats.speed < this.enemy.stats.speed) {
            first = this.enemy;
            second = this.player;
            firstMove = enemyMove;
            secondMove = playerMove;
        } else {
            // Same speed, random
            if (Math.random() < 0.5) {
                first = this.player;
                second = this.enemy;
                firstMove = playerMove;
                secondMove = enemyMove;
            } else {
                first = this.enemy;
                second = this.player;
                firstMove = enemyMove;
                secondMove = playerMove;
            }
        }

        // First attack
        await this.performAttack(first, second, firstMove);
        
        // Check if second pokemon is still alive
        if (!second.isAlive()) {
            return;
        }

        // Second attack
        await this.performAttack(second, first, secondMove);
        
        this.turn++;
    }

    async performAttack(attacker, defender, move) {
        const isPlayer = attacker === this.player;
        const attackerName = isPlayer ? 'Vous' : 'Ennemi';
        
        console.log(`\n${attackerName} (${attacker.name}) utilise ${move.name.toUpperCase()}!`);
        
        // Check PP
        if (move.currentPp <= 0) {
            console.log(`${move.name} n'a plus de PP!`);
            return;
        }

        move.currentPp--;

        const result = this.calculateDamage(attacker, defender, move);
        
        if (result.missed) {
            console.log(`L'attaque a raté!`);
            return;
        }

        defender.hp = Math.max(0, defender.hp - result.damage);
        
        console.log(`Dégâts infligés: ${result.damage}`);
        
        if (result.typeEffectiveness > 1) {
            console.log(`C'est super efficace!`);
        } else if (result.typeEffectiveness < 1 && result.typeEffectiveness > 0) {
            console.log(`Ce n'est pas très efficace...`);
        } else if (result.typeEffectiveness === 0) {
            console.log(`Ça n'a aucun effet...`);
        }
        
        console.log(`${defender.name} HP: ${defender.hp}/${defender.maxHp}`);
    }

    async start() {
        console.log('\n╔════════════════════════════════════════╗');
        console.log('║     ⚔️  COMBAT POKEMON COMMENCE! ⚔️     ║');
        console.log('╔════════════════════════════════════════╗\n');
        
        console.log(`${this.player.name.toUpperCase()} VS ${this.enemy.name.toUpperCase()}\n`);
        
        while (this.player.isAlive() && this.enemy.isAlive()) {
            // Display status
            console.log('\n' + '='.repeat(50));
            this.player.displayStatus();
            this.enemy.displayStatus();
            console.log('='.repeat(50));

            // Player chooses move
            const playerMove = await this.getPlayerMoveChoice();
            
            // Enemy chooses random move
            const enemyMove = this.getEnemyMoveChoice();
            
            // Execute turn
            await this.executeTurn(playerMove, enemyMove);
            
            // Small delay for readability
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Battle end
        console.log('\n' + '='.repeat(50));
        if (this.player.isAlive()) {
            console.log('\n🎉 VICTOIRE! Vous avez gagné! 🎉\n');
        } else {
            console.log('\n💀 DÉFAITE! Vous avez perdu... 💀\n');
        }
        console.log('='.repeat(50));
    }

    async getPlayerMoveChoice() {
        this.player.displayMoves();
        
        const choices = this.player.moves.map((move, index) => {
            const status = move.currentPp > 0 ? '✓' : '✗';
            const powerBar = '█'.repeat(Math.floor(move.power / 20));
            return {
                name: `${status} ${move.name.toUpperCase().padEnd(20)} | ⚡${move.power.toString().padEnd(3)} | 🎯${move.accuracy}% | PP:${move.currentPp}/${move.pp} | ${powerBar}`,
                value: index,
                disabled: move.currentPp <= 0 ? 'Plus de PP!' : false
            };
        });

        const answer = await inquirer.prompt([
            {
                type: 'list',
                name: 'moveIndex',
                message: '⚔️  Choisissez votre attaque:',
                choices: choices,
                pageSize: 5
            }
        ]);

        return this.player.moves[answer.moveIndex];
    }

    getEnemyMoveChoice() {
        // Filter moves with PP remaining
        const availableMoves = this.enemy.moves.filter(m => m.currentPp > 0);
        
        if (availableMoves.length === 0) {
            // If no moves available, return first move anyway (struggle)
            return this.enemy.moves[0];
        }
        
        // Random choice
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }
}

// Main game logic
async function main() {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║   🎮 POKEMON BATTLE GAME 🎮            ║');
    console.log('╚════════════════════════════════════════╝\n');

    // Helper function to get Pokemon emoji
    this.getPokemonEmoji = function(name) {
        const emojiMap = {
            'pikachu': '⚡', 'charizard': '🔥', 'blastoise': '💧', 'venusaur': '🌿',
            'mewtwo': '🔮', 'dragonite': '🐉', 'gyarados': '🌊', 'alakazam': '✨',
            'gengar': '👻', 'machamp': '💪', 'arcanine': '🦊', 'snorlax': '😴',
            'lapras': '🦕', 'eevee': '🦊', 'jolteon': '⚡', 'vaporeon': '💧',
            'flareon': '🔥', 'articuno': '❄️', 'zapdos': '⚡', 'moltres': '🔥'
        };
        return emojiMap[name] || '⭐';
    };

    try {
        // Get list of popular Pokemon
        console.log('Chargement des Pokemon disponibles...\n');
        
        const popularPokemon = [
            'pikachu', 'charizard', 'blastoise', 'venusaur', 'mewtwo',
            'dragonite', 'gyarados', 'alakazam', 'gengar', 'machamp',
            'arcanine', 'snorlax', 'lapras', 'eevee', 'jolteon',
            'vaporeon', 'flareon', 'articuno', 'zapdos', 'moltres'
        ];

        console.log('Pokemon disponibles:');
        const pokemonChoices = popularPokemon.map((name, index) => ({
            name: `${(index + 1).toString().padStart(2, '0')}. ${name.charAt(0).toUpperCase() + name.slice(1).padEnd(15)} ${this.getPokemonEmoji(name)}`,
            value: name
        }));

        // Player chooses Pokemon
        const playerAnswer = await inquirer.prompt([
            {
                type: 'list',
                name: 'pokemon',
                message: '🎮 Choisissez votre Pokemon:',
                choices: pokemonChoices,
                pageSize: 10
            }
        ]);

        const playerChoice = playerAnswer.pokemon;

        console.log(`\nVous avez choisi: ${playerChoice.toUpperCase()}!`);
        console.log('Chargement de votre Pokemon...');

        // Load player Pokemon
        const playerData = await fetchFromAPI(`https://pokeapi.co/api/v2/pokemon/${playerChoice}`);
        const playerPokemon = new Pokemon(playerData);
        await playerPokemon.loadMoves(playerData.moves);

        console.log('\nLe bot choisit son Pokemon au hasard...');
        
        // Enemy chooses random Pokemon
        const enemyChoice = popularPokemon[Math.floor(Math.random() * popularPokemon.length)];
        console.log(`Le bot a choisi: ${enemyChoice.toUpperCase()}!`);
        console.log('Chargement du Pokemon ennemi...');

        const enemyData = await fetchFromAPI(`https://pokeapi.co/api/v2/pokemon/${enemyChoice}`);
        const enemyPokemon = new Pokemon(enemyData);
        await enemyPokemon.loadMoves(enemyData.moves);

        console.log('\nTous les Pokemon sont prêts!');
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Start battle
        const battle = new Battle(playerPokemon, enemyPokemon);
        await battle.start();

        // Ask if player wants to play again
        const playAgain = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'again',
                message: '🔄 Voulez-vous rejouer?',
                default: true
            }
        ]);

        if (playAgain.again) {
            console.clear();
            await main();
        } else {
            console.log('\n👋 Merci d\'avoir joué! À bientôt!\n');
        }

    } catch (error) {
        console.error('Erreur:', error.message);
    }
}

// Start the game
main();
