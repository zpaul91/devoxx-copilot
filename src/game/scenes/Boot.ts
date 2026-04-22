import { Scene } from 'phaser';

export class Boot extends Scene {
    constructor() {
        super('Boot');
    }

    preload() {
        // No external assets needed for the 2048 game
    }

    create() {
        this.scene.start('Preloader');
    }
}
