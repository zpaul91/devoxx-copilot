/**
 * Tests for demo mode state management.
 *
 * Phaser's Systems.start() retains the previous settings.data when
 * scene.start() is called without data (it only overwrites if data is truthy).
 * This means init() can receive STALE data from a previous scene run.
 *
 * These tests verify that the demo mode flag is correctly resolved under
 * all scenarios, including stale data leakage from Phaser's scene system.
 */
import { describe, it, expect } from 'vitest';

/**
 * Mirrors the logic in GameScene.init() for resolving demo mode.
 * Must use strict `=== true` rather than truthy/nullish coalescing.
 */
function resolveDemoMode(data?: { demoMode?: boolean }): boolean {
    return data?.demoMode === true;
}

describe('Demo mode state resolution', () => {
    it('returns false when no data is passed (undefined)', () => {
        expect(resolveDemoMode(undefined)).toBe(false);
    });

    it('returns false when empty object is passed', () => {
        expect(resolveDemoMode({})).toBe(false);
    });

    it('returns false when demoMode is explicitly false', () => {
        expect(resolveDemoMode({ demoMode: false })).toBe(false);
    });

    it('returns true when demoMode is explicitly true', () => {
        expect(resolveDemoMode({ demoMode: true })).toBe(true);
    });

    it('returns false when demoMode is undefined in the data object', () => {
        expect(resolveDemoMode({ demoMode: undefined })).toBe(false);
    });

    // This is the critical Phaser bug scenario:
    // After a demo run, Phaser retains { demoMode: true } in settings.data.
    // When "Jouer" passes { demoMode: false } explicitly, init receives it.
    it('explicit false overrides previous true (simulates Jouer after Demo)', () => {
        // Simulate Phaser's Systems.start behavior
        let settingsData: { demoMode?: boolean } = { demoMode: true }; // from demo run

        // Simulate scene.start('GameScene', { demoMode: false }) from "Jouer"
        const newData: { demoMode?: boolean } = { demoMode: false };
        if (newData) { settingsData = newData; } // Phaser's: if (data) { settings.data = data }

        expect(resolveDemoMode(settingsData)).toBe(false);
    });

    it('stale data leaks demoMode when no data passed (the Phaser bug)', () => {
        // Simulate Phaser's Systems.start behavior
        let settingsData: { demoMode?: boolean } = { demoMode: true }; // from demo run

        // Simulate scene.start('GameScene') with NO data (the old buggy call)
        const newData = undefined;
        if (newData) { settingsData = newData; } // Phaser's: if (data) { settings.data = data }

        // With the old `?? false` logic, this would return TRUE (the bug!)
        // With strict `=== true`, it still returns true because the data leaked.
        // This is WHY we must always pass { demoMode: false } explicitly.
        expect(resolveDemoMode(settingsData)).toBe(true);
        // ^ This proves the Phaser stale-data issue exists.
        // Our fix: all callers always pass explicit { demoMode: false }.
    });

    it('stale data is overwritten when explicit data is provided', () => {
        let settingsData: { demoMode?: boolean } = { demoMode: true };

        const newData: { demoMode?: boolean } = { demoMode: false };
        if (newData) { settingsData = newData; }

        // The stale data is now overwritten
        expect(resolveDemoMode(settingsData)).toBe(false);
    });
});
