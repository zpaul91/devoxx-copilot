import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { addScore, getTop, getCurrentPlayer } from '../logic/Leaderboard';

export class GameOver extends Scene {
    private finalScore = 0;
    private playerName = '';

    constructor() {
        super('GameOver');
    }

    init(data: { score: number; bestScore: number; playerName?: string }) {
        this.finalScore = data.score ?? 0;
        this.playerName = data.playerName || getCurrentPlayer() || 'Joueur';
    }

    create() {
        this.cameras.main.setBackgroundColor(0x0f2137);
        const cx = this.scale.width / 2;

        // Save score to leaderboard
        const rank = addScore(this.playerName, this.finalScore);

        // Title
        this.add.text(cx, 30, 'Game Over', {
            fontFamily: 'Arial Black',
            fontSize: '42px',
            color: '#e0f0ff',
            stroke: '#1a3a5c',
            strokeThickness: 4,
        }).setOrigin(0.5, 0);

        // Score + rank
        this.add.text(cx, 85, `Score : ${this.finalScore}`, {
            fontFamily: 'Arial Black',
            fontSize: '28px',
            color: '#4a90d9',
        }).setOrigin(0.5, 0);

        this.add.text(cx, 120, `🏅 Position : ${rank}${rank === 1 ? 'er' : 'ème'}`, {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#00b4d8',
        }).setOrigin(0.5, 0);

        // Leaderboard
        const lbY = 160;
        this.add.text(cx, lbY, '🏆 Classement', {
            fontFamily: 'Arial Black',
            fontSize: '20px',
            color: '#e0f0ff',
        }).setOrigin(0.5, 0);

        const top10 = getTop(10);
        const colRank = cx - 160;
        const colName = cx - 120;
        const colScore = cx + 140;

        top10.forEach((entry, i) => {
            const y = lbY + 35 + i * 28;
            const isCurrentEntry = entry.name === this.playerName && entry.score === this.finalScore;
            const isMe = entry.name === this.playerName;
            const color = isCurrentEntry ? '#00cfea' : isMe ? '#00b4d8' : '#7eb8e0';
            const font = isCurrentEntry ? 'Arial Black' : 'Arial';

            this.add.text(colRank, y, `${i + 1}.`, {
                fontFamily: font, fontSize: '15px', color,
            }).setOrigin(0, 0.5);

            const displayName = entry.name.length > 14 ? entry.name.slice(0, 14) + '…' : entry.name;
            this.add.text(colName, y, displayName, {
                fontFamily: font, fontSize: '15px', color,
            }).setOrigin(0, 0.5);

            this.add.text(colScore, y, String(entry.score), {
                fontFamily: font, fontSize: '15px', color,
            }).setOrigin(1, 0.5);

            // Highlight bar for current game entry
            if (isCurrentEntry) {
                const barW = 320;
                this.add.rectangle(cx, y, barW, 24, 0x00b4d8, 0.1).setOrigin(0.5);
            }
        });

        // Buttons
        const btnsY = lbY + 35 + Math.min(top10.length, 10) * 28 + 20;

        const retryBtn = this.add.rectangle(cx, btnsY, 180, 46, 0x2563eb, 1)
            .setInteractive({ useHandCursor: true });
        this.add.text(cx, btnsY, 'Rejouer', {
            fontFamily: 'Arial Black', fontSize: '20px', color: '#ffffff',
        }).setOrigin(0.5);
        retryBtn.on('pointerover', () => retryBtn.setFillStyle(0x3b82f6));
        retryBtn.on('pointerout', () => retryBtn.setFillStyle(0x2563eb));
        retryBtn.on('pointerdown', () => this.scene.start('GameScene'));

        const menuBtn = this.add.rectangle(cx, btnsY + 60, 180, 46, 0x1a3a5c, 1)
            .setInteractive({ useHandCursor: true });
        this.add.text(cx, btnsY + 60, 'Menu', {
            fontFamily: 'Arial Black', fontSize: '20px', color: '#7eb8e0',
        }).setOrigin(0.5);
        menuBtn.on('pointerover', () => menuBtn.setFillStyle(0x1e4976));
        menuBtn.on('pointerout', () => menuBtn.setFillStyle(0x1a3a5c));
        menuBtn.on('pointerdown', () => this.scene.start('MainMenu'));

        EventBus.emit('current-scene-ready', this);
    }
}
