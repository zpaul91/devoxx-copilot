import { Boot } from './scenes/Boot';
import { GameOver } from './scenes/GameOver';
import { GameScene } from './scenes/GameScene';
import { MainMenu } from './scenes/MainMenu';
import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';

const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 520,
    height: 680,
    parent: 'game-container',
    backgroundColor: '#0f2137',
    scene: [
        Boot,
        Preloader,
        MainMenu,
        GameScene,
        GameOver
    ]
};

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
}

export default StartGame;
