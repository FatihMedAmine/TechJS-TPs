# 🎮 Pokemon Battle Game

Un mini-jeu de combat Pokemon utilisant la [PokeAPI](https://pokeapi.co) !

## 📋 Caractéristiques

- **Sélection de Pokemon**: Choisissez parmi 20 Pokemon populaires
- **Combat au tour par tour**: Affrontez un bot qui choisit aléatoirement son Pokemon
- **5 Moves par Pokemon**: Chaque Pokemon dispose de 5 attaques avec différentes puissances
- **Système de combat complet**:
  - ✅ Précision des attaques (accuracy)
  - ✅ Points de pouvoir (PP) pour chaque move
  - ✅ Système de vitesse (le plus rapide attaque en premier)
  - ✅ Calcul des dégâts basé sur les stats (Attaque, Défense, Attaque Spéciale, Défense Spéciale)
  - ✅ Efficacité des types (super efficace, pas très efficace, etc.)
  - ✅ STAB (Same Type Attack Bonus)
  - ✅ 300 HP pour chaque joueur

## 🚀 Installation et Lancement

### Prérequis
- Node.js installé sur votre machine

### Lancer le jeu

```powershell
node game.js
```

Ou avec npm:

```powershell
npm start
```

## 🎯 Comment jouer

1. **Choisissez votre Pokemon** parmi la liste de 20 Pokemon disponibles
2. **Le bot choisit automatiquement** son Pokemon aléatoirement
3. **À chaque tour**:
   - Consultez les statistiques de votre Pokemon et de l'adversaire
   - Choisissez une attaque (1-5)
   - L'attaque est exécutée en fonction de la vitesse
4. **Le combat continue** jusqu'à ce qu'un Pokemon atteigne 0 HP
5. **Victoire ou défaite** !

## ⚔️ Mécaniques de combat

### Calcul des dégâts
Le jeu utilise une formule simplifiée basée sur la formule officielle Pokemon:
- **Stats**: Attaque, Défense, Attaque Spéciale, Défense Spéciale
- **Puissance du move**: Définie par la PokeAPI
- **STAB**: Bonus de 50% si le type du move correspond au type du Pokemon
- **Efficacité des types**: Multiplicateur selon le tableau des types
- **Facteur aléatoire**: Entre 85% et 100%

### Précision
Chaque attaque a une chance de rater basée sur sa précision (accuracy).

### PP (Power Points)
Chaque move a un nombre limité d'utilisations. Une fois les PP épuisés, le move ne peut plus être utilisé.

### Vitesse
Le Pokemon avec la stat de vitesse la plus élevée attaque en premier. En cas d'égalité, l'ordre est aléatoire.

## 📊 Pokemon disponibles

1. Pikachu
2. Charizard
3. Blastoise
4. Venusaur
5. Mewtwo
6. Dragonite
7. Gyarados
8. Alakazam
9. Gengar
10. Machamp
11. Arcanine
12. Snorlax
13. Lapras
14. Eevee
15. Jolteon
16. Vaporeon
17. Flareon
18. Articuno
19. Zapdos
20. Moltres

## 🔧 Structure du code

- **Pokemon Class**: Gère les statistiques, HP, et moves de chaque Pokemon
- **Battle Class**: Contrôle le système de combat, calcul des dégâts, et déroulement du jeu
- **Type System**: Table complète d'efficacité des types Pokemon
- **API Integration**: Récupération des données en temps réel depuis PokeAPI

## 📝 Crédits

- Données Pokemon: [PokeAPI](https://pokeapi.co)
- Game Design: Basé sur les mécaniques de combat Pokemon
