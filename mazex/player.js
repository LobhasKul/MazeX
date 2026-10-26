class Player {
    constructor(c, r, maze) {
        this.maze = maze;
        this.c = c;
        this.r = r;
        this.targetC = c;
        this.targetR = r;
        this.x = c * maze.cellSize + maze.cellSize/2;
        this.y = r * maze.cellSize + maze.cellSize/2;
        this.radius = 10;
        this.speed = 4;
        this.color = '#22D3EE';
        
        this.health = 100;
        this.dir = {x: 0, y: 0};
        this.nextDir = {x: 0, y: 0};
        
        this.effects = {
            shield: 0,
            speed: 0,
            flash: 0,
            freeze: 0
        };
        this.invulnerable = 0;
    }
    
    update(keys) {
        if(this.invulnerable > 0) this.invulnerable--;
        for(let fx in this.effects) { if(this.effects[fx] > 0) this.effects[fx]--; }
        
        let curSpeed = this.effects.speed > 0 ? this.speed * 1.5 : this.speed;
        
        // Input queuing — Arrow keys, WASD, Numpad (8/2/4/6), and
        // extended navigation keys: PageUp=Up, PageDown=Down, Home=Left, End=Right
        if(keys['ArrowUp']    || keys['KeyW'] || keys['Numpad8'] || keys['PageUp'])
            this.nextDir = {x: 0, y: -1};
        else if(keys['ArrowDown']  || keys['KeyS'] || keys['Numpad2'] || keys['PageDown'])
            this.nextDir = {x: 0, y: 1};
        else if(keys['ArrowLeft']  || keys['KeyA'] || keys['Numpad4'] || keys['Home'])
            this.nextDir = {x: -1, y: 0};
        else if(keys['ArrowRight'] || keys['KeyD'] || keys['Numpad6'] || keys['End'])
            this.nextDir = {x: 1, y: 0};
        
        // Grid snapping logic
        let cx = this.targetC * this.maze.cellSize + this.maze.cellSize/2;
        let cy = this.targetR * this.maze.cellSize + this.maze.cellSize/2;
        
        let dx = cx - this.x;
        let dy = cy - this.y;
        
        if(Math.abs(dx) <= curSpeed && Math.abs(dy) <= curSpeed) {
            // Snap exactly to cell center
            this.x = cx;
            this.y = cy;
            this.c = this.targetC;
            this.r = this.targetR;

            let cell = this.maze.getCell(this.c, this.r);

            // Prefer queued direction; fall back to current; stop if blocked
            if(this.canMove(cell, this.nextDir)) {
                this.dir = {x: this.nextDir.x, y: this.nextDir.y};
            } else if(!this.canMove(cell, this.dir)) {
                this.dir = {x: 0, y: 0};
            }
            // Clear nextDir only after successfully consuming it
            if(this.dir.x === this.nextDir.x && this.dir.y === this.nextDir.y) {
                // keep nextDir so rapid taps in corridors feel responsive
            }

            let newC = this.c + this.dir.x;
            let newR = this.r + this.dir.y;
            // Safety: don't target out-of-bounds cells
            if(this.maze.getCell(newC, newR)) {
                this.targetC = newC;
                this.targetR = newR;
            } else {
                this.dir = {x: 0, y: 0};
                this.targetC = this.c;
                this.targetR = this.r;
            }
        } else {
            this.x += this.dir.x * curSpeed;
            this.y += this.dir.y * curSpeed;
        }
    }
    
    canMove(cell, dir) {
        if(!cell) return false;
        if(dir.x === 1 && !cell.right) return true;
        if(dir.x === -1 && !cell.left) return true;
        if(dir.y === 1 && !cell.bottom) return true;
        if(dir.y === -1 && !cell.top) return true;
        return false;
    }
    
    draw(ctx, offsetX, offsetY) {
        if(this.invulnerable > 0 && Math.floor(Date.now()/100)%2===0) return;
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(offsetX + this.x, offsetY + this.y, this.radius, 0, Math.PI*2);
        ctx.fill();
        
        // Core glow
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(offsetX + this.x, offsetY + this.y, this.radius * 0.4, 0, Math.PI*2);
        ctx.fill();
        
        if(this.effects.shield > 0) {
            ctx.strokeStyle = '#3B82F6';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(offsetX + this.x, offsetY + this.y, this.radius + 5, 0, Math.PI*2);
            ctx.stroke();
        }
    }
}
