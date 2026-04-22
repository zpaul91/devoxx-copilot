import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { getCurrentPlayer, setCurrentPlayer } from '../logic/Leaderboard';

export class RegisterScene extends Scene {
    private inputElement: HTMLInputElement | null = null;
    private overlay: HTMLDivElement | null = null;

    constructor() {
        super('RegisterScene');
    }

    create() {
        this.cameras.main.setBackgroundColor(0x0f2137);

        const existing = getCurrentPlayer();
        if (existing) {
            this.scene.start('MainMenu');
            return;
        }

        const cx = this.scale.width / 2;

        this.add.text(cx, 120, '2048', {
            fontFamily: 'Arial Black',
            fontSize: '64px',
            color: '#e0f0ff',
            stroke: '#1a3a5c',
            strokeThickness: 4,
        }).setOrigin(0.5);

        this.add.text(cx, 220, 'Entrez votre pseudo', {
            fontFamily: 'Arial',
            fontSize: '22px',
            color: '#7eb8e0',
        }).setOrigin(0.5);

        this.createDOMInput();

        EventBus.emit('current-scene-ready', this);
    }

    private createDOMInput() {
        const canvas = this.game.canvas;
        const parent = canvas.parentElement;
        if (!parent) return;

        this.overlay = document.createElement('div');
        Object.assign(this.overlay.style, {
            position: 'absolute',
            top: '0',
            left: '0',
            width: `${canvas.width}px`,
            height: `${canvas.height}px`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
        });

        this.inputElement = document.createElement('input');
        Object.assign(this.inputElement.style, {
            pointerEvents: 'auto',
            width: '220px',
            padding: '12px 16px',
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            textAlign: 'center',
            border: '2px solid #2563eb',
            borderRadius: '8px',
            backgroundColor: '#1a3a5c',
            color: '#e0f0ff',
            outline: 'none',
            marginTop: '40px',
        });
        this.inputElement.type = 'text';
        this.inputElement.maxLength = 20;
        this.inputElement.placeholder = 'Votre pseudo...';

        const btn = document.createElement('button');
        Object.assign(btn.style, {
            pointerEvents: 'auto',
            marginTop: '16px',
            padding: '12px 32px',
            fontSize: '18px',
            fontFamily: 'Arial Black, sans-serif',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
        });
        btn.textContent = 'Commencer';

        const submit = () => {
            const name = this.inputElement?.value.trim();
            if (name && name.length > 0) {
                setCurrentPlayer(name);
                this.cleanupDOM();
                this.scene.start('MainMenu');
            }
        };

        btn.addEventListener('click', submit);
        this.inputElement.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') submit();
        });

        this.overlay.appendChild(this.inputElement);
        this.overlay.appendChild(btn);
        parent.style.position = 'relative';
        parent.appendChild(this.overlay);

        setTimeout(() => this.inputElement?.focus(), 100);
    }

    private cleanupDOM() {
        if (this.overlay && this.overlay.parentElement) {
            this.overlay.parentElement.removeChild(this.overlay);
        }
        this.overlay = null;
        this.inputElement = null;
    }

    shutdown() {
        this.cleanupDOM();
    }
}
