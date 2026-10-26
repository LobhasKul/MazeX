# MazeX: Cyber Escape

> **Escape. Outsmart. Survive.**  
> *Designed and Developed by Lobhas Kulkarni*

![HTML5](https://img.shields.io/badge/HTML5-Canvas%202D-E34F26?logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)
![Audio](https://img.shields.io/badge/Audio-WebAudio%20API-blue)
![Desktop](https://img.shields.io/badge/Desktop-Electron-47848F?logo=electron&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

---

## Overview

**MazeX: Cyber Escape** is a high-octane cyberpunk labyrinth game where players navigate procedurally generated cyber-mazes, gather data coins, avoid relentless AI sentinel drones, and reach the exit point across 15 increasingly challenging sectors.

Featuring a completely procedural **HTML5 Canvas 2D** rendering pipeline, an integrated **WebAudio procedural synthesizer** for real-time sound effects and ambient electronic pads, dynamic BFS enemy pathfinding, and rich visual themes.

---

## Key Features

- **15 Progressive Sectors**: From the introductory *"First Steps"* to the massive final sector *"MAZEX CORE: THE OVERLORD"*.
- **Intelligent Sentinel AI**:
  - **Hunter (Blinky)**: Directly pursues the player using breadth-first search (BFS) shortest paths.
  - **Ambusher (Pinky)**: Anticipates the player's vector and cuts off escape routes ahead.
  - **Trapper (Clyde)**: Roams unpredictably and sets perimeter blockades around choke points.
  - **Patroller (Inky)**: High-speed sweep of key corridors.
  - **Boss Sentinel**: High-durability guardian of Sector 15.
- **Combat & Vanish Mechanics**: Hostile collisions deal damage, causing the enemy to destabilize and vanish for 2 seconds before respawning back into the grid.
- **Tactical Power-Ups**:
  - ⚡ **Speed Overdrive**: 60% velocity boost with dynamic motion particle trails.
  - 🛡️ **Cyber Shield**: Deflects incoming lethal strikes.
  - ❄️ **Cryo Freeze**: Immobilizes all roaming sentinels in place.
- **Procedural Audio Synthesizer**: 100% self-contained audio using the WebAudio API — zero external `.mp3` or `.wav` files required.
- **Visual Customization**: 4 neon themes (*Cyber Grid*, *Quantum Core*, *Neon Reactor*, *AI Fortress*) with customizable bloom glow intensity.
- **Persistent Progression**: Level unlocks, stars, statistics, and 8 unique achievements saved locally in `localStorage`.
- **Zero-Dependency Architecture**: Runs in any modern browser without external runtime frameworks.

---

## Controls

MazeX supports standard keyboards, extended keypad layouts, and mobile touch screens:

| Action | Primary Keys | Keypad / Extended Keys | Touch / Mobile |
| :--- | :--- | :--- | :--- |
| **Move Up** | <kbd>W</kbd> / <kbd>↑</kbd> | <kbd>Page Up</kbd> / <kbd>Numpad 8</kbd> | On-screen D-Pad Up |
| **Move Down** | <kbd>S</kbd> / <kbd>↓</kbd> | <kbd>Page Down</kbd> / <kbd>Numpad 2</kbd> | On-screen D-Pad Down |
| **Move Left** | <kbd>A</kbd> / <kbd>←</kbd> | <kbd>Home</kbd> / <kbd>Numpad 4</kbd> | On-screen D-Pad Left |
| **Move Right** | <kbd>D</kbd> / <kbd>→</kbd> | <kbd>End</kbd> / <kbd>Numpad 6</kbd> | On-screen D-Pad Right |
| **Hint Path** | <kbd>H</kbd> | — | Hint Button (💡) |
| **Pause / Resume** | <kbd>ESC</kbd> / <kbd>P</kbd> | — | Pause Button (⏸) |

---

## Quick Start / How to Run

### Option 1: Direct in Browser (No Installation)
Simply open `index.html` in any modern web browser (Chrome, Edge, Firefox, Brave, Safari).

### Option 2: Local Node.js Server
Run the included zero-dependency HTTP server:
```bash
npm start
```
Then navigate to:
```
http://localhost:3000/
```

### Option 3: Desktop App via Electron
To launch MazeX as a native desktop application:
```bash
npm install
npm run app
```

### Option 4: Build Windows Executable (.exe)
```bash
npm run build:exe
```
The output executable will be generated inside the `dist/` directory.

---

## Deployment to GitHub Pages

Because `index.html` is located in the repository root, you can host MazeX online for free using GitHub Pages:

1. Push this repository to GitHub.
2. Go to repository **Settings** > **Pages**.
3. Under **Build and deployment**, set:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main` / `/ (root)`
4. Click **Save**. Your game will be live at `https://<your-username>.github.io/<repo-name>/`!

---

## Project Structure

```text
├── index.html         # Main UI structure, HUD, screens, and modals
├── game.js            # Complete MazeX game engine, AI, sound synth & physics
├── style.css          # Cyberpunk visual styles, layout, and animations
├── server.js          # Lightweight Node.js local HTTP server
├── main.js            # Electron desktop entry point
├── package.json       # Scripts, configuration, and dependencies
├── .gitignore         # Ignores build artifacts and node_modules
├── LICENSE            # MIT License
└── README.md          # Project documentation
```

---

## License

This project is licensed under the [MIT License](LICENSE) &copy; 2026 Lobhas Kulkarni.
