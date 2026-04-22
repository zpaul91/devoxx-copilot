import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class GameOver extends Scene {
    private finalScore = 0;
    private bestScore = 0;

    constructor() {
        super('GameOver');
    }

    init(data: { score: number; bestScore: number }) {
        this.finalScore = data.score ?? 0;
        this.bestScore = data.bestScore ?? 0;
    }

    create() {
        this.cameras.main.setBackgroundColor(0x0f2137);
        const cx = this.scale.width / 2;
        const cy = this.scale.height / 2;

        this.add.text(cx, cy - 140, 'Game Over', {
            fontFamily: 'Arial Black',
            fontSize: '52px',
            color: '#e0f0ff',
            stroke: '#1a3a5c',
            strokeThickness: 4,
        }).setOrigin(0.5);

        this.add.text(cx, cy - 60, `Score : ${this.finalScore}`, {
            fontFamily: 'Arial Black',
            fontSize: '32px',
            color: '#4a90d9',
        }).setOrigin(0.5);

        this.add.text(cx, cy - 20, `Meilleur : ${this.bestScore}`, {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#7eb8e0',
        }).setOrigin(0.5);

        // Retry button
        const retryBtn = this.add.rectangle(cx, cy + 60, 180, 50, 0x2563eb, 1)
            .setInteractive({ useHandCursor: true });
        this.add.text(cx, cy + 60, 'Rejouer', {
            fontFamily: 'Arial Black', fontSize: '22px', color: '#ffffff',
        }).setOrigin(0.5);
        retryBtn.on('pointerover', () => retryBtn.setFillStyle(0x3b82f6));
        retryBtn.on('pointerout', () => retryBtn.setFillStyle(0x2563eb));
        retryBtn.on('pointerdown', () => this.scene.start('GameScene'));

        // Menu button
        const menuBtn = this.add.rectangle(cx, cy + 130, 180, 50, 0x1a3a5c, 1)
            .setInteractive({ useHandCursor: true });
        this.add.text(cx, cy + 130, 'Menu', {
            fontFamily: 'Arial Black', fontSize: '22px', color: '#7eb8e0',
        }).setOrigin(0.5);
        menuBtn.on('pointerover', () => menuBtn.setFillStyle(0x1e4976));
        menuBtn.on('pointerout', () => menuBtn.setFillStyle(0x1a3a5c));
        menuBtn.on('pointerdown', () => this.scene.start('MainMenu'));

        EventBus.emit('current-scene-ready', this);
    }
}
