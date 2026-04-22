import { Scene, Display } from 'phaser';
import { Board, MoveResult } from '../logic/Board';
import { getCurrentPlayer } from '../logic/Leaderboard';
import { bestMove, bestSpawnPosition } from '../logic/DemoAI';
import { EventBus } from '../EventBus';

// Blue theme tile colors
const TILE_COLORS: Record<number, { bg: number; text: string }> = {
    2:    { bg: 0x4a90d9, text: '#ffffff' },
    4:    { bg: 0x3d7ec8, text: '#ffffff' },
    8:    { bg: 0x2e6ab5, text: '#ffffff' },
    16:   { bg: 0x1f56a2, text: '#ffffff' },
    32:   { bg: 0x1a4b8f, text: '#ffffff' },
    64:   { bg: 0x0d3b7a, text: '#ffffff' },
    128:  { bg: 0x00b4d8, text: '#0a1628' },
    256:  { bg: 0x00cfea, text: '#0a1628' },
    512:  { bg: 0x48e8c8, text: '#0a1628' },
    1024: { bg: 0x90f0d0, text: '#0a1628' },
    2048: { bg: 0xe0f7fa, text: '#0a1628' },
};

const DEFAULT_TILE = { bg: 0xffffff, text: '#0a1628' };
const GRID_BG = 0x1a3a5c;
const CELL_BG = 0x1e4976;
const GRID_SIZE = 4;
const CELL_SIZE = 110;
const CELL_GAP = 12;
const GRID_PADDING = 12;
const GRID_TOTAL = GRID_PADDING * 2 + GRID_SIZE * CELL_SIZE + (GRID_SIZE - 1) * CELL_GAP;
const HEADER_HEIGHT = 120;
const SWIPE_THRESHOLD = 50;
const DEMO_MOVE_DELAY = 300;

export class GameScene extends Scene {
    private board!: Board;
    private tileContainers: (Phaser.GameObjects.Container | null)[][] = [];
    private gridOffsetX!: number;
    private gridOffsetY!: number;
    private scoreText!: Phaser.GameObjects.Text;
    private bestScoreText!: Phaser.GameObjects.Text;
    private timerText!: Phaser.GameObjects.Text;
    private timerEvent?: Phaser.Time.TimerEvent;
    private isAnimating = false;
    private pointerStartX = 0;
    private pointerStartY = 0;
    private demoMode = false;
    private demoTimer?: Phaser.Time.TimerEvent;
    private demoWon = false;

    constructor() {
        super('GameScene');
    }

    init(data?: { demoMode?: boolean }) {
        // Phaser retains old settings.data when scene.start() is called without data,
        // so always use strict check: demoMode must be explicitly true.
        this.demoMode = data?.demoMode === true;
        this.demoWon = false;
    }

    create() {
        // Defensive cleanup: ensure no leftover demo state from a previous run
        this.stopDemo();
        this.isAnimating = false;

        this.board = new Board(GRID_SIZE, this.demoMode);
        this.board.reset();

        const canvasW = this.scale.width;

        this.gridOffsetX = (canvasW - GRID_TOTAL) / 2;
        this.gridOffsetY = HEADER_HEIGHT + 20;

        this.cameras.main.setBackgroundColor(0x0f2137);

        this.drawHeader(canvasW);
        this.drawGrid();
        this.createTileContainers();
        this.renderAllTiles(false);

        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimerDisplay,
            callbackScope: this,
            loop: true,
        });

        if (this.demoMode) {
            this.startDemoAutoPlay();
        } else {
            this.setupInput();
        }

        // Reliable cleanup when Phaser shuts down this scene
        this.events.once('shutdown', this.cleanupScene, this);

        EventBus.emit('current-scene-ready', this);
    }

    // --- Header (score, best, restart) ---

    private drawHeader(canvasW: number) {
        // Title
        const titleText = this.demoMode ? '2048 — DÉMO' : '2048';
        this.add.text(canvasW / 2, 20, titleText, {
            fontFamily: 'Arial Black',
            fontSize: this.demoMode ? '36px' : '48px',
            color: this.demoMode ? '#00b4d8' : '#e0f0ff',
        }).setOrigin(0.5, 0);

        // Demo badge
        if (this.demoMode) {
            this.add.text(canvasW / 2, 60, '🤖 L\'IA joue automatiquement', {
                fontFamily: 'Arial',
                fontSize: '13px',
                color: '#48e8c8',
            }).setOrigin(0.5, 0);
        }

        // Score box
        const boxW = 100;
        const boxH = 50;
        const timerBoxX = canvasW / 2 - boxW / 2;
        const scoreBoxX = canvasW / 2 - boxW - boxW / 2 - 10;
        const bestBoxX = canvasW / 2 + boxW / 2 + 10;
        const boxY = 75;

        // Timer box (center)
        const timerBoxGfx = this.add.graphics();
        timerBoxGfx.fillStyle(0x1a3a5c, 1);
        timerBoxGfx.fillRoundedRect(timerBoxX, boxY, boxW, boxH, 8);
        this.add.text(timerBoxX + boxW / 2, boxY + 8, 'TEMPS', {
            fontFamily: 'Arial', fontSize: '12px', color: '#7eb8e0',
        }).setOrigin(0.5, 0);
        this.timerText = this.add.text(timerBoxX + boxW / 2, boxY + 30, '00:00', {
            fontFamily: 'Arial Black', fontSize: '20px', color: '#e0f0ff',
        }).setOrigin(0.5, 0);

        const scoreBoxGfx = this.add.graphics();
        scoreBoxGfx.fillStyle(0x1a3a5c, 1);
        scoreBoxGfx.fillRoundedRect(scoreBoxX, boxY, boxW, boxH, 8);
        this.add.text(scoreBoxX + boxW / 2, boxY + 8, 'SCORE', {
            fontFamily: 'Arial', fontSize: '12px', color: '#7eb8e0',
        }).setOrigin(0.5, 0);
        this.scoreText = this.add.text(scoreBoxX + boxW / 2, boxY + 30, '0', {
            fontFamily: 'Arial Black', fontSize: '20px', color: '#e0f0ff',
        }).setOrigin(0.5, 0);

        const bestBoxGfx = this.add.graphics();
        bestBoxGfx.fillStyle(0x1a3a5c, 1);
        bestBoxGfx.fillRoundedRect(bestBoxX, boxY, boxW, boxH, 8);
        this.add.text(bestBoxX + boxW / 2, boxY + 8, 'BEST', {
            fontFamily: 'Arial', fontSize: '12px', color: '#7eb8e0',
        }).setOrigin(0.5, 0);
        this.bestScoreText = this.add.text(bestBoxX + boxW / 2, boxY + 30, String(this.board.bestScore), {
            fontFamily: 'Arial Black', fontSize: '20px', color: '#e0f0ff',
        }).setOrigin(0.5, 0);

        // Stop/Restart button
        const btnLabel = this.demoMode ? 'Arrêter' : 'Restart';
        const btnW = 100;
        const btnH = 36;
        const btnX = canvasW - 70;
        const btnY = 30;
        const btnGfx = this.add.graphics();
        btnGfx.fillStyle(0x2563eb, 1);
        btnGfx.fillRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 10);

        this.add.text(btnX, btnY, btnLabel, {
            fontFamily: 'Arial', fontSize: '16px', color: '#ffffff',
        }).setOrigin(0.5);

        const btnHit = this.add.rectangle(btnX, btnY, btnW, btnH, 0x000000, 0)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        btnHit.on('pointerover', () => {
            btnGfx.clear();
            btnGfx.fillStyle(0x3b82f6, 1);
            btnGfx.fillRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 10);
        });
        btnHit.on('pointerout', () => {
            btnGfx.clear();
            btnGfx.fillStyle(0x2563eb, 1);
            btnGfx.fillRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 10);
        });
        btnHit.on('pointerdown', () => {
            if (this.demoMode) {
                this.stopDemo();
                this.scene.start('MainMenu');
            } else {
                this.restartGame();
            }
        });

        // Subtle horizontal separator below header
        const sep = this.add.graphics();
        sep.lineStyle(1, 0x1a3a5c, 1);
        sep.beginPath();
        sep.moveTo(this.gridOffsetX, HEADER_HEIGHT + 10);
        sep.lineTo(this.gridOffsetX + GRID_TOTAL, HEADER_HEIGHT + 10);
        sep.strokePath();
    }

    // --- Demo auto-play ---

    private startDemoAutoPlay() {
        this.demoTimer = this.time.addEvent({
            delay: DEMO_MOVE_DELAY,
            callback: this.demoStep,
            callbackScope: this,
            loop: true,
        });
    }

    private demoStep() {
        if (this.isAnimating || this.demoWon) return;

        // Check for win
        if (this.board.hasWon()) {
            this.demoWon = true;
            this.stopDemo();
            this.time.delayedCall(500, () => {
                this.scene.start('MainMenu');
            });
            return;
        }

        const dir = bestMove(this.board);
        if (dir) {
            this.handleMove(dir);
        } else {
            // No moves available (shouldn't happen with rigged spawns but just in case)
            this.stopDemo();
            this.scene.start('MainMenu');
        }
    }

    private stopDemo() {
        if (this.demoTimer) {
            this.demoTimer.destroy();
            this.demoTimer = undefined;
        }
        if (this.timerEvent) {
            this.timerEvent.destroy();
            this.timerEvent = undefined;
        }
        // Also kill any pending delayedCall timers from handleMove/demoStep
        this.time.removeAllEvents();
    }

    // --- Grid ---

    private drawGrid() {
        const gfx = this.add.graphics();
        gfx.fillStyle(GRID_BG, 1);
        gfx.fillRoundedRect(this.gridOffsetX, this.gridOffsetY, GRID_TOTAL, GRID_TOTAL, 8);

        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const { x, y } = this.cellPosition(r, c);
                gfx.fillStyle(CELL_BG, 1);
                gfx.fillRoundedRect(x, y, CELL_SIZE, CELL_SIZE, 8);
            }
        }
    }

    private cellPosition(row: number, col: number): { x: number; y: number } {
        return {
            x: this.gridOffsetX + GRID_PADDING + col * (CELL_SIZE + CELL_GAP),
            y: this.gridOffsetY + GRID_PADDING + row * (CELL_SIZE + CELL_GAP),
        };
    }

    private cellCenter(row: number, col: number): { x: number; y: number } {
        const pos = this.cellPosition(row, col);
        return { x: pos.x + CELL_SIZE / 2, y: pos.y + CELL_SIZE / 2 };
    }

    // --- Tiles ---

    private createTileContainers() {
        this.tileContainers = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
    }

    private renderAllTiles(animate: boolean, mergedPositions: { row: number; col: number }[] = [], spawnPos?: { row: number; col: number }) {
        // Destroy old tiles
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (this.tileContainers[r][c]) {
                    this.tileContainers[r][c]!.destroy();
                    this.tileContainers[r][c] = null;
                }
            }
        }

        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const val = this.board.grid[r][c];
                if (val === 0) continue;

                const { x, y } = this.cellCenter(r, c);
                const container = this.createTile(val, x, y);
                this.tileContainers[r][c] = container;

                const isMerged = mergedPositions.some(p => p.row === r && p.col === c);
                const isSpawn = spawnPos && spawnPos.row === r && spawnPos.col === c;

                if (animate && isMerged) {
                    container.setScale(0.5);
                    this.tweens.add({
                        targets: container,
                        scale: 1,
                        duration: 150,
                        ease: 'Back.easeOut',
                    });
                } else if (animate && isSpawn) {
                    container.setScale(0);
                    this.tweens.add({
                        targets: container,
                        scale: 1,
                        duration: 200,
                        ease: 'Back.easeOut',
                    });
                }
            }
        }
    }

    private createTile(value: number, cx: number, cy: number): Phaser.GameObjects.Container {
        const style = TILE_COLORS[value] || DEFAULT_TILE;
        const tileW = CELL_SIZE - 4;
        const tileH = CELL_SIZE - 4;

        const bg = this.add.graphics();
        bg.fillStyle(style.bg, 1);
        bg.fillRoundedRect(-tileW / 2, -tileH / 2, tileW, tileH, 8);
        // Subtle lighter stroke
        const strokeColor = Display.Color.IntegerToColor(style.bg).brighten(20).color;
        bg.lineStyle(1, strokeColor, 1);
        bg.strokeRoundedRect(-tileW / 2, -tileH / 2, tileW, tileH, 8);

        const fontSize = value >= 1024 ? '28px' : value >= 128 ? '32px' : '38px';
        const text = this.add.text(0, 0, String(value), {
            fontFamily: 'Arial Black',
            fontSize,
            color: style.text,
        }).setOrigin(0.5);

        const container = this.add.container(cx, cy, [bg, text]);
        return container;
    }

    // --- Input ---

    private setupInput() {
        // Keyboard
        if (this.input.keyboard) {
            this.input.keyboard.on('keydown', (event: KeyboardEvent) => {
                if (this.isAnimating) return;
                switch (event.key) {
                    case 'ArrowLeft':
                    case 'a':
                    case 'A':
                        this.handleMove('left');
                        break;
                    case 'ArrowRight':
                    case 'd':
                    case 'D':
                        this.handleMove('right');
                        break;
                    case 'ArrowUp':
                    case 'w':
                    case 'W':
                        this.handleMove('up');
                        break;
                    case 'ArrowDown':
                    case 's':
                    case 'S':
                        this.handleMove('down');
                        break;
                }
            });
        }

        // Swipe (touch / mouse)
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            this.pointerStartX = pointer.x;
            this.pointerStartY = pointer.y;
        });

        this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            if (this.isAnimating) return;
            const dx = pointer.x - this.pointerStartX;
            const dy = pointer.y - this.pointerStartY;
            const absDx = Math.abs(dx);
            const absDy = Math.abs(dy);

            if (Math.max(absDx, absDy) < SWIPE_THRESHOLD) return;

            if (absDx > absDy) {
                this.handleMove(dx > 0 ? 'right' : 'left');
            } else {
                this.handleMove(dy > 0 ? 'down' : 'up');
            }
        });
    }

    private handleMove(direction: 'left' | 'right' | 'up' | 'down') {
        let result: MoveResult;
        switch (direction) {
            case 'left':  result = this.board.moveLeft(); break;
            case 'right': result = this.board.moveRight(); break;
            case 'up':    result = this.board.moveUp(); break;
            case 'down':  result = this.board.moveDown(); break;
        }

        if (!result.moved) return;

        this.isAnimating = true;
        const spawnFn = this.demoMode ? bestSpawnPosition : undefined;
        const spawn = this.board.spawnTile(spawnFn);
        this.renderAllTiles(true, result.mergedPositions, spawn ?? undefined);
        this.updateScoreDisplay();

        this.time.delayedCall(250, () => {
            this.isAnimating = false;

            if (this.demoMode && this.board.hasWon()) {
                this.demoWon = true;
                this.stopDemo();
                this.time.delayedCall(800, () => {
                    this.scene.start('MainMenu');
                });
                return;
            }

            if (!this.demoMode && this.board.isGameOver()) {
                this.board.stopTimer();
                const elapsedSeconds = this.board.getElapsedSeconds();
                this.time.delayedCall(300, () => {
                    this.scene.start('GameOver', {
                        score: this.board.score,
                        bestScore: this.board.bestScore,
                        playerName: getCurrentPlayer() || 'Joueur',
                        time: elapsedSeconds,
                    });
                });
            }
        });
    }

    private updateScoreDisplay() {
        this.scoreText.setText(String(this.board.score));
        this.bestScoreText.setText(String(this.board.bestScore));
    }

    private updateTimerDisplay() {
        const totalSeconds = this.board.getElapsedSeconds();
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        this.timerText.setText(
            `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
        );
    }

    private restartGame() {
        this.scene.restart({ demoMode: this.demoMode });
    }

    private cleanupScene() {
        this.stopDemo();
        this.demoMode = false;
        this.demoWon = false;
        this.isAnimating = false;
        // Remove input listeners to prevent ghost inputs in next scene
        if (this.input.keyboard) {
            this.input.keyboard.removeAllListeners();
        }
        this.input.removeAllListeners();
    }
}
