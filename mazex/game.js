const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const ui = new UI();

let gameState = 'menu'; // menu, playing, pause, complete
let currentLevelIdx = 0;
let score = 0;

let maze, player, enemies = [], items = [];
let keys = {};
let offsetX = 0, offsetY = 0;

// Keys that must not trigger browser scroll / page navigation
const GAME_KEYS = new Set([
    'ArrowUp','ArrowDown','ArrowLeft','ArrowRight',
    'KeyW','KeyA','KeyS','KeyD',
    'Numpad2','Numpad4','Numpad6','Numpad8',
    'PageUp','PageDown','Home','End'
]);

// Events
window.addEventListener('keydown', e => {
    if(GAME_KEYS.has(e.code)) e.preventDefault();
    keys[e.code] = true;
    if(e.code === 'Escape' && gameState === 'playing') togglePause();
});
window.addEventListener('keyup', e => {
    if(GAME_KEYS.has(e.code)) e.preventDefault();
    keys[e.code] = false;
});
window.addEventListener('resize', resizeCanvas);

document.getElementById('btn-play').addEventListener('click', () => startLevel(0));
document.getElementById('btn-levels').addEventListener('click', () => ui.showScreen('levels'));
document.getElementById('btn-levels-back').addEventListener('click', () => ui.showScreen('menu'));
document.getElementById('btn-resume').addEventListener('click', togglePause);
document.getElementById('btn-quit').addEventListener('click', () => ui.showScreen('menu'));
document.getElementById('btn-restart').addEventListener('click', () => startLevel(currentLevelIdx));
document.getElementById('btn-next-level').addEventListener('click', () => startLevel(currentLevelIdx+1));
document.getElementById('btn-pause').addEventListener('click', togglePause);

// Mobile DPAD
['up','down','left','right'].forEach(dir => {
    const btn = document.getElementById(`dpad-${dir}`);
    const code = 'Arrow' + dir.charAt(0).toUpperCase() + dir.slice(1);
    btn.addEventListener('touchstart', (e) => { e.preventDefault(); keys[code] = true; });
    btn.addEventListener('touchend', (e) => { e.preventDefault(); keys[code] = false; });
});

function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
}

function startLevel(idx) {
    if(idx >= LevelsConfig.length) {
        ui.showScreen('menu');
        return;
    }
    
    resizeCanvas();
    currentLevelIdx = idx;
    let cfg = LevelsConfig[idx];
    
    maze = new Maze(cfg.grid.w, cfg.grid.h);
    player = new Player(1, 1, maze);
    
    enemies = [];
    cfg.enemies.forEach(type => {
        let ec = Math.floor(Math.random() * (maze.cols-5)) + 5;
        let er = Math.floor(Math.random() * (maze.rows-5)) + 5;
        enemies.push(new Enemy(ec, er, type, maze));
    });
    
    items = [];
    let placedOrbs = 0;
    while(placedOrbs < cfg.orbs) {
        let ic = Math.floor(Math.random() * maze.cols);
        let ir = Math.floor(Math.random() * maze.rows);
        if((ic > 2 || ir > 2) && !items.find(i=>i.c===ic&&i.r===ir)) {
            items.push(new Collectible(ic, ir, 'orb', maze));
            placedOrbs++;
        }
    }
    
    if(cfg.powerups) {
        cfg.powerups.forEach(p => {
            items.push(new Collectible(Math.floor(Math.random()*maze.cols), Math.floor(Math.random()*maze.rows), 'powerup_'+p, maze));
        });
    }
    
    items.push(new Collectible(maze.cols-2, maze.rows-2, 'exit', maze));
    
    ui.showScreen('hud');
    gameState = 'playing';
    requestAnimationFrame(loop);
}

function togglePause() {
    if(gameState === 'playing') {
        gameState = 'pause';
        ui.showScreen('pause');
    } else if(gameState === 'pause') {
        gameState = 'playing';
        ui.showScreen('hud');
        requestAnimationFrame(loop);
    }
}

function loop() {
    if(gameState !== 'playing') return;
    update();
    draw();
    requestAnimationFrame(loop);
}

function update() {
    player.update(keys);
    
    enemies.forEach(e => e.update(player));
    
    // Camera center
    offsetX = canvas.width/2 - player.x;
    offsetY = canvas.height/2 - player.y;
    
    // Collisions
    for(let i=items.length-1; i>=0; i--) {
        let item = items[i];
        let d = Math.hypot(player.x - item.x, player.y - item.y);
        if(d < player.radius + item.radius) {
            if(item.type === 'orb') { score += 10; items.splice(i,1); }
            else if(item.type.startsWith('powerup_')) {
                let p = item.type.split('_')[1];
                player.effects[p] = 300; // 5 seconds roughly
                items.splice(i,1);
            }
            else if(item.type === 'exit') {
                gameState = 'complete';
                document.getElementById('lc-title').innerText = `LEVEL ${currentLevelIdx+1} COMPLETE`;
                document.getElementById('lc-score').innerText = score;
                ui.showScreen('complete');
            }
        }
    }
    
    enemies.forEach(e => {
        let d = Math.hypot(player.x - e.x, player.y - e.y);
        if(d < player.radius + e.radius) {
            if(player.invulnerable <= 0) {
                if(player.effects.shield > 0) {
                    player.effects.shield = 0;
                    player.invulnerable = 60;
                } else {
                    player.health -= 25;
                    player.invulnerable = 60;
                    if(player.health <= 0) {
                        gameState = 'menu'; // temp restart
                        ui.showScreen('menu');
                    }
                }
            }
        }
    });
    
    ui.updateHUD(player.health, LevelsConfig[currentLevelIdx].orbs, LevelsConfig[currentLevelIdx].orbs - items.filter(i=>i.type==='orb').length, currentLevelIdx+1, score);
}

function draw() {
    ctx.fillStyle = '#101828';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    maze.draw(ctx, offsetX, offsetY);
    items.forEach(i => i.draw(ctx, offsetX, offsetY));
    enemies.forEach(e => e.draw(ctx, offsetX, offsetY));
    player.draw(ctx, offsetX, offsetY);
    
    if(LevelsConfig[currentLevelIdx].dark && player.effects.flash <= 0) {
        let gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 50, canvas.width/2, canvas.height/2, 200);
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, 'rgba(16,24,40,1)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0,0,canvas.width,canvas.height);
    }
}

function populateLevels() {
    const grid = document.getElementById('level-grid');
    grid.innerHTML = '';
    LevelsConfig.forEach((cfg, idx) => {
        let btn = document.createElement('button');
        btn.className = 'level-btn unlocked';
        btn.innerText = (idx + 1).toString().padStart(2, '0');
        btn.title = cfg.name;
        btn.onclick = () => startLevel(idx);
        grid.appendChild(btn);
    });
}

// Init
populateLevels();
resizeCanvas();
