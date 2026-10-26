const LevelsConfig = [
    { id: 1, name: "First Steps", grid: {w: 15, h: 11}, enemies: ['scout'], orbs: 10, dark: false },
    { id: 2, name: "The Chase", grid: {w: 17, h: 13}, enemies: ['scout', 'scout'], orbs: 15, dark: false },
    { id: 3, name: "Power Core", grid: {w: 19, h: 13}, enemies: ['scout', 'hunter'], orbs: 20, powerups: ['speed'], dark: false },
    { id: 4, name: "Split Paths", grid: {w: 21, h: 15}, enemies: ['hunter', 'hunter'], orbs: 25, powerups: ['shield'], dark: false },
    { id: 5, name: "The Hunter", grid: {w: 23, h: 15}, enemies: ['hunter', 'hunter', 'ambusher'], orbs: 30, dark: false },
    { id: 6, name: "Dark Maze", grid: {w: 21, h: 15}, enemies: ['ambusher', 'hunter'], orbs: 20, dark: true, powerups: ['flash'] },
    { id: 7, name: "The Trapper", grid: {w: 23, h: 17}, enemies: ['trapper', 'hunter', 'scout'], orbs: 35, dark: false },
    { id: 8, name: "Time Run", grid: {w: 25, h: 17}, enemies: ['hunter', 'ambusher', 'trapper'], orbs: 40, time: 60, dark: false },
    { id: 9, name: "Teleport Grid", grid: {w: 25, h: 19}, enemies: ['trapper', 'ambusher'], orbs: 30, teleport: true, dark: false },
    { id: 10, name: "Adaptive Hunt", grid: {w: 27, h: 19}, enemies: ['hunter', 'hunter', 'ambusher', 'trapper'], orbs: 45, dark: false },
    { id: 11, name: "The Vault", grid: {w: 29, h: 21}, enemies: ['ambusher', 'trapper', 'phantom'], orbs: 50, keys: 1, dark: false },
    { id: 12, name: "Chaos Maze", grid: {w: 31, h: 21}, enemies: ['phantom', 'phantom', 'hunter'], orbs: 55, dark: false, chaos: true },
    { id: 13, name: "Phantom Protocol", grid: {w: 31, h: 23}, enemies: ['phantom', 'phantom', 'trapper', 'ambusher'], orbs: 60, dark: true },
    { id: 14, name: "The Final Hunt", grid: {w: 35, h: 25}, enemies: ['hunter', 'ambusher', 'trapper', 'phantom', 'scout'], orbs: 70, keys: 2, teleport: true, dark: true },
    { id: 15, name: "MAZEX: THE CORE", grid: {w: 35, h: 25}, enemies: ['boss'], orbs: 0, cores: 3, dark: false }
];
