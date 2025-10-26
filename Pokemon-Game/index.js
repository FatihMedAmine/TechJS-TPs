import { fetchPokemon, fetchPokemonList, fetchMove } from "./lib/api.js";
import chalk from "chalk";
import inquirer from "inquirer";

// --- Initialiser les HP ---
var playerHP = 300;
var botHP = 300;

// refactoring le code principal en une fonction  async main
const select_available_moves = async (pokemon, owner, limit = 5) => {
  console.log(chalk.yellow(`\nChargement des moves de ${owner}...`));
  const moves = [];
  for (const move of pokemon.moves) {
    if (moves.length >= limit) break;
    const moveDetails = await fetchMove(move.url);
    if (moveDetails && moveDetails.power && moveDetails.pp) {
      moves.push({
        ...moveDetails,
        ppCurrent: moveDetails.pp, // suivre le PP en combat
      });
    }
  }
  return moves;
};

const executeMove = (attacker, defender, move) => {
  if (move.ppCurrent <= 0) {
    console.log(
      chalk.gray(`${attacker.name} n'a plus de PP pour ${move.name}!`)
    );
    return 0;
  }

  // Vérification de l'accuracy
  const hitRoll = Math.random() * 100;
  if (move.accuracy && hitRoll > move.accuracy) {
    console.log(chalk.gray(`${attacker.name} rate ${move.name}!`));
    move.ppCurrent--;
    return 0;
  }

  const damage = calculateDamage(attacker, defender, move);
  move.ppCurrent--;
  return damage;
};

const selectPlayerMove = async (playerMoves) => {
  const choices = playerMoves.map((m, i) => ({
    name: `${m.name} | Power: ${m.power} | PP: ${m.ppCurrent}/${m.pp}`,
    value: i,
  }));

  const { moveIndex } = await inquirer.prompt([
    {
      type: "list",
      name: "moveIndex",
      message: "Choisissez votre attaque :",
      choices,
    },
  ]);

  return playerMoves[moveIndex];
};

const selectBotMove = (botMoves) => {
  // Choix aléatoire parmi les moves ayant encore du PP
  const availableMoves = botMoves.filter((m) => m.ppCurrent > 0);
  if (availableMoves.length === 0) return null;
  const move =
    availableMoves[Math.floor(Math.random() * availableMoves.length)];
  return move;
};

async function main() {
  console.log(chalk.blue.bold("----------- Pokemon Selection -----------\n"));

  const pokemonList = await fetchPokemonList(10);

  if (pokemonList.length === 0) {
    console.log(chalk.red("Impossible de récupérer la liste des Pokemon."));
    return;
  }

  const { selectedPokemon } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedPokemon",
      message: "Choisissez votre Pokémon :",
      choices: pokemonList.map((p) => ({
        name: p.name.charAt(0).toUpperCase() + p.name.slice(1),
        value: p.name,
      })),
    },
  ]);

  const pokemon = await fetchPokemon(selectedPokemon);

  if (!pokemon) {
    console.log(chalk.red("Erreur de chargement du Pokémon."));
    return;
  }

  console.log(chalk.green(`\n${pokemon.name.toUpperCase()} choisi !\n`));
  console.log(chalk.yellow("Chargement des moves du joueur..."));

  // --- selection des 5 moves du joueur ---
  const playerMoves = await select_available_moves(pokemon, "player");

  console.log(chalk.cyan("\nVos 5 moves :"));
  playerMoves.forEach((m, i) => {
    console.log(
      `${i + 1}. ${m.name} | Power: ${m.power} | Acc: ${
        m.accuracy ?? "?"
      }% | PP: ${m.pp} | Type: ${m.type} | Class: ${m.damageClass}`
    );
  });

  // --- Bot selection ---
  const botPokemonName =
    pokemonList[Math.floor(Math.random() * pokemonList.length)].name;

  const botPokemon = await fetchPokemon(botPokemonName);

  console.log(
    chalk.yellow(`\nLe bot a choisi ${botPokemon.name.toUpperCase()} !\n`)
  );

  console.log(chalk.yellow("Chargement des moves du bot..."));

  // --- Sélection des 5 moves du bot ---
  const botMoves = await select_available_moves(botPokemon, "bot");

  console.log(chalk.cyan("Moves du bot :"));
  botMoves.forEach((m, i) => {
    console.log(`${i + 1}. ${m.name} | Power: ${m.power} | PP: ${m.pp}`);
  });

  console.log(
    chalk.cyan("\n ------------- Le combat commence ! -------------\n")
  );
  console.log(
    chalk.cyan(
      `${pokemon.name.toUpperCase()} (Vous) VS ${botPokemon.name.toUpperCase()} (Bot)\n`
    )
  );

  // --- Combat Loop ---
  while (playerHP > 0 && botHP > 0) {
    console.log(
      chalk.blue(
        `\nHP : ${pokemon.name} ${playerHP} | ${botPokemon.name} ${botHP}\n`
      )
    );

    // Choix des moves
    const playerMove = await selectPlayerMove(playerMoves);
    const botMove = selectBotMove(botMoves);

    if (!botMove) {
      console.log(chalk.red("Le bot n'a plus de PP, vous gagnez !"));
      break;
    }

    // Déterminer qui attaque en premier : speed + priority
    const playerSpeed = pokemon.stats.speed + (playerMove.priority || 0);
    const botSpeed = botPokemon.stats.speed + (botMove.priority || 0);

    const first = playerSpeed >= botSpeed ? "player" : "bot";

    if (first === "player") {
      const damage = executeMove(pokemon, botPokemon, playerMove);
      botHP -= damage;
      console.log(
        chalk.green(
          `${pokemon.name} utilise ${playerMove.name} et inflige ${damage} dégâts!`
        )
      );
      if (botHP <= 0) break;

      const damageBot = executeMove(botPokemon, pokemon, botMove);
      playerHP -= damageBot;
      console.log(
        chalk.red(
          `${botPokemon.name} utilise ${botMove.name} et inflige ${damageBot} dégâts!`
        )
      );
    } else {
      const damageBot = executeMove(botPokemon, pokemon, botMove);
      playerHP -= damageBot;
      console.log(
        chalk.red(
          `${botPokemon.name} utilise ${botMove.name} et inflige ${damageBot} dégâts!`
        )
      );
      if (playerHP <= 0) break;

      const damage = executeMove(pokemon, botPokemon, playerMove);
      botHP -= damage;
      console.log(
        chalk.green(
          `${pokemon.name} utilise ${playerMove.name} et inflige ${damage} dégâts!`
        )
      );
    }
  }

  // Résultat final
  if (playerHP <= 0) console.log(chalk.red("\n Vous avez perdu !"));
  else console.log(chalk.green("\n Vous avez gagné !"));
}

main();
