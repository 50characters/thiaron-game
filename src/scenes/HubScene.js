/**
 * HubScene — Game selector for the chosen age group.
 *
 * Available games per age group:
 *   4-5  : Alphabet, Words (Spanish), Math (addition ≤10)
 *   6-7  : Alphabet, Words (Spanish), Math (±20), Multiplication
 *   8-10 : Math (±100), Multiplication, English Words, Reading
 */
class HubScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HubScene' });
    }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;

        // Persist current state (balls earned, score) every time the hub is entered.
        GameState.save();

        this._drawBackground(W, H);

        // Header bar
        const hdr = this.add.graphics();
        hdr.fillStyle(0x0f3460, 0.9);
        hdr.fillRect(0, 0, W, H * 0.14);

        this.add.text(W / 2, H * 0.07, '🏆 Elige tu juego', {
            fontSize: Math.floor(H * 0.05) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#FFD700',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Age badge
        this.add.text(W - 12, 10, GameState.ageGroup + ' años', {
            fontSize: Math.floor(H * 0.028) + 'px',
            fontFamily: 'Arial, sans-serif',
            color: '#ecf0f1',
            backgroundColor: '#2980b9',
            padding: { x: 8, y: 4 }
        }).setOrigin(1, 0);

        // Game definitions
        const allGames = [
            { key: 'AlphabetScene',      label: 'Abecedario',    emoji: '🔤', color: 0xe67e22, hover: 0xd35400, ages: ['4-5', '6-7'] },
            { key: 'WordsScene',         label: 'Palabras',      emoji: '📖', color: 0x8e44ad, hover: 0x6c3483, ages: ['4-5', '6-7'] },
            { key: 'MathScene',          label: 'Matemáticas',   emoji: '➕', color: 0x16a085, hover: 0x0e6655, ages: ['4-5', '6-7', '8-10'] },
            { key: 'MultiplicationScene',label: 'Tablas',        emoji: '✖️', color: 0xe74c3c, hover: 0xc0392b, ages: ['6-7', '8-10'] },
            { key: 'EnglishScene',       label: 'Inglés',        emoji: '🇬🇧', color: 0x2980b9, hover: 0x1a5276, ages: ['8-10'] },
            { key: 'ReadingScene',       label: 'Lectura',       emoji: '📝', color: 0x117a65, hover: 0x0e6655, ages: ['8-10'] }
        ];

        const available = allGames.filter(g => g.ages.includes(GameState.ageGroup));

        const cols = available.length <= 3 ? 1 : 2;
        const rows = Math.ceil(available.length / cols);
        const btnW = cols === 1 ? Math.min(W * 0.65, 380) : Math.min(W * 0.42, 280);
        const btnH = Math.floor(H * 0.115);
        const padX = (W - cols * btnW - (cols - 1) * 20) / 2 + btnW / 2;
        const startY = H * 0.22 + btnH / 2;
        const gapY = btnH + Math.floor(H * 0.035);
        const gapX = btnW + 20;

        available.forEach((g, i) => {
            const col = cols === 1 ? 0 : i % cols;
            const row = cols === 1 ? i : Math.floor(i / cols);
            const x = padX + col * gapX;
            const y = startY + row * gapY;
            this._makeGameButton(x, y, btnW, btnH, g.emoji, g.label, g.color, g.hover, () => {
                this.cameras.main.fade(300, 0, 0, 0);
                this.time.delayedCall(300, () => this.scene.start(g.key));
            });
        });

        // Back button
        this._makeSmallButton(70, H - 36, 120, 44, '← Volver', 0x555555, 0x333333, () => {
            this.cameras.main.fade(300, 0, 0, 0);
            this.time.delayedCall(300, () => this.scene.start('MenuScene'));
        });

        // Soccer ball counter (if any earned)
        this._drawBallCounter(W, H);

        this.cameras.main.fadeIn(400);
    }

    _drawBallCounter(W, H) {
        if (GameState.soccerBalls <= 0) return;
        this.add.text(20, 10, '🏅 × ' + GameState.soccerBalls, {
            fontSize: Math.floor(H * 0.035) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#ffffff',
            backgroundColor: '#27ae60',
            padding: { x: 8, y: 4 }
        });

        if (GameState.soccerBalls >= 3) {
            // Sport selection label
            this.add.text(W / 2, H * 0.8, '⚡ ¡Elige tu deporte!', {
                fontSize: Math.floor(H * 0.032) + 'px',
                fontFamily: 'Arial Rounded MT Bold, Arial',
                color: '#FFD700',
                stroke: '#000',
                strokeThickness: 2
            }).setOrigin(0.5);

            // Soccer button (left half)
            const bw = W * 0.42;
            const bh = H * 0.075;
            this._makeGameButton(W * 0.28, H * 0.9, bw, bh, '⚽', 'Fútbol', 0x27ae60, 0x1e8449, () => {
                this.cameras.main.fade(300, 0, 0, 0);
                this.time.delayedCall(300, () => this.scene.start('SoccerScene'));
            });

            // Basketball button (right half)
            this._makeGameButton(W * 0.72, H * 0.9, bw, bh, '🏀', 'Baloncesto', 0xe67e22, 0xc05800, () => {
                this.cameras.main.fade(300, 0, 0, 0);
                this.time.delayedCall(300, () => this.scene.start('BasketballScene'));
            });
        }
    }

    _drawBackground(W, H) {
        const g = this.add.graphics();
        g.fillStyle(0x1a1a2e);
        g.fillRect(0, 0, W, H);
        // Subtle grid decoration
        g.lineStyle(1, 0xffffff, 0.04);
        for (let x = 0; x < W; x += 60) g.lineBetween(x, 0, x, H);
        for (let y = 0; y < H; y += 60) g.lineBetween(0, y, W, y);
    }

    _makeGameButton(x, y, w, h, emoji, label, color, hoverColor, callback) {
        const bg = this.add.graphics();
        const r = Math.floor(h * 0.3);

        const draw = (c) => {
            bg.clear();
            bg.fillStyle(0x000000, 0.25);
            bg.fillRoundedRect(x - w / 2 + 3, y - h / 2 + 5, w, h, r);
            bg.fillStyle(c);
            bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, r);
            bg.lineStyle(2, 0xffffff, 0.35);
            bg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, r);
        };
        draw(color);

        const eSize = Math.floor(h * 0.42);
        this.add.text(x - w * 0.28, y, emoji, {
            fontSize: eSize + 'px'
        }).setOrigin(0.5);

        this.add.text(x + w * 0.08, y, label, {
            fontSize: Math.floor(h * 0.33) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#ffffff',
            stroke: '#000',
            strokeThickness: 2
        }).setOrigin(0.5);

        const zone = this.add.zone(x, y, w, h).setInteractive({ useHandCursor: true });
        zone.on('pointerover', () => draw(hoverColor));
        zone.on('pointerout',  () => draw(color));
        zone.on('pointerdown', callback);
    }

    _makeSmallButton(x, y, w, h, label, color, hoverColor, callback) {
        const bg = this.add.graphics();
        const r = 10;
        const draw = (c) => {
            bg.clear();
            bg.fillStyle(c);
            bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, r);
        };
        draw(color);
        this.add.text(x, y, label, {
            fontSize: Math.floor(h * 0.5) + 'px',
            fontFamily: 'Arial, sans-serif',
            color: '#fff'
        }).setOrigin(0.5);
        const zone = this.add.zone(x, y, w, h).setInteractive({ useHandCursor: true });
        zone.on('pointerover', () => draw(hoverColor));
        zone.on('pointerout',  () => draw(color));
        zone.on('pointerdown', callback);
    }
}
