export interface MoveResult {
    moved: boolean;
    mergedPositions: { row: number; col: number }[];
    scoreGained: number;
}

export class Board {
    readonly size: number;
    grid: number[][];
    score: number;
    bestScore: number;
    demoMode: boolean;

    constructor(size = 4, demoMode = false) {
        this.size = size;
        this.demoMode = demoMode;
        this.grid = this.createEmptyGrid();
        this.score = 0;
        this.bestScore = this.loadBestScore();
    }

    private createEmptyGrid(): number[][] {
        return Array.from({ length: this.size }, () => Array(this.size).fill(0));
    }

    reset(): void {
        this.grid = this.createEmptyGrid();
        this.score = 0;
        this.spawnTile();
        this.spawnTile();
    }

    spawnTile(bestSpawnFn?: (board: Board) => { row: number; col: number } | null): { row: number; col: number; value: number } | null {
        if (this.demoMode && bestSpawnFn) {
            const pos = bestSpawnFn(this);
            if (!pos) return null;
            this.grid[pos.row][pos.col] = 2;
            return { ...pos, value: 2 };
        }

        const empty: { row: number; col: number }[] = [];
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.grid[r][c] === 0) empty.push({ row: r, col: c });
            }
        }
        if (empty.length === 0) return null;

        const cell = empty[Math.floor(Math.random() * empty.length)];
        const value = Math.random() < 0.9 ? 2 : 4;
        this.grid[cell.row][cell.col] = value;
        return { ...cell, value };
    }

    private slideRow(row: number[]): { newRow: number[]; merged: number[]; scoreGained: number; moved: boolean } {
        // Remove zeros
        const filtered = row.filter(v => v !== 0);
        const newRow: number[] = [];
        const merged: number[] = [];
        let scoreGained = 0;
        let i = 0;

        while (i < filtered.length) {
            if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
                const val = filtered[i] * 2;
                newRow.push(val);
                merged.push(newRow.length - 1);
                scoreGained += val;
                i += 2;
            } else {
                newRow.push(filtered[i]);
                i++;
            }
        }

        // Pad with zeros
        while (newRow.length < this.size) {
            newRow.push(0);
        }

        const moved = row.some((v, idx) => v !== newRow[idx]);
        return { newRow, merged, scoreGained, moved };
    }

    moveLeft(): MoveResult {
        let anyMoved = false;
        let totalScore = 0;
        const mergedPositions: { row: number; col: number }[] = [];

        for (let r = 0; r < this.size; r++) {
            const result = this.slideRow(this.grid[r]);
            if (result.moved) {
                anyMoved = true;
                this.grid[r] = result.newRow;
                totalScore += result.scoreGained;
                for (const col of result.merged) {
                    mergedPositions.push({ row: r, col });
                }
            }
        }

        this.score += totalScore;
        this.updateBestScore();
        return { moved: anyMoved, mergedPositions, scoreGained: totalScore };
    }

    moveRight(): MoveResult {
        this.reverseRows();
        const result = this.moveLeft();
        this.reverseRows();
        // Fix merged positions (mirror cols)
        result.mergedPositions = result.mergedPositions.map(p => ({
            row: p.row,
            col: this.size - 1 - p.col,
        }));
        return result;
    }

    moveUp(): MoveResult {
        this.transpose();
        const result = this.moveLeft();
        this.transpose();
        // Fix merged positions (swap row/col)
        result.mergedPositions = result.mergedPositions.map(p => ({
            row: p.col,
            col: p.row,
        }));
        return result;
    }

    moveDown(): MoveResult {
        this.transpose();
        const result = this.moveRight();
        this.transpose();
        // Fix merged positions (swap row/col)
        result.mergedPositions = result.mergedPositions.map(p => ({
            row: p.col,
            col: p.row,
        }));
        return result;
    }

    private transpose(): void {
        const newGrid = this.createEmptyGrid();
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                newGrid[c][r] = this.grid[r][c];
            }
        }
        this.grid = newGrid;
    }

    private reverseRows(): void {
        for (let r = 0; r < this.size; r++) {
            this.grid[r].reverse();
        }
    }

    isGameOver(): boolean {
        // Check for empty cells
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.grid[r][c] === 0) return false;
            }
        }
        // Check for possible merges
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                const val = this.grid[r][c];
                if (c + 1 < this.size && this.grid[r][c + 1] === val) return false;
                if (r + 1 < this.size && this.grid[r + 1][c] === val) return false;
            }
        }
        return true;
    }

    hasWon(): boolean {
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.grid[r][c] === 2048) return true;
            }
        }
        return false;
    }

    private loadBestScore(): number {
        try {
            return parseInt(localStorage.getItem('2048-best-score') || '0', 10);
        } catch {
            return 0;
        }
    }

    private updateBestScore(): void {
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            try {
                localStorage.setItem('2048-best-score', String(this.bestScore));
            } catch {
                // localStorage unavailable
            }
        }
    }
}
