class Enemy {
    constructor(c, r, type, maze) {
        this.maze = maze;
        this.c = c; this.r = r;
        this.targetC = c; this.targetR = r;
        this.x = c * maze.cellSize + maze.cellSize/2;
        this.y = r * maze.cellSize + maze.cellSize/2;
        this.type = type;
        this.dir = {x:0, y:0};
        
        switch(type) {
            case 'scout': this.color = '#F59E0B'; this.speed = 2; break; // Amber
            case 'hunter': this.color = '#EF4444'; this.speed = 2.5; break; // Red
            case 'ambusher': this.color = '#8B5CF6'; this.speed = 2.5; break; // Violet
            case 'trapper': this.color = '#3B82F6'; this.speed = 2.2; break; // Blue
            case 'phantom': this.color = '#CBD5E1'; this.speed = 2.8; break; // Grey
            case 'boss': this.color = '#EF4444'; this.speed = 1.5; this.radius = 20; break;
        }
        this.radius = this.radius || 10;
    }
    
    update(player) {
        if(player.effects.freeze > 0) return;
        
        let cx = this.targetC * this.maze.cellSize + this.maze.cellSize/2;
        let cy = this.targetR * this.maze.cellSize + this.maze.cellSize/2;
        
        let dx = cx - this.x;
        let dy = cy - this.y;
        
        if(Math.abs(dx) <= this.speed && Math.abs(dy) <= this.speed) {
            this.x = cx; this.y = cy;
            this.c = this.targetC; this.r = this.targetR;
            
            let cell = this.maze.getCell(this.c, this.r);
            if(!cell) return;
            
            let possibleMoves = [];
            if(!cell.top && (this.dir.y !== 1)) possibleMoves.push({x:0, y:-1});
            if(!cell.right && (this.dir.x !== -1)) possibleMoves.push({x:1, y:0});
            if(!cell.bottom && (this.dir.y !== -1)) possibleMoves.push({x:0, y:1});
            if(!cell.left && (this.dir.x !== 1)) possibleMoves.push({x:-1, y:0});
            
            // If dead end, can reverse
            if(possibleMoves.length === 0) {
                possibleMoves.push({x: -this.dir.x, y: -this.dir.y});
            }
            
            let bestMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            
            if(this.type === 'hunter' || this.type === 'boss') {
                let minD = Infinity;
                possibleMoves.forEach(m => {
                    let d = Math.hypot((this.c+m.x)-player.c, (this.r+m.y)-player.r);
                    if(d < minD) { minD = d; bestMove = m; }
                });
            } else if(this.type === 'ambusher') {
                // target 4 tiles ahead of player
                let tc = player.c + player.dir.x * 4;
                let tr = player.r + player.dir.y * 4;
                let minD = Infinity;
                possibleMoves.forEach(m => {
                    let d = Math.hypot((this.c+m.x)-tc, (this.r+m.y)-tr);
                    if(d < minD) { minD = d; bestMove = m; }
                });
            }
            
            this.dir = bestMove;
            this.targetC = this.c + this.dir.x;
            this.targetR = this.r + this.dir.y;
        } else {
            this.x += this.dir.x * this.speed;
            this.y += this.dir.y * this.speed;
        }
    }
    
    draw(ctx, offsetX, offsetY) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        if(this.type === 'trapper') {
            ctx.rect(offsetX + this.x - this.radius, offsetY + this.y - this.radius, this.radius*2, this.radius*2);
        } else {
            ctx.arc(offsetX + this.x, offsetY + this.y, this.radius, 0, Math.PI*2);
        }
        ctx.fill();
    }
}
