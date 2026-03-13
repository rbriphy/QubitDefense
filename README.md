# Qubit Defense

## Table of Contents

- [Overview](#overview)
- [How to Play](#how-to-play)
- [Game Modes](#game-modes)
- [Towers](#towers)
- [Quantum Mechanics in the Game](#quantum-mechanics-in-the-game)
- [Running the Game](#running-the-game)
- [Credits](#credits)

## Overview

Qubit Defense is a unique tower defense game that combines classic tower defense gameplay with real quantum computing concepts. Instead of traditional damage-based attacks, each enemy is a qubit, and your towers apply quantum gates to manipulate their wavefunction until they're measured (defeated).

### The Goal

Enemies travel along a path toward your defenses. Your job is to **defeat them before they escape** by placing quantum towers that manipulate their quantum state until they collapse to the |1⟩ state (death).

## How to Play

### Basic Mechanics

1. **Left-click** on the game field to place a quantum tower
2. **Right-click** on a tower to remove it
3. Press **START WAVE** to begin each wave
4. Prevent enemies from reaching the end of the path

### Quantum State

- Enemies start in the |0⟩ state (100% survival chance)
- Each tower applies a quantum gate that rotates the enemy's state on the Bloch sphere
- Measurement towers collapse the state to either |0⟩ (survive) or |1⟩ (die)
- The probability of killing an enemy is |β|² where the state is |ψ⟩ = α|0⟩ + β|1⟩

## Game Modes

### Tutorial Mode
Learn the basics of quantum computing and how to play the game.

### Career Mode
Progress through 5 waves of increasing difficulty. New towers unlock as you advance. Test your quantum strategy skills!

### Sandbox Mode
Unlimited resources and all towers available from the start. Experiment freely with different quantum gate configurations.

## Towers

### Rotation Gates (Gate Towers)
These towers rotate the enemy's quantum state on the Bloch sphere, moving them closer to or further from the |1⟩ (death) state:

| Tower | Cost | Description |
|-------|------|-------------|
| Hadamard (H) | 15 | Rotates along multiple axes |
| Rx(20°) | 8 | Small X-axis rotation |
| Rx(45°) | 15 | Medium X-axis rotation |
| Rx(90°) | 25 | Large X-axis rotation |
| Ry(20°) | 8 | Small Y-axis rotation |
| Ry(45°) | 15 | Medium Y-axis rotation |
| Ry(90°) | 25 | Large Y-axis rotation |
| Rz(20°) | 5 | Small Z-axis rotation |
| Rz(45°) | 8 | Medium Z-axis rotation |
| Rz(90°) | 12 | Large Z-axis rotation |

### Measurement Towers
These towers collapse the enemy's quantum state, determining their fate:

| Tower | Cost | Description |
|-------|------|-------------|
| Z-Measurement (Ψ) | 40 | Measures in the Z basis: \|0⟩ = survive, \|1⟩ = die |
| X-Measurement (+) | 50 | Measures in the X basis: resets to \|+⟩ or \|-⟩ |
| Y-Measurement (Y) | 50 | Measures in the Y basis: resets to \|↗⟩ or \|↙⟩ |

### Strategy Tips

- **Build rotation towers first** to move enemies toward the |1⟩ state (south pole on the Bloch sphere)
- **Place measurement towers at the end** of the path for the final kill attempt
- The more rotations applied before measurement, the higher your chance of killing the enemy

## Quantum Mechanics in the Game

### The Bloch Sphere

The game visualizes each enemy's quantum state on the Bloch sphere:
- **North Pole (|0⟩)** = 100% chance of survival
- **South Pole (|1⟩)** = 100% chance of death
- Points between the poles represent superposition states

### Measurement = Collapse!

When you measure an enemy, their quantum state **collapses** to one of the poles based on the probability amplitudes. That's when we find out if they live or die!

## Running the Game

Simply open `index.html` in a modern web browser. 

A web version is hosted at https://neon-medovik-cfb96f.netlify.app/


## Project Structure

```
QubitDefense/
├── index.html          # Main game file
├── css/
│   └── styles.css      # Game styling
├── js/
│   ├── config.js       # Game configuration
│   ├── quantum.js      # Quantum mechanics calculations
│   ├── entities.js     # Game entities (enemies, towers)
│   ├── systems.js      # Game systems
│   ├── game.js         # Main game logic
│   ├── audio.js        # Audio management
│   └── tutorial.js     # Tutorial system
├── audio/              # Sound effects and music
└── README.md           # This file
```

## Credits
Music - 0xHatespeech
Coding and Brainstorming - Minimax M2.5 via Cline
