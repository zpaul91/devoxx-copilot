import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { addScore, getTop, getCurrentPlayer } from '../logic/Leaderboard';

export class GameOver extends Scene {
    private finalScore = 0;
    private finalTime = 0;
    private playerName = '';

    constructor() {
        super('GameOver');
    }

    init(data: { score: number; bestScore: number; playerName?: string; time?: number }) {
        this.finalScore = data.score ?? 0;
        this.finalTime = data.time ?? 0;
        this.playerName = data.playerName || getCurrentPlayer() || 'Joueur';
    }

    create() {
        this.cameras.main.setBackgroundColor(0x0f2137);
        const cx = this.scale.width / 2;

        // Save score to leaderboard
        const rank = addScore(this.playerName, this.finalScore, this.finalTime);

        // Title with enhanced glow
        this.add.text(cx, 30, 'Game Over', {
            fontFamily: 'Arial Black',
            fontSize: '42px',
            color: '#e0f0ff',
            stroke: '#1a3a5c',
            strokeThickness: 6,
        }).setOrigin(0.5, 0);

        // Score panel background
        const scorePanelW = 360;
        const scorePanelH = 95;
        const scorePanelGfx = this.add.graphics();
        scorePanelGfx.fillStyle(0x1a3a5c, 1);
        scorePanelGfx.fillRoundedRect(cx - scorePanelW / 2, 78, scorePanelW, scorePanelH, 12);

        // Score + time + rank
        this.add.text(cx, 85, `Score : ${this.finalScore}`, {
            fontFamily: 'Arial Black',
            fontSize: '28px',
            color: '#4a90d9',
        }).setOrigin(0.5, 0);

        const mins = Math.floor(this.finalTime / 60);
        const secs = this.finalTime % 60;
        const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        this.add.text(cx, 120, `⏱ Temps : ${timeStr}`, {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#48e8c8',
        }).setOrigin(0.5, 0);

        this.add.text(cx, 143, `🏅 Position : ${rank}${rank === 1 ? 'er' : 'ème'}`, {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#00b4d8',
        }).setOrigin(0.5, 0);

        // Leaderboard
        const lbY = 185;
        const top10 = getTop(10);
        const rowCount = Math.min(top10.length, 10);

        // Leaderboard panel background
        const lbPanelW = 360;
        const lbPanelH = 40 + rowCount * 28 + 10;
        const lbPanelX = cx - lbPanelW / 2;
        const lbPanelY = lbY - 5;
        const lbPanelGfx = this.add.graphics();
        lbPanelGfx.fillStyle(0x1a3a5c, 0.5);
        lbPanelGfx.fillRoundedRect(lbPanelX, lbPanelY, lbPanelW, lbPanelH, 12);

        // Graphics layer for separators and highlight bars (behind text, in front of panel)
        const lbDetailGfx = this.add.graphics();

        this.add.text(cx, lbY, '🏆 Classement', {
            fontFamily: 'Arial Black',
            fontSize: '20px',
            color: '#e0f0ff',
        }).setOrigin(0.5, 0);

        const colRank = cx - 160;
        const colName = cx - 120;
        const colTime = cx + 80;
        const colScore = cx + 150;

        top10.forEach((entry, i) => {
            const y = lbY + 35 + i * 28;
            const isCurrentEntry = entry.name === this.playerName && entry.score === this.finalScore;
            const isMe = entry.name === this.playerName;
            const color = isCurrentEntry ? '#00cfea' : isMe ? '#00b4d8' : '#7eb8e0';
            const font = isCurrentEntry ? 'Arial Black' : 'Arial';

            // Separator line between rows
            if (i > 0) {
                lbDetailGfx.lineStyle(1, 0x2a4a6c, 1);
                lbDetailGfx.lineBetween(lbPanelX + 10, y - 14, lbPanelX + lbPanelW - 10, y - 14);
            }

            // Highlight bar for current game entry (rounded)
            if (isCurrentEntry) {
                const barW = 320;
                lbDetailGfx.fillStyle(0x00b4d8, 0.1);
                lbDetailGfx.fillRoundedRect(cx - barW / 2, y - 12, barW, 24, 6);
            }

            this.add.text(colRank, y, `${i + 1}.`, {
                fontFamily: font, fontSize: '15px', color,
            }).setOrigin(0, 0.5);

            const displayName = entry.name.length > 14 ? entry.name.slice(0, 14) + '…' : entry.name;
            this.add.text(colName, y, displayName, {
                fontFamily: font, fontSize: '15px', color,
            }).setOrigin(0, 0.5);

            const entryMins = Math.floor((entry.time || 0) / 60);
            const entrySecs = (entry.time || 0) % 60;
            const entryTimeStr = `${String(entryMins).padStart(2, '0')}:${String(entrySecs).padStart(2, '0')}`;
            this.add.text(colTime, y, entryTimeStr, {
                fontFamily: font, fontSize: '13px', color,
            }).setOrigin(0.5, 0.5);

            this.add.text(colScore, y, String(entry.score), {
                fontFamily: font, fontSize: '15px', color,
            }).setOrigin(1, 0.5);
        });

        // Buttons
        const btnsY = lbY + 35 + rowCount * 28 + 20;
        const btnW = 180;
        const btnH = 46;

        // Retry button (rounded)
        const retryGfx = this.add.graphics();
        const drawRetryBtn = (btnColor: number) => {
            retryGfx.clear();
            retryGfx.fillStyle(btnColor, 1);
            retryGfx.fillRoundedRect(cx - btnW / 2, btnsY - btnH / 2, btnW, btnH, 12);
        };
        drawRetryBtn(0x2563eb);
        this.add.text(cx, btnsY, 'Rejouer', {
            fontFamily: 'Arial Black', fontSize: '20px', color: '#ffffff',
        }).setOrigin(0.5);
        const retryZone = this.add.zone(cx, btnsY, btnW, btnH).setInteractive({ useHandCursor: true });
        retryZone.on('pointerover', () => drawRetryBtn(0x3b82f6));
        retryZone.on('pointerout', () => drawRetryBtn(0x2563eb));
        retryZone.on('pointerdown', () => this.scene.start('GameScene', { demoMode: false }));

        // Menu button (rounded)
        const menuGfx = this.add.graphics();
        const menuY = btnsY + 60;
        const drawMenuBtn = (btnColor: number) => {
            menuGfx.clear();
            menuGfx.fillStyle(btnColor, 1);
            menuGfx.fillRoundedRect(cx - btnW / 2, menuY - btnH / 2, btnW, btnH, 12);
        };
        drawMenuBtn(0x1a3a5c);
        this.add.text(cx, menuY, 'Menu', {
            fontFamily: 'Arial Black', fontSize: '20px', color: '#7eb8e0',
        }).setOrigin(0.5);
        const menuZone = this.add.zone(cx, menuY, btnW, btnH).setInteractive({ useHandCursor: true });
        menuZone.on('pointerover', () => drawMenuBtn(0x1e4976));
        menuZone.on('pointerout', () => drawMenuBtn(0x1a3a5c));
        menuZone.on('pointerdown', () => this.scene.start('MainMenu'));

        EventBus.emit('current-scene-ready', this);
    }
}
