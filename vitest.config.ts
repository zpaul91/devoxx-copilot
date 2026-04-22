import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['src/**/*.test.ts'],
        coverage: {
            provider: 'v8',
            include: ['src/game/logic/**/*.ts'],
            exclude: ['src/game/logic/__tests__/**'],
            reporter: ['text', 'text-summary', 'lcov'],
            thresholds: {
                lines: 75,
                branches: 75,
                functions: 75,
                statements: 75,
            },
        },
    },
});
