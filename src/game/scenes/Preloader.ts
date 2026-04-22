import { Scene } from 'phaser';

export class Preloader extends Scene {
    constructor() {
        super('Preloader');
    }

    init() {
        this.cameras.main.setBackgroundColor(0x0f2137);

        const cx = this.scale.width / 2;
        const cy = this.scale.height / 2;

        this.add.rectangle(cx, cy, 300, 24).setStrokeStyle(1, 0x4a90d9);
        const bar = this.add.rectangle(cx - 148, cy, 4, 20, 0x4a90d9);

        this.load.on('progress', (progress: number) => {
            bar.width = 4 + (296 * progress);
        });
    }

    preload() {
        // No external assets needed — everything is drawn with Phaser primitives
    }

    create() {
        this.scene.start('RegisterScene');
    }
}
