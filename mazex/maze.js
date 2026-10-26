class Maze {
    constructor(cols, rows) {
        this.cols = cols;
        this.rows = rows;
        this.cellSize = 30; // pixels
        this.grid = [];
        this.generate();
    }
    
    generate() {
        for (let r = 0; r < this.rows; r++) {
            let row = [];
            for (let c = 0; c < this.cols; c++) {
                row.push({
                    c: c, r: r,
                    top: true, right: true, bottom: true, left: true,
                    visited: false
                });
            }
            this.grid.push(row);
        }

        let stack = [];
        let current = this.grid[0][0];
        current.visited = true;
        let unvisited = this.rows * this.cols - 1;

        while (unvisited > 0) {
            let n = this.getUnvisitedNeighbors(current);
            if (n.length > 0) {
                let next = n[Math.floor(Math.random() * n.length)];
                stack.push(current);
                this.removeWalls(current, next);
                current = next;
                current.visited = true;
                unvisited--;
            } else if (stack.length > 0) {
                current = stack.pop();
            }
        }
        
        // Remove some random walls for loops
        for(let i = 0; i < (this.rows * this.cols * 0.15); i++) {
            let r = Math.floor(Math.random() * (this.rows-2)) + 1;
            let c = Math.floor(Math.random() * (this.cols-2)) + 1;
            let cell = this.grid[r][c];
            if(Math.random() > 0.5) {
                cell.right = false; this.grid[r][c+1].left = false;
            } else {
                cell.bottom = false; this.grid[r+1][c].top = false;
            }
        }
    }

    getCell(c, r) {
        if(c < 0 || r < 0 || c >= this.cols || r >= this.rows) return null;
        return this.grid[r][c];
    }

    getUnvisitedNeighbors(cell) {
        let res = [];
        let t = this.getCell(cell.c, cell.r-1);
        let r = this.getCell(cell.c+1, cell.r);
        let b = this.getCell(cell.c, cell.r+1);
        let l = this.getCell(cell.c-1, cell.r);
        if(t && !t.visited) res.push(t);
        if(r && !r.visited) res.push(r);
        if(b && !b.visited) res.push(b);
        if(l && !l.visited) res.push(l);
        return res;
    }

    removeWalls(a, b) {
        let x = a.c - b.c;
        if(x === 1) { a.left = false; b.right = false; }
        else if(x === -1) { a.right = false; b.left = false; }
        let y = a.r - b.r;
        if(y === 1) { a.top = false; b.bottom = false; }
        else if(y === -1) { a.bottom = false; b.top = false; }
    }

    draw(ctx, offsetX, offsetY) {
        ctx.strokeStyle = '#263B63';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        for(let r=0; r<this.rows; r++){
            for(let c=0; c<this.cols; c++){
                let cell = this.grid[r][c];
                let x = offsetX + c * this.cellSize;
                let y = offsetY + r * this.cellSize;
                if(cell.top) { ctx.moveTo(x,y); ctx.lineTo(x+this.cellSize, y); }
                if(cell.right) { ctx.moveTo(x+this.cellSize,y); ctx.lineTo(x+this.cellSize, y+this.cellSize); }
                if(cell.bottom) { ctx.moveTo(x+this.cellSize,y+this.cellSize); ctx.lineTo(x, y+this.cellSize); }
                if(cell.left) { ctx.moveTo(x,y+this.cellSize); ctx.lineTo(x, y); }
            }
        }
        ctx.stroke();
    }
}
