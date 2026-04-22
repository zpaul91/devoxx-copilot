import { describe, it, expect, beforeEach } from 'vitest';
import { Board } from '../Board';

describe('Board', () => {
    let board: Board;

    beforeEach(() => {
        board = new Board(4);
    });

    describe('constructor', () => {
        it('creates a 4x4 empty grid', () => {
            expect(board.size).toBe(4);
            expect(board.grid.length).toBe(4);
            expect(board.grid.every(row => row.length === 4)).toBe(true);
            expect(board.grid.flat().every(v => v === 0)).toBe(true);
        });

        it('initializes score to 0', () => {
            expect(board.score).toBe(0);
        });

        it('supports custom size', () => {
            const small = new Board(3);
            expect(small.size).toBe(3);
            expect(small.grid.length).toBe(3);
        });

        it('supports demoMode flag', () => {
            const demo = new Board(4, true);
            expect(demo.demoMode).toBe(true);
        });
    });

    describe('reset', () => {
        it('clears the grid and spawns exactly 2 tiles', () => {
            board.reset();
            const nonZero = board.grid.flat().filter(v => v !== 0);
            expect(nonZero.length).toBe(2);
        });

        it('resets the score to 0', () => {
            board.score = 100;
            board.reset();
            expect(board.score).toBe(0);
        });

        it('spawned tiles are 2 or 4', () => {
            board.reset();
            const values = board.grid.flat().filter(v => v !== 0);
            expect(values.every(v => v === 2 || v === 4)).toBe(true);
        });
    });

    describe('spawnTile', () => {
        it('adds a tile to an empty cell', () => {
            const result = board.spawnTile();
            expect(result).not.toBeNull();
            expect(result!.value === 2 || result!.value === 4).toBe(true);
            expect(board.grid[result!.row][result!.col]).toBe(result!.value);
        });

        it('returns null when grid is full', () => {
            for (let r = 0; r < 4; r++) {
                for (let c = 0; c < 4; c++) {
                    board.grid[r][c] = 2;
                }
            }
            expect(board.spawnTile()).toBeNull();
        });

        it('uses bestSpawnFn in demo mode', () => {
            const demo = new Board(4, true);
            const fn = () => ({ row: 0, col: 0 });
            const result = demo.spawnTile(fn);
            expect(result).toEqual({ row: 0, col: 0, value: 2 });
            expect(demo.grid[0][0]).toBe(2);
        });
    });

    describe('moveLeft', () => {
        it('slides tiles to the left', () => {
            board.grid = [
                [0, 0, 0, 2],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ];
            const result = board.moveLeft();
            expect(result.moved).toBe(true);
            expect(board.grid[0][0]).toBe(2);
        });

        it('merges equal adjacent tiles', () => {
            board.grid = [
                [2, 2, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ];
            const result = board.moveLeft();
            expect(result.moved).toBe(true);
            expect(board.grid[0][0]).toBe(4);
            expect(board.grid[0][1]).toBe(0);
            expect(result.scoreGained).toBe(4);
        });

        it('merges multiple pairs', () => {
            board.grid = [
                [2, 2, 4, 4],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ];
            board.moveLeft();
            expect(board.grid[0][0]).toBe(4);
            expect(board.grid[0][1]).toBe(8);
            expect(board.score).toBe(12);
        });

        it('does not merge already-merged tiles', () => {
            board.grid = [
                [2, 2, 2, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ];
            board.moveLeft();
            expect(board.grid[0][0]).toBe(4);
            expect(board.grid[0][1]).toBe(2);
        });

        it('returns moved=false if nothing can move', () => {
            board.grid = [
                [2, 4, 8, 16],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ];
            const result = board.moveLeft();
            expect(result.moved).toBe(false);
        });

        it('reports merged positions correctly', () => {
            board.grid = [
                [2, 2, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ];
            const result = board.moveLeft();
            expect(result.mergedPositions).toEqual([{ row: 0, col: 0 }]);
        });
    });

    describe('moveRight', () => {
        it('slides tiles to the right', () => {
            board.grid = [
                [2, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ];
            const result = board.moveRight();
            expect(result.moved).toBe(true);
            expect(board.grid[0][3]).toBe(2);
        });

        it('merges to the right', () => {
            board.grid = [
                [0, 0, 2, 2],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ];
            const result = board.moveRight();
            expect(board.grid[0][3]).toBe(4);
            expect(result.mergedPositions).toEqual([{ row: 0, col: 3 }]);
        });
    });

    describe('moveUp', () => {
        it('slides tiles up', () => {
            board.grid = [
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [2, 0, 0, 0],
            ];
            const result = board.moveUp();
            expect(result.moved).toBe(true);
            expect(board.grid[0][0]).toBe(2);
        });

        it('merges upward', () => {
            board.grid = [
                [2, 0, 0, 0],
                [2, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ];
            const result = board.moveUp();
            expect(board.grid[0][0]).toBe(4);
            expect(result.mergedPositions).toEqual([{ row: 0, col: 0 }]);
        });
    });

    describe('moveDown', () => {
        it('slides tiles down', () => {
            board.grid = [
                [2, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ];
            const result = board.moveDown();
            expect(result.moved).toBe(true);
            expect(board.grid[3][0]).toBe(2);
        });

        it('merges downward', () => {
            board.grid = [
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [2, 0, 0, 0],
                [2, 0, 0, 0],
            ];
            const result = board.moveDown();
            expect(board.grid[3][0]).toBe(4);
            expect(result.mergedPositions).toEqual([{ row: 3, col: 0 }]);
        });
    });

    describe('score', () => {
        it('accumulates score across multiple moves', () => {
            board.grid = [
                [2, 2, 4, 4],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ];
            board.moveLeft(); // merges 2+2=4, 4+4=8 → score = 12
            expect(board.score).toBe(12);
            // After moveLeft: [4, 8, 0, 0] — set up another merge
            board.grid[0][2] = 8;
            board.moveLeft(); // merges 8+8=16 → score = 12 + 16 = 28
            expect(board.score).toBe(28);
        });
    });

    describe('isGameOver', () => {
        it('returns false when there are empty cells', () => {
            board.grid = [
                [2, 4, 8, 16],
                [16, 8, 4, 2],
                [2, 4, 8, 16],
                [16, 8, 4, 0],
            ];
            expect(board.isGameOver()).toBe(false);
        });

        it('returns false when merges are possible', () => {
            board.grid = [
                [2, 4, 8, 16],
                [16, 8, 4, 2],
                [2, 4, 8, 16],
                [16, 8, 4, 4],
            ];
            expect(board.isGameOver()).toBe(false);
        });

        it('returns true when no moves are possible', () => {
            board.grid = [
                [2, 4, 8, 16],
                [16, 8, 4, 2],
                [2, 4, 8, 16],
                [16, 8, 4, 2],
            ];
            expect(board.isGameOver()).toBe(true);
        });
    });

    describe('hasWon', () => {
        it('returns false when no 2048 tile', () => {
            board.grid = [
                [2, 4, 8, 16],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ];
            expect(board.hasWon()).toBe(false);
        });

        it('returns true when 2048 tile exists', () => {
            board.grid = [
                [2048, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ];
            expect(board.hasWon()).toBe(true);
        });
    });
});
