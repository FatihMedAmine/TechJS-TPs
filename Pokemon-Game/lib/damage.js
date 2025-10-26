
export const calculateDamage = (attacker, defender, move) => {
  // Choix de l'attaque physique ou spéciale
  const attackStat =
    move.damageClass === "physical"
      ? attacker.stats.attack
      : attacker.stats["special-attack"];
  const defenseStat =
    move.damageClass === "physical"
      ? defender.stats.defense
      : defender.stats["special-defense"];

  // Formule simple : dégâts = power * (attack/defense)
  const damage = Math.floor(move.power * (attackStat / defenseStat));
  return damage;
};
