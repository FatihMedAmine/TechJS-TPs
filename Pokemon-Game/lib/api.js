import fetch from "node-fetch";

// get All pokemon names
export async function fetchPokemonList(limit) {
  try {
    const url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Impossible de charger la liste des Pokémon !");
    }

    const data = await response.json();

    // return only results eg: name , url
    return data.results;
  } catch (error) {
    console.error("Erreur lors du fetch de la liste:", error.message);
    return [];
  }
}

// get pokemon data
export async function fetchPokemon(pokemonName) {
  try {
    const url = `https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Pokémon "${pokemonName}" introuvable !`);
    }

    const data = await response.json();

    // Extract important stats
    const stats = {};
    for (const s of data.stats) {
      const name = s.stat.name; // e.g., 'hp', 'attack', etc.
      stats[name] = s.base_stat;
    }

    // List of moves with their name + url for details (attackes)
    const moves = data.moves.map((m) => ({
      name: m.move.name,
      url: m.move.url,
    }));

    return {
      name: data.name,
      stats,
      moves,
    };
  } catch (error) {
    console.error("Erreur lors du fetch Pokémon:", error.message);
    return null;
  }
}

// get pokemon's move details
export async function fetchMove(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Erreur lors du fetch du move !");
    }

    const data = await response.json();

    return {
      name: data.name,
      power: data.power, 
      accuracy: data.accuracy,
      pp: data.pp,
      priority: data.priority,
      damageClass: data.damage_class.name,
      type: data.type.name,
    };
  } catch (error) {
    console.error("Erreur fetchMove:", error.message);
    return null;
  }
}
