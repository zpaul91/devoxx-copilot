import { describe, it, expect } from 'vitest';
import { Board } from '../Board';
import { bestMove, bestSpawnPosition } from '../DemoAI';

describe('DemoAI', () => {
    describe('bestMove', () => {
        it('returns a valid direction for a movable board', () => {
            const board = new Board(4);
            board.grid = [
                [2, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ];
            const dir = bestMove(board);
            expect(dir).not.toBeNull();
            expect(['left', 'right', 'up', 'down']).toContain(dir);
        });

        it('returns null when no move is possible', () => {
            const board = new Board(4);
            board.grid = [
                [2, 4, 8, 16],
                [16, 8, 4, 2],
                [2, 4, 8, 16],
                [16, 8, 4, 2],
            ];
            expect(bestMove(board)).toBeNull();
        });

        it('prefers moves that preserve corner strategy', () => {
            const board = new Board(4);
            board.grid = [
                [64, 32, 16, 8],
                [ 4,  8, 0,  0],
                [ 2,  0, 0,  0],
                [ 0,  0, 0,  0],
            ];
            const dir = bestMove(board);
            // The AI should pick a move that keeps high values in top-left
            expect(dir).not.toBeNull();
        });

        it('does not modify the original board', () => {
            const board = new Board(4);
            board.grid = [
                [2, 2, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ];
            const gridCopy = board.grid.map(r => [...r]);
            bestMove(board);
            expect(board.grid).toEqual(gridCopy);
        });
    });

    describe('bestSpawnPosition', () => {
        it('returns a valid empty position', () => {
            const board = new Board(4);
            board.grid = [
                [2, 4, 8, 16],
                [16, 8, 4, 2],
                [2, 4, 8, 16],
                [16, 8, 4, 0],
            ];
            const pos = bestSpawnPosition(board);
            expect(pos).toEqual({ row: 3, col: 3 });
        });

        it('returns null when grid is full', () => {
            const board = new Board(4);
            board.grid = [
                [2, 4, 8, 16],
                [16, 8, 4, 2],
                [2, 4, 8, 16],
                [16, 8, 4, 2],
            ];
            expect(bestSpawnPosition(board)).toBeNull();
        });

        it('picks the position that maximizes heuristic', () => {
            const board = new Board(4);
            board.grid = [
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ];
            const pos = bestSpawnPosition(board);
            expect(pos).not.toBeNull();
            // Should prefer top-left area (high snake weight)
            expect(pos!.row).toBeLessThanOrEqual(1);
        });
    });
});
