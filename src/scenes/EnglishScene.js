/**
 * EnglishScene — Learn basic English words (age 8-10 only).
 *
 * Show a Spanish word (+ emoji hint) and choose the correct English translation
 * from 4 options.
 */
class EnglishScene extends Phaser.Scene {
    constructor() {
        super({ key: 'EnglishScene' });
    }

    create() {
        this.W = this.scale.width;
        this.H = this.scale.height;

        this.score = 0;
        this.streak = 0;
        this.round = 0;
        this.totalRounds = 12;

        this.vocab = Phaser.Utils.Array.Shuffle([
            { es: 'Perro',      en: 'Dog',      emoji: '🐶', wrong: ['Cat', 'Wolf', 'Bear'] },
            { es: 'Gato',       en: 'Cat',      emoji: '🐱', wrong: ['Dog', 'Mouse', 'Bird'] },
            { es: 'Casa',       en: 'House',    emoji: '🏠', wrong: ['Door', 'Window', 'Garden'] },
            { es: 'Libro',      en: 'Book',     emoji: '📚', wrong: ['Pen', 'Paper', 'Desk'] },
            { es: 'Agua',       en: 'Water',    emoji: '💧', wrong: ['Fire', 'Air', 'Earth'] },
            { es: 'Manzana',    en: 'Apple',    emoji: '🍎', wrong: ['Pear', 'Grape', 'Orange'] },
            { es: 'Coche',      en: 'Car',      emoji: '🚗', wrong: ['Bike', 'Bus', 'Train'] },
            { es: 'Sol',        en: 'Sun',      emoji: '☀️', wrong: ['Moon', 'Star', 'Cloud'] },
            { es: 'Árbol',      en: 'Tree',     emoji: '🌳', wrong: ['Flower', 'Leaf', 'Grass'] },
            { es: 'Escuela',    en: 'School',   emoji: '🏫', wrong: ['Park', 'Hospital', 'Shop'] },
            { es: 'Amigo',      en: 'Friend',   emoji: '🤝', wrong: ['Enemy', 'Brother', 'Teacher'] },
            { es: 'Feliz',      en: 'Happy',    emoji: '😊', wrong: ['Sad', 'Angry', 'Tired'] },
            { es: 'Grande',     en: 'Big',      emoji: '🐘', wrong: ['Small', 'Tall', 'Fast'] },
            { es: 'Rojo',       en: 'Red',      emoji: '🔴', wrong: ['Blue', 'Green', 'Yellow'] },
            { es: 'Correr',     en: 'Run',      emoji: '🏃', wrong: ['Jump', 'Swim', 'Walk'] },
            { es: 'Comer',      en: 'Eat',      emoji: '🍽️', wrong: ['Drink', 'Sleep', 'Play'] },
            { es: 'Hablar',     en: 'Speak',    emoji: '💬', wrong: ['Listen', 'Write', 'Read'] },
            { es: 'Número',     en: 'Number',   emoji: '🔢', wrong: ['Letter', 'Word', 'Color'] }
        ]);

        this._drawBackground();
        this._drawHeader();
        this._buildQuestion();
        this.cameras.main.fadeIn(400);
    }

    _drawBackground() {
        const g = this.add.graphics();
        g.fillStyle(0x1a1a2e);
        g.fillRect(0, 0, this.W, this.H);
    }

    _drawHeader() {
        const W = this.W, H = this.H;
        const hdr = this.add.graphics();
        hdr.fillStyle(0x0f3460, 0.95);
        hdr.fillRect(0, 0, W, H * 0.13);

        this.add.text(W / 2, H * 0.065, '🇬🇧 Inglés', {
            fontSize: Math.floor(H * 0.048) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#FFD700',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);

        this._makeSmallButton(55, H - 30, 90, 40, '← Salir', 0x555555, 0x333333, () => {
            this.cameras.main.fade(300, 0, 0, 0);
            this.time.delayedCall(300, () => this.scene.start('HubScene'));
        });
    }

    _buildQuestion() {
        const W = this.W, H = this.H;
        if (this._qGroup) this._qGroup.destroy(true);
        this._qGroup = this.add.group();

        if (this.round >= this.totalRounds) { this._showEnd(); return; }

        const item = this.vocab[this.round % this.vocab.length];
        this._correctEn = item.en;

        const choices = Phaser.Utils.Array.Shuffle([item.en, ...item.wrong.slice(0, 3)]);

        // Score
        const scoreTxt = this.add.text(W - 12, 8, '⭐ ' + this.score, {
            fontSize: Math.floor(H * 0.032) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#FFD700',
            backgroundColor: '#0f3460',
            padding: { x: 8, y: 4 }
        }).setOrigin(1, 0);
        this._qGroup.add(scoreTxt);

        // Progress
        this._qGroup.add(this.add.text(W / 2, H * 0.17, 'Ronda ' + (this.round + 1) + ' / ' + this.totalRounds, {
            fontSize: Math.floor(H * 0.028) + 'px', color: '#bdc3c7'
        }).setOrigin(0.5));

        // Streak
        if (this.streak >= 3) {
            this._qGroup.add(this.add.text(12, 8, '🔥 ×' + this.streak, {
                fontSize: Math.floor(H * 0.032) + 'px', color: '#ff6b35',
                backgroundColor: '#2c0000', padding: { x: 8, y: 4 }
            }).setOrigin(0, 0));
        }

        // Instruction
        this._qGroup.add(this.add.text(W / 2, H * 0.23, '¿Cómo se dice en inglés?', {
            fontSize: Math.floor(H * 0.038) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#ecf0f1'
        }).setOrigin(0.5));

        // Spanish word card
        const cardW = Math.min(W * 0.65, 340);
        const cardH = H * 0.18;
        const cx = W / 2;
        const cy = H * 0.41;

        const card = this.add.graphics();
        card.fillStyle(0x1a5276);
        card.fillRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 22);
        card.lineStyle(4, 0xFFD700, 0.85);
        card.strokeRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 22);
        this._qGroup.add(card);

        this._qGroup.add(this.add.text(cx, cy - cardH * 0.12, item.emoji, {
            fontSize: Math.floor(cardH * 0.38) + 'px'
        }).setOrigin(0.5));

        this._qGroup.add(this.add.text(cx, cy + cardH * 0.3, item.es, {
            fontSize: Math.floor(H * 0.052) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#FFD700',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5));

        this.tweens.add({
            targets: [card],
            scaleX: { from: 0.5, to: 1 },
            scaleY: { from: 0.5, to: 1 },
            duration: 350,
            ease: 'Back.Out'
        });

        // Answer buttons
        const btnW = Math.min(W * 0.38, 200);
        const btnH = Math.floor(H * 0.1);
        const sx = W / 2 - btnW / 2 - 10;
        const sy = H * 0.64;

        choices.forEach((word, i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const bx = sx + col * (btnW + 20) + btnW / 2;
            const by = sy + row * (btnH + 14) + btnH / 2;
            this._makeAnswerButton(bx, by, btnW, btnH, word, word === this._correctEn);
        });
    }

    _makeAnswerButton(x, y, w, h, word, isCorrect) {
        const r = Math.floor(h * 0.3);
        const bg = this.add.graphics();
        this._qGroup.add(bg);
        const baseColor = 0x2980b9;

        const draw = (c) => {
            bg.clear();
            bg.fillStyle(0x000000, 0.2);
            bg.fillRoundedRect(x - w / 2 + 3, y - h / 2 + 4, w, h, r);
            bg.fillStyle(c);
            bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, r);
            bg.lineStyle(2, 0xffffff, 0.4);
            bg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, r);
        };
        draw(baseColor);

        const txt = this.add.text(x, y, word, {
            fontSize: Math.floor(h * 0.36) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#fff',
            stroke: '#000',
            strokeThickness: 2
        }).setOrigin(0.5);
        this._qGroup.add(txt);

        const zone = this.add.zone(x, y, w, h).setInteractive({ useHandCursor: true });
        this._qGroup.add(zone);

        zone.on('pointerover', () => draw(0x1a5276));
        zone.on('pointerout',  () => draw(baseColor));
        zone.on('pointerup', () => {
            this._qGroup.getChildren().forEach(c => { if (c.input) c.input.enabled = false; });
            if (isCorrect) {
                draw(0x27ae60);
                this.score++;
                this.streak++;
                const bonus = this.add.text(x, y - 30, '✓ +1', {
                    fontSize: Math.floor(h * 0.44) + 'px', color: '#2ecc71'
                }).setOrigin(0.5);
                this.tweens.add({ targets: bonus, y: y - 80, alpha: 0, duration: 800, onComplete: () => bonus.destroy() });
            } else {
                draw(0xe74c3c);
                this.streak = 0;
                const hint = this.add.text(this.W / 2, this.H * 0.82,
                    'Correcto: ' + this._correctEn, {
                    fontSize: Math.floor(h * 0.36) + 'px',
                    color: '#FFD700',
                    backgroundColor: '#0f3460',
                    padding: { x: 10, y: 5 }
                }).setOrigin(0.5);
                this._qGroup.add(hint);
            }
            this.round++;
            this.time.delayedCall(900, () => this._buildQuestion());
        });
    }

    _showEnd() {
        const W = this.W, H = this.H;
        const pct = Math.round((this.score / this.totalRounds) * 100);
        const emoji = pct >= 80 ? '🌟🌟🌟' : pct >= 50 ? '⭐⭐' : '⭐';

        this.add.text(W / 2, H * 0.28, 'Well done! / ¡Muy bien!', {
            fontSize: Math.floor(H * 0.052) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#FFD700',
            stroke: '#000', strokeThickness: 4
        }).setOrigin(0.5);

        this.add.text(W / 2, H * 0.42, emoji, { fontSize: Math.floor(H * 0.08) + 'px' }).setOrigin(0.5);

        this.add.text(W / 2, H * 0.54, 'Score: ' + this.score + ' / ' + this.totalRounds, {
            fontSize: Math.floor(H * 0.042) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#ecf0f1'
        }).setOrigin(0.5);

        const msg = pct >= 80 ? 'You are a language star! 🌟' : pct >= 50 ? 'Good job! Keep going!' : 'Keep practicing! 💪';
        this.add.text(W / 2, H * 0.64, msg, {
            fontSize: Math.floor(H * 0.034) + 'px', color: '#2ecc71'
        }).setOrigin(0.5);

        this._makeSmallButton(W / 2, H * 0.77, 200, 52, 'Continuar ▶', 0x27ae60, 0x1e8449, () => {
            this.cameras.main.fade(300, 0, 0, 0);
            this.time.delayedCall(300, () => this.scene.start('HubScene'));
        });
    }

    _makeSmallButton(x, y, w, h, label, color, hoverColor, callback) {
        const bg = this.add.graphics();
        const r = 12;
        const draw = (c) => { bg.clear(); bg.fillStyle(c); bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, r); };
        draw(color);
        this.add.text(x, y, label, {
            fontSize: Math.floor(h * 0.46) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#fff'
        }).setOrigin(0.5);
        const zone = this.add.zone(x, y, w, h).setInteractive({ useHandCursor: true });
        zone.on('pointerover', () => draw(hoverColor));
        zone.on('pointerout',  () => draw(color));
        zone.on('pointerup',   callback);
    }
}
