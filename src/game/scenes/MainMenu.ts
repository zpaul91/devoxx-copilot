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

        // Title glow (shadow text behind)
        this.add.text(cx, 32, '2048', {
            fontFamily: 'Arial Black',
            fontSize: '72px',
            color: '#2a6090',
            stroke: '#1a3a5c',
            strokeThickness: 10,
        }).setOrigin(0.5, 0).setAlpha(0.5);

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

        // Leaderboard panel background
        const panelW = 400;
        const panelPadTop = 8;
        const panelPadBottom = 12;
        const panelContentH = top5.length > 0 ? 30 + top5.length * 30 : 55;
        const panelH = panelPadTop + panelContentH + panelPadBottom;
        const panelGfx = this.add.graphics();
        panelGfx.fillStyle(0x1a3a5c, 0.6);
        panelGfx.fillRoundedRect(cx - panelW / 2, lbY - panelPadTop, panelW, panelH, 12);

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
            const separatorGfx = this.add.graphics();
            const separatorW = 360;

            top5.forEach((entry, i) => {
                const y = lbY + 35 + i * 30;
                const isMe = entry.name === playerName;
                const color = isMe ? '#00b4d8' : '#7eb8e0';
                const font = isMe ? 'Arial Black' : 'Arial';

                // Row separator (between rows, not before the first)
                if (i > 0) {
                    separatorGfx.fillStyle(0x2a4a6c, 1);
                    separatorGfx.fillRect(cx - separatorW / 2, y - 15, separatorW, 1);
                }

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

        // Play button (rounded via Graphics + Zone for hit area)
        const btnY = subY + 40;
        const playBtnW = 140;
        const playBtnH = 50;
        const playBtnX = cx - 55;
        const playGfx = this.add.graphics();
        const drawPlayBtn = (color: number) => {
            playGfx.clear();
            playGfx.fillStyle(color, 1);
            playGfx.fillRoundedRect(playBtnX - playBtnW / 2, btnY - playBtnH / 2, playBtnW, playBtnH, 12);
        };
        drawPlayBtn(0x2563eb);
        this.add.text(playBtnX, btnY, 'Jouer', {
            fontFamily: 'Arial Black',
            fontSize: '22px',
            color: '#ffffff',
        }).setOrigin(0.5);
        const playZone = this.add.zone(playBtnX, btnY, playBtnW, playBtnH)
            .setInteractive({ useHandCursor: true });
        playZone.on('pointerover', () => drawPlayBtn(0x3b82f6));
        playZone.on('pointerout', () => drawPlayBtn(0x2563eb));
        playZone.on('pointerdown', () => this.scene.start('GameScene', { demoMode: false }));

        // Demo button (rounded via Graphics + Zone for hit area)
        const demoBtnW = 120;
        const demoBtnH = 50;
        const demoBtnX = cx + 95;
        const demoGfx = this.add.graphics();
        const drawDemoBtn = (color: number) => {
            demoGfx.clear();
            demoGfx.fillStyle(color, 1);
            demoGfx.fillRoundedRect(demoBtnX - demoBtnW / 2, btnY - demoBtnH / 2, demoBtnW, demoBtnH, 12);
        };
        drawDemoBtn(0x1a3a5c);
        this.add.text(demoBtnX, btnY, '🤖 Démo', {
            fontFamily: 'Arial Black',
            fontSize: '18px',
            color: '#48e8c8',
        }).setOrigin(0.5);
        const demoZone = this.add.zone(demoBtnX, btnY, demoBtnW, demoBtnH)
            .setInteractive({ useHandCursor: true });
        demoZone.on('pointerover', () => drawDemoBtn(0x1e4976));
        demoZone.on('pointerout', () => drawDemoBtn(0x1a3a5c));
        demoZone.on('pointerdown', () => this.scene.start('GameScene', { demoMode: true }));

        // Controls hint
        this.add.text(cx, btnY + 45, '⌨ Flèches / WASD   📱 Swipe', {
            fontFamily: 'Arial',
            fontSize: '13px',
            color: '#4a7aa8',
        }).setOrigin(0.5, 0);

        EventBus.emit('current-scene-ready', this);
    }
}
