import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { getTop, getCurrentPlayer } from '../logic/Leaderboard';

export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        this.cameras.main.setBackgroundColor(0x0f2137);

        const cx = this.scale.width / 2;
        const playerName = getCurrentPlayer() || 'Joueur';

        // Title
        this.add.text(cx, 30, '2048', {
            fontFamily: 'Arial Black',
            fontSize: '72px',
            color: '#e0f0ff',
            stroke: '#1a3a5c',
            strokeThickness: 6,
        }).setOrigin(0.5, 0);

        // Player name
        this.add.text(cx, 115, `👤 ${playerName}`, {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#7eb8e0',
        }).setOrigin(0.5, 0);

        // Change pseudo button
        const changeBtnY = 145;
        const changeBtn = this.add.text(cx, changeBtnY, '(changer de pseudo)', {
            fontFamily: 'Arial',
            fontSize: '13px',
            color: '#4a7aa8',
        }).setOrigin(0.5, 0).setInteractive({ useHandCursor: true });
        changeBtn.on('pointerover', () => changeBtn.setColor('#7eb8e0'));
        changeBtn.on('pointerout', () => changeBtn.setColor('#4a7aa8'));
        changeBtn.on('pointerdown', () => {
            try { localStorage.removeItem('2048-current-player'); } catch { /* */ }
            this.scene.start('RegisterScene');
        });

        // Leaderboard
        const top5 = getTop(5);
        const lbY = 180;

        this.add.text(cx, lbY, '🏆 Classement', {
            fontFamily: 'Arial Black',
            fontSize: '20px',
            color: '#e0f0ff',
        }).setOrigin(0.5, 0);

        if (top5.length === 0) {
            this.add.text(cx, lbY + 35, 'Aucun score enregistré', {
                fontFamily: 'Arial',
                fontSize: '15px',
                color: '#4a7aa8',
            }).setOrigin(0.5, 0);
        } else {
            const colRank = cx - 160;
            const colName = cx - 120;
            const colScore = cx + 140;

            top5.forEach((entry, i) => {
                const y = lbY + 35 + i * 30;
                const isMe = entry.name === playerName;
                const color = isMe ? '#00b4d8' : '#7eb8e0';
                const font = isMe ? 'Arial Black' : 'Arial';

                // Rank
                this.add.text(colRank, y, `${i + 1}.`, {
                    fontFamily: font, fontSize: '16px', color,
                }).setOrigin(0, 0.5);

                // Name
                const displayName = entry.name.length > 14 ? entry.name.slice(0, 14) + '…' : entry.name;
                this.add.text(colName, y, displayName, {
                    fontFamily: font, fontSize: '16px', color,
                }).setOrigin(0, 0.5);

                // Score
                this.add.text(colScore, y, String(entry.score), {
                    fontFamily: font, fontSize: '16px', color,
                }).setOrigin(1, 0.5);
            });
        }

        // Subtitle
        const subY = top5.length > 0 ? lbY + 35 + top5.length * 30 + 15 : lbY + 65;
        this.add.text(cx, subY, 'Combinez les tuiles pour atteindre 2048 !', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#4a7aa8',
        }).setOrigin(0.5, 0);

        // Play button
        const btnY = subY + 40;
        const btn = this.add.rectangle(cx, btnY, 180, 50, 0x2563eb, 1)
            .setInteractive({ useHandCursor: true });
        this.add.text(cx, btnY, 'Jouer', {
            fontFamily: 'Arial Black',
            fontSize: '24px',
            color: '#ffffff',
        }).setOrigin(0.5);

        btn.on('pointerover', () => btn.setFillStyle(0x3b82f6));
        btn.on('pointerout', () => btn.setFillStyle(0x2563eb));
        btn.on('pointerdown', () => this.scene.start('GameScene'));

        // Controls hint
        this.add.text(cx, btnY + 45, '⌨ Flèches / WASD   📱 Swipe', {
            fontFamily: 'Arial',
            fontSize: '13px',
            color: '#4a7aa8',
        }).setOrigin(0.5, 0);

        EventBus.emit('current-scene-ready', this);
    }
}
