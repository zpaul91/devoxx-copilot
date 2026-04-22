import { describe, it, expect, beforeEach } from 'vitest';
import { addScore, getTop, getRank, getCurrentPlayer, setCurrentPlayer } from '../Leaderboard';

// Mock localStorage
const store: Record<string, string> = {};
const localStorageMock: Storage = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { for (const key in store) delete store[key]; },
    get length() { return Object.keys(store).length; },
    key: (index: number) => Object.keys(store)[index] ?? null,
};

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

describe('Leaderboard', () => {
    beforeEach(() => {
        localStorageMock.clear();
    });

    describe('addScore', () => {
        it('adds a score and returns rank 1 for first entry', () => {
            const rank = addScore('Alice', 100);
            expect(rank).toBe(1);
        });

        it('returns correct rank for multiple entries', () => {
            addScore('Alice', 300);
            addScore('Bob', 500);
            const rank = addScore('Charlie', 400);
            // 500, 400, 300 → Charlie is 2nd
            expect(rank).toBe(2);
        });

        it('sorts entries by score descending', () => {
            addScore('Alice', 100);
            addScore('Bob', 300);
            addScore('Charlie', 200);
            const top = getTop(3);
            expect(top[0].score).toBe(300);
            expect(top[1].score).toBe(200);
            expect(top[2].score).toBe(100);
        });
    });

    describe('getTop', () => {
        it('returns empty array when no scores', () => {
            expect(getTop(5)).toEqual([]);
        });

        it('returns at most n entries', () => {
            for (let i = 0; i < 10; i++) {
                addScore(`Player${i}`, i * 100);
            }
            expect(getTop(5).length).toBe(5);
        });

        it('entries have correct shape', () => {
            addScore('Alice', 100);
            const top = getTop(1);
            expect(top[0]).toHaveProperty('name', 'Alice');
            expect(top[0]).toHaveProperty('score', 100);
            expect(top[0]).toHaveProperty('date');
        });
    });

    describe('getRank', () => {
        it('returns 1 when no scores exist', () => {
            expect(getRank(100)).toBe(1);
        });

        it('returns correct rank', () => {
            addScore('A', 500);
            addScore('B', 300);
            addScore('C', 100);
            // Score 400 → 1 score above (500), so rank 2
            expect(getRank(400)).toBe(2);
            // Score 600 → 0 scores above, so rank 1
            expect(getRank(600)).toBe(1);
            // Score 50 → 3 scores above, so rank 4
            expect(getRank(50)).toBe(4);
        });
    });

    describe('getCurrentPlayer / setCurrentPlayer', () => {
        it('returns null when no player set', () => {
            expect(getCurrentPlayer()).toBeNull();
        });

        it('stores and retrieves player name', () => {
            setCurrentPlayer('Alice');
            expect(getCurrentPlayer()).toBe('Alice');
        });

        it('overwrites previous player', () => {
            setCurrentPlayer('Alice');
            setCurrentPlayer('Bob');
            expect(getCurrentPlayer()).toBe('Bob');
        });
    });

    describe('max entries limit', () => {
        it('keeps at most 50 entries', () => {
            for (let i = 0; i < 60; i++) {
                addScore(`Player${i}`, i);
            }
            const all = getTop(100);
            expect(all.length).toBe(50);
            // Lowest score should be 10 (60 - 50)
            expect(all[all.length - 1].score).toBe(10);
        });
    });
});
