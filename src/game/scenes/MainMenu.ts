import { Scene } from 'phaser';
import { EventBus } from '../EventBus';

export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        this.cameras.main.setBackgroundColor(0x0f2137);

        const cx = this.scale.width / 2;
        const cy = this.scale.height / 2;

        this.add.text(cx, cy - 120, '2048', {
            fontFamily: 'Arial Black',
            fontSize: '96px',
            color: '#e0f0ff',
            stroke: '#1a3a5c',
            strokeThickness: 6,
        }).setOrigin(0.5);

        this.add.text(cx, cy, 'Combinez les tuiles pour atteindre 2048 !', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#7eb8e0',
        }).setOrigin(0.5);

        // Play button
        const btnW = 180;
        const btnH = 50;
        const btn = this.add.rectangle(cx, cy + 80, btnW, btnH, 0x2563eb, 1)
            .setInteractive({ useHandCursor: true });

        this.add.text(cx, cy + 80, 'Jouer', {
            fontFamily: 'Arial Black',
            fontSize: '24px',
            color: '#ffffff',
        }).setOrigin(0.5);

        btn.on('pointerover', () => btn.setFillStyle(0x3b82f6));
        btn.on('pointerout', () => btn.setFillStyle(0x2563eb));
        btn.on('pointerdown', () => this.scene.start('GameScene'));

        // Controls hint
        this.add.text(cx, cy + 160, '⌨ Flèches / WASD   📱 Swipe', {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#4a7aa8',
        }).setOrigin(0.5);

        EventBus.emit('current-scene-ready', this);
    }
}
