import { Board } from './Board';

// Snake pattern weights: highest weight in top-left corner, zigzag down
// This encourages the AI to keep the largest tile in the corner
const SNAKE_WEIGHTS = [
    [15, 14, 13, 12],
    [ 8,  9, 10, 11],
    [ 7,  6,  5,  4],
    [ 0,  1,  2,  3],
];

function evaluateBoard(grid: number[][], size: number): number {
    let snakeScore = 0;
    let emptyCount = 0;
    let mergeBonus = 0;

    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const val = grid[r][c];
            if (val === 0) {
                emptyCount++;
                continue;
            }
            snakeScore += val * SNAKE_WEIGHTS[r][c];

            // Bonus for adjacent equal tiles (potential merges)
            if (c + 1 < size && grid[r][c + 1] === val) mergeBonus += val;
            if (r + 1 < size && grid[r + 1][c] === val) mergeBonus += val;
        }
    }

    return snakeScore + emptyCount * 50 + mergeBonus * 2;
}

function cloneGrid(grid: number[][]): number[][] {
    return grid.map(row => [...row]);
}

/**
 * Pick the best direction to move.
 * Tries each direction on a cloned board and picks the one with highest heuristic.
 */
export function bestMove(board: Board): 'left' | 'right' | 'up' | 'down' | null {
    const directions: ('left' | 'right' | 'up' | 'down')[] = ['left', 'down', 'right', 'up'];
    let bestDir: 'left' | 'right' | 'up' | 'down' | null = null;
    let bestScore = -Infinity;

    for (const dir of directions) {
        const clone = new Board(board.size);
        clone.grid = cloneGrid(board.grid);
        clone.score = board.score;

        let result;
        switch (dir) {
            case 'left':  result = clone.moveLeft(); break;
            case 'right': result = clone.moveRight(); break;
            case 'up':    result = clone.moveUp(); break;
            case 'down':  result = clone.moveDown(); break;
        }

        if (!result.moved) continue;

        const score = evaluateBoard(clone.grid, clone.size);
        if (score > bestScore) {
            bestScore = score;
            bestDir = dir;
        }
    }

    return bestDir;
}

/**
 * Find the best empty cell to spawn a tile (for rigged demo mode).
 * Places a 2 in the position that maximizes the board heuristic.
 */
export function bestSpawnPosition(board: Board): { row: number; col: number } | null {
    const empty: { row: number; col: number }[] = [];
    for (let r = 0; r < board.size; r++) {
        for (let c = 0; c < board.size; c++) {
            if (board.grid[r][c] === 0) empty.push({ row: r, col: c });
        }
    }
    if (empty.length === 0) return null;

    let bestPos = empty[0];
    let bestScore = -Infinity;

    for (const pos of empty) {
        const grid = cloneGrid(board.grid);
        grid[pos.row][pos.col] = 2;
        const score = evaluateBoard(grid, board.size);
        if (score > bestScore) {
            bestScore = score;
            bestPos = pos;
        }
    }

    return bestPos;
}
