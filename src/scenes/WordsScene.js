/**
 * WordsScene — Basic Spanish words / initial reading game.
 *
 * Show an emoji and 4 word options.
 * Player selects the correct Spanish word for the image.
 * Gamified with streaks and stars.
 */
class WordsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'WordsScene' });
    }

    create() {
        this.W = this.scale.width;
        this.H = this.scale.height;

        this.score = 0;
        this.streak = 0;
        this.round = 0;
        this.totalRounds = 12;

        // Word bank per difficulty
        this.words = this._getWordBank();

        this._drawBackground();
        this._drawHeader();
        this._buildQuestion();
        this.cameras.main.fadeIn(400);
    }

    _getWordBank() {
        const all = [
            { word: 'Perro',     emoji: '🐶', distractors: ['Gato', 'Pato', 'Lobo'] },
            { word: 'Gato',      emoji: '🐱', distractors: ['Perro', 'Ratón', 'Oso'] },
            { word: 'Sol',       emoji: '☀️', distractors: ['Luna', 'Nube', 'Lluvia'] },
            { word: 'Casa',      emoji: '🏠', distractors: ['Puerta', 'Jardín', 'Techo'] },
            { word: 'Árbol',     emoji: '🌳', distractors: ['Flor', 'Hoja', 'Rama'] },
            { word: 'Pelota',    emoji: '⚽', distractors: ['Balón', 'Tenis', 'Dado'] },
            { word: 'Libro',     emoji: '📚', distractors: ['Lápiz', 'Papel', 'Cuaderno'] },
            { word: 'Manzana',   emoji: '🍎', distractors: ['Pera', 'Uva', 'Naranja'] },
            { word: 'Coche',     emoji: '🚗', distractors: ['Moto', 'Bus', 'Tren'] },
            { word: 'Avión',     emoji: '✈️', distractors: ['Barco', 'Cohete', 'Globo'] },
            { word: 'Flor',      emoji: '🌸', distractors: ['Hoja', 'Árbol', 'Jardín'] },
            { word: 'Luna',      emoji: '🌙', distractors: ['Estrella', 'Sol', 'Cometa'] },
            { word: 'Corazón',   emoji: '❤️', distractors: ['Amor', 'Flor', 'Beso'] },
            { word: 'Pez',       emoji: '🐟', distractors: ['Ballena', 'Tiburón', 'Pulpo'] },
            { word: 'Montaña',   emoji: '⛰️', distractors: ['Río', 'Mar', 'Bosque'] },
            { word: 'Bicicleta', emoji: '🚲', distractors: ['Coche', 'Moto', 'Patín'] },
            { word: 'Cohete',    emoji: '🚀', distractors: ['Avión', 'Satélite', 'Nave'] },
            { word: 'Bebé',      emoji: '👶', distractors: ['Niño', 'Mayor', 'Mamá'] }
        ];

        if (GameState.ageGroup === '4-5') {
            return all.slice(0, 10);
        } else if (GameState.ageGroup === '6-7') {
            return all.slice(0, 14);
        }
        return all;
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

        this.add.text(W / 2, H * 0.065, '📖 Palabras', {
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

        // Pick random word
        const item = Phaser.Utils.Array.GetRandom(this.words);
        this._correctWord = item.word;

        // Build 4 choices: correct + 3 distractors (shuffle)
        const choices = Phaser.Utils.Array.Shuffle([item.word, ...item.distractors.slice(0, 3)]);

        // Score + streak
        const scoreTxt = this.add.text(W - 12, 8, '⭐ ' + this.score, {
            fontSize: Math.floor(H * 0.032) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#FFD700',
            backgroundColor: '#0f3460',
            padding: { x: 8, y: 4 }
        }).setOrigin(1, 0);
        this._qGroup.add(scoreTxt);

        // Progress
        const prog = this.add.text(W / 2, H * 0.17, 'Ronda ' + (this.round + 1) + ' / ' + this.totalRounds, {
            fontSize: Math.floor(H * 0.028) + 'px',
            color: '#bdc3c7'
        }).setOrigin(0.5);
        this._qGroup.add(prog);

        // Streak fire
        if (this.streak >= 3) {
            const fire = this.add.text(12, 8, '🔥 ×' + this.streak, {
                fontSize: Math.floor(H * 0.032) + 'px',
                color: '#ff6b35',
                backgroundColor: '#2c0000',
                padding: { x: 8, y: 4 }
            }).setOrigin(0, 0);
            this._qGroup.add(fire);
        }

        // Question
        const questionTxt = this.add.text(W / 2, H * 0.23, '¿Qué palabra es?', {
            fontSize: Math.floor(H * 0.038) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#ecf0f1'
        }).setOrigin(0.5);
        this._qGroup.add(questionTxt);

        // Emoji card
        const cardSize = Math.min(W * 0.45, 220);
        const cx = W / 2;
        const cy = H * 0.43;

        const card = this.add.graphics();
        card.fillStyle(0x533483);
        card.fillRoundedRect(cx - cardSize / 2, cy - cardSize / 2, cardSize, cardSize, 24);
        card.lineStyle(4, 0xFFD700, 0.85);
        card.strokeRoundedRect(cx - cardSize / 2, cy - cardSize / 2, cardSize, cardSize, 24);
        this._qGroup.add(card);

        const emojiTxt = this.add.text(cx, cy, item.emoji, {
            fontSize: Math.floor(cardSize * 0.5) + 'px'
        }).setOrigin(0.5);
        this._qGroup.add(emojiTxt);

        // Entrance animation
        this.tweens.add({
            targets: [card, emojiTxt],
            scaleX: { from: 0.4, to: 1 },
            scaleY: { from: 0.4, to: 1 },
            duration: 350,
            ease: 'Back.Out'
        });

        // Answer buttons
        const btnW = Math.min(W * 0.38, 200);
        const btnH = Math.floor(H * 0.1);
        const sx = W / 2 - btnW / 2 - 10;
        const sy = H * 0.67;

        choices.forEach((word, i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const bx = sx + col * (btnW + 20) + btnW / 2;
            const by = sy + row * (btnH + 14) + btnH / 2;
            this._makeAnswerButton(bx, by, btnW, btnH, word, word === this._correctWord);
        });
    }

    _makeAnswerButton(x, y, w, h, word, isCorrect) {
        const r = Math.floor(h * 0.3);
        const bg = this.add.graphics();
        this._qGroup.add(bg);

        const draw = (c) => {
            bg.clear();
            bg.fillStyle(0x000000, 0.2);
            bg.fillRoundedRect(x - w / 2 + 3, y - h / 2 + 4, w, h, r);
            bg.fillStyle(c);
            bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, r);
            bg.lineStyle(2, 0xffffff, 0.4);
            bg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, r);
        };
        draw(0x8e44ad);

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

        zone.on('pointerover', () => draw(0x6c3483));
        zone.on('pointerout',  () => draw(0x8e44ad));
        zone.on('pointerdown', () => {
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
                const hint = this.add.text(this.W / 2, this.H * 0.82, 'Era: ' + this._correctWord, {
                    fontSize: Math.floor(h * 0.38) + 'px',
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

        this.add.text(W / 2, H * 0.28, '¡Juego terminado!', {
            fontSize: Math.floor(H * 0.055) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#FFD700',
            stroke: '#000', strokeThickness: 4
        }).setOrigin(0.5);

        this.add.text(W / 2, H * 0.42, emoji, { fontSize: Math.floor(H * 0.08) + 'px' }).setOrigin(0.5);

        this.add.text(W / 2, H * 0.54, 'Aciertos: ' + this.score + ' / ' + this.totalRounds, {
            fontSize: Math.floor(H * 0.042) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#ecf0f1'
        }).setOrigin(0.5);

        const msg = pct >= 80 ? '¡Eres un lector increíble!' : pct >= 50 ? '¡Muy bien hecho!' : '¡Practica más!';
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
        zone.on('pointerdown',   callback);
    }
}