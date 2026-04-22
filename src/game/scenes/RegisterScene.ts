import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { getCurrentPlayer, setCurrentPlayer } from '../logic/Leaderboard';

export class RegisterScene extends Scene {
    private inputElement: HTMLInputElement | null = null;
    private overlay: HTMLDivElement | null = null;
    private resizeHandler = () => this.repositionOverlay();

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
            strokeThickness: 6,
        }).setOrigin(0.5);

        this.add.text(cx, 220, 'Entrez votre pseudo', {
            fontFamily: 'Arial',
            fontSize: '22px',
            color: '#7eb8e0',
        }).setOrigin(0.5);

        this.add.text(cx, 255, 'Pour sauvegarder vos scores', {
            fontFamily: 'Arial',
            fontSize: '15px',
            color: '#4a7ea8',
        }).setOrigin(0.5);

        this.createDOMInput();

        EventBus.emit('current-scene-ready', this);
    }

    private repositionOverlay() {
        if (!this.overlay) return;
        const canvas = this.game.canvas;
        const parent = canvas.parentElement;
        if (!parent) return;
        const rect = canvas.getBoundingClientRect();
        const parentRect = parent.getBoundingClientRect();
        Object.assign(this.overlay.style, {
            top: `${rect.top - parentRect.top}px`,
            left: `${rect.left - parentRect.left}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
        });
    }

    private createDOMInput() {
        const canvas = this.game.canvas;
        const parent = canvas.parentElement;
        if (!parent) return;

        const rect = canvas.getBoundingClientRect();
        const parentRect = parent.getBoundingClientRect();

        this.overlay = document.createElement('div');
        Object.assign(this.overlay.style, {
            position: 'absolute',
            top: `${rect.top - parentRect.top}px`,
            left: `${rect.left - parentRect.left}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
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
            boxShadow: '0 0 15px rgba(37, 99, 235, 0.3)',
            transition: 'border-color 0.2s, box-shadow 0.2s',
        });
        this.inputElement.type = 'text';
        this.inputElement.maxLength = 20;
        this.inputElement.placeholder = 'Votre pseudo...';

        this.inputElement.addEventListener('focus', () => {
            if (this.inputElement) {
                this.inputElement.style.borderColor = '#60a5fa';
                this.inputElement.style.boxShadow = '0 0 20px rgba(96, 165, 250, 0.5)';
            }
        });
        this.inputElement.addEventListener('blur', () => {
            if (this.inputElement) {
                this.inputElement.style.borderColor = '#2563eb';
                this.inputElement.style.boxShadow = '0 0 15px rgba(37, 99, 235, 0.3)';
            }
        });

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
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'background-color 0.2s, transform 0.1s',
        });
        btn.textContent = 'Commencer';

        btn.onmouseover = () => {
            btn.style.backgroundColor = '#3b82f6';
            btn.style.transform = 'scale(1.05)';
        };
        btn.onmouseout = () => {
            btn.style.backgroundColor = '#2563eb';
            btn.style.transform = 'scale(1)';
        };

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

        window.addEventListener('resize', this.resizeHandler);

        setTimeout(() => this.inputElement?.focus(), 100);
    }

    private cleanupDOM() {
        window.removeEventListener('resize', this.resizeHandler);
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
