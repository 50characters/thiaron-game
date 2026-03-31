/**
 * AlphabetScene — Learn the alphabet.
 *
 * Age 4-5: Show letter + example word + emoji. Navigate freely.
 * Age 6-7: Quiz mode — show emoji, pick the starting letter.
 */
class AlphabetScene extends Phaser.Scene {
    constructor() {
        super({ key: 'AlphabetScene' });
    }

    create() {
        this.W = this.scale.width;
        this.H = this.scale.height;

        // Spanish alphabet data: letter → { word, emoji }
        this.alphabet = [
            { letter: 'A', word: 'Avión',    emoji: '✈️' },
            { letter: 'B', word: 'Barco',    emoji: '🚢' },
            { letter: 'C', word: 'Casa',     emoji: '🏠' },
            { letter: 'D', word: 'Delfín',   emoji: '🐬' },
            { letter: 'E', word: 'Estrella', emoji: '⭐' },
            { letter: 'F', word: 'Fresa',    emoji: '🍓' },
            { letter: 'G', word: 'Gato',     emoji: '🐱' },
            { letter: 'H', word: 'Helado',   emoji: '🍦' },
            { letter: 'I', word: 'Iglesia',  emoji: '⛪' },
            { letter: 'J', word: 'Jirafa',   emoji: '🦒' },
            { letter: 'K', word: 'Kiwi',     emoji: '🥝' },
            { letter: 'L', word: 'León',     emoji: '🦁' },
            { letter: 'M', word: 'Manzana',  emoji: '🍎' },
            { letter: 'N', word: 'Nube',     emoji: '☁️' },
            { letter: 'Ñ', word: 'Ñoño',     emoji: '😅' },
            { letter: 'O', word: 'Oso',      emoji: '🐻' },
            { letter: 'P', word: 'Pelota',   emoji: '⚽' },
            { letter: 'Q', word: 'Queso',    emoji: '🧀' },
            { letter: 'R', word: 'Ratón',    emoji: '🐭' },
            { letter: 'S', word: 'Sol',      emoji: '☀️' },
            { letter: 'T', word: 'Tortuga',  emoji: '🐢' },
            { letter: 'U', word: 'Uva',      emoji: '🍇' },
            { letter: 'V', word: 'Vaca',     emoji: '🐄' },
            { letter: 'W', word: 'Wifi',     emoji: '📶' },
            { letter: 'X', word: 'Xilófono', emoji: '🎵' },
            { letter: 'Y', word: 'Yoyo',     emoji: '🪀' },
            { letter: 'Z', word: 'Zapato',   emoji: '👟' }
        ];

        this.mode = (GameState.ageGroup === '4-5') ? 'explore' : 'quiz';
        this.currentIndex = 0;
        this.score = 0;
        this.quizIndex = 0;

        this._drawBackground();
        this._drawHeader();

        if (this.mode === 'explore') {
            this._showLetter(0);
        } else {
            this._buildQuiz();
        }

        this.cameras.main.fadeIn(400);
    }

    _drawBackground() {
        const g = this.add.graphics();
        g.fillStyle(0x1a1a2e);
        g.fillRect(0, 0, this.W, this.H);
        // Subtle dots
        g.fillStyle(0xffffff, 0.06);
        for (let i = 0; i < 30; i++) {
            g.fillCircle(
                Phaser.Math.Between(0, this.W),
                Phaser.Math.Between(0, this.H),
                Phaser.Math.Between(2, 6)
            );
        }
    }

    _drawHeader() {
        const W = this.W, H = this.H;
        const hdr = this.add.graphics();
        hdr.fillStyle(0x0f3460, 0.95);
        hdr.fillRect(0, 0, W, H * 0.13);

        this.add.text(W / 2, H * 0.065, '🔤 El Abecedario', {
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

    // ─── Explore mode (age 4-5) ───────────────────────────────────────────────

    _showLetter(index) {
        const W = this.W, H = this.H;
        if (this._cardGroup) this._cardGroup.destroy(true);
        this._cardGroup = this.add.group();

        const item = this.alphabet[index];

        // Progress indicator
        const prog = this.add.text(W / 2, H * 0.16, (index + 1) + ' / ' + this.alphabet.length, {
            fontSize: Math.floor(H * 0.03) + 'px',
            fontFamily: 'Arial, sans-serif',
            color: '#bdc3c7'
        }).setOrigin(0.5);
        this._cardGroup.add(prog);

        // Letter card
        const cardW = Math.min(W * 0.55, 280);
        const cardH = cardW;
        const cx = W / 2;
        const cy = H * 0.41;

        const card = this.add.graphics();
        card.fillStyle(0x533483);
        card.fillRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 28);
        card.lineStyle(5, 0xFFD700, 0.9);
        card.strokeRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 28);
        this._cardGroup.add(card);

        const letterTxt = this.add.text(cx, cy - cardH * 0.1, item.letter, {
            fontSize: Math.floor(cardH * 0.5) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#FFD700',
            stroke: '#000',
            strokeThickness: 6
        }).setOrigin(0.5);
        this._cardGroup.add(letterTxt);

        // Entrance animation
        this.tweens.add({
            targets: [card, letterTxt],
            scaleX: { from: 0.5, to: 1 },
            scaleY: { from: 0.5, to: 1 },
            duration: 350,
            ease: 'Back.Out'
        });

        // Emoji
        const emojiTxt = this.add.text(cx, cy + cardH * 0.3, item.emoji, {
            fontSize: Math.floor(cardH * 0.22) + 'px'
        }).setOrigin(0.5);
        this._cardGroup.add(emojiTxt);

        // Word
        const wordTxt = this.add.text(cx, H * 0.68, item.word, {
            fontSize: Math.floor(H * 0.055) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#ecf0f1',
            stroke: '#2c3e50',
            strokeThickness: 3
        }).setOrigin(0.5);
        this._cardGroup.add(wordTxt);

        // Navigation arrows
        if (index > 0) {
            this._makeNavButton(W * 0.12, H * 0.87, '◀', () => {
                this.currentIndex--;
                this._showLetter(this.currentIndex);
            });
        }
        if (index < this.alphabet.length - 1) {
            this._makeNavButton(W * 0.88, H * 0.87, '▶', () => {
                this.currentIndex++;
                this._showLetter(this.currentIndex);
            });
        } else {
            // End: show complete message
            const endTxt = this.add.text(W / 2, H * 0.87, '🎉 ¡Completaste el abecedario!', {
                fontSize: Math.floor(H * 0.032) + 'px',
                fontFamily: 'Arial Rounded MT Bold, Arial',
                color: '#FFD700'
            }).setOrigin(0.5);
            this._cardGroup.add(endTxt);
        }

        // Alphabet scroll strip at bottom
        this._drawAlphabetStrip(index);
    }

    _drawAlphabetStrip(activeIndex) {
        const W = this.W, H = this.H;
        const stripY = H * 0.96;
        const letters = this.alphabet.map(a => a.letter);
        const cellW = W / Math.min(letters.length, 14);

        // Show subset centered around active
        const half = 6;
        const start = Math.max(0, Math.min(activeIndex - half, letters.length - 13));
        const end = Math.min(letters.length, start + 13);

        for (let i = start; i < end; i++) {
            const x = W * 0.04 + (i - start) * cellW + cellW / 2;
            const isActive = i === activeIndex;
            const t = this.add.text(x, stripY, letters[i], {
                fontSize: Math.floor(H * isActive ? 0.03 : 0.025) + 'px',
                fontFamily: 'Arial Rounded MT Bold, Arial',
                color: isActive ? '#FFD700' : '#888'
            }).setOrigin(0.5);
            this._cardGroup.add(t);
        }
    }

    _makeNavButton(x, y, label, callback) {
        const W = this.W, H = this.H;
        const size = Math.floor(H * 0.072);
        const bg = this.add.graphics();
        bg.fillStyle(0x533483);
        bg.fillCircle(x, y, size);
        bg.lineStyle(3, 0xFFD700, 0.8);
        bg.strokeCircle(x, y, size);
        this._cardGroup.add(bg);

        const t = this.add.text(x, y, label, {
            fontSize: Math.floor(size * 0.9) + 'px',
            color: '#fff'
        }).setOrigin(0.5);
        this._cardGroup.add(t);

        const zone = this.add.zone(x, y, size * 2, size * 2).setInteractive({ useHandCursor: true });
        this._cardGroup.add(zone);
        zone.on('pointerdown', callback);
    }

    _buildQuiz() {
        const W = this.W, H = this.H;
        if (this._cardGroup) this._cardGroup.destroy(true);
        this._cardGroup = this.add.group();

        if (this.quizIndex >= 10) { this._showQuizEnd(); return; }

        // Pick random item
        const shuffled = Phaser.Utils.Array.Shuffle([...this.alphabet]);
        const correct = shuffled[0];

        // 4 choices (letters)
        const choices = Phaser.Utils.Array.Shuffle(shuffled.slice(0, 4)).map(a => a.letter);

        // Score display
        const scoreTxt = this.add.text(W - 12, 8, '⭐ ' + this.score, {
            fontSize: Math.floor(H * 0.032) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#FFD700',
            backgroundColor: '#0f3460',
            padding: { x: 8, y: 4 }
        }).setOrigin(1, 0);
        this._cardGroup.add(scoreTxt);

        // Question
        this.add.text(W / 2, H * 0.2, '¿Con qué letra empieza?', {
            fontSize: Math.floor(H * 0.038) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#ecf0f1'
        }).setOrigin(0.5);
        this._cardGroup.add(
            this.add.text(W / 2, H * 0.2, '')
        );

        // Emoji + word card
        const cardW = Math.min(W * 0.52, 260);
        const cx = W / 2;
        const cy = H * 0.41;

        const card = this.add.graphics();
        card.fillStyle(0x533483);
        card.fillRoundedRect(cx - cardW / 2, cy - cardW * 0.45, cardW, cardW * 0.9, 24);
        this._cardGroup.add(card);

        const emojiTxt = this.add.text(cx, cy - cardW * 0.07, correct.emoji, {
            fontSize: Math.floor(cardW * 0.42) + 'px'
        }).setOrigin(0.5);
        this._cardGroup.add(emojiTxt);

        const wordTxt = this.add.text(cx, cy + cardW * 0.28, correct.word, {
            fontSize: Math.floor(H * 0.042) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#FFD700'
        }).setOrigin(0.5);
        this._cardGroup.add(wordTxt);

        // Progress
        const prog = this.add.text(W / 2, H * 0.18, 'Pregunta ' + (this.quizIndex + 1) + ' / 10', {
            fontSize: Math.floor(H * 0.028) + 'px',
            color: '#bdc3c7'
        }).setOrigin(0.5);
        this._cardGroup.add(prog);

        // Answer buttons
        const btnW = Math.min(W * 0.35, 170);
        const btnH = Math.floor(H * 0.1);
        const startX = W / 2 - btnW - 10;
        const startY = H * 0.66;

        choices.forEach((letter, i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const bx = startX + col * (btnW + 20) + btnW / 2;
            const by = startY + row * (btnH + 14) + btnH / 2;
            this._makeQuizButton(bx, by, btnW, btnH, letter, letter === correct.letter);
        });
    }

    _makeQuizButton(x, y, w, h, letter, isCorrect) {
        const r = Math.floor(h * 0.3);
        const bg = this.add.graphics();
        const baseColor = 0x2980b9;
        const draw = (c) => {
            bg.clear();
            bg.fillStyle(c);
            bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, r);
            bg.lineStyle(2, 0xffffff, 0.4);
            bg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, r);
        };
        draw(baseColor);
        this._cardGroup.add(bg);

        const txt = this.add.text(x, y, letter, {
            fontSize: Math.floor(h * 0.5) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#fff',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);
        this._cardGroup.add(txt);

        const zone = this.add.zone(x, y, w, h).setInteractive({ useHandCursor: true });
        this._cardGroup.add(zone);

        zone.on('pointerover', () => draw(0x1a5276));
        zone.on('pointerout',  () => draw(baseColor));
        zone.on('pointerdown', () => {
            // Disable all
            this._cardGroup.getChildren().forEach(c => { if (c.input) c.input.enabled = false; });

            if (isCorrect) {
                draw(0x27ae60);
                this.score++;
                const bonus = this.add.text(x, y - 30, '✓', { fontSize: Math.floor(h * 0.6) + 'px', color: '#2ecc71' }).setOrigin(0.5);
                this.tweens.add({ targets: bonus, y: y - 80, alpha: 0, duration: 700, onComplete: () => bonus.destroy() });
            } else {
                draw(0xe74c3c);
                const wrong = this.add.text(x, y - 30, '✗', { fontSize: Math.floor(h * 0.6) + 'px', color: '#e74c3c' }).setOrigin(0.5);
                this.tweens.add({ targets: wrong, y: y - 80, alpha: 0, duration: 700, onComplete: () => wrong.destroy() });
            }

            this.quizIndex++;
            this.time.delayedCall(900, () => this._buildQuiz());
        });
    }

    _showQuizEnd() {
        const W = this.W, H = this.H;
        if (this._cardGroup) this._cardGroup.destroy(true);
        this._cardGroup = this.add.group();

        const pct = (this.score / 10) * 100;
        const emoji = pct >= 80 ? '🌟🌟🌟' : pct >= 50 ? '⭐⭐' : '⭐';

        this.add.text(W / 2, H * 0.3, '¡Juego terminado!', {
            fontSize: Math.floor(H * 0.055) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#FFD700',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);

        this.add.text(W / 2, H * 0.44, emoji, {
            fontSize: Math.floor(H * 0.08) + 'px'
        }).setOrigin(0.5);

        this.add.text(W / 2, H * 0.56, 'Aciertos: ' + this.score + ' / 10', {
            fontSize: Math.floor(H * 0.042) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#ecf0f1'
        }).setOrigin(0.5);

        const msg = pct >= 80 ? '¡Eres un maestro del abecedario!' : pct >= 50 ? '¡Muy bien!' : '¡Sigue practicando!';
        this.add.text(W / 2, H * 0.65, msg, {
            fontSize: Math.floor(H * 0.032) + 'px',
            fontFamily: 'Arial, sans-serif',
            color: '#2ecc71'
        }).setOrigin(0.5);

        this._makeSmallButton(W / 2, H * 0.78, 200, 52, 'Continuar ▶', 0x27ae60, 0x1e8449, () => {
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
