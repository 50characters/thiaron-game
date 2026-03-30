/**
 * MenuScene — Welcome screen with age-group selection.
 * Age groups: 4-5, 6-7, 8-10
 */
class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;

        // Gradient background via multiple rectangles
        this._drawBackground(W, H);

        // Stars decoration
        this._drawStars(W, H);

        // Title
        this.add.text(W / 2, H * 0.13, '🌟 Thiaron', {
            fontSize: Math.floor(H * 0.085) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#FFD700',
            stroke: '#c0392b',
            strokeThickness: 6,
            shadow: { offsetX: 3, offsetY: 3, color: '#000', blur: 6, fill: true }
        }).setOrigin(0.5);

        this.add.text(W / 2, H * 0.23, '¡Juego Educativo!', {
            fontSize: Math.floor(H * 0.042) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#ffffff',
            stroke: '#2c3e50',
            strokeThickness: 3
        }).setOrigin(0.5);

        this.add.text(W / 2, H * 0.33, '¿Cuántos años tienes?', {
            fontSize: Math.floor(H * 0.036) + 'px',
            fontFamily: 'Arial, sans-serif',
            color: '#ecf0f1'
        }).setOrigin(0.5);

        // Age group buttons
        const groups = [
            { label: '4 - 5 años', key: '4-5', color: 0xe74c3c, hover: 0xc0392b, emoji: '🐣' },
            { label: '6 - 7 años', key: '6-7', color: 0x27ae60, hover: 0x1e8449, emoji: '🌱' },
            { label: '8 - 10 años', key: '8-10', color: 0x2980b9, hover: 0x1a5276, emoji: '🚀' }
        ];

        const btnW = Math.min(W * 0.6, 360);
        const btnH = Math.floor(H * 0.1);
        const startY = H * 0.46;
        const gap = btnH + Math.floor(H * 0.035);

        groups.forEach((g, i) => {
            const y = startY + i * gap;
            this._makeButton(W / 2, y, btnW, btnH, g.emoji + '  ' + g.label, g.color, g.hover, () => {
                GameState.ageGroup = g.key;
                GameState.resetGame();
                this.cameras.main.fade(300, 0, 0, 0);
                this.time.delayedCall(300, () => this.scene.start('HubScene'));
            });
        });

        // Footer
        this.add.text(W / 2, H * 0.94, '✨ ¡Aprende jugando! ✨', {
            fontSize: Math.floor(H * 0.028) + 'px',
            fontFamily: 'Arial, sans-serif',
            color: '#bdc3c7'
        }).setOrigin(0.5);

        this.cameras.main.fadeIn(400);
    }

    _drawBackground(W, H) {
        const g = this.add.graphics();
        // Dark-blue to purple gradient approximated with bands
        const colors = [0x1a1a2e, 0x16213e, 0x0f3460, 0x533483];
        const bandH = H / colors.length;
        colors.forEach((c, i) => {
            g.fillStyle(c);
            g.fillRect(0, i * bandH, W, bandH + 1);
        });
    }

    _drawStars(W, H) {
        const g = this.add.graphics();
        g.fillStyle(0xffffff, 0.7);
        for (let i = 0; i < 40; i++) {
            const x = Phaser.Math.Between(0, W);
            const y = Phaser.Math.Between(0, H * 0.88);
            const r = Phaser.Math.FloatBetween(1, 3);
            g.fillCircle(x, y, r);
        }
    }

    _makeButton(x, y, w, h, label, color, hoverColor, callback) {
        const bg = this.add.graphics();
        const r = Math.floor(h * 0.35);

        const draw = (c, shadow) => {
            bg.clear();
            if (shadow) {
                bg.fillStyle(0x000000, 0.3);
                bg.fillRoundedRect(x - w / 2 + 4, y - h / 2 + 6, w, h, r);
            }
            bg.fillStyle(c);
            bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, r);
            bg.lineStyle(3, 0xffffff, 0.4);
            bg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, r);
        };

        draw(color, true);

        const txt = this.add.text(x, y, label, {
            fontSize: Math.floor(h * 0.38) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        const zone = this.add.zone(x, y, w, h).setInteractive({ useHandCursor: true });

        zone.on('pointerover', () => {
            draw(hoverColor, false);
            txt.setScale(1.05);
        });
        zone.on('pointerout', () => {
            draw(color, true);
            txt.setScale(1);
        });
        zone.on('pointerdown', () => {
            draw(hoverColor, false);
            txt.setScale(0.97);
            callback();
        });
        zone.on('pointerup', () => {
            draw(color, true);
            txt.setScale(1);
        });
    }
}
