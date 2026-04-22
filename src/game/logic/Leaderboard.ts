export interface LeaderboardEntry {
    name: string;
    score: number;
    time: number;
    date: string;
}

const LEADERBOARD_KEY = '2048-leaderboard';
const PLAYER_KEY = '2048-current-player';
const MAX_ENTRIES = 50;

function loadEntries(): LeaderboardEntry[] {
    try {
        const raw = localStorage.getItem(LEADERBOARD_KEY);
        if (!raw) return [];
        return JSON.parse(raw) as LeaderboardEntry[];
    } catch {
        return [];
    }
}

function saveEntries(entries: LeaderboardEntry[]): void {
    try {
        localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries));
    } catch {
        // localStorage unavailable
    }
}

export function addScore(name: string, score: number, time: number = 0): number {
    const entries = loadEntries();
    const entry: LeaderboardEntry = {
        name,
        score,
        time,
        date: new Date().toISOString(),
    };
    entries.push(entry);
    entries.sort((a, b) => b.score - a.score || (a.time ?? 0) - (b.time ?? 0));
    const trimmed = entries.slice(0, MAX_ENTRIES);
    saveEntries(trimmed);
    // Return rank (1-based) of this entry
    return trimmed.findIndex(e => e === entry) + 1 || getRank(score);
}

export function getTop(n: number): LeaderboardEntry[] {
    return loadEntries().slice(0, n);
}

export function getRank(score: number): number {
    const entries = loadEntries();
    const position = entries.filter(e => e.score > score).length;
    return position + 1;
}

export function getCurrentPlayer(): string | null {
    try {
        return localStorage.getItem(PLAYER_KEY) || null;
    } catch {
        return null;
    }
}

export function setCurrentPlayer(name: string): void {
    try {
        localStorage.setItem(PLAYER_KEY, name);
    } catch {
        // localStorage unavailable
    }
}
