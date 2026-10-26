class Collectible {
    constructor(c, r, type, maze) {
        this.c = c; this.r = r;
        this.type = type;
        this.x = c * maze.cellSize + maze.cellSize/2;
        this.y = r * maze.cellSize + maze.cellSize/2;
        this.radius = 4;
        this.color = '#FBBF24';
        if(type === 'powerup_speed') this.color = '#22C55E';
        if(type === 'powerup_shield') this.color = '#3B82F6';
        if(type === 'powerup_flash') this.color = '#F8FAFC';
        if(type === 'powerup_freeze') this.color = '#22D3EE';
        if(type === 'exit') { this.color = '#8B5CF6'; this.radius = 12; }
    }
    
    draw(ctx, offsetX, offsetY) {
        const px = offsetX + this.x;
        const py = offsetY + this.y;

        if(this.type === 'exit') {
            // Draw a plain purple diamond — no glow ring, no animation
            const r = this.radius;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.moveTo(px,      py - r); // top
            ctx.lineTo(px + r,  py);     // right
            ctx.lineTo(px,      py + r); // bottom
            ctx.lineTo(px - r,  py);     // left
            ctx.closePath();
            ctx.fill();
        } else {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(px, py, this.radius, 0, Math.PI*2);
            ctx.fill();
        }
    }
}
