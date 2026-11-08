/**
 * MAZEX: CYBER ESCAPE — Complete Game Engine & Final Polish
 * Designed by Lobhas
 */

// ================= WEBAUDIO SYNTHESIZER & AMBIENT MUSIC ENGINE =================
class SoundManager {
    constructor() {
        this.ctx = null;
        this.sfxEnabled = true;
        this.musicEnabled = true;
        this.masterVolume = 0.8;
        this.musicVolume = 0.6;
        this.sfxVolume = 0.8;

        this.musicGain = null;
        this.musicInterval = null;
        this.musicStep = 0;
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
                this.musicGain = this.ctx.createGain();
                this.musicGain.gain.setValueAtTime(this.getMusicEffectiveVolume(), this.ctx.currentTime);
                this.musicGain.connect(this.ctx.destination);
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        if (this.musicEnabled && !this.musicInterval) {
            this.startAmbientMusic();
        }
    }

    getMasterEffectiveVolume() {
        return Math.max(0, Math.min(1, this.masterVolume));
    }

    getSfxEffectiveVolume() {
        return this.sfxEnabled ? (this.sfxVolume * this.getMasterEffectiveVolume()) : 0;
    }

    getMusicEffectiveVolume() {
        return this.musicEnabled ? (this.musicVolume * this.getMasterEffectiveVolume() * 0.28) : 0;
    }

    updateVolumes() {
        if (this.musicGain && this.ctx) {
            this.musicGain.gain.setValueAtTime(this.getMusicEffectiveVolume(), this.ctx.currentTime);
        }
    }

    playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.3, pitchSlide = null) {
        const effectiveGain = gainVal * this.getSfxEffectiveVolume();
        if (effectiveGain <= 0.001 || !this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, now);
            if (pitchSlide) {
                osc.frequency.exponentialRampToValueAtTime(Math.max(20, pitchSlide), now + duration);
            }

            gain.gain.setValueAtTime(effectiveGain, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + duration);
        } catch (e) {}
    }

    playNoise(duration = 0.15, gainVal = 0.4) {
        const effectiveGain = gainVal * this.getSfxEffectiveVolume();
        if (effectiveGain <= 0.001 || !this.ctx) return;

        try {
            const bufferSize = this.ctx.sampleRate * duration;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(700, this.ctx.currentTime);
            filter.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + duration);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(effectiveGain, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            noise.start();
        } catch (e) {}
    }

    playCoin() {
        this.playTone(987.77, 'sine', 0.08, 0.22, 1318.5);
    }

    playGem() {
        this.playTone(1046.5, 'triangle', 0.1, 0.28, 1568);
        setTimeout(() => this.playTone(2093, 'sine', 0.14, 0.22), 60);
    }

    playPowerup() {
        const notes = [440, 554.37, 659.25, 880];
        notes.forEach((f, i) => {
            setTimeout(() => this.playTone(f, 'sine', 0.12, 0.22), i * 50);
        });
    }

    playFreeze() {
        this.playTone(1350, 'sine', 0.2, 0.25, 550);
        setTimeout(() => this.playTone(1600, 'triangle', 0.25, 0.2, 400), 70);
    }

    playShieldDeflect() {
        this.playTone(600, 'triangle', 0.18, 0.35, 1200);
    }

    playEnemyKill() {
        this.playNoise(0.28, 0.45);
        this.playTone(320, 'sawtooth', 0.22, 0.35, 80);
        setTimeout(() => this.playTone(880, 'sine', 0.18, 0.3, 1400), 50);
    }

    playSafeZoneEnter() {
        this.playTone(523.25, 'sine', 0.12, 0.22, 659.25);
        setTimeout(() => this.playTone(783.99, 'sine', 0.16, 0.2, 1046.5), 60);
    }

    playHit() {
        this.playNoise(0.25, 0.45);
        this.playTone(160, 'sawtooth', 0.18, 0.35, 50);
    }

    playLifeLost() {
        this.playTone(220, 'sawtooth', 0.2, 0.4, 110);
        setTimeout(() => this.playTone(165, 'sawtooth', 0.3, 0.4, 80), 120);
    }

    playAlert() {
        this.playTone(680, 'sawtooth', 0.07, 0.18, 880);
        setTimeout(() => this.playTone(880, 'sawtooth', 0.09, 0.22, 1050), 65);
    }

    playPortalActive() {
        const notes = [392, 523.25, 659.25, 783.99, 1046.5];
        notes.forEach((f, i) => {
            setTimeout(() => this.playTone(f, 'sine', 0.22, 0.28), i * 70);
        });
    }

    playHint() {
        this.playTone(523, 'sine', 0.14, 0.22);
        setTimeout(() => this.playTone(659, 'sine', 0.14, 0.22), 80);
        setTimeout(() => this.playTone(784, 'sine', 0.18, 0.22), 160);
    }

    playLevelComplete() {
        const melody = [523.25, 659.25, 783.99, 1046.5, 1318.51];
        melody.forEach((f, i) => {
            setTimeout(() => this.playTone(f, 'triangle', 0.24, 0.3), i * 90);
        });
    }

    playGameOver() {
        const notes = [293.66, 261.63, 220, 174.61];
        notes.forEach((f, i) => {
            setTimeout(() => this.playTone(f, 'sawtooth', 0.3, 0.35, f * 0.85), i * 140);
        });
    }

    playAchievement() {
        const notes = [587.33, 739.99, 880, 1174.66];
        notes.forEach((f, i) => {
            setTimeout(() => this.playTone(f, 'sine', 0.18, 0.3), i * 65);
        });
    }

    playClick() {
        this.playTone(420, 'sine', 0.035, 0.15);
    }

    // ================= CYBERPUNK SYNTHWAVE / CHIPTUNE BGM ENGINE =================
    startAmbientMusic() {
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }
        if (!this.musicEnabled) return;

        // Cyberpunk Synthwave Harmonic Progression: Am -> F -> G -> Em
        const chordProgression = [
            // Am (A Minor: Root 55Hz, 5th 82.4Hz, Octave 110Hz, Arp A-C-E-G)
            { root: 55.0, fifth: 82.41, oct: 110.0, arp: [440.0, 523.25, 659.25, 783.99, 659.25, 523.25, 440.0, 493.88] },
            // F (F Major: Root 43.65Hz, 5th 65.4Hz, Octave 87.3Hz, Arp F-A-C-F)
            { root: 43.65, fifth: 65.41, oct: 87.31, arp: [349.23, 440.0, 523.25, 698.46, 523.25, 440.0, 392.0, 440.0] },
            // G (G Major: Root 49Hz, 5th 73.4Hz, Octave 98Hz, Arp G-B-D-G)
            { root: 49.00, fifth: 73.42, oct: 98.00, arp: [392.0, 493.88, 587.33, 783.99, 587.33, 493.88, 440.0, 493.88] },
            // Em (E Minor: Root 41.2Hz, 5th 61.7Hz, Octave 82.4Hz, Arp E-G-B-E)
            { root: 41.20, fifth: 61.74, oct: 82.41, arp: [329.63, 392.0, 493.88, 659.25, 493.88, 392.0, 329.63, 392.0] }
        ];

        this.musicStep = 0;
        const stepTime = 0.122; // ~123 BPM 16th-note pulse

        this.musicInterval = setInterval(() => {
            if (!this.musicEnabled || !this.ctx || this.ctx.state !== 'running') return;
            const effective = this.getMusicEffectiveVolume();
            if (effective <= 0.001) return;

            const totalSteps = 64; // 4 bars × 16 steps
            const currentStep = this.musicStep % totalSteps;
            const chordIdx = Math.floor(currentStep / 16) % chordProgression.length;
            const chord = chordProgression[chordIdx];
            const stepInBar = currentStep % 16;

            // 1. Low-Frequency Cyber Synth Bass Arpeggio (Filtered resonant saw bass pulse)
            if (stepInBar % 2 === 0) {
                let bassFreq = chord.root;
                if (stepInBar === 6 || stepInBar === 14) bassFreq = chord.oct;
                else if (stepInBar === 10) bassFreq = chord.fifth;
                this.playSynthBass(bassFreq, stepTime * 1.4, 0.38);
            }

            // 2. Retro Chiptune Arp Melodic Accent (Triangle wave cyber arpeggiator)
            const arpIndex = stepInBar % 8;
            const arpFreq = chord.arp[arpIndex];
            if (stepInBar % 2 === 0 || stepInBar === 3 || stepInBar === 7 || stepInBar === 11 || stepInBar === 15) {
                this.playChiptuneArp(arpFreq, stepTime * 1.15, 0.18);
            }

            // 3. Subtle Cyber Percussion (Electro kick & hat pulse)
            if (stepInBar === 0 || stepInBar === 8) {
                this.playCyberKick(stepTime * 1.6, 0.32);
            } else if (stepInBar === 4 || stepInBar === 12) {
                this.playCyberSnare(stepTime * 1.1, 0.20);
            } else if (stepInBar % 2 === 1) {
                this.playCyberHat(0.035, 0.10);
            }

            this.musicStep++;
        }, 122);
    }

    playSynthBass(freq, duration = 0.18, gainScale = 0.35) {
        if (!this.ctx || !this.musicGain) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const filter = this.ctx.createBiquadFilter();
            const gain = this.ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, now);

            filter.type = 'lowpass';
            filter.Q.setValueAtTime(3.5, now);
            filter.frequency.setValueAtTime(420, now);
            filter.frequency.exponentialRampToValueAtTime(110, now + duration * 0.9);

            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(gainScale, now + 0.012);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.musicGain);

            osc.start(now);
            osc.stop(now + duration);
        } catch (e) {}
    }

    playChiptuneArp(freq, duration = 0.14, gainScale = 0.18) {
        if (!this.ctx || !this.musicGain) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const filter = this.ctx.createBiquadFilter();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1600, now);

            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(gainScale, now + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.musicGain);

            osc.start(now);
            osc.stop(now + duration);
        } catch (e) {}
    }

    playCyberKick(duration = 0.16, gainScale = 0.3) {
        if (!this.ctx || !this.musicGain) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(95, now);
            osc.frequency.exponentialRampToValueAtTime(32, now + duration);

            gain.gain.setValueAtTime(gainScale, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

            osc.connect(gain);
            gain.connect(this.musicGain);

            osc.start(now);
            osc.stop(now + duration);
        } catch (e) {}
    }

    playCyberSnare(duration = 0.1, gainScale = 0.2) {
        if (!this.ctx || !this.musicGain) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const oscGain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(180, now);
            osc.frequency.exponentialRampToValueAtTime(70, now + duration * 0.6);
            oscGain.gain.setValueAtTime(gainScale * 0.5, now);
            oscGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.6);
            osc.connect(oscGain);
            oscGain.connect(this.musicGain);
            osc.start(now);
            osc.stop(now + duration * 0.6);

            const bufferSize = Math.max(1, Math.floor(this.ctx.sampleRate * duration));
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1400, now);
            filter.Q.setValueAtTime(1.5, now);

            const nGain = this.ctx.createGain();
            nGain.gain.setValueAtTime(gainScale * 0.7, now);
            nGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

            noise.connect(filter);
            filter.connect(nGain);
            nGain.connect(this.musicGain);

            noise.start(now);
        } catch (e) {}
    }

    playCyberHat(duration = 0.035, gainScale = 0.10) {
        if (!this.ctx || !this.musicGain) return;
        try {
            const now = this.ctx.currentTime;
            const bufferSize = Math.max(1, Math.floor(this.ctx.sampleRate * duration));
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.setValueAtTime(5500, now);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(gainScale, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.musicGain);

            noise.start(now);
        } catch (e) {}
    }

    pauseMusic() {
        if (this.musicGain && this.ctx) {
            this.musicGain.gain.setValueAtTime(this.getMusicEffectiveVolume() * 0.35, this.ctx.currentTime);
        }
    }

    resumeMusic() {
        if (this.musicGain && this.ctx) {
            this.musicGain.gain.setValueAtTime(this.getMusicEffectiveVolume(), this.ctx.currentTime);
        }
    }

    stopAmbientMusic() {
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }
    }
}

const sound = new SoundManager();

// ================= PROGRESS, ACHIEVEMENTS & STATS =================
class ProgressManager {
    static getUnlockedLevel() {
        const raw = parseInt(localStorage.getItem('mazex_unlocked') || '1', 10);
        const stars = this.getLevelStars();
        // All levels unlocked when Level 1 is completed (stars[1] > 0 or raw >= 2)
        if (raw >= 2 || (stars && stars[1] > 0)) {
            return 15;
        }
        return raw;
    }
    static setUnlockedLevel(lvl) {
        if (lvl >= 2) {
            // Unlocking past level 1 unlocks all 15 levels
            localStorage.setItem('mazex_unlocked', '15');
        } else {
            const cur = this.getUnlockedLevel();
            if (lvl > cur) {
                localStorage.setItem('mazex_unlocked', Math.min(15, lvl).toString());
            }
        }
    }
    static getLevelStars() {
        try {
            return JSON.parse(localStorage.getItem('mazex_stars')) || {};
        } catch (e) {
            return {};
        }
    }
    static setLevelStars(lvl, stars) {
        const data = this.getLevelStars();
        const prev = data[lvl] || 0;
        if (stars > prev) {
            data[lvl] = stars;
            localStorage.setItem('mazex_stars', JSON.stringify(data));
        }
    }

    // Statistics
    static getStats() {
        try {
            return JSON.parse(localStorage.getItem('mazex_stats')) || {
                gamesPlayed: 0,
                bestScore: 0,
                levelsCompleted: 0,
                coinsCollected: 0,
                hintsUsed: 0,
                deaths: 0
            };
        } catch (e) {
            return { gamesPlayed: 0, bestScore: 0, levelsCompleted: 0, coinsCollected: 0, hintsUsed: 0, deaths: 0 };
        }
    }
    static updateStats(callback) {
        const stats = this.getStats();
        callback(stats);
        localStorage.setItem('mazex_stats', JSON.stringify(stats));
        return stats;
    }

    // Achievements
    static getAchievements() {
        try {
            return JSON.parse(localStorage.getItem('mazex_achievements')) || {};
        } catch (e) {
            return {};
        }
    }
    static unlockAchievement(key) {
        const achs = this.getAchievements();
        if (!achs[key]) {
            achs[key] = { unlocked: true, date: new Date().toLocaleDateString() };
            localStorage.setItem('mazex_achievements', JSON.stringify(achs));
            return true;
        }
        return false;
    }

    // Saved Game Session (Continue feature)
    static getSavedSession() {
        try {
            const raw = localStorage.getItem('mazex_saved_session');
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }
    static saveSession(levelIdx, score, lives, health, claimedBonusLevels = []) {
        const session = { levelIdx, score, lives, health, claimedBonusLevels, timestamp: Date.now() };
        localStorage.setItem('mazex_saved_session', JSON.stringify(session));
    }
    static clearSavedSession() {
        localStorage.removeItem('mazex_saved_session');
    }

    // Settings
    static getSettings() {
        try {
            return JSON.parse(localStorage.getItem('mazex_settings')) || {
                sound: true,
                music: true,
                masterVolume: 80,
                musicVolume: 60,
                sfxVolume: 80,
                theme: 'theme-cyber',
                glow: 'glow-medium',
                touch: 'auto'
            };
        } catch (e) {
            return {
                sound: true, music: true, masterVolume: 80, musicVolume: 60, sfxVolume: 80,
                theme: 'theme-cyber', glow: 'glow-medium', touch: 'auto'
            };
        }
    }
    static saveSettings(settings) {
        localStorage.setItem('mazex_settings', JSON.stringify(settings));
    }

    // Reset Progress
    static resetProgress() {
        localStorage.removeItem('mazex_unlocked');
        localStorage.removeItem('mazex_stars');
        localStorage.removeItem('mazex_stats');
        localStorage.removeItem('mazex_achievements');
        localStorage.removeItem('mazex_saved_session');
    }
}

// ================= ACHIEVEMENTS DEFINITIONS =================
const ACHIEVEMENTS_DEF = [
    { key: 'first_escape', title: 'First Escape', desc: 'Complete your first sector.', icon: '◆' },
    { key: 'coin_collector', title: 'Coin Collector', desc: 'Collect all coins in a sector.', icon: '◈' },
    { key: 'survivor', title: 'Survivor', desc: 'Complete a sector without losing a life.', icon: '▲' },
    { key: 'speed_runner', title: 'Speed Runner', desc: 'Complete a sector within the target time.', icon: '✦' },
    { key: 'maze_master', title: 'Maze Master', desc: 'Complete 5 campaign sectors.', icon: '⬡' },
    { key: 'shield_bearer', title: 'Shield Bearer', desc: 'Deflect an enemy collision with Cyber Shield.', icon: '❖' },
    { key: 'cryo_master', title: 'Cryo Master', desc: 'Immobilize enemies using Cryo Freeze.', icon: '◇' },
    { key: 'grand_champion', title: 'Grand Champion', desc: 'Conquer all 15 campaign sectors.', icon: '★' }
];

// ================= TACTICAL POWERS FOR ADVANCED SECTORS (Levels 13, 14, 15) =================
const TACTICAL_POWERS_DEF = [
    {
        id: 'shield',
        title: 'Aegis Forcefield',
        icon: '🛡️',
        cost: 80,
        desc: 'Deploys an energetic defensive shield that fully absorbs an enemy strike and deflects the attacker safely with zero damage.'
    },
    {
        id: 'freeze',
        title: 'Chrono Cryo Stasis',
        icon: '❄️',
        cost: 140,
        desc: 'Emits a sub-zero stasis burst immobilizing all hostile pink sentinels for 20 seconds, creating safe paths.'
    },
    {
        id: 'armor',
        title: 'Nanite Composite Armor',
        icon: '⚙️',
        cost: 200,
        desc: 'Nanite cyberweave reduces all incoming collision damage by 50% (only 12 HP lost) and extends post-hit invulnerability.'
    },
    {
        id: 'bubble',
        title: 'Portable Sanctuary Bubble',
        icon: '💠',
        cost: 280,
        desc: 'Surrounds the player with a mobile Safe Zone aura for 15 seconds. Enemies are repelled and cannot inflict damage anywhere!'
    }
];

// ================= 15 LEVEL CONFIGURATIONS =================
const LEVELS_CONFIG = [
    { id: 1, name: "First Steps", diff: "Very Easy", cols: 13, rows: 9, coins: 8, gems: 0, powerups: [], enemies: [], hints: 5, targetTime: 25 },
    { id: 2, name: "The Awakening", diff: "Easy", cols: 15, rows: 11, coins: 12, gems: 0, powerups: [], enemies: [{ type: 'patrol' }], hints: 5, targetTime: 32 },
    { id: 3, name: "The Neon Hunt", diff: "Easy", cols: 17, rows: 11, coins: 14, gems: 1, powerups: [], enemies: [{ type: 'hunter' }], hints: 5, targetTime: 36 },
    { id: 4, name: "Split Circuits", diff: "Easy-Medium", cols: 17, rows: 13, coins: 16, gems: 1, powerups: [], enemies: [{ type: 'hunter' }], hints: 5, targetTime: 40 },
    { id: 5, name: "Dual Threat", diff: "Medium", cols: 19, rows: 13, coins: 18, gems: 2, powerups: [], enemies: [{ type: 'hunter' }, { type: 'patrol' }], hints: 5, targetTime: 45 },
    { id: 6, name: "Overdrive", diff: "Medium", cols: 19, rows: 13, coins: 20, gems: 2, powerups: ['speed'], enemies: [{ type: 'hunter' }, { type: 'ambusher' }], hints: 5, targetTime: 48 },
    { id: 7, name: "Branching Paths", diff: "Medium-Hard", cols: 21, rows: 15, coins: 22, gems: 3, powerups: ['speed'], enemies: [{ type: 'hunter' }, { type: 'ambusher' }], hints: 5, targetTime: 52 },
    { id: 8, name: "Cyber Defense", diff: "Hard", cols: 21, rows: 15, coins: 24, gems: 3, powerups: ['shield', 'speed'], enemies: [{ type: 'hunter' }, { type: 'ambusher' }, { type: 'trapper' }], hints: 5, targetTime: 58 },
    { id: 9, name: "Cryo Protocol", diff: "Hard", cols: 23, rows: 15, coins: 26, gems: 3, powerups: ['freeze', 'shield'], enemies: [{ type: 'hunter' }, { type: 'ambusher' }, { type: 'trapper' }], hints: 5, targetTime: 62 },
    { id: 10, name: "Chrono Challenge", diff: "Hard", cols: 23, rows: 17, coins: 28, gems: 4, powerups: ['freeze', 'speed'], enemies: [{ type: 'hunter' }, { type: 'ambusher' }, { type: 'trapper' }], hints: 5, targetTime: 65 },
    { id: 11, name: "The Gauntlet", diff: "Very Hard", cols: 25, rows: 17, coins: 30, gems: 4, powerups: ['shield', 'freeze'], enemies: [{ type: 'hunter' }, { type: 'ambusher' }, { type: 'trapper' }, { type: 'patrol' }], hints: 5, targetTime: 72 },
    { id: 12, name: "Labyrinth of Shadows", diff: "Very Hard", cols: 25, rows: 17, coins: 32, gems: 4, powerups: ['speed', 'shield'], enemies: [{ type: 'hunter' }, { type: 'ambusher' }, { type: 'trapper' }, { type: 'hunter' }], hints: 5, targetTime: 78 },
    { id: 13, name: "Synapse Matrix", diff: "Expert", cols: 27, rows: 17, coins: 35, gems: 5, powerups: ['speed', 'shield', 'freeze'], enemies: [{ type: 'hunter' }, { type: 'ambusher' }, { type: 'trapper' }, { type: 'hunter' }], hints: 5, targetTime: 85 },
    { id: 14, name: "Omega Survival", diff: "Expert", cols: 29, rows: 19, coins: 38, gems: 5, powerups: ['speed', 'shield', 'freeze'], enemies: [{ type: 'hunter' }, { type: 'hunter' }, { type: 'ambusher' }, { type: 'trapper' }], hints: 5, targetTime: 95 },
    { id: 15, name: "MAZEX CORE: THE OVERLORD", diff: "Final Boss", cols: 31, rows: 19, coins: 25, gems: 3, cores: 3, powerups: ['speed', 'shield', 'freeze'], enemies: [{ type: 'boss' }, { type: 'hunter' }, { type: 'ambusher' }], hints: 5, targetTime: 110 }
];

// ================= MAZE GRAPH GENERATOR =================
class MazeGenerator {
    static generate(cols, rows) {
        const grid = [];
        for (let r = 0; r < rows; r++) {
            const row = [];
            for (let c = 0; c < cols; c++) {
                row.push({ c, r, top: true, right: true, bottom: true, left: true, visited: false });
            }
            grid.push(row);
        }

        const stack = [];
        let curr = grid[0][0];
        curr.visited = true;
        let unvisited = cols * rows - 1;

        while (unvisited > 0) {
            const neighbors = [];
            const { c, r } = curr;
            if (r > 0 && !grid[r - 1][c].visited) neighbors.push({ cell: grid[r - 1][c], wall: 'top', opp: 'bottom' });
            if (c < cols - 1 && !grid[r][c + 1].visited) neighbors.push({ cell: grid[r][c + 1], wall: 'right', opp: 'left' });
            if (r < rows - 1 && !grid[r + 1][c].visited) neighbors.push({ cell: grid[r + 1][c], wall: 'bottom', opp: 'top' });
            if (c > 0 && !grid[r][c - 1].visited) neighbors.push({ cell: grid[r][c - 1], wall: 'left', opp: 'right' });

            if (neighbors.length > 0) {
                const next = neighbors[Math.floor(Math.random() * neighbors.length)];
                stack.push(curr);
                curr[next.wall] = false;
                next.cell[next.opp] = false;
                curr = next.cell;
                curr.visited = true;
                unvisited--;
            } else if (stack.length > 0) {
                curr = stack.pop();
            }
        }

        // Add 18% loops so players can circle around enemies
        const loopCount = Math.floor(cols * rows * 0.18);
        for (let i = 0; i < loopCount; i++) {
            const r = Math.floor(Math.random() * (rows - 2)) + 1;
            const c = Math.floor(Math.random() * (cols - 2)) + 1;
            if (Math.random() < 0.5) {
                grid[r][c].right = false;
                grid[r][c + 1].left = false;
            } else {
                grid[r][c].bottom = false;
                grid[r + 1][c].top = false;
            }
        }
        return grid;
    }

    static findPath(grid, cols, rows, startC, startR, endC, endR, avoidSafeZoneFn = null) {
        if (startC === endC && startR === endR) return [];
        const queue = [[{ c: startC, r: startR }]];
        const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
        visited[startR][startC] = true;

        while (queue.length > 0) {
            const path = queue.shift();
            const curr = path[path.length - 1];

            if (curr.c === endC && curr.r === endR) return path;

            const cell = grid[curr.r][curr.c];
            const moves = [];
            if (!cell.top && curr.r > 0) moves.push({ c: curr.c, r: curr.r - 1 });
            if (!cell.right && curr.c < cols - 1) moves.push({ c: curr.c + 1, r: curr.r });
            if (!cell.bottom && curr.r < rows - 1) moves.push({ c: curr.c, r: curr.r + 1 });
            if (!cell.left && curr.c > 0) moves.push({ c: curr.c - 1, r: curr.r });

            for (const m of moves) {
                if (avoidSafeZoneFn && avoidSafeZoneFn(m.c, m.r) && !(m.c === endC && m.r === endR)) {
                    continue;
                }
                if (!visited[m.r][m.c]) {
                    visited[m.r][m.c] = true;
                    queue.push([...path, m]);
                }
            }
        }
        return [];
    }
}

// ================= PLAYER ENTITY =================
class Player {
    constructor(c, r, cellSize, offsetX, offsetY) {
        this.c = c;
        this.r = r;
        this.targetC = c;
        this.targetR = r;
        this.cellSize = cellSize;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.x = offsetX + c * cellSize + cellSize / 2;
        this.y = offsetY + r * cellSize + cellSize / 2;
        this.radius = Math.max(6, cellSize * 0.35);
        this.baseSpeed = 4.0;
        this.dir = { x: 0, y: 0 };
        this.nextDir = { x: 0, y: 0 };
        this.nextDirTimer = 0;
        this.invulnerable = 0;
        this.trail = [];
    }

    getOpenDirections(cell, cols, rows) {
        if (!cell) return [];
        const dirs = [];
        if (!cell.top && cell.r > 0) dirs.push({ x: 0, y: -1, name: 'UP' });
        if (!cell.right && cell.c < cols - 1) dirs.push({ x: 1, y: 0, name: 'RIGHT' });
        if (!cell.bottom && cell.r < rows - 1) dirs.push({ x: 0, y: 1, name: 'DOWN' });
        if (!cell.left && cell.c > 0) dirs.push({ x: -1, y: 0, name: 'LEFT' });
        return dirs;
    }

    setNextDirection(newDir, grid, cols, rows) {
        if (!newDir || (newDir.x === 0 && newDir.y === 0)) return;

        // 1. Immediate 180-degree turnaround anytime anywhere along a corridor
        if (this.dir.x !== 0 || this.dir.y !== 0) {
            if (newDir.x === -this.dir.x && newDir.y === -this.dir.y) {
                this.dir = { ...newDir };
                this.nextDir = { ...newDir };
                this.nextDirTimer = 30;
                const prevTargetC = this.targetC;
                const prevTargetR = this.targetR;
                this.targetC = this.c;
                this.targetR = this.r;
                this.c = prevTargetC;
                this.r = prevTargetR;
                return;
            }
        }

        // Set queued desired direction (stays queued until executed or replaced)
        this.nextDir = { ...newDir };
        this.nextDirTimer = 30;

        const cs = this.cellSize || 32;
        const ox = this.offsetX || 0;
        const oy = this.offsetY || 0;

        // 2. If the player is currently stopped at a wall:
        if (this.dir.x === 0 && this.dir.y === 0) {
            const cell = grid && grid[this.r] ? grid[this.r][this.c] : null;
            if (cell) {
                // If unobstructed in desired direction, start immediately!
                if (this.canMove(cell, newDir, cols, rows)) {
                    this.dir = { ...newDir };
                    this.targetC = Math.max(0, Math.min(cols - 1, this.c + this.dir.x));
                    this.targetR = Math.max(0, Math.min(rows - 1, this.r + this.dir.y));
                    return;
                }

                // SMART CORNER & DEAD-END AUTO-NAVIGATION ASSIST:
                // If blocked by a wall directly in newDir, check if an open passage leads towards newDir
                const openDirs = this.getOpenDirections(cell, cols, rows);
                let assistDir = null;
                for (const od of openDirs) {
                    const nextR = this.r + od.y;
                    const nextC = this.c + od.x;
                    if (nextR >= 0 && nextR < rows && nextC >= 0 && nextC < cols) {
                        const nextCell = grid[nextR][nextC];
                        if (this.canMove(nextCell, newDir, cols, rows)) {
                            assistDir = od;
                            break;
                        }
                    }
                }

                // If in a dead-end pocket (only 1 open exit), navigate along the open exit
                if (!assistDir && openDirs.length === 1) {
                    assistDir = openDirs[0];
                }

                if (assistDir) {
                    this.dir = { ...assistDir };
                    this.nextDir = { ...newDir };
                    this.targetC = Math.max(0, Math.min(cols - 1, this.c + assistDir.x));
                    this.targetR = Math.max(0, Math.min(rows - 1, this.r + assistDir.y));
                    return;
                }
            }
        }

        // 3. Ultra-Responsive Corner-Assist & Perpendicular Snap-Turn:
        // When moving perpendicularly to newDir, check if player is near an open corridor intersection
        if (this.dir.x !== 0 && newDir.y !== 0) {
            // Currently moving horizontally, turning vertically
            const nearC = Math.round((this.x - ox - cs / 2) / cs);
            if (nearC >= 0 && nearC < cols) {
                const nearCenterX = ox + nearC * cs + cs / 2;
                const distToCenter = Math.abs(this.x - nearCenterX);
                if (distToCenter <= cs * 0.48) {
                    const cell = grid && grid[this.r] ? grid[this.r][nearC] : null;
                    if (cell && this.canMove(cell, newDir, cols, rows)) {
                        this.x = nearCenterX;
                        this.y = oy + this.r * cs + cs / 2;
                        this.c = nearC;
                        this.dir = { ...newDir };
                        this.nextDir = { x: 0, y: 0 };
                        this.nextDirTimer = 0;
                        this.targetC = nearC;
                        this.targetR = Math.max(0, Math.min(rows - 1, this.r + newDir.y));
                        return;
                    }
                }
            }
        } else if (this.dir.y !== 0 && newDir.x !== 0) {
            // Currently moving vertically, turning horizontally
            const nearR = Math.round((this.y - oy - cs / 2) / cs);
            if (nearR >= 0 && nearR < rows) {
                const nearCenterY = oy + nearR * cs + cs / 2;
                const distToCenter = Math.abs(this.y - nearCenterY);
                if (distToCenter <= cs * 0.48) {
                    const cell = grid && grid[nearR] ? grid[nearR][this.c] : null;
                    if (cell && this.canMove(cell, newDir, cols, rows)) {
                        this.x = ox + this.c * cs + cs / 2;
                        this.y = nearCenterY;
                        this.r = nearR;
                        this.dir = { ...newDir };
                        this.nextDir = { x: 0, y: 0 };
                        this.nextDirTimer = 0;
                        this.targetC = Math.max(0, Math.min(cols - 1, this.c + newDir.x));
                        this.targetR = nearR;
                        return;
                    }
                }
            }
        }
    }

    update(grid, cols, rows, cellSize, offsetX, offsetY, activeEffects) {
        this.cellSize = cellSize;
        this.offsetX = offsetX;
        this.offsetY = offsetY;

        if (this.invulnerable > 0) this.invulnerable--;

        // Decrement buffer timer for queued turns
        if (this.nextDirTimer > 0) {
            this.nextDirTimer--;
            if (this.nextDirTimer === 0) {
                this.nextDir = { x: 0, y: 0 };
            }
        }

        const speedMult = activeEffects.speed > 0 ? 1.45 : 1.0;
        const speed = this.baseSpeed * speedMult;

        const targetCenterX = offsetX + this.targetC * cellSize + cellSize / 2;
        const targetCenterY = offsetY + this.targetR * cellSize + cellSize / 2;

        const dx = targetCenterX - this.x;
        const dy = targetCenterY - this.y;
        const distToTarget = Math.hypot(dx, dy);

        if (distToTarget <= speed) {
            const leftoverSpeed = speed - distToTarget;
            this.x = targetCenterX;
            this.y = targetCenterY;
            this.c = this.targetC;
            this.r = this.targetR;

            const cell = grid[this.r] ? grid[this.r][this.c] : null;

            // 1. Turn into queued nextDir if unobstructed at this intersection
            if (this.nextDir && (this.nextDir.x !== 0 || this.nextDir.y !== 0) && this.canMove(cell, this.nextDir, cols, rows)) {
                this.dir = { ...this.nextDir };
                this.nextDir = { x: 0, y: 0 };
                this.nextDirTimer = 0;
            } 
            // 2. Else continue in current direction if unobstructed forward
            else if (this.canMove(cell, this.dir, cols, rows)) {
                // keep moving smoothly forward
            } 
            // 3. Else stopped at wall (NO auto-steering around corners without player command!)
            else {
                this.dir = { x: 0, y: 0 };
            }

            this.targetC = Math.max(0, Math.min(cols - 1, this.c + this.dir.x));
            this.targetR = Math.max(0, Math.min(rows - 1, this.r + this.dir.y));

            // Apply leftover velocity to guarantee smooth 60fps cornering
            if (leftoverSpeed > 0 && (this.dir.x !== 0 || this.dir.y !== 0)) {
                this.x += this.dir.x * leftoverSpeed;
                this.y += this.dir.y * leftoverSpeed;
            }
        } else {
            this.x += this.dir.x * speed;
            this.y += this.dir.y * speed;
        }

        // Motion trail during Speed Overdrive (smooth electric green cyber trail)
        if (activeEffects.speed > 0 && (this.dir.x !== 0 || this.dir.y !== 0)) {
            this.trail.push({
                x: this.x,
                y: this.y,
                alpha: 0.75,
                size: this.radius,
                color: '#39ff14'
            });
        }
        for (let i = this.trail.length - 1; i >= 0; i--) {
            this.trail[i].alpha -= 0.08;
            if (this.trail[i].alpha <= 0) this.trail.splice(i, 1);
        }
    }

    canMove(cell, d, cols, rows) {
        if (!cell || !d || (d.x === 0 && d.y === 0)) return false;
        if (d.y === -1 && !cell.top && cell.r > 0) return true;
        if (d.x === 1 && !cell.right && cell.c < cols - 1) return true;
        if (d.y === 1 && !cell.bottom && cell.r < rows - 1) return true;
        if (d.x === -1 && !cell.left && cell.c > 0) return true;
        return false;
    }

    draw(ctx, activeEffects, inSafeZone = false, activeProtection = null) {
        // Draw motion trail
        this.trail.forEach(t => {
            ctx.fillStyle = t.color ? `${t.color}55` : 'rgba(0, 255, 204, 0.3)';
            ctx.beginPath();
            ctx.arc(t.x, t.y, t.size * 0.8, 0, Math.PI * 2);
            ctx.fill();
        });

        // Invulnerability flicker
        if (this.invulnerable > 0 && Math.floor(Date.now() / 80) % 2 === 0) return;

        // Glowing outer body with electric green aura when Speed Boost is active
        const isSpeeding = activeEffects && activeEffects.speed > 0;
        const bodyColor = isSpeeding ? '#39ff14' : '#00ffcc';
        ctx.save();
        ctx.shadowBlur = isSpeeding ? 18 : 14;
        ctx.shadowColor = bodyColor;
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Inner core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.45, 0, Math.PI * 2);
        ctx.fill();

        // Cyber Shield forcefield
        if (activeEffects && activeEffects.shield > 0) {
            ctx.save();
            ctx.strokeStyle = '#00bfff';
            ctx.lineWidth = 2.5;
            ctx.shadowBlur = 14;
            ctx.shadowColor = '#00bfff';
            ctx.beginPath();
            const angle = Date.now() / 180;
            ctx.arc(this.x, this.y, this.radius + 6, angle, angle + Math.PI * 1.6);
            ctx.stroke();
            ctx.restore();
        }

        // Nanite Armor Hex Grid
        if (activeProtection === 'armor') {
            ctx.save();
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 1.8;
            ctx.shadowBlur = 12;
            ctx.shadowColor = '#ffd700';
            ctx.beginPath();
            const angle = Date.now() / 250;
            for (let i = 0; i < 6; i++) {
                const a = angle + i * (Math.PI / 3);
                const r = this.radius + 5;
                const hx = this.x + Math.cos(a) * r;
                const hy = this.y + Math.sin(a) * r;
                if (i === 0) ctx.moveTo(hx, hy);
                else ctx.lineTo(hx, hy);
            }
            ctx.closePath();
            ctx.stroke();
            ctx.restore();
        }

        // Safe Zone Protective Dome (or Portable Sanctuary Bubble)
        if (inSafeZone || (activeEffects && activeEffects.bubble > 0)) {
            ctx.save();
            ctx.strokeStyle = '#00ffcc';
            ctx.lineWidth = 2.4;
            ctx.shadowBlur = 16;
            ctx.shadowColor = '#00ffcc';
            ctx.beginPath();
            const angle = Date.now() / 220;
            ctx.arc(this.x, this.y, this.radius + 7, angle, angle + Math.PI * 1.5);
            ctx.stroke();

            ctx.strokeStyle = 'rgba(0, 240, 255, 0.8)';
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 4, -angle * 1.4, -angle * 1.4 + Math.PI * 1.2);
            ctx.stroke();
            ctx.restore();
        }
    }
}

// ================= ENEMY ENTITY (Animated Expression States) =================
class ExpressiveEnemy {
    constructor(c, r, type, level, cellSize, offsetX, offsetY) {
        this.c = c;
        this.r = r;
        this.targetC = c;
        this.targetR = r;
        this.x = offsetX + c * cellSize + cellSize / 2;
        this.y = offsetY + r * cellSize + cellSize / 2;
        this.type = type;
        this.level = level;

        const speedMap = {
            patrol: 1.6 + level * 0.05,
            hunter: 1.8 + level * 0.065,
            ambusher: 1.9 + level * 0.06,
            trapper: 1.7 + level * 0.055,
            boss: 1.85 + level * 0.04
        };
        this.speed = Math.min(2.85, speedMap[type] || 2.0);
        this.burstTimer = 0;
        this.burstActive = false;

        // Small, sleek enemy radius for ALL enemies including boss
        this.radius = Math.max(5, cellSize * 0.28);
        this.dir = { x: 0, y: 0 };
        this.alertTimer = 0;
        this.state = 'normal';
        this.blinkTimer = Math.random() * 100;
        this.defeatedTimer = 0;

        // Dynamic full-maze roaming destination & timer
        this.roamTargetC = null;
        this.roamTargetR = null;
        this.retargetTimer = 0;
    }

    pickNewRoamTarget(cols, rows, game = null) {
        let bestC = Math.floor(Math.random() * cols);
        let bestR = Math.floor(Math.random() * rows);
        let maxDist = 0;

        // Sample 8 random points across the maze and pick a distant quadrant to ensure full board traversal
        for (let tries = 0; tries < 8; tries++) {
            const tc = Math.floor(Math.random() * cols);
            const tr = Math.floor(Math.random() * rows);
            // Don't pick safe zones as roam destinations
            if (game && game.isSafeZone(tc, tr)) continue;

            const dist = Math.hypot(tc - this.c, tr - this.r);
            if (dist > maxDist) {
                maxDist = dist;
                bestC = tc;
                bestR = tr;
            }
        }

        this.roamTargetC = bestC;
        this.roamTargetR = bestR;
        this.retargetTimer = Math.floor(Math.random() * 180) + 240; // 4 to 7 seconds
    }

    defeat(durationFrames = 120) {
        this.defeatedTimer = durationFrames;
        this.state = 'defeated';
        this.burstActive = false;
        this.alertTimer = 0;
    }

    update(player, grid, cols, rows, cellSize, offsetX, offsetY, isFrozen, game = null) {
        if (this.defeatedTimer > 0) {
            this.defeatedTimer--;
            this.state = 'defeated';
            if (this.defeatedTimer === 0) {
                this.state = 'normal';
            }
            return;
        }

        if (isFrozen) {
            this.state = 'frozen';
            return;
        }

        if (this.alertTimer > 0) this.alertTimer--;
        this.retargetTimer--;

        if (this.level >= 7 && (this.type === 'hunter' || this.type === 'boss')) {
            this.burstTimer++;
            if (this.burstTimer > 300) {
                this.burstActive = true;
                if (this.burstTimer > 370) {
                    this.burstTimer = 0;
                    this.burstActive = false;
                }
            }
        }
        const effectiveSpeed = this.speed * (this.burstActive ? 1.3 : 1.0);

        const targetCenterX = offsetX + this.targetC * cellSize + cellSize / 2;
        const targetCenterY = offsetY + this.targetR * cellSize + cellSize / 2;

        const dx = targetCenterX - this.x;
        const dy = targetCenterY - this.y;
        const distToCenter = Math.hypot(dx, dy);

        if (distToCenter <= effectiveSpeed) {
            const leftoverSpeed = effectiveSpeed - distToCenter;
            this.x = targetCenterX;
            this.y = targetCenterY;
            this.c = this.targetC;
            this.r = this.targetR;

            const cell = grid[this.r] ? grid[this.r][this.c] : null;
            if (!cell) return;

            // Available corridor exits from current cell
            const exits = [];
            if (!cell.top && this.r > 0) exits.push({ x: 0, y: -1, c: this.c, r: this.r - 1 });
            if (!cell.right && this.c < cols - 1) exits.push({ x: 1, y: 0, c: this.c + 1, r: this.r });
            if (!cell.bottom && this.r < rows - 1) exits.push({ x: 0, y: 1, c: this.c, r: this.r + 1 });
            if (!cell.left && this.c > 0) exits.push({ x: -1, y: 0, c: this.c - 1, r: this.r });

            if (exits.length === 0) return;

            // Enemies cannot enter safe zone cells
            const safeZoneFilteredExits = exits.filter(e => !(game && game.isSafeZone(e.c, e.r)));
            const usableExits = safeZoneFilteredExits.length > 0 ? safeZoneFilteredExits : exits;

            const distToPlayer = Math.hypot(player.c - this.c, player.r - this.r);
            const playerProtected = game ? game.isPlayerInSafeZone() : false;

            // Determine if pursuing player or roaming across entire maze
            let destC = this.roamTargetC;
            let destR = this.roamTargetR;

            const isChasing = !playerProtected && (this.type === 'hunter' || this.type === 'boss') && distToPlayer <= 9;
            const isAmbushing = !playerProtected && this.type === 'ambusher' && distToPlayer <= 7;
            const isTrapping = !playerProtected && this.type === 'trapper' && distToPlayer <= 5;

            if (isChasing || isAmbushing || isTrapping) {
                if (this.state !== 'chasing' && this.state !== 'alert') {
                    this.state = 'alert';
                    this.alertTimer = 40;
                    sound.playAlert();
                } else if (this.alertTimer <= 0) {
                    this.state = 'chasing';
                }

                if (isAmbushing) {
                    destC = Math.max(0, Math.min(cols - 1, player.c + player.dir.x * 3));
                    destR = Math.max(0, Math.min(rows - 1, player.r + player.dir.y * 3));
                } else {
                    destC = player.c;
                    destR = player.r;
                }
            } else {
                this.state = 'normal';
                // Pick a new distant roam target across the board if needed, arrived, or expired
                if (destC === null || destR === null || this.retargetTimer <= 0 || (this.c === destC && this.r === destR) || (game && game.isSafeZone(destC, destR))) {
                    this.pickNewRoamTarget(cols, rows, game);
                    destC = this.roamTargetC;
                    destR = this.roamTargetR;
                }
            }

            // Pathfind through the maze corridors using BFS MazeGenerator.findPath, avoiding safe zones
            let nextStep = null;
            if (destC !== null && destR !== null && (destC !== this.c || destR !== this.r)) {
                const avoidSafeZoneFn = (c, r) => (game ? game.isSafeZone(c, r) : false);
                const path = MazeGenerator.findPath(grid, cols, rows, this.c, this.r, destC, destR, avoidSafeZoneFn);
                if (path && path.length > 1) {
                    nextStep = path[1];
                }
            }

            if (nextStep && usableExits.some(e => e.c === nextStep.c && e.r === nextStep.r)) {
                this.dir = { x: nextStep.c - this.c, y: nextStep.r - this.r };
            } else {
                // If path not resolved, avoid 180 reversal unless dead-end
                const nonReverseExits = usableExits.filter(e => !(e.x === -this.dir.x && e.y === -this.dir.y));
                const candidates = nonReverseExits.length > 0 ? nonReverseExits : usableExits;
                const picked = candidates[Math.floor(Math.random() * candidates.length)];
                this.dir = { x: picked.x, y: picked.y };
            }

            this.targetC = Math.max(0, Math.min(cols - 1, this.c + this.dir.x));
            this.targetR = Math.max(0, Math.min(rows - 1, this.r + this.dir.y));

            // Apply leftover velocity to eliminate cell transition hitch
            if (leftoverSpeed > 0 && (this.dir.x !== 0 || this.dir.y !== 0)) {
                this.x += this.dir.x * leftoverSpeed;
                this.y += this.dir.y * leftoverSpeed;
            }
        } else {
            this.x += this.dir.x * effectiveSpeed;
            this.y += this.dir.y * effectiveSpeed;
        }

        this.blinkTimer++;
    }

    draw(ctx, isFrozen, player) {
        ctx.save();

        // Vanished — invisible for 2 seconds after hitting the player
        if (this.defeatedTimer > 0) {
            ctx.restore();
            return;
        }

        let drawX = this.x;
        let drawY = this.y;


        if (isFrozen || this.state === 'frozen') {
            drawX += Math.sin(Date.now() / 25) * 1.5;
            drawY += Math.cos(Date.now() / 25) * 1.5;
        }

        ctx.shadowBlur = isFrozen ? 14 : 16;
        ctx.shadowColor = isFrozen ? '#00f0ff' : (this.type === 'boss' ? '#ff0055' : '#ff007f');

        const grad = ctx.createRadialGradient(drawX - this.radius * 0.3, drawY - this.radius * 0.3, 2, drawX, drawY, this.radius);
        if (isFrozen || this.state === 'frozen') {
            grad.addColorStop(0, '#e0f7ff');
            grad.addColorStop(1, '#00b4d8');
        } else if (this.type === 'boss') {
            grad.addColorStop(0, '#ff4d94');
            grad.addColorStop(0.7, '#ff007f');
            grad.addColorStop(1, '#990033');
        } else {
            grad.addColorStop(0, '#ff66b2');
            grad.addColorStop(0.8, '#ff007f');
            grad.addColorStop(1, '#cc0066');
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(drawX, drawY, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Scleras and face features (Alert badge removed per design)

        // Eye tracking
        const eyeOffset = this.radius * 0.35;
        const eyeRadius = this.radius * 0.28;
        const eyeY = drawY - this.radius * 0.15;

        let lookX = this.dir.x * 2;
        let lookY = this.dir.y * 2;
        const distToPlayer = Math.hypot(player.x - this.x, player.y - this.y);
        if (distToPlayer < 200 && !isFrozen) {
            lookX = ((player.x - this.x) / distToPlayer) * 2.5;
            lookY = ((player.y - this.y) / distToPlayer) * 2.5;
        }

        // Scleras
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(drawX - eyeOffset, eyeY, eyeRadius, 0, Math.PI * 2);
        ctx.arc(drawX + eyeOffset, eyeY, eyeRadius, 0, Math.PI * 2);
        ctx.fill();

        // Pupils
        const isBlinking = (this.blinkTimer % 180 > 172) && !isFrozen;
        if (!isBlinking) {
            ctx.fillStyle = isFrozen ? '#0077b6' : '#111122';
            const pupilRadius = eyeRadius * 0.55;
            ctx.beginPath();
            ctx.arc(drawX - eyeOffset + lookX, eyeY + lookY, pupilRadius, 0, Math.PI * 2);
            ctx.arc(drawX + eyeOffset + lookX, eyeY + lookY, pupilRadius, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(drawX - eyeOffset + lookX - 1, eyeY + lookY - 1, pupilRadius * 0.35, 0, Math.PI * 2);
            ctx.arc(drawX + eyeOffset + lookX - 1, eyeY + lookY - 1, pupilRadius * 0.35, 0, Math.PI * 2);
            ctx.fill();
        }

        // Eyebrows
        ctx.strokeStyle = isFrozen ? '#0077b6' : '#660022';
        ctx.lineWidth = Math.max(1.5, this.radius * 0.12);
        ctx.lineCap = 'round';
        ctx.beginPath();

        if (isFrozen) {
            ctx.moveTo(drawX - eyeOffset - eyeRadius, eyeY - eyeRadius - 1);
            ctx.lineTo(drawX - eyeOffset + eyeRadius, eyeY - eyeRadius - 1);
            ctx.moveTo(drawX + eyeOffset - eyeRadius, eyeY - eyeRadius - 1);
            ctx.lineTo(drawX + eyeOffset + eyeRadius, eyeY - eyeRadius - 1);
        } else if (this.state === 'chasing' || this.type === 'hunter' || this.type === 'boss') {
            ctx.moveTo(drawX - eyeOffset - eyeRadius, eyeY - eyeRadius + 2);
            ctx.lineTo(drawX - eyeOffset + eyeRadius, eyeY - eyeRadius - 3);
            ctx.moveTo(drawX + eyeOffset - eyeRadius, eyeY - eyeRadius - 3);
            ctx.lineTo(drawX + eyeOffset + eyeRadius, eyeY - eyeRadius + 2);
        } else if (this.type === 'ambusher') {
            ctx.moveTo(drawX - eyeOffset - eyeRadius, eyeY - eyeRadius);
            ctx.lineTo(drawX - eyeOffset + eyeRadius, eyeY - eyeRadius - 3);
            ctx.moveTo(drawX + eyeOffset - eyeRadius, eyeY - eyeRadius - 4);
            ctx.lineTo(drawX + eyeOffset + eyeRadius, eyeY - eyeRadius);
        } else {
            ctx.moveTo(drawX - eyeOffset - eyeRadius, eyeY - eyeRadius - 2);
            ctx.lineTo(drawX - eyeOffset + eyeRadius, eyeY - eyeRadius - 2);
            ctx.moveTo(drawX + eyeOffset - eyeRadius, eyeY - eyeRadius - 2);
            ctx.lineTo(drawX + eyeOffset + eyeRadius, eyeY - eyeRadius - 2);
        }
        ctx.stroke();

        // Mouth
        ctx.beginPath();
        const mouthY = drawY + this.radius * 0.45;
        if (isFrozen) {
            ctx.moveTo(drawX - 5, mouthY);
            ctx.lineTo(drawX - 2, mouthY + 2);
            ctx.lineTo(drawX + 2, mouthY - 2);
            ctx.lineTo(drawX + 5, mouthY);
            ctx.stroke();
        } else if (this.state === 'chasing' || this.type === 'hunter' || this.type === 'boss') {
            ctx.fillStyle = '#660022';
            ctx.arc(drawX, mouthY - 1, this.radius * 0.28, 0, Math.PI);
            ctx.fill();
        } else if (this.type === 'ambusher') {
            ctx.moveTo(drawX - 4, mouthY);
            ctx.quadraticCurveTo(drawX + 1, mouthY + 4, drawX + 5, mouthY - 2);
            ctx.stroke();
        } else {
            ctx.arc(drawX, mouthY - 3, this.radius * 0.22, 0.2 * Math.PI, 0.8 * Math.PI);
            ctx.stroke();
        }

        ctx.restore();
    }
}

// ================= COLLECTIBLES & ENHANCED EXIT PORTAL =================
class CollectibleItem {
    constructor(c, r, type, cellSize, offsetX, offsetY) {
        this.c = c;
        this.r = r;
        this.type = type;
        this.x = offsetX + c * cellSize + cellSize / 2;
        this.y = offsetY + r * cellSize + cellSize / 2;
        this.radius = Math.max(4, cellSize * 0.25);
        if (type === 'gem') this.radius = Math.max(6, cellSize * 0.32);
        if (type === 'core') this.radius = Math.max(8, cellSize * 0.4);
        if (type === 'exit') this.radius = Math.max(14, cellSize * 0.7);
        this.pulse = Math.random() * Math.PI * 2;
    }

    draw(ctx, exitActivated = false, unlockAnim = 0) {
        this.pulse += 0.05;
        const scale = 1 + Math.sin(this.pulse) * 0.12;

        ctx.save();
        if (this.type === 'coin') {
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#ffd700';
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * scale, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(this.x - 1, this.y - 1, this.radius * 0.35, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'gem') {
            ctx.shadowBlur = 12;
            ctx.shadowColor = '#a855f7';
            ctx.fillStyle = '#c084fc';
            ctx.beginPath();
            const sz = this.radius * scale;
            ctx.moveTo(this.x, this.y - sz);
            ctx.lineTo(this.x + sz * 0.8, this.y);
            ctx.lineTo(this.x, this.y + sz);
            ctx.lineTo(this.x - sz * 0.8, this.y);
            ctx.closePath();
            ctx.fill();
        } else if (this.type === 'core') {
            ctx.shadowBlur = 16;
            ctx.shadowColor = '#ff00aa';
            ctx.fillStyle = '#ff00aa';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#00ffcc';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 0.5, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'speed') {
            ctx.shadowBlur = 12;
            ctx.shadowColor = '#39ff14';
            ctx.fillStyle = '#39ff14';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.font = 'bold 10px Orbitron';
            ctx.textAlign = 'center';
            ctx.fillText('⚡', this.x, this.y + 3);
        } else if (this.type === 'shield') {
            ctx.shadowBlur = 12;
            ctx.shadowColor = '#00bfff';
            ctx.fillStyle = '#00bfff';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.font = 'bold 9px Orbitron';
            ctx.textAlign = 'center';
            ctx.fillText('🛡', this.x, this.y + 3);
        } else if (this.type === 'freeze') {
            ctx.shadowBlur = 12;
            ctx.shadowColor = '#00f0ff';
            ctx.fillStyle = '#00f0ff';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.font = 'bold 10px Orbitron';
            ctx.textAlign = 'center';
            ctx.fillText('❄', this.x, this.y + 3);
        } else if (this.type === 'exit') {
            // ================= CLEAN CYBER EXIT PORTAL =================
            if (exitActivated) {
                // Active exit — just a glowing filled white circle, no outer ring
                if (unlockAnim > 0) {
                    const waveRadius = this.radius * (1 + (60 - unlockAnim) * 0.04);
                    const waveAlpha = unlockAnim / 60;
                    ctx.strokeStyle = `rgba(0, 245, 212, ${waveAlpha})`;
                    ctx.lineWidth = 2.5;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, waveRadius, 0, Math.PI * 2);
                    ctx.stroke();
                }

                ctx.shadowBlur = 18;
                ctx.shadowColor = '#ffffff';
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius * 0.45, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            } else {
                // Dormant exit — solid filled white circle to mark the endpoint
                ctx.shadowBlur = 8;
                ctx.shadowColor = '#ffffff';
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius * 0.45, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }
        ctx.restore();
    }
}

// ================= PARTICLE & FLOATING TEXT ENGINE =================
class EffectManager {
    constructor() {
        this.particles = [];
        this.floatTexts = [];
        this.confetti = [];
    }

    addBurst(x, y, color = '#ffd700', count = 12) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.5 + Math.random() * 3.5;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color,
                alpha: 1.0,
                radius: 1.5 + Math.random() * 2.5,
                decay: 0.03 + Math.random() * 0.03
            });
        }
    }

    addFloatText(x, y, text, color = '#ffd700') {
        this.floatTexts.push({ x, y, text, color, alpha: 1.0, vy: -1.2 });
    }

    startConfetti(width, height) {
        this.confetti = [];
        const colors = ['#00ffcc', '#ff007f', '#ffd700', '#00bfff', '#a855f7', '#ffffff'];
        for (let i = 0; i < 120; i++) {
            this.confetti.push({
                x: Math.random() * width,
                y: Math.random() * height - height,
                vx: (Math.random() - 0.5) * 2,
                vy: 2 + Math.random() * 4,
                rot: Math.random() * 360,
                rotSpeed: (Math.random() - 0.5) * 8,
                size: 6 + Math.random() * 6,
                color: colors[Math.floor(Math.random() * colors.length)]
            });
        }
    }

    update(width, height) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= p.decay;
            if (p.alpha <= 0) this.particles.splice(i, 1);
        }

        for (let i = this.floatTexts.length - 1; i >= 0; i--) {
            const ft = this.floatTexts[i];
            ft.y += ft.vy;
            ft.alpha -= 0.02;
            if (ft.alpha <= 0) this.floatTexts.splice(i, 1);
        }

        this.confetti.forEach(c => {
            c.x += c.vx;
            c.y += c.vy;
            c.rot += c.rotSpeed;
            if (c.y > height) c.y = -20;
        });
    }

    draw(ctx) {
        this.particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 6;
            ctx.shadowColor = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        this.floatTexts.forEach(ft => {
            ctx.save();
            ctx.globalAlpha = Math.max(0, ft.alpha);
            ctx.font = 'bold 12px Orbitron, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const metrics = ctx.measureText(ft.text);
            const padX = 8;
            const padY = 3;
            const boxW = Math.max(30, metrics.width + padX * 2);
            const boxH = 18;

            // Sleek translucent cyber pill backdrop (never overlaps or clashes with walls)
            ctx.fillStyle = 'rgba(10, 15, 30, 0.90)';
            ctx.strokeStyle = ft.color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            if (typeof ctx.roundRect === 'function') {
                ctx.roundRect(ft.x - boxW / 2, ft.y - boxH / 2, boxW, boxH, 4);
            } else {
                ctx.rect(ft.x - boxW / 2, ft.y - boxH / 2, boxW, boxH);
            }
            ctx.fill();
            ctx.stroke();

            // Text with glow
            ctx.fillStyle = ft.color;
            ctx.shadowBlur = 6;
            ctx.shadowColor = ft.color;
            ctx.fillText(ft.text, ft.x, ft.y);
            ctx.restore();
        });
    }

    drawConfetti(ctx, width, height) {
        ctx.clearRect(0, 0, width, height);
        this.confetti.forEach(c => {
            ctx.save();
            ctx.translate(c.x, c.y);
            ctx.rotate((c.rot * Math.PI) / 180);
            ctx.fillStyle = c.color;
            ctx.shadowBlur = 6;
            ctx.shadowColor = c.color;
            ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size * 0.6);
            ctx.restore();
        });
    }
}

// ================= KEYBOARD INPUT MAPPINGS =================
const KEY_TO_DIR = {
    // Arrow Keys (standard codes and keys)
    'ArrowUp': 'UP', 'ArrowDown': 'DOWN', 'ArrowLeft': 'LEFT', 'ArrowRight': 'RIGHT',
    'Up': 'UP', 'Down': 'DOWN', 'Left': 'LEFT', 'Right': 'RIGHT',
    // WASD (case-insensitive)
    'KeyW': 'UP', 'KeyS': 'DOWN', 'KeyA': 'LEFT', 'KeyD': 'RIGHT',
    'w': 'UP', 'W': 'UP', 's': 'DOWN', 'S': 'DOWN', 'a': 'LEFT', 'A': 'LEFT', 'd': 'RIGHT', 'D': 'RIGHT',
    // Dedicated Navigation Cluster
    'Home': 'LEFT', 'End': 'RIGHT', 'PageUp': 'UP', 'PageDown': 'DOWN',
    // Numpad (both with NumLock On & Off)
    'Numpad8': 'UP', 'Numpad2': 'DOWN', 'Numpad4': 'LEFT', 'Numpad6': 'RIGHT',
    'Numpad7': 'LEFT', 'Numpad1': 'RIGHT', 'Numpad9': 'UP', 'Numpad3': 'DOWN',
    '8': 'UP', '2': 'DOWN', '4': 'LEFT', '6': 'RIGHT',
    '7': 'LEFT', '1': 'RIGHT', '9': 'UP', '3': 'DOWN'
};

const MOVEMENT_KEYS = new Set([
    'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Up', 'Down', 'Left', 'Right',
    'KeyW', 'KeyA', 'KeyS', 'KeyD', 'w', 'W', 'a', 'A', 's', 'S', 'd', 'D',
    'Home', 'End', 'PageUp', 'PageDown',
    'Numpad8', 'Numpad2', 'Numpad4', 'Numpad6', 'Numpad7', 'Numpad1', 'Numpad9', 'Numpad3',
    '8', '2', '4', '6', '7', '1', '9', '3'
]);

// ================= MAIN GAME CONTROLLER =================
class MazeXGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.confettiCanvas = document.getElementById('confettiCanvas');
        this.confettiCtx = this.confettiCanvas.getContext('2d');
        this.container = document.getElementById('game-container');

        this.effects = new EffectManager();

        // Game State
        this.gameState = 'MENU';
        this.currentLevelIdx = 0;
        this.score = 0;
        this.lives = 3;
        this.health = 100;
        this.maxSafeCharges = 2;
        this.safeChargesRemaining = 2;

        // Level Run Metrics
        this.levelStartTime = 0;
        this.levelElapsedTime = 0;
        this.levelHitsTaken = 0;
        this.requiredCoins = 0;
        this.collectedCoins = 0;
        this.exitActivated = false;
        this.portalUnlockAnim = 0;
        this.isLevelCompleting = false;

        // Overall Campaign Run Stats
        this.campaignScore = 0;
        this.campaignTime = 0;
        this.campaignCollectibles = 0;
        this.claimedBonusLevels = [];

        // Power-ups and timers
        this.activeEffects = { speed: 0, shield: 0, freeze: 0, bubble: 0 };
        this.hintsRemaining = 5;
        this.hintCooldown = 0;
        this.activeHintPath = [];
        this.hintRenderTimer = 0;

        // Maze Geometry
        this.grid = [];
        this.cols = 15;
        this.rows = 11;
        this.cellSize = 32;
        this.offsetX = 0;
        this.offsetY = 0;

        // Entities
        this.player = null;
        this.enemies = [];
        this.items = [];
        this.exitItem = null;

        // Inputs & Direction Controls (LIFO Stack for Instant Responsiveness)
        this.keys = {};
        this.heldDirectionStack = [];
        this.activeDirection = null;

        // Safe Zones (for levels after level 10)
        this.safeZones = [];
        this.safeZoneKeys = new Set();
        this.wasInSafeZone = false;
        this.activeProtection = null;
        this.isPowersModalOpen = false;

        // DOM Screens & Elements
        this.screens = {
            menu: document.getElementById('screen-menu'),
            levels: document.getElementById('screen-levels'),
            howTo: document.getElementById('screen-how-to'),
            stats: document.getElementById('screen-stats'),
            settings: document.getElementById('screen-settings'),
            pause: document.getElementById('screen-pause'),
            complete: document.getElementById('screen-level-complete'),
            gameOver: document.getElementById('screen-game-over'),
            victory: document.getElementById('screen-victory'),
            tacticalPowers: document.getElementById('screen-tactical-powers'),
            confirmReset: document.getElementById('modal-confirm-reset')
        };
        this.hud = document.getElementById('hud');
        this.toastBanner = document.getElementById('toast-banner');

        this.init();
    }

    clearInput() {
        this.keys = {};
        this.heldDirectionStack = [];
        this.activeDirection = null;
    }

    setDesiredDirection(dirName) {
        if (!dirName) return;
        const DIR_VECTORS = {
            'UP': { x: 0, y: -1 },
            'DOWN': { x: 0, y: 1 },
            'LEFT': { x: -1, y: 0 },
            'RIGHT': { x: 1, y: 0 }
        };
        const vec = DIR_VECTORS[dirName];
        if (vec && this.player) {
            this.player.setNextDirection(vec, this.grid, this.cols, this.rows);
        }
    }

    handleDirectionPress(dirName) {
        if (!dirName) return;
        // Move this direction to the top of the stack (most recent active input)
        this.heldDirectionStack = this.heldDirectionStack.filter(d => d !== dirName);
        this.heldDirectionStack.push(dirName);
        this.activeDirection = dirName;
        this.setDesiredDirection(dirName);
    }

    handleDirectionRelease(dirName) {
        if (!dirName) return;
        this.heldDirectionStack = this.heldDirectionStack.filter(d => d !== dirName);
        if (this.heldDirectionStack.length > 0) {
            // Revert to previously held direction
            this.activeDirection = this.heldDirectionStack[this.heldDirectionStack.length - 1];
            this.setDesiredDirection(this.activeDirection);
        } else {
            this.activeDirection = null;
        }
    }

    init() {
        this.bindEvents();
        this.applySettings(ProgressManager.getSettings());
        this.updateContinueButtonState();
        this.resize();
        this.showScreen('menu');

        const loop = () => {
            this.update();
            this.draw();
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    resize() {
        const cContainer = document.getElementById('canvas-container');
        if (cContainer) {
            this.canvas.width = cContainer.clientWidth || 800;
            this.canvas.height = cContainer.clientHeight || 520;
            this.confettiCanvas.width = this.canvas.width;
            this.confettiCanvas.height = this.canvas.height;
            this.recalculateMazeLayout();

            // Synchronize entity coordinates smoothly when resized
            if (this.player && this.cellSize) {
                this.player.radius = Math.max(6, this.cellSize * 0.35);
                this.player.x = this.offsetX + this.player.c * this.cellSize + this.cellSize / 2;
                this.player.y = this.offsetY + this.player.r * this.cellSize + this.cellSize / 2;
            }
            if (this.items && this.cellSize) {
                this.items.forEach(it => {
                    it.radius = it.type === 'gem' ? Math.max(6, this.cellSize * 0.32) :
                                it.type === 'core' ? Math.max(8, this.cellSize * 0.4) :
                                it.type === 'exit' ? Math.max(14, this.cellSize * 0.7) :
                                Math.max(4, this.cellSize * 0.25);
                    it.x = this.offsetX + it.c * this.cellSize + this.cellSize / 2;
                    it.y = this.offsetY + it.r * this.cellSize + this.cellSize / 2;
                });
            }
            if (this.exitItem && this.cellSize) {
                this.exitItem.radius = Math.max(14, this.cellSize * 0.7);
                this.exitItem.x = this.offsetX + this.exitItem.c * this.cellSize + this.cellSize / 2;
                this.exitItem.y = this.offsetY + this.exitItem.r * this.cellSize + this.cellSize / 2;
            }
            if (this.enemies && this.cellSize) {
                this.enemies.forEach(e => {
                    e.radius = Math.max(5, this.cellSize * 0.28);
                    e.x = this.offsetX + e.c * this.cellSize + this.cellSize / 2;
                    e.y = this.offsetY + e.r * this.cellSize + this.cellSize / 2;
                });
            }
        }
    }

    recalculateMazeLayout() {
        if (!this.cols || !this.rows) return;
        this.cellSize = Math.floor(Math.min(
            (this.canvas.width - 24) / this.cols,
            (this.canvas.height - 24) / this.rows
        ));
        this.offsetX = Math.floor((this.canvas.width - this.cols * this.cellSize) / 2);
        this.offsetY = Math.floor((this.canvas.height - this.rows * this.cellSize) / 2);
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resize());

        // Ensure canvas clicks refocus game window and clear any button focus
        const focusGameWindow = () => {
            if (document.activeElement && typeof document.activeElement.blur === 'function') {
                document.activeElement.blur();
            }
            if (this.canvas && typeof this.canvas.focus === 'function') {
                this.canvas.focus();
            }
            window.focus();
        };
        this.canvas.addEventListener('mousedown', focusGameWindow);
        this.canvas.addEventListener('click', focusGameWindow);

        window.addEventListener('keydown', (e) => {
            sound.init();

            // Prevent browser scrolling and default actions for all movement keys
            if (MOVEMENT_KEYS.has(e.code) || MOVEMENT_KEYS.has(e.key)) {
                e.preventDefault();
            }

            // Close tactical powers modal on ESC or B toggle or Enter
            if (this.isPowersModalOpen) {
                if (e.code === 'Escape' || e.key === 'Escape' || e.code === 'KeyB' || e.key === 'b' || e.key === 'B' || e.code === 'Enter') {
                    this.hideTacticalPowersModal();
                }
                return;
            }

            if (this.gameState !== 'PLAYING') {
                if (e.code === 'Escape' || e.code === 'KeyP') {
                    if (this.gameState === 'PAUSED') this.resumeGame();
                }
                return;
            }

            const kCode = e.code || '';
            const kKey = e.key || '';
            const dirName = KEY_TO_DIR[kCode] || KEY_TO_DIR[kKey] || KEY_TO_DIR[kKey.toLowerCase()] || KEY_TO_DIR[kKey.toUpperCase()];
            if (dirName) {
                this.handleDirectionPress(dirName);
            }

            if (e.code === 'Escape' || e.code === 'KeyP') {
                this.pauseGame();
            }

            if (e.code === 'KeyH' || e.key === 'h' || e.key === 'H') {
                this.triggerHint();
            }

            if (e.code === 'Space') {
                e.preventDefault();
                this.triggerCyberStrike();
            }

            // Open Tactical Powers Arsenal on B key for Advanced Sectors (13, 14, 15)
            if (e.code === 'KeyB' || e.key === 'b' || e.key === 'B') {
                const cfg = LEVELS_CONFIG[this.currentLevelIdx];
                if (cfg && cfg.id >= 13) {
                    this.showTacticalPowersModal();
                }
            }
        });

        window.addEventListener('keyup', (e) => {
            const kCode = e.code || '';
            const kKey = e.key || '';
            const dirName = KEY_TO_DIR[kCode] || KEY_TO_DIR[kKey] || KEY_TO_DIR[kKey.toLowerCase()] || KEY_TO_DIR[kKey.toUpperCase()];
            if (dirName) {
                this.handleDirectionRelease(dirName);
            }
        });

        window.addEventListener('blur', () => {
            this.clearInput();
            if (document.activeElement && typeof document.activeElement.blur === 'function') {
                document.activeElement.blur();
            }
            window.focus();
        });

        // Main Menu Navigation (Always start with full 3 lives and 100 health)
        document.getElementById('btn-play').addEventListener('click', () => {
            sound.init();
            sound.playClick();
            if (this.areAllLevelsCompleted()) {
                this.showVictoryScreen();
                return;
            }
            const session = ProgressManager.getSavedSession();
            const starsMap = ProgressManager.getLevelStars();
            if (session && session.levelIdx !== undefined && (!starsMap[session.levelIdx + 1] || starsMap[session.levelIdx + 1] === 0)) {
                this.score = session.score || 0;
                this.campaignScore = session.score || 0;
                this.lives = 3;
                this.health = 100;
                this.claimedBonusLevels = session.claimedBonusLevels || [];
                this.startLevel(session.levelIdx);
            } else {
                this.score = 0;
                this.campaignScore = 0;
                this.claimedBonusLevels = [];
                const targetIdx = this.getNextIncompleteLevelIndex();
                this.startLevel(targetIdx);
            }
        });

        const btnLevelsContinue = document.getElementById('btn-levels-continue');
        if (btnLevelsContinue) {
            btnLevelsContinue.addEventListener('click', () => {
                sound.init();
                sound.playClick();
                if (this.areAllLevelsCompleted()) {
                    this.showVictoryScreen();
                    return;
                }
                const session = ProgressManager.getSavedSession();
                const starsMap = ProgressManager.getLevelStars();
                if (session && session.levelIdx !== undefined && (!starsMap[session.levelIdx + 1] || starsMap[session.levelIdx + 1] === 0)) {
                    this.score = session.score || 0;
                    this.campaignScore = session.score || 0;
                    this.lives = 3;
                    this.health = 100;
                    this.claimedBonusLevels = session.claimedBonusLevels || [];
                    this.startLevel(session.levelIdx);
                } else {
                    this.score = 0;
                    this.campaignScore = 0;
                    this.claimedBonusLevels = [];
                    const targetIdx = this.getNextIncompleteLevelIndex();
                    this.startLevel(targetIdx);
                }
            });
        }

        document.getElementById('btn-levels').addEventListener('click', () => {
            sound.init();
            sound.playClick();
            this.renderLevelSelectGrid();
            this.showScreen('levels');
        });

        document.getElementById('btn-howto').addEventListener('click', () => {
            sound.init();
            sound.playClick();
            this.showScreen('howTo');
        });

        document.getElementById('btn-settings').addEventListener('click', () => {
            sound.init();
            sound.playClick();
            this.showScreen('settings');
        });

        document.getElementById('btn-stats').addEventListener('click', () => {
            sound.init();
            sound.playClick();
            this.renderStatsAndAchievements();
            this.showScreen('stats');
        });

        // Close (✕) Buttons on Modals
        document.getElementById('btn-close-levels-x').addEventListener('click', () => { sound.playClick(); this.showScreen('menu'); });
        document.getElementById('btn-levels-back').addEventListener('click', () => { sound.playClick(); this.showScreen('menu'); });

        document.getElementById('btn-close-howto-x').addEventListener('click', () => { sound.playClick(); this.showScreen('menu'); });
        document.getElementById('btn-close-how-to').addEventListener('click', () => { sound.playClick(); this.showScreen('menu'); });

        document.getElementById('btn-close-stats-x').addEventListener('click', () => { sound.playClick(); this.showScreen('menu'); });
        document.getElementById('btn-close-stats').addEventListener('click', () => { sound.playClick(); this.showScreen('menu'); });

        document.getElementById('btn-close-settings-x').addEventListener('click', () => { sound.playClick(); this.saveSettingsFromUI(); this.showScreen('menu'); });
        document.getElementById('btn-close-settings').addEventListener('click', () => { sound.playClick(); this.saveSettingsFromUI(); this.showScreen('menu'); });

        // Reset Progress Confirmation Dialog
        const openResetModal = () => {
            sound.playClick();
            document.getElementById('modal-confirm-reset').classList.remove('hidden');
        };
        document.getElementById('btn-settings-reset').addEventListener('click', openResetModal);
        document.getElementById('btn-stats-reset').addEventListener('click', openResetModal);

        document.getElementById('btn-confirm-cancel').addEventListener('click', () => {
            sound.playClick();
            document.getElementById('modal-confirm-reset').classList.add('hidden');
        });

        document.getElementById('btn-confirm-reset').addEventListener('click', () => {
            sound.playClick();
            ProgressManager.resetProgress();
            this.score = 0;
            this.campaignScore = 0;
            this.claimedBonusLevels = [];
            document.getElementById('modal-confirm-reset').classList.add('hidden');
            this.updateContinueButtonState();
            this.renderLevelSelectGrid();
            this.renderStatsAndAchievements();
            this.showToast("Campaign progress and achievements reset.");
        });

        // Settings Sliders Dynamic Percentage Display
        const setupSlider = (sliderId, labelId, callback) => {
            const s = document.getElementById(sliderId);
            const l = document.getElementById(labelId);
            s.addEventListener('input', () => {
                l.innerText = `${s.value}%`;
                callback(parseInt(s.value, 10));
            });
        };
        setupSlider('slider-master-volume', 'val-master-volume', v => { sound.masterVolume = v / 100; sound.updateVolumes(); });
        setupSlider('slider-music-volume', 'val-music-volume', v => { sound.musicVolume = v / 100; sound.updateVolumes(); });
        setupSlider('slider-sfx-volume', 'val-sfx-volume', v => { sound.sfxVolume = v / 100; sound.updateVolumes(); });

        document.getElementById('toggle-music').addEventListener('change', e => {
            sound.musicEnabled = e.target.checked;
            sound.updateVolumes();
            if (sound.musicEnabled && !sound.musicInterval) sound.startAmbientMusic();
            else if (!sound.musicEnabled) sound.stopAmbientMusic();
        });
        document.getElementById('toggle-sfx').addEventListener('change', e => {
            sound.sfxEnabled = e.target.checked;
        });

        document.getElementById('select-theme').addEventListener('change', e => {
            this.applyTheme(e.target.value);
        });
        document.getElementById('select-glow').addEventListener('change', e => {
            this.applyGlow(e.target.value);
        });

        // HUD Buttons
        document.getElementById('btn-hud-hint').addEventListener('click', () => { sound.init(); this.triggerHint(); });
        document.getElementById('btn-hud-pause').addEventListener('click', () => { sound.init(); this.pauseGame(); });

        const btnHudPowers = document.getElementById('btn-hud-powers');
        if (btnHudPowers) {
            btnHudPowers.addEventListener('click', () => {
                sound.init();
                sound.playClick();
                this.showTacticalPowersModal();
            });
        }

        const btnPowersDeploy = document.getElementById('btn-powers-deploy');
        if (btnPowersDeploy) {
            btnPowersDeploy.addEventListener('click', () => {
                sound.playClick();
                this.hideTacticalPowersModal();
            });
        }

        const btnClosePowersX = document.getElementById('btn-close-powers-x');
        if (btnClosePowersX) {
            btnClosePowersX.addEventListener('click', () => {
                sound.playClick();
                this.hideTacticalPowersModal();
            });
        }

        // Pause Modal
        document.getElementById('btn-pause-resume').addEventListener('click', () => this.resumeGame());
        document.getElementById('btn-pause-restart').addEventListener('click', () => {
            sound.playClick();
            this.isLevelCompleting = false;
            this.startLevel(this.currentLevelIdx);
        });
        document.getElementById('btn-pause-settings').addEventListener('click', () => {
            sound.playClick();
            this.showScreen('settings');
        });
        document.getElementById('btn-pause-menu').addEventListener('click', () => {
            sound.playClick();
            this.showScreen('menu');
        });

        // Level Complete Screen Actions
        document.getElementById('btn-next-level').addEventListener('click', () => {
            sound.playClick();
            this.isLevelCompleting = false;
            if (this.areAllLevelsCompleted()) {
                this.showVictoryScreen();
                return;
            }
            const starsMap = ProgressManager.getLevelStars();
            // If subsequent level in sequence is incomplete, launch it
            if (this.currentLevelIdx + 1 < LEVELS_CONFIG.length && (!starsMap[this.currentLevelIdx + 2] || starsMap[this.currentLevelIdx + 2] === 0)) {
                this.startLevel(this.currentLevelIdx + 1);
            } else {
                // Otherwise jump directly to the first incomplete level!
                const nextIncomplete = this.getFirstIncompleteLevelIndex();
                if (nextIncomplete !== -1) {
                    this.startLevel(nextIncomplete);
                } else {
                    this.showVictoryScreen();
                }
            }
        });
        document.getElementById('btn-replay-level').addEventListener('click', () => {
            sound.playClick();
            this.isLevelCompleting = false;
            this.startLevel(this.currentLevelIdx);
        });
        document.getElementById('btn-complete-menu').addEventListener('click', () => {
            sound.playClick();
            this.isLevelCompleting = false;
            this.showScreen('menu');
        });

        // Game Over Screen Actions
        document.getElementById('btn-gameover-retry').addEventListener('click', () => {
            sound.playClick();
            this.lives = 3;
            this.health = 100;
            this.isLevelCompleting = false;
            this.startLevel(this.currentLevelIdx);
        });
        document.getElementById('btn-gameover-menu').addEventListener('click', () => {
            sound.playClick();
            this.isLevelCompleting = false;
            this.showScreen('menu');
        });

        // Victory Screen Actions
        document.getElementById('btn-victory-play-again').addEventListener('click', () => {
            sound.playClick();
            this.score = 0;
            this.campaignScore = 0;
            this.campaignTime = 0;
            this.campaignCollectibles = 0;
            this.lives = 3;
            this.health = 100;
            this.claimedBonusLevels = [];
            this.isLevelCompleting = false;
            ProgressManager.clearSavedSession();
            this.startLevel(0);
        });
        document.getElementById('btn-victory-levels').addEventListener('click', () => {
            sound.playClick();
            this.confettiCanvas.classList.add('hidden');
            this.renderLevelSelectGrid();
            this.showScreen('levels');
        });
        document.getElementById('btn-victory-menu').addEventListener('click', () => {
            sound.playClick();
            this.confettiCanvas.classList.add('hidden');
            this.showScreen('menu');
        });

        // Mobile Controls
        ['up', 'down', 'left', 'right'].forEach(dir => {
            const btn = document.getElementById(`dpad-${dir}`);
            const dirName = dir.toUpperCase();
            if (btn) {
                const press = (e) => {
                    e.preventDefault();
                    if (this.gameState === 'PLAYING') {
                        sound.init();
                        this.handleDirectionPress(dirName);
                    }
                };
                const release = (e) => {
                    e.preventDefault();
                    this.handleDirectionRelease(dirName);
                };
                btn.addEventListener('touchstart', press, { passive: false });
                btn.addEventListener('touchend', release);
                btn.addEventListener('mousedown', press);
                btn.addEventListener('mouseup', release);
                btn.addEventListener('mouseleave', release);
            }
        });
        const btnMStrike = document.getElementById('m-btn-strike');
        if (btnMStrike) {
            btnMStrike.addEventListener('click', () => {
                if (this.gameState === 'PLAYING') this.triggerCyberStrike();
            });
        }
        document.getElementById('m-btn-hint').addEventListener('click', () => {
            if (this.gameState === 'PLAYING') this.triggerHint();
        });
        document.getElementById('m-btn-pause').addEventListener('click', () => {
            if (this.gameState === 'PLAYING') this.pauseGame();
        });
    }

    showScreen(screenName) {
        this.isPowersModalOpen = false;
        Object.values(this.screens).forEach(s => s && s.classList.add('hidden'));
        if (screenName === 'hud') {
            this.hud.classList.remove('hidden');
            this.gameState = 'PLAYING';
        } else {
            this.hud.classList.add('hidden');
            if (this.screens[screenName]) {
                this.screens[screenName].classList.remove('hidden');
            }
            if (screenName === 'menu') {
                this.gameState = 'MENU';
                this.updateContinueButtonState();
            } else if (screenName === 'levels') this.gameState = 'LEVEL_SELECT';
            else if (screenName === 'pause') this.gameState = 'PAUSED';
            else if (screenName === 'complete') this.gameState = 'LEVEL_COMPLETE';
            else if (screenName === 'gameOver') this.gameState = 'GAME_OVER';
            else if (screenName === 'victory') this.gameState = 'VICTORY';
        }
    }

    showToast(msg) {
        if (!this.toastBanner) return;
        const textEl = document.getElementById('toast-text');
        if (textEl) textEl.innerText = msg;

        this.toastBanner.classList.remove('hidden', 'toast-hiding');
        clearTimeout(this.toastTimeout);
        clearTimeout(this.toastHideTimeout);

        // Pop up, display cleanly, then smoothly vanish
        this.toastTimeout = setTimeout(() => {
            this.toastBanner.classList.add('toast-hiding');
            this.toastHideTimeout = setTimeout(() => {
                this.toastBanner.classList.add('hidden');
                this.toastBanner.classList.remove('toast-hiding');
            }, 350);
        }, 2200);
    }

    triggerScreenShake() {
        if (this.container) {
            this.container.classList.remove('screen-shake');
            void this.container.offsetWidth;
            this.container.classList.add('screen-shake');
            setTimeout(() => this.container.classList.remove('screen-shake'), 320);
        }
    }

    areAllLevelsCompleted() {
        const starsMap = ProgressManager.getLevelStars();
        return LEVELS_CONFIG.every(cfg => (starsMap[cfg.id] || 0) > 0);
    }

    getFirstIncompleteLevelIndex() {
        const starsMap = ProgressManager.getLevelStars();
        for (let idx = 0; idx < LEVELS_CONFIG.length; idx++) {
            const levelNum = LEVELS_CONFIG[idx].id;
            if (!starsMap[levelNum] || starsMap[levelNum] === 0) {
                return idx;
            }
        }
        return -1;
    }

    getCompletedLevelsCount() {
        const starsMap = ProgressManager.getLevelStars();
        let count = 0;
        LEVELS_CONFIG.forEach(cfg => {
            if ((starsMap[cfg.id] || 0) > 0) count++;
        });
        return count;
    }

    getNextIncompleteLevelIndex() {
        const starsMap = ProgressManager.getLevelStars();
        const session = ProgressManager.getSavedSession();
        if (session && session.levelIdx !== undefined) {
            const sessionLevelNum = session.levelIdx + 1;
            if (!starsMap[sessionLevelNum] || starsMap[sessionLevelNum] === 0) {
                return session.levelIdx;
            }
        }
        for (let l = 1; l <= 15; l++) {
            if (!starsMap[l] || starsMap[l] === 0) {
                return l - 1;
            }
        }
        return 0;
    }

    updateContinueButtonState() {
        const btnContinue = document.getElementById('btn-levels-continue');
        if (!btnContinue) return;
        if (this.areAllLevelsCompleted()) {
            btnContinue.innerText = 'CONQUERED (VIEW VICTORY)';
            return;
        }
        const targetIdx = this.getNextIncompleteLevelIndex();
        if (targetIdx === 0) {
            btnContinue.innerText = 'START LEVEL 1';
        } else {
            btnContinue.innerText = `CONTINUE LEVEL ${targetIdx + 1}`;
        }
    }

    // --- LEVEL SELECT GRID ---
    renderLevelSelectGrid() {
        const gridEl = document.getElementById('level-grid');
        if (!gridEl) return;
        gridEl.innerHTML = '';

        const highestUnlocked = ProgressManager.getUnlockedLevel();
        const starsMap = ProgressManager.getLevelStars();
        const allCompleted = this.areAllLevelsCompleted();
        const targetIdx = this.getNextIncompleteLevelIndex();
        const currentTargetLvl = allCompleted ? -1 : (targetIdx + 1);

        LEVELS_CONFIG.forEach((cfg, idx) => {
            const levelNum = cfg.id;
            const isUnlocked = levelNum <= highestUnlocked;
            const isCurrent = levelNum === currentTargetLvl;
            const stars = starsMap[levelNum] || 0;
            const isCompleted = stars > 0;

            const card = document.createElement('div');
            card.className = `level-card ${isUnlocked ? 'unlocked' : 'locked'} ${isCurrent ? 'current' : ''} ${isCompleted ? 'completed' : ''}`;

            const actionLabel = levelNum === 1 ? 'START' : 'CONTINUE';

            card.innerHTML = `
                <div class="level-status-badge">${isCompleted ? '✓' : ''}</div>
                <div class="level-num">${levelNum.toString().padStart(2, '0')}</div>
                <div class="level-name" title="${cfg.name}">${cfg.name}</div>
                ${isCurrent ? `<div class="level-continue-pill">${actionLabel}</div>` : ''}
                <div class="level-stars">
                    <span class="${stars >= 1 ? 'star-filled' : 'star-empty'}">★</span>
                    <span class="${stars >= 2 ? 'star-filled' : 'star-empty'}">★</span>
                    <span class="${stars >= 3 ? 'star-filled' : 'star-empty'}">★</span>
                </div>
            `;

            if (isUnlocked) {
                card.addEventListener('click', () => {
                    sound.playClick();
                    this.startLevel(idx);
                });
            }

            gridEl.appendChild(card);
        });

        this.updateContinueButtonState();
    }

    // --- STATISTICS & ACHIEVEMENTS RENDER ---
    renderStatsAndAchievements() {
        const stats = ProgressManager.getStats();
        document.getElementById('st-games').innerText = stats.gamesPlayed || 0;
        document.getElementById('st-best-score').innerText = stats.bestScore || 0;
        document.getElementById('st-levels').innerText = stats.levelsCompleted || 0;
        document.getElementById('st-coins').innerText = stats.coinsCollected || 0;
        document.getElementById('st-hints').innerText = stats.hintsUsed || 0;
        document.getElementById('st-deaths').innerText = stats.deaths || 0;

        const achs = ProgressManager.getAchievements();
        const listEl = document.getElementById('achievements-list');
        if (!listEl) return;
        listEl.innerHTML = '';

        ACHIEVEMENTS_DEF.forEach(def => {
            const isUnlocked = !!achs[def.key];
            const card = document.createElement('div');
            card.className = `achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`;
            card.innerHTML = `
                <div class="ach-icon">${def.icon}</div>
                <div class="ach-info">
                    <span class="ach-title">${def.title}</span>
                    <span class="ach-desc">${def.desc}</span>
                    <span class="ach-status">${isUnlocked ? 'UNLOCKED' : 'LOCKED'}</span>
                </div>
            `;
            listEl.appendChild(card);
        });
    }

    // --- START A LEVEL ---
    startLevel(idx) {
        this.currentLevelIdx = idx;
        const cfg = LEVELS_CONFIG[idx];
        if (!cfg) return;

        // Fresh 3 lives and 100 health per level (no lives continuation across sectors)
        this.lives = 3;
        this.health = 100;
        this.activeProtection = null;
        this.isPowersModalOpen = false;

        // Enemy Kill Quota for Levels 12 onwards (up to 3 kills allowed per sector until reaching goal)
        this.enemiesKilledThisLevel = 0;
        this.maxEnemyKills = (cfg.id >= 12) ? 3 : 0;

        // Tactical Defense Score Budget for Advanced Sectors (Levels 13, 14, 15)
        // Ensures the player has available score to equip cyber protection
        if (cfg.id >= 13) {
            const minTacticalBudgets = { 13: 350, 14: 450, 15: 600 };
            const requiredMin = minTacticalBudgets[cfg.id] || 350;
            if (!this.score || this.score < requiredMin) {
                this.score = requiredMin;
            }
        }

        ProgressManager.updateStats(st => st.gamesPlayed = (st.gamesPlayed || 0) + 1);

        this.cols = cfg.cols;
        this.rows = cfg.rows;
        this.recalculateMazeLayout();

        this.grid = MazeGenerator.generate(this.cols, this.rows);
        this.player = new Player(0, 0, this.cellSize, this.offsetX, this.offsetY);
        this.clearInput();
        if (document.activeElement && typeof document.activeElement.blur === 'function') {
            document.activeElement.blur();
        }
        window.focus();

        // Safe Zones for harder levels (Level 11 through 15)
        this.safeZones = [];
        this.safeZoneKeys = new Set();
        this.wasInSafeZone = false;

        if (cfg.id > 10) {
            // Generate safe zones where pink enemies cannot enter or attack
            const numZones = cfg.id >= 13 ? 3 : 2;
            const quadrants = [
                { cMin: Math.floor(this.cols * 0.55), cMax: Math.floor(this.cols * 0.85), rMin: Math.floor(this.rows * 0.15), rMax: Math.floor(this.rows * 0.45) },
                { cMin: Math.floor(this.cols * 0.15), cMax: Math.floor(this.cols * 0.45), rMin: Math.floor(this.rows * 0.55), rMax: Math.floor(this.rows * 0.85) },
                { cMin: Math.floor(this.cols * 0.38), cMax: Math.floor(this.cols * 0.65), rMin: Math.floor(this.rows * 0.38), rMax: Math.floor(this.rows * 0.65) }
            ];

            for (let z = 0; z < numZones; z++) {
                const quad = quadrants[z % quadrants.length];
                let chosenC = null, chosenR = null;
                for (let tries = 0; tries < 60; tries++) {
                    const c = Math.floor(Math.random() * (quad.cMax - quad.cMin + 1)) + quad.cMin;
                    const r = Math.floor(Math.random() * (quad.rMax - quad.rMin + 1)) + quad.rMin;
                    const key = `${c},${r}`;
                    if (key !== '0,0' && key !== `${this.cols - 1},${this.rows - 1}` && !this.safeZoneKeys.has(key)) {
                        chosenC = c;
                        chosenR = r;
                        break;
                    }
                }
                if (chosenC === null) {
                    chosenC = Math.max(1, Math.min(this.cols - 2, Math.floor((quad.cMin + quad.cMax) / 2)));
                    chosenR = Math.max(1, Math.min(this.rows - 2, Math.floor((quad.rMin + quad.rMax) / 2)));
                }
                this.safeZones.push({ c: chosenC, r: chosenR });
                this.safeZoneKeys.add(`${chosenC},${chosenR}`);
            }
        }

        this.maxSafeCharges = 2;
        this.safeChargesRemaining = 2;

        this.requiredCoins = cfg.coins;
        this.collectedCoins = 0;
        // Coin collection is compulsory ONLY for Level 1 (idx === 0)
        // In Levels 2 through 15: exit portal is open and active right away!
        this.exitActivated = (idx > 0);
        this.portalUnlockAnim = 0;
        this.isLevelCompleting = false;
        this.levelStartTime = Date.now();
        this.levelElapsedTime = 0;
        this.levelHitsTaken = 0;
        this.hintsRemaining = cfg.hints !== undefined ? cfg.hints : 5;
        this.hintCooldown = 0;
        this.activeHintPath = [];
        this.hintRenderTimer = 0;
        this.activeEffects = { speed: 0, shield: 0, freeze: 0, bubble: 0 };

        this.items = [];
        this.enemies = [];

        // Spawn Coins
        let placedCoins = 0;
        const occupied = new Set(['0,0', `${this.cols - 1},${this.rows - 1}`]);

        while (placedCoins < cfg.coins) {
            const c = Math.floor(Math.random() * this.cols);
            const r = Math.floor(Math.random() * this.rows);
            const key = `${c},${r}`;
            if (!occupied.has(key)) {
                occupied.add(key);
                this.items.push(new CollectibleItem(c, r, 'coin', this.cellSize, this.offsetX, this.offsetY));
                placedCoins++;
            }
        }

        // Spawn Bonus Gems
        for (let g = 0; g < (cfg.gems || 0); g++) {
            const c = Math.floor(Math.random() * this.cols);
            const r = Math.floor(Math.random() * this.rows);
            const key = `${c},${r}`;
            if (!occupied.has(key)) {
                occupied.add(key);
                this.items.push(new CollectibleItem(c, r, 'gem', this.cellSize, this.offsetX, this.offsetY));
            }
        }

        // Spawn Boss Power Cores (Level 15)
        for (let cr = 0; cr < (cfg.cores || 0); cr++) {
            const c = Math.floor(Math.random() * (this.cols - 4)) + 2;
            const r = Math.floor(Math.random() * (this.rows - 4)) + 2;
            const key = `${c},${r}`;
            if (!occupied.has(key)) {
                occupied.add(key);
                this.items.push(new CollectibleItem(c, r, 'core', this.cellSize, this.offsetX, this.offsetY));
            }
        }

        // Spawn Power-Ups
        (cfg.powerups || []).forEach(pType => {
            const c = Math.floor(Math.random() * this.cols);
            const r = Math.floor(Math.random() * this.rows);
            const key = `${c},${r}`;
            if (!occupied.has(key)) {
                occupied.add(key);
                this.items.push(new CollectibleItem(c, r, pType, this.cellSize, this.offsetX, this.offsetY));
            }
        });

        // Spawn Exit Portal at bottom-right
        this.exitItem = new CollectibleItem(this.cols - 1, this.rows - 1, 'exit', this.cellSize, this.offsetX, this.offsetY);

        // Spawn Enemies (Max 4 pink enemies strictly enforced across all levels)
        const maxAllowedEnemies = 4;
        const enemyList = (cfg.enemies || []).slice(0, maxAllowedEnemies);

        enemyList.forEach(eCfg => {
            let ec = Math.floor(Math.random() * (this.cols - 3)) + 3;
            let er = Math.floor(Math.random() * (this.rows - 3)) + 3;
            // Prevent spawning directly in a safe zone
            for (let tries = 0; tries < 30; tries++) {
                if (this.isSafeZone(ec, er)) {
                    ec = Math.floor(Math.random() * (this.cols - 3)) + 3;
                    er = Math.floor(Math.random() * (this.rows - 3)) + 3;
                } else {
                    break;
                }
            }
            const enemy = new ExpressiveEnemy(ec, er, eCfg.type, cfg.id, this.cellSize, this.offsetX, this.offsetY);
            enemy.game = this;
            this.enemies.push(enemy);
        });

        // Save session for Continue (Fresh 3 lives and 100 health per level)
        ProgressManager.saveSession(this.currentLevelIdx, this.score, 3, 100, this.claimedBonusLevels);

        // Tactical powers button visibility for advanced sectors (Levels 13, 14, 15)
        const powersBtn = document.getElementById('btn-hud-powers');
        if (powersBtn) {
            if (cfg.id >= 13) {
                powersBtn.classList.remove('hidden');
            } else {
                powersBtn.classList.add('hidden');
            }
        }

        this.updateHUD();
        this.showScreen('hud');
        this.showToast(`Level ${cfg.id}: ${cfg.name}`);

        if (document.activeElement && typeof document.activeElement.blur === 'function') {
            document.activeElement.blur();
        }
        if (this.canvas && typeof this.canvas.focus === 'function') {
            this.canvas.focus();
        }
        window.focus();

        // For advanced sectors 13, 14, 15, open the tactical defense arsenal
        if (cfg.id >= 13) {
            setTimeout(() => {
                if (this.currentLevelIdx === idx && this.gameState === 'PLAYING') {
                    this.showTacticalPowersModal();
                }
            }, 350);
        }
    }

    // --- GAME LOOP UPDATE ---
    update() {
        if (this.gameState !== 'PLAYING' || this.isPowersModalOpen) return;

        this.levelElapsedTime = Math.floor((Date.now() - this.levelStartTime) / 1000);

        for (const fx in this.activeEffects) {
            if (this.activeEffects[fx] > 0) {
                if (fx === 'shield' && this.activeEffects[fx] > 10000) {
                    // Persistent Aegis Shield remains active until hit
                } else {
                    this.activeEffects[fx]--;
                    if (this.activeEffects[fx] === 0) {
                        this.showToast(`${fx.toUpperCase()} protection expired.`);
                    }
                }
            }
        }
        if (this.hintCooldown > 0) this.hintCooldown--;
        if (this.hintRenderTimer > 0) this.hintRenderTimer--;
        if (this.portalUnlockAnim > 0) this.portalUnlockAnim--;

        // Continuous input from currently held direction (LIFO stack priority)
        if (this.activeDirection) {
            this.setDesiredDirection(this.activeDirection);
        }

        // Update Player with responsive path-following
        if (this.player) {
            this.player.update(
                this.grid,
                this.cols,
                this.rows,
                this.cellSize,
                this.offsetX,
                this.offsetY,
                this.activeEffects
            );
        }

        // Check Safe Zone entry notification & chime
        const inSafeZoneNow = this.isPlayerInSafeZone();
        if (inSafeZoneNow && !this.wasInSafeZone) {
            sound.playSafeZoneEnter();
            this.effects.addBurst(this.player.x, this.player.y, '#00ffcc', 14);
            this.effects.addFloatText(this.player.x, this.player.y - 12, 'SANCTUARY ACTIVE', '#00ffcc');
            this.showToast("Safe Zone: Hostiles repelled.");
        }
        this.wasInSafeZone = inSafeZoneNow;

        // Update Enemies
        const isFrozen = this.activeEffects.freeze > 0;
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(
                this.player,
                this.grid,
                this.cols,
                this.rows,
                this.cellSize,
                this.offsetX,
                this.offsetY,
                isFrozen,
                this
            );

            // Collision check: skip while enemy is vanished (defeatedTimer > 0)
            const dist = Math.hypot(this.player.x - enemy.x, this.player.y - enemy.y);
            if (dist < this.player.radius + enemy.radius && enemy.defeatedTimer <= 0) {
                this.handleEnemyCollision(enemy, i);
            }
        }

        // Collectibles Collision
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            const dist = Math.hypot(this.player.x - item.x, this.player.y - item.y);
            if (dist < this.player.radius + item.radius) {
                this.collectItem(item, i);
            }
        }

        // ================= PORTAL ACTIVATION ANIMATION SEQUENCE =================
        const remainingObjectives = this.items.filter(it => it.type === 'coin' || it.type === 'core');
        if (remainingObjectives.length === 0 && !this.exitActivated) {
            this.exitActivated = true;
            this.portalUnlockAnim = 60; // 1s shockwave animation
            sound.playPortalActive();
            this.triggerScreenShake();
            this.showToast("Exit portal activated.");
            this.effects.addBurst(this.exitItem.x, this.exitItem.y, '#00ffcc', 30);

            // Achievement: Coin Collector
            if (ProgressManager.unlockAchievement('coin_collector')) {
                this.showToast("Achievement Unlocked: Coin Collector");
                sound.playAchievement();
            }
        }

        // Check Exit Portal Touch - Only when activated & guarded against double trigger
        if (this.exitActivated && !this.isLevelCompleting) {
            const exitDist = Math.hypot(this.player.x - this.exitItem.x, this.player.y - this.exitItem.y);
            if (exitDist < this.player.radius + this.exitItem.radius * 0.8) {
                this.isLevelCompleting = true;
                this.completeLevel();
            }
        }

        this.effects.update(this.canvas.width, this.canvas.height);
        this.updateHUD();
    }

    collectItem(item, idx) {
        if (item.type === 'coin') {
            this.score += 10;
            this.campaignScore += 10;
            this.campaignCollectibles++;
            this.collectedCoins++;
            sound.playCoin();
            this.effects.addBurst(item.x, item.y, '#ffd700', 8);
            this.effects.addFloatText(item.x, item.y - 10, '+10', '#ffd700');
            ProgressManager.updateStats(st => st.coinsCollected = (st.coinsCollected || 0) + 1);
        } else if (item.type === 'gem') {
            this.score += 50;
            this.campaignScore += 50;
            this.campaignCollectibles++;
            sound.playGem();
            this.effects.addBurst(item.x, item.y, '#c084fc', 12);
            this.effects.addFloatText(item.x, item.y - 10, '+50 GEM!', '#c084fc');
        } else if (item.type === 'core') {
            this.score += 200;
            this.campaignScore += 200;
            this.campaignCollectibles++;
            sound.playPowerup();
            this.effects.addBurst(item.x, item.y, '#ff00aa', 20);
            this.effects.addFloatText(item.x, item.y - 12, '+200 CORE', '#ff00aa');
        } else if (item.type === 'speed') {
            this.activeEffects.speed = 480;
            sound.playPowerup();
            this.effects.addBurst(item.x, item.y, '#39ff14', 22);
            this.effects.addFloatText(item.x, item.y - 10, 'SPEED BOOST ⚡', '#39ff14');
            this.showToast("Speed Overdrive engaged! Movement velocity boosted.");
        } else if (item.type === 'shield') {
            this.activeEffects.shield = 600;
            sound.playPowerup();
            this.effects.addBurst(item.x, item.y, '#00bfff', 15);
            this.effects.addFloatText(item.x, item.y - 10, 'CYBER SHIELD', '#00bfff');
            this.showToast("Cyber Shield activated.");
        } else if (item.type === 'freeze') {
            this.activeEffects.freeze = 1200; // 20s at 60fps
            sound.playFreeze();
            this.effects.addBurst(item.x, item.y, '#00f0ff', 20);
            this.effects.addFloatText(item.x, item.y - 10, 'FREEZE (20s)', '#00f0ff');
            this.showToast("Cryo Freeze activated. Sentinels immobilized for 20s.");

            // Achievement: Cryo Master
            if (ProgressManager.unlockAchievement('cryo_master')) {
                this.showToast("Achievement Unlocked: Cryo Master");
                sound.playAchievement();
            }
        }

        this.items.splice(idx, 1);
    }

    killEnemy(enemyIndex, reason = 'CYBER STRIKE') {
        const enemy = this.enemies[enemyIndex];
        if (!enemy) return;

        this.enemiesKilledThisLevel++;
        this.score += 150;
        this.campaignScore += 150;
        sound.playEnemyKill();
        this.triggerScreenShake();

        // Spectacular visual death burst
        this.effects.addBurst(enemy.x, enemy.y, '#ff0055', 35);
        this.effects.addBurst(enemy.x, enemy.y, '#00ffcc', 25);
        this.effects.addFloatText(enemy.x, enemy.y - 15, '+150 KILL', '#ff0055');

        this.showToast(`Sentinel destroyed via ${reason}! (${this.enemiesKilledThisLevel}/${this.maxEnemyKills} enemies killed)`);

        // Permanently eliminate from array so it never comes back
        this.enemies.splice(enemyIndex, 1);
        this.updateHUD();
    }

    triggerCyberStrike() {
        if (this.gameState !== 'PLAYING') return;
        const cfg = LEVELS_CONFIG[this.currentLevelIdx] || {};
        if (cfg.id < 12) {
            this.showToast("Cyber Strike unlocked for Level 12 onwards.");
            return;
        }

        if (this.enemiesKilledThisLevel >= this.maxEnemyKills) {
            this.showToast(`Max enemy kills reached for this sector (${this.maxEnemyKills}/${this.maxEnemyKills})!`);
            return;
        }

        if (!this.player || this.enemies.length === 0) {
            this.showToast("All hostiles already eliminated in this sector!");
            return;
        }

        // Find closest active enemy
        let closestDist = Infinity;
        let closestIdx = -1;

        this.enemies.forEach((enemy, idx) => {
            if (enemy.defeatedTimer <= 0) {
                const dist = Math.hypot(this.player.x - enemy.x, this.player.y - enemy.y);
                if (dist < closestDist) {
                    closestDist = dist;
                    closestIdx = idx;
                }
            }
        });

        const maxRange = this.cellSize * 6.5;
        if (closestIdx !== -1 && closestDist <= maxRange) {
            const enemy = this.enemies[closestIdx];
            this.effects.addBurst(this.player.x, this.player.y, '#00ffff', 20);
            this.effects.addBurst(enemy.x, enemy.y, '#ff0055', 30);
            this.killEnemy(closestIdx, 'CYBER STRIKE [SPACE]');
        } else {
            this.showToast("Hostile out of range! Move closer to sentinel to strike [SPACE].");
        }
    }

    handleEnemyCollision(enemy, enemyIndex = -1) {
        const cfg = LEVELS_CONFIG[this.currentLevelIdx] || {};
        const isLevel12Plus = cfg.id >= 12;
        const canKill = isLevel12Plus && (this.enemiesKilledThisLevel < this.maxEnemyKills);

        // 1. Frozen Enemy (Cryo Freeze): Running into frozen sentinels shatters them!
        if (this.activeEffects.freeze > 0) {
            if (canKill && enemyIndex >= 0) {
                this.killEnemy(enemyIndex, 'CRYO SHATTER');
                return;
            } else {
                sound.playShieldDeflect();
                this.effects.addBurst(enemy.x, enemy.y, '#00f0ff', 22);
                this.effects.addFloatText(enemy.x, enemy.y - 15, 'CRYO DEFLECT', '#00f0ff');
                enemy.defeat(180);
                return;
            }
        }

        if (this.player.invulnerable > 0) return;

        // 2. Safe Zone Protection: Overloads hostile on impact!
        if (this.isPlayerInSafeZone()) {
            if (canKill && enemyIndex >= 0) {
                this.killEnemy(enemyIndex, 'SANCTUARY DEFENSE');
                return;
            } else {
                sound.playShieldDeflect();
                this.triggerScreenShake();
                this.effects.addBurst(this.player.x, this.player.y, '#00ffcc', 20);
                this.effects.addFloatText(this.player.x, this.player.y - 15, 'SANCTUARY DEFLECT', '#00ffcc');
                this.showToast("Safe Zone deflected hostile attack.");
                enemy.defeat(90);
                this.updateHUD();
                return;
            }
        }

        // 3. Cyber Shield / Aegis Absorption: Obliterates attacking hostile!
        if (this.activeEffects.shield > 0) {
            this.activeEffects.shield = 0;
            this.player.invulnerable = 90;
            if (canKill && enemyIndex >= 0) {
                this.killEnemy(enemyIndex, 'AEGIS SHIELD');
                return;
            } else {
                sound.playShieldDeflect();
                this.triggerScreenShake();
                this.effects.addBurst(this.player.x, this.player.y, '#00bfff', 20);
                this.effects.addFloatText(this.player.x, this.player.y - 15, 'SHIELD DEFLECTED', '#00bfff');
                this.showToast("Cyber Shield absorbed impact.");

                // Achievement: Shield Bearer
                if (ProgressManager.unlockAchievement('shield_bearer')) {
                    this.showToast("Achievement Unlocked: Shield Bearer");
                    sound.playAchievement();
                }

                enemy.defeat(120);
                this.effects.addBurst(enemy.x, enemy.y, '#00bfff', 24);
                this.updateHUD();
                return;
            }
        }

        let damage = 25;
        let invulnDuration = 90;
        let hitText = '-25 HP';

        if (this.activeProtection === 'armor') {
            damage = 12;
            invulnDuration = 150;
            hitText = '-12 HP';
        }

        this.health -= damage;
        this.levelHitsTaken++;
        this.player.invulnerable = invulnDuration;
        sound.playHit();
        this.triggerScreenShake();
        this.effects.addBurst(this.player.x, this.player.y, this.activeProtection === 'armor' ? '#ffd700' : '#ff0055', 25);
        this.effects.addFloatText(this.player.x, this.player.y - 15, hitText, this.activeProtection === 'armor' ? '#ffd700' : '#ff0055');
        if (this.activeProtection === 'armor') {
            this.showToast(`Nanite Armor absorbed 50% damage: -12 HP (Health: ${Math.max(0, this.health)}%)`);
        } else {
            this.showToast(`Hostile strike: -25 HP (Health: ${Math.max(0, this.health)}%)`);
        }

        // Enemy vanishes for 2 seconds then comes back
        enemy.defeat(120);
        this.effects.addBurst(enemy.x, enemy.y, '#ff0055', 24);

        if (this.health <= 0) {
            this.lives--;
            sound.playLifeLost();
            ProgressManager.updateStats(st => st.deaths = (st.deaths || 0) + 1);

            if (this.lives > 0) {
                this.health = 100;
                this.showToast(`Life lost. Remaining lives: ${this.lives}`);
                this.player.c = 0;
                this.player.r = 0;
                this.player.targetC = 0;
                this.player.targetR = 0;
                this.player.x = this.offsetX + this.cellSize / 2;
                this.player.y = this.offsetY + this.cellSize / 2;
                this.player.invulnerable = 120;
            } else {
                this.gameOver();
            }
        }
        this.updateHUD();
    }

    triggerHint() {
        if (this.hintsRemaining <= 0) {
            this.showToast("No hints remaining for this level!");
            return;
        }
        if (this.hintCooldown > 0) {
            this.showToast(`Hint cooling down... (${Math.ceil(this.hintCooldown / 60)}s)`);
            return;
        }

        let targetC = this.exitItem.c;
        let targetR = this.exitItem.r;
        let targetName = "Exit Portal";

        const remainingObjectives = this.items.filter(it => it.type === 'coin' || it.type === 'gem' || it.type === 'core');
        if (remainingObjectives.length > 0) {
            let closestDist = Infinity;
            remainingObjectives.forEach(it => {
                const d = Math.hypot(it.c - this.player.c, it.r - this.player.r);
                if (d < closestDist) {
                    closestDist = d;
                    targetC = it.c;
                    targetR = it.r;
                    targetName = it.type === 'coin' ? 'Coin' : (it.type === 'gem' ? 'Gem' : 'Power Core');
                }
            });
        }

        const path = MazeGenerator.findPath(this.grid, this.cols, this.rows, this.player.c, this.player.r, targetC, targetR);
        if (path.length > 0) {
            this.activeHintPath = path;
            this.hintRenderTimer = 240;
            this.hintsRemaining--;
            this.hintCooldown = 300;
            sound.playHint();
            this.showToast(`Guidance path illuminated to nearest ${targetName.toLowerCase()}.`);
            ProgressManager.updateStats(st => st.hintsUsed = (st.hintsUsed || 0) + 1);
        } else {
            this.showToast("Cannot find a path to objective.");
        }
    }

    pauseGame() {
        if (this.gameState !== 'PLAYING') return;
        this.gameState = 'PAUSED';
        sound.pauseMusic();
        document.getElementById('pause-level-info').innerText = `Level ${this.currentLevelIdx + 1} &middot; Score: ${this.score}`;
        this.showScreen('pause');
    }

    resumeGame() {
        if (this.gameState !== 'PAUSED') return;
        sound.resumeMusic();
        this.showScreen('hud');
        this.gameState = 'PLAYING';
    }

    // ================= 1. LEVEL COMPLETE SCREEN =================
    completeLevel() {
        this.gameState = 'LEVEL_COMPLETE';
        const cfg = LEVELS_CONFIG[this.currentLevelIdx];
        const timeTaken = this.levelElapsedTime;

        // Calculate 3-Star Rating
        let stars = 1;
        if (timeTaken <= cfg.targetTime && this.levelHitsTaken === 0) {
            stars = 3;
        } else if (timeTaken <= cfg.targetTime * 1.5 || this.levelHitsTaken <= 2) {
            stars = 2;
        }

        // Milestone Completion Bonus (Awarded once per game run; resets on game restart):
        // Level 1: +500 pts
        // Level 5: +1000 pts
        // Level 10: +1500 pts
        // Level 15: +2000 pts
        // In-between levels: 0 bonus pts
        let milestoneBonus = 0;
        if (cfg.id === 1) milestoneBonus = 500;
        else if (cfg.id === 5) milestoneBonus = 1000;
        else if (cfg.id === 10) milestoneBonus = 1500;
        else if (cfg.id === 15) milestoneBonus = 2000;

        let completionBonus = 0;
        if (milestoneBonus > 0) {
            if (!this.claimedBonusLevels.includes(cfg.id)) {
                completionBonus = milestoneBonus;
                this.claimedBonusLevels.push(cfg.id);
            }
        }

        this.score += completionBonus;
        this.campaignScore += completionBonus;
        this.campaignTime += timeTaken;
        this.updateHUD();

        // Completing Level 1 unlocks ALL 15 levels immediately!
        ProgressManager.setUnlockedLevel(15);
        ProgressManager.setLevelStars(cfg.id, stars);
        ProgressManager.updateStats(st => {
            st.levelsCompleted = (st.levelsCompleted || 0) + 1;
            st.bestScore = Math.max(st.bestScore || 0, this.score);
        });

        if (this.currentLevelIdx === 0) {
            this.showToast("Level 1 completed! All 15 levels are now unlocked!");
        }

        // ================= 4. ACHIEVEMENT UNLOCK CHECKS =================
        // First Escape: Complete first level
        if (this.currentLevelIdx === 0 && ProgressManager.unlockAchievement('first_escape')) {
            this.showToast("Achievement Unlocked: First Escape");
            sound.playAchievement();
        }
        // Speed Runner: Complete a level within target time
        if (timeTaken <= cfg.targetTime && ProgressManager.unlockAchievement('speed_runner')) {
            this.showToast("Achievement Unlocked: Speed Runner");
            sound.playAchievement();
        }
        // Survivor: Complete a level without losing a life
        if (this.levelHitsTaken === 0 && ProgressManager.unlockAchievement('survivor')) {
            this.showToast("Achievement Unlocked: Survivor");
            sound.playAchievement();
        }
        // Maze Master: Complete 5 or more levels
        const completedLevelsCount = ProgressManager.getStats().levelsCompleted;
        if (completedLevelsCount >= 5 && ProgressManager.unlockAchievement('maze_master')) {
            this.showToast("Achievement Unlocked: Maze Master");
            sound.playAchievement();
        }

        // Check if ALL 15 levels are now fully conquered
        const allCompleted = this.areAllLevelsCompleted();

        if (allCompleted) {
            ProgressManager.clearSavedSession();
            if (ProgressManager.unlockAchievement('grand_champion')) {
                this.showToast("Achievement Unlocked: Grand Champion - All 15 Sectors Conquered!");
                sound.playAchievement();
            }
            setTimeout(() => this.showVictoryScreen(), 1200);
            return;
        }

        // Not all levels are completed yet. Determine next target incomplete level:
        let nextTargetIdx = -1;
        const starsMap = ProgressManager.getLevelStars();
        if (this.currentLevelIdx + 1 < LEVELS_CONFIG.length && (!starsMap[this.currentLevelIdx + 2] || starsMap[this.currentLevelIdx + 2] === 0)) {
            nextTargetIdx = this.currentLevelIdx + 1;
        } else {
            nextTargetIdx = this.getFirstIncompleteLevelIndex();
        }

        if (nextTargetIdx !== -1) {
            ProgressManager.saveSession(nextTargetIdx, this.score, 3, 100, this.claimedBonusLevels);
        } else {
            ProgressManager.clearSavedSession();
        }

        sound.playLevelComplete();
        this.triggerScreenShake();

        // Format Time mm:ss
        const mins = Math.floor(timeTaken / 60);
        const secs = timeTaken % 60;
        const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

        // Populate Level Complete Modal with actual statistics
        document.getElementById('complete-title').innerText = `LEVEL ${cfg.id.toString().padStart(2, '0')} COMPLETE`;
        const starIcons = document.querySelectorAll('#complete-stars .star-icon');
        starIcons.forEach((el, idx) => {
            el.className = `star-icon ${idx < stars ? 'filled' : 'empty'}`;
        });

        const ratingTitles = ["Sector Cleared", "Skilled Navigation", "Master Performance"];
        document.getElementById('complete-rating-text').innerText = ratingTitles[stars - 1] || "Sector Cleared";
        document.getElementById('lc-coins').innerText = `${this.collectedCoins}/${this.requiredCoins}`;
        document.getElementById('lc-time').innerText = timeStr;
        document.getElementById('lc-lives').innerText = `${this.lives}`;
        document.getElementById('lc-score').innerText = completionBonus > 0 ? `+${completionBonus}` : `0`;

        // Dynamic Next Level button text
        const btnNextLevel = document.getElementById('btn-next-level');
        if (btnNextLevel) {
            if (nextTargetIdx !== -1) {
                if (nextTargetIdx === this.currentLevelIdx + 1) {
                    btnNextLevel.innerText = 'NEXT LEVEL';
                } else {
                    btnNextLevel.innerText = `CONTINUE LEVEL ${nextTargetIdx + 1}`;
                }
            } else {
                btnNextLevel.innerText = 'NEXT LEVEL';
            }
        }

        if (completionBonus > 0) {
            this.showToast(`Level ${cfg.id} Cleared! Milestone Bonus: +${completionBonus} PTS!`);
        } else if (milestoneBonus > 0) {
            this.showToast(`Level ${cfg.id} Replayed: Milestone bonus already claimed in this run.`);
        }

        // If Level 15 (or any advanced sector) was cleared while earlier sectors remain open:
        const completedCount = this.getCompletedLevelsCount();
        const remainingCount = 15 - completedCount;
        if (remainingCount > 0 && this.currentLevelIdx === 14) {
            setTimeout(() => {
                this.showToast(`Sector 15 Cleared! ${remainingCount} uncompleted sector${remainingCount > 1 ? 's' : ''} left before Final Victory.`);
            }, 1000);
        }

        this.showScreen('complete');
    }

    // ================= 2. GAME OVER SCREEN =================
    gameOver() {
        this.gameState = 'GAME_OVER';
        sound.playGameOver();
        this.triggerScreenShake();

        // Update stats
        ProgressManager.updateStats(st => st.bestScore = Math.max(st.bestScore || 0, this.score));
        ProgressManager.clearSavedSession();

        const mins = Math.floor(this.levelElapsedTime / 60);
        const secs = this.levelElapsedTime % 60;
        const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

        // Populate all requested Game Over statistics
        document.getElementById('go-score').innerText = this.score;
        document.getElementById('go-coins').innerText = this.collectedCoins;
        document.getElementById('go-level').innerText = `Level ${this.currentLevelIdx + 1}`;
        document.getElementById('go-time').innerText = timeStr;

        this.showScreen('gameOver');
    }

    // ================= VICTORY SCREEN (Level 15 Beaten) =================
    showVictoryScreen() {
        this.gameState = 'VICTORY';
        sound.playLevelComplete();
        this.effects.startConfetti(this.canvas.width, this.canvas.height);
        this.confettiCanvas.classList.remove('hidden');

        ProgressManager.updateStats(st => st.bestScore = Math.max(st.bestScore || 0, this.score));
        ProgressManager.clearSavedSession();

        const starsMap = ProgressManager.getLevelStars();
        let totalStars = 0;
        for (let l = 1; l <= 15; l++) totalStars += (starsMap[l] || 0);

        const mins = Math.floor(this.campaignTime / 60);
        const secs = this.campaignTime % 60;
        const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

        document.getElementById('vic-total-score').innerText = Math.max(this.score, this.campaignScore).toLocaleString();
        document.getElementById('vic-total-time').innerText = timeStr;
        document.getElementById('vic-total-coins').innerText = this.campaignCollectibles;
        document.getElementById('vic-total-stars').innerText = `${totalStars} / 45`;

        this.showScreen('victory');
    }

    // ================= TACTICAL DEFENSE ARSENAL (Levels 13, 14, 15) =================
    showTacticalPowersModal() {
        if (!this.screens.tacticalPowers) return;
        this.clearInput();
        this.isPowersModalOpen = true;
        this.renderTacticalPowersModal();
        this.screens.tacticalPowers.classList.remove('hidden');
    }

    hideTacticalPowersModal() {
        if (!this.screens.tacticalPowers) return;
        this.clearInput();
        this.isPowersModalOpen = false;
        this.screens.tacticalPowers.classList.add('hidden');
        if (document.activeElement && typeof document.activeElement.blur === 'function') {
            document.activeElement.blur();
        }
        if (this.canvas && typeof this.canvas.focus === 'function') {
            this.canvas.focus();
        }
        window.focus();
        this.updateHUD();
    }

    renderTacticalPowersModal() {
        const gridEl = document.getElementById('powers-grid');
        const scoreEl = document.getElementById('powers-current-score');
        const cfg = LEVELS_CONFIG[this.currentLevelIdx] || {};

        if (scoreEl) scoreEl.innerText = this.score.toLocaleString();

        if (!gridEl) return;
        gridEl.innerHTML = '';

        TACTICAL_POWERS_DEF.forEach(power => {
            const isEquipped = (this.activeProtection === power.id) ||
                (power.id === 'shield' && this.activeEffects.shield > 0) ||
                (power.id === 'freeze' && this.activeEffects.freeze > 0) ||
                (power.id === 'bubble' && this.activeEffects.bubble > 0);
            const canAfford = this.score >= power.cost;

            const card = document.createElement('div');
            card.className = `power-card ${isEquipped ? 'equipped' : ''}`;

            let buttonText = 'EQUIP';
            let isDisabled = false;

            if (isEquipped) {
                if (power.id === 'freeze' && this.activeEffects.freeze > 0) {
                    buttonText = `❄️ ACTIVE (${Math.ceil(this.activeEffects.freeze / 60)}s)`;
                } else if (power.id === 'bubble' && this.activeEffects.bubble > 0) {
                    buttonText = `💠 ACTIVE (${Math.ceil(this.activeEffects.bubble / 60)}s)`;
                } else if (power.id === 'shield' && this.activeEffects.shield > 0) {
                    buttonText = '🛡️ READY';
                } else {
                    buttonText = '✓ EQUIPPED';
                }
                isDisabled = true;
            } else if (!canAfford) {
                buttonText = 'LOCKED';
                isDisabled = true;
            }

            card.innerHTML = `
                <div class="power-card-header">
                    <span class="power-card-icon">${power.icon}</span>
                    <span class="power-card-title">${power.title}</span>
                </div>
                <p class="power-card-desc">${power.desc}</p>
                <div class="power-card-footer">
                    <span class="power-cost-tag">🪙 ${power.cost} PTS</span>
                    <button class="btn-power-select ${isEquipped ? 'btn-equipped' : canAfford ? 'btn-can-equip' : ''}" data-id="${power.id}" ${isDisabled ? 'disabled' : ''}>
                        ${buttonText}
                    </button>
                </div>
            `;

            const btn = card.querySelector('.btn-power-select');
            if (btn && !isEquipped && canAfford) {
                btn.addEventListener('click', () => {
                    sound.playClick();
                    this.equipTacticalPower(power.id);
                });
            }

            gridEl.appendChild(card);
        });
    }

    equipTacticalPower(powerId) {
        const power = TACTICAL_POWERS_DEF.find(p => p.id === powerId);
        if (!power) return;
        if (this.score < power.cost) {
            this.showToast(`Insufficient score! Need ${power.cost} points.`);
            return;
        }

        this.score -= power.cost;
        this.activeProtection = powerId;

        if (powerId === 'shield') {
            this.activeEffects.shield = 999999;
            this.showToast(`Aegis Forcefield equipped (-${power.cost} pts): Deflects next hostile attack!`);
            sound.playShieldDeflect();
            this.effects.addBurst(this.player ? this.player.x : this.canvas.width / 2, this.player ? this.player.y : this.canvas.height / 2, '#00bfff', 18);
        } else if (powerId === 'freeze') {
            this.activeEffects.freeze = 1200; // 20s at 60fps
            this.showToast(`Chrono Cryo Stasis engaged (-${power.cost} pts): Hostile pink sentinels frozen for 20s!`);
            sound.playFreeze();
            this.effects.addBurst(this.player ? this.player.x : this.canvas.width / 2, this.player ? this.player.y : this.canvas.height / 2, '#00f0ff', 24);
        } else if (powerId === 'armor') {
            this.showToast(`Nanite Composite Armor equipped (-${power.cost} pts): Incoming collision damage reduced by 50%!`);
            sound.playPowerup();
            this.effects.addBurst(this.player ? this.player.x : this.canvas.width / 2, this.player ? this.player.y : this.canvas.height / 2, '#ffd700', 20);
        } else if (powerId === 'bubble') {
            this.activeEffects.bubble = 900;
            this.showToast(`Portable Sanctuary Bubble active (-${power.cost} pts): Mobile Safe Zone engaged for 15s!`);
            sound.playPowerup();
            this.effects.addBurst(this.player ? this.player.x : this.canvas.width / 2, this.player ? this.player.y : this.canvas.height / 2, '#00ffcc', 22);
        }

        this.updateHUD();
        this.renderTacticalPowersModal();
    }

    // --- UPDATE IN-GAME HUD ---
    updateHUD() {
        document.getElementById('score-val').innerText = this.score;
        document.getElementById('level-val').innerText = `${this.currentLevelIdx + 1}/15`;

        // Safe Pacification Charges — removed (feature disabled)
        const hearts = document.querySelectorAll('#lives-icons .heart');
        hearts.forEach((h, idx) => {
            if (idx < this.lives) h.classList.remove('lost');
            else h.classList.add('lost');
        });

        // Health bar color transitions
        const bar = document.getElementById('health-bar-fill');
        const txt = document.getElementById('health-val');
        const pct = Math.max(0, Math.min(100, this.health));
        bar.style.width = `${pct}%`;
        txt.innerText = `${pct}%`;

        bar.className = 'health-fill';
        if (pct <= 25) bar.classList.add('danger');
        else if (pct <= 50) bar.classList.add('warning');

        // Mission display
        const missionText = document.getElementById('mission-text');
        const missionWrap = missionText.parentElement;
        const cfg = LEVELS_CONFIG[this.currentLevelIdx] || {};

        if (this.currentLevelIdx === 0) {
            // Level 1: Coins compulsory!
            if (this.exitActivated) {
                missionText.innerText = "Portal Activated! Reach the Exit!";
                missionWrap.classList.add('portal-ready');
            } else {
                missionWrap.classList.remove('portal-ready');
                missionText.innerText = `Collect all coins: ${this.collectedCoins}/${this.requiredCoins}`;
            }
        } else {
            // Levels 2–15: Coins optional! Exit is open right away!
            missionWrap.classList.add('portal-ready');
            if (this.collectedCoins >= this.requiredCoins) {
                missionText.innerText = `All coins collected! Reach the Exit! (${this.collectedCoins}/${this.requiredCoins})`;
            } else {
                missionText.innerText = `Reach the exit portal (Coins: ${this.collectedCoins}/${this.requiredCoins})`;
            }
        }

        // Hint button state
        const hintBtn = document.getElementById('btn-hud-hint');
        const hintBadge = document.getElementById('hint-badge');
        hintBadge.innerText = `(${this.hintsRemaining})`;
        if (this.hintsRemaining <= 0 || this.hintCooldown > 0) {
            hintBtn.disabled = true;
            if (this.hintCooldown > 0) {
                hintBadge.innerText = `${Math.ceil(this.hintCooldown / 60)}s`;
            }
        } else {
            hintBtn.disabled = false;
        }
    }

    isSafeZone(c, r) {
        if (!this.safeZoneKeys) return false;
        return this.safeZoneKeys.has(`${c},${r}`);
    }

    isStandingInMazeSafeZone() {
        if (!this.player || !this.safeZoneKeys || this.safeZoneKeys.size === 0) return false;
        if (this.isSafeZone(this.player.c, this.player.r)) return true;
        for (const sz of this.safeZones) {
            const szCenterX = this.offsetX + sz.c * this.cellSize + this.cellSize / 2;
            const szCenterY = this.offsetY + sz.r * this.cellSize + this.cellSize / 2;
            const dist = Math.hypot(this.player.x - szCenterX, this.player.y - szCenterY);
            if (dist < this.cellSize * 0.65) return true;
        }
        return false;
    }

    isPlayerInSafeZone() {
        if (this.activeEffects && this.activeEffects.bubble > 0) return true;
        return this.isStandingInMazeSafeZone();
    }

    // --- CANVAS RENDERING ---
    draw() {
        this.ctx.fillStyle = '#05070b';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.gameState === 'VICTORY') {
            this.effects.drawConfetti(this.confettiCtx, this.confettiCanvas.width, this.confettiCanvas.height);
            return;
        }

        if (this.gameState === 'PLAYING' || this.gameState === 'PAUSED' || this.gameState === 'LEVEL_COMPLETE' || this.gameState === 'GAME_OVER') {
            this.drawMaze();
            this.drawSafeZones();
            this.drawHintTrail();

            this.items.forEach(it => it.draw(this.ctx));
            if (this.exitItem) this.exitItem.draw(this.ctx, this.exitActivated, this.portalUnlockAnim);

            const isFrozen = this.activeEffects.freeze > 0;
            this.enemies.forEach(e => e.draw(this.ctx, isFrozen, this.player));

            if (this.player) this.player.draw(this.ctx, this.activeEffects, this.isPlayerInSafeZone(), this.activeProtection);

            this.effects.draw(this.ctx);
        }
    }

    drawSafeZones() {
        if (!this.safeZones || this.safeZones.length === 0) return;
        const ctx = this.ctx;
        const now = Date.now();
        const pulse = 0.5 + 0.35 * Math.sin(now / 320);

        this.safeZones.forEach(sz => {
            const x = this.offsetX + sz.c * this.cellSize;
            const y = this.offsetY + sz.r * this.cellSize;
            const cx = x + this.cellSize / 2;
            const cy = y + this.cellSize / 2;
            const size = this.cellSize;

            ctx.save();

            // Holographic floor gradient
            const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, size * 0.65);
            grad.addColorStop(0, `rgba(0, 255, 204, ${0.28 + pulse * 0.14})`);
            grad.addColorStop(0.7, `rgba(0, 180, 255, ${0.12 + pulse * 0.08})`);
            grad.addColorStop(1, 'rgba(0, 25, 50, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(x + 1, y + 1, size - 2, size - 2);

            // Glowing border brackets
            ctx.strokeStyle = `rgba(0, 255, 204, ${0.6 + pulse * 0.35})`;
            ctx.lineWidth = Math.max(1.5, size * 0.08);
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#00ffcc';

            const pad = Math.max(2, size * 0.1);
            const cornerLen = Math.max(3, size * 0.22);

            // Corner brackets
            ctx.beginPath();
            ctx.moveTo(x + pad, y + pad + cornerLen);
            ctx.lineTo(x + pad, y + pad);
            ctx.lineTo(x + pad + cornerLen, y + pad);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x + size - pad - cornerLen, y + pad);
            ctx.lineTo(x + size - pad, y + pad);
            ctx.lineTo(x + size - pad, y + pad + cornerLen);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x + size - pad, y + size - pad - cornerLen);
            ctx.lineTo(x + size - pad, y + size - pad);
            ctx.lineTo(x + size - pad - cornerLen, y + size - pad);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x + pad + cornerLen, y + size - pad);
            ctx.lineTo(x + pad, y + size - pad);
            ctx.lineTo(x + pad, y + size - pad - cornerLen);
            ctx.stroke();

            // Shield Crest inside safe zone
            const ringR = Math.max(4, size * 0.22);
            ctx.strokeStyle = `rgba(0, 255, 204, ${0.75 + pulse * 0.25})`;
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = `rgba(0, 255, 204, ${0.85 + pulse * 0.15})`;
            ctx.beginPath();
            const sw = ringR * 0.65;
            const sh = ringR * 0.8;
            ctx.moveTo(cx, cy - sh * 0.6);
            ctx.lineTo(cx + sw, cy - sh * 0.2);
            ctx.lineTo(cx + sw * 0.7, cy + sh * 0.55);
            ctx.lineTo(cx, cy + sh);
            ctx.lineTo(cx - sw * 0.7, cy + sh * 0.55);
            ctx.lineTo(cx - sw, cy - sh * 0.2);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        });
    }

    drawMaze() {
        if (!this.grid || this.grid.length === 0) return;
        const ctx = this.ctx;

        ctx.save();
        const themeWallColor = getComputedStyle(document.body).getPropertyValue('--maze-wall').trim() || '#00ffcc';
        ctx.strokeStyle = themeWallColor;
        ctx.lineWidth = Math.max(2, this.cellSize * 0.09);
        ctx.lineCap = 'round';
        ctx.shadowBlur = 10;
        ctx.shadowColor = themeWallColor;

        ctx.beginPath();
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const cell = this.grid[r][c];
                const x = this.offsetX + c * this.cellSize;
                const y = this.offsetY + r * this.cellSize;

                if (cell.top) { ctx.moveTo(x, y); ctx.lineTo(x + this.cellSize, y); }
                if (cell.right) { ctx.moveTo(x + this.cellSize, y); ctx.lineTo(x + this.cellSize, y + this.cellSize); }
                if (cell.bottom) { ctx.moveTo(x + this.cellSize, y + this.cellSize); ctx.lineTo(x, y + this.cellSize); }
                if (cell.left) { ctx.moveTo(x, y + this.cellSize); ctx.lineTo(x, y); }
            }
        }
        ctx.stroke();
        ctx.restore();
    }

    drawHintTrail() {
        if (this.hintRenderTimer <= 0 || this.activeHintPath.length === 0) return;

        const ctx = this.ctx;
        const alpha = Math.min(1.0, this.hintRenderTimer / 60);

        ctx.save();
        ctx.strokeStyle = `rgba(255, 215, 0, ${alpha * 0.8})`;
        ctx.fillStyle = `rgba(0, 255, 204, ${alpha * 0.9})`;
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 6]);
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#00ffcc';

        ctx.beginPath();
        for (let i = 0; i < this.activeHintPath.length; i++) {
            const pt = this.activeHintPath[i];
            const px = this.offsetX + pt.c * this.cellSize + this.cellSize / 2;
            const py = this.offsetY + pt.r * this.cellSize + this.cellSize / 2;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();

        this.activeHintPath.forEach((pt, idx) => {
            if (idx % 2 === 0) {
                const px = this.offsetX + pt.c * this.cellSize + this.cellSize / 2;
                const py = this.offsetY + pt.r * this.cellSize + this.cellSize / 2;
                ctx.beginPath();
                ctx.arc(px, py, 3.5, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        ctx.restore();
    }

    // --- SETTINGS & THEMES ---
    applyTheme(themeName) {
        document.body.classList.remove('theme-cyber', 'theme-quantum', 'theme-reactor', 'theme-fortress');
        document.body.classList.add(themeName);
    }

    applyGlow(glowName) {
        document.body.classList.remove('glow-high', 'glow-medium', 'glow-low');
        document.body.classList.add(glowName);
    }

    applySettings(settings) {
        sound.masterVolume = (settings.masterVolume !== undefined ? settings.masterVolume : 80) / 100;
        sound.musicVolume = (settings.musicVolume !== undefined ? settings.musicVolume : 60) / 100;
        sound.sfxVolume = (settings.sfxVolume !== undefined ? settings.sfxVolume : 80) / 100;
        sound.musicEnabled = settings.music !== undefined ? settings.music : true;
        sound.sfxEnabled = settings.sound !== undefined ? settings.sound : true;
        sound.updateVolumes();

        document.getElementById('slider-master-volume').value = settings.masterVolume || 80;
        document.getElementById('val-master-volume').innerText = `${settings.masterVolume || 80}%`;

        document.getElementById('toggle-music').checked = sound.musicEnabled;
        document.getElementById('slider-music-volume').value = settings.musicVolume || 60;
        document.getElementById('val-music-volume').innerText = `${settings.musicVolume || 60}%`;

        document.getElementById('toggle-sfx').checked = sound.sfxEnabled;
        document.getElementById('slider-sfx-volume').value = settings.sfxVolume || 80;
        document.getElementById('val-sfx-volume').innerText = `${settings.sfxVolume || 80}%`;

        document.getElementById('select-theme').value = settings.theme || 'theme-cyber';
        this.applyTheme(settings.theme || 'theme-cyber');

        document.getElementById('select-glow').value = settings.glow || 'glow-medium';
        this.applyGlow(settings.glow || 'glow-medium');

        document.getElementById('toggle-touch').value = settings.touch || 'auto';

        const mobileEl = document.getElementById('mobile-controls');
        if (settings.touch === 'always') mobileEl.classList.remove('hidden');
        else if (settings.touch === 'never') mobileEl.classList.add('hidden');
        else {
            const isTouch = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            if (isTouch) mobileEl.classList.remove('hidden');
            else mobileEl.classList.add('hidden');
        }

        if (sound.musicEnabled && !sound.musicInterval) {
            sound.startAmbientMusic();
        } else if (!sound.musicEnabled) {
            sound.stopAmbientMusic();
        }
    }

    saveSettingsFromUI() {
        const settings = {
            masterVolume: parseInt(document.getElementById('slider-master-volume').value, 10),
            music: document.getElementById('toggle-music').checked,
            musicVolume: parseInt(document.getElementById('slider-music-volume').value, 10),
            sound: document.getElementById('toggle-sfx').checked,
            sfxVolume: parseInt(document.getElementById('slider-sfx-volume').value, 10),
            theme: document.getElementById('select-theme').value,
            glow: document.getElementById('select-glow').value,
            touch: document.getElementById('toggle-touch').value
        };
        ProgressManager.saveSettings(settings);
        this.applySettings(settings);
        this.showToast("Settings saved.");
    }
}

// Instantiate on window load
window.addEventListener('DOMContentLoaded', () => {
    window.gameInstance = new MazeXGame();
});
