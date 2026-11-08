# MazeX: Cyber Escape

> **Escape. Outsmart. Survive.**  
> *Designed and Developed by Lobhas Kulkarni*

![HTML5](https://img.shields.io/badge/HTML5-Canvas%202D-E34F26?logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)
![Audio](https://img.shields.io/badge/Audio-WebAudio%20Procedural%20Synth-blue)
![BGM](https://img.shields.io/badge/Music-Cyberpunk%20Synth%20BGM-ff007f)
![Desktop](https://img.shields.io/badge/Desktop-Electron%20%2F%20Windows%20Setup.exe-47848F?logo=electron&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🎮 Play Online & Downloads

| Platform / Method | Link / Action | Description |
| :--- | :--- | :--- |
| **Web Browser (Instant)** | 🌐 **[Play Online (GitHub Pages)](https://lobhaskul.github.io/MazeX/)** | Zero installation — play in Chrome, Edge, Safari, Firefox |
| **Windows Installer (.exe)** | 📥 **[Download MazeX-Setup.exe](https://github.com/LobhasKul/MazeX/raw/main/MazeX-Setup.exe)** | Single-file setup; auto-creates Desktop & Start Menu shortcuts |
| **Windows Portable (.zip)** | 📦 **[Download MazeX-Windows.zip](https://github.com/LobhasKul/MazeX/raw/main/MazeX-Windows.zip)** | Portable version — extract ZIP and run `MazeX.exe` directly |
| **GitHub File Viewer** | 📁 **[Browse MazeX-Setup.exe on GitHub](https://github.com/LobhasKul/MazeX/blob/main/MazeX-Setup.exe)** | View file details and click "Download raw file" on GitHub |

---

## Overview

**MazeX: Cyber Escape** is an adrenaline-fueled cyberpunk arcade labyrinth game where players navigate complex, glowing neon cyber-mazes, harvest data coins, evade relentless AI sentinel drones, deploy tactical abilities, and breach the core portal across 15 increasingly challenging sectors.

Featuring a high-performance **HTML5 Canvas 2D** rendering pipeline, an integrated **WebAudio procedural synthesizer** for sound effects and ambient cyberpunk synthwave background music, fluid corner-buffered steering physics, dynamic AI pathfinding, and full local persistence.

---

## Key Features

- **15 Progressive Cyber Sectors**: From the introductory *"First Steps"* to the brutal endgame gauntlet *"MAZEX CORE: THE OVERLORD"*.
- **Responsive Corner-Assist Physics**:
  - 30-frame (~500ms) pre-turn input buffer ensures turns at high speed are never dropped.
  - Smooth corridor gliding with no awkward auto-steering or sticky corners.
  - Speed Overdrive (1.45× speed) with electric green cyber aura and motion particle trail.
- **Intelligent Sentinel AI**:
  - **Hunter (Red)**: Directly pursues the player using breadth-first search (BFS) shortest paths.
  - **Ambusher (Cyan)**: Anticipates player trajectory and cuts off escape routes.
  - **Stalker (Magenta)**: Roams unpredictable patrol vectors and locks choke points.
  - **Phantom (Purple)**: Fast corridor sweeper with phasing behavior.
- **Advanced Combat & Enemy Elimination (Levels 12+)**:
  - In sectors 12 through 15, players can turn the tables and eliminate/destroy enemies 2 to 3 times per level using Aegis Shield contact or EMP shockwaves, earning +150 bonus points per elimination.
  - Nanite Armor absorption feedback (`"-12 HP (NANITE ARMOR)"`) buffers damage taken.
- **Tactical Defense Arsenal**:
  - ⚡ **Speed Boost (-100 pts)**: High-speed overdrive with enhanced cornering.
  - 🛡️ **Aegis Shield (-250 pts)**: Absorbs damage and vaporizes hostile sentinels on contact.
  - ❄️ **Cryo Freeze (-200 pts)**: Locks all enemies in ice for a full **20 seconds**.
  - 💥 **EMP Blast (-150 pts)**: Shocks and neutralizes active drones in the sector.
- **Milestone Completion Bonus System**:
  - **Level 1**: **+500 points**
  - **Level 5**: **+1,000 points**
  - **Level 10**: **+1,500 points**
  - **Level 15**: **+2,000 points**
  - **In-between levels**: **0 bonus points**
  - Anti-farming protection: Milestone points are awarded once per run and reset upon starting a fresh campaign.
- **Strict 100% 15-Level Victory Condition**:
  - Completing Level 15 while earlier levels remain uncompleted guides the player via dynamic buttons (e.g. `CONTINUE LEVEL 6`).
  - The official **Grand Champion Victory Screen** and fanfare only trigger when **all 15 sectors** are conquered!
- **Procedural Cyberpunk Synthwave BGM Engine**:
  - Ambient analog sawtooth bassline with 24dB resonant low-pass cutoff sweeps (`Am -> F -> G -> Em`).
  - 16-step retro chiptune arpeggios, electro kicks, snares, and cyber hi-hats.
  - Automatically muffles to gentle ambient level on pause, with real-time volume slider control.
- **Visual & Audio Customization**:
  - 4 neon themes (*Cyber Grid*, *Quantum Core*, *Neon Reactor*, *AI Fortress*) with customizable bloom glow intensity.
  - Separate Master, Music, and SFX volume sliders with sound test feedback.
- **Persistent Progression**: Level unlocks, stars (up to 45★), best scores, statistics, and 8 unique achievements saved in `localStorage`.

---

## Controls

MazeX supports keyboards, numpads, and touch screens:

| Action | Primary Keys | Keypad / Extended Keys | Touch / Mobile |
| :--- | :--- | :--- | :--- |
| **Move Up** | <kbd>W</kbd> / <kbd>↑</kbd> | <kbd>Page Up</kbd> / <kbd>Numpad 8</kbd> | On-screen D-Pad Up |
| **Move Down** | <kbd>S</kbd> / <kbd>↓</kbd> | <kbd>Page Down</kbd> / <kbd>Numpad 2</kbd> | On-screen D-Pad Down |
| **Move Left** | <kbd>A</kbd> / <kbd>←</kbd> | <kbd>Home</kbd> / <kbd>Numpad 4</kbd> | On-screen D-Pad Left |
| **Move Right** | <kbd>D</kbd> / <kbd>→</kbd> | <kbd>End</kbd> / <kbd>Numpad 6</kbd> | On-screen D-Pad Right |
| **Tactical Powers** | Click **POWERS** Button | — | On-screen POWERS Button |
| **Hint Path** | <kbd>H</kbd> / Click **HINT** | — | Hint Button (💡) |
| **Pause / Resume** | <kbd>ESC</kbd> / <kbd>P</kbd> | — | Pause Button (⏸) |

---

## Quick Start & Installation

### Option 1: Web Browser (Instant Play)
Open **[https://lobhaskul.github.io/MazeX/](https://lobhaskul.github.io/MazeX/)** in any modern web browser (Chrome, Edge, Firefox, Brave, Safari, Mobile).

### Option 2: Single-File Setup Installer (.exe) (Recommended for Windows)
1. **Download the installer directly**:
   - Direct link: 📥 **[Download MazeX-Setup.exe](https://github.com/LobhasKul/MazeX/raw/main/MazeX-Setup.exe)** *(or click on `MazeX-Setup.exe` in the repository root and click **Download raw file**)*.
2. **Run the Installer**:
   - Double-click **`MazeX-Setup.exe`**.
   - A cyberpunk setup window with an animated progress bar will appear.
   - It automatically extracts all runtime binaries, creates a **Desktop shortcut** and **Start Menu shortcut**, and launches the game immediately.
3. *(Optional Note)*: If Windows SmartScreen displays a *"Windows protected your PC"* notification (standard for newly released indie `.exe` files), click **More info** ➔ **Run anyway**.

### Option 3: Portable ZIP (No Installation Required)
1. **Download the portable package**:
   - Direct link: 📦 **[Download MazeX-Windows.zip](https://github.com/LobhasKul/MazeX/raw/main/MazeX-Windows.zip)**.
2. **Extract**:
   - Right-click `MazeX-Windows.zip` ➔ **Extract All**.
3. **Play**:
   - Open the extracted folder and double-click **`MazeX.exe`** to play instantly.

### Option 4: Local Node.js Development Server
```bash
npm start
```
Then navigate to `http://localhost:3000/`.

### Option 5: Build Installer from Source
```bash
node build-installer.js
```
Packs `app.asar`, creates `MazeX-Windows.zip`, and compiles `MazeX-Setup.exe`.

---

## Project Structure

```text
├── index.html            # UI structure, HUD, screens, modals, and power arsenal
├── game.js               # Game engine, AI sentinels, procedural BGM & audio synth, physics
├── style.css             # Cyberpunk neon styles, glassmorphic HUD, animations
├── build-installer.js    # Automated build pipeline for app.asar, ZIP, and Setup.exe
├── server.js             # Zero-dependency local development HTTP server
├── main.js               # Electron desktop container entry point
├── package.json          # Package configuration and build scripts
├── MazeX-Setup.exe       # Standalone Windows Setup Installer (Git LFS)
├── MazeX-Windows.zip     # Portable Windows ZIP release (Git LFS)
├── .gitattributes        # Git LFS tracking configuration for binary releases
├── LICENSE               # MIT License
└── README.md             # Project documentation and guide
```

---

## License

This project is licensed under the [MIT License](LICENSE) &copy; 2026 Lobhas Kulkarni.
