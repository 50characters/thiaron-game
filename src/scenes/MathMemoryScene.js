/**
 * MathMemoryScene — Classic memory card game with math equation pairs.
 *
 * Each pair: one card shows a math equation, the other shows the result.
 * The player flips two cards at a time; matching pairs stay face-up.
 *
 * Difficulty by age group:
 *   4-5  : addition only, operands 1–10,    3×4 grid (6 pairs), 5 min timer
 *   6-7  : addition + subtraction, ≤20,     4×4 grid (8 pairs), 3 min timer
 *   8-10 : addition, subtraction & multiply, 4×4 grid (8 pairs), 2 min timer
 */
class MathMemoryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MathMemoryScene' });
    }

    create() {
        this.W = this.scale.width;
        this.H = this.scale.height;

        this._flipped  = [];   // currently revealed (unmatched) cards, max 2
        this._locked   = false;
        this._matchedPairs = 0;

        const cfg = this._config();
        this._totalPairs = cfg.pairs;
        this._cols       = cfg.cols;
        this._rows       = cfg.rows;
        this._timeLeft   = cfg.timeLimit;

        this._drawBackground();
        this._drawHeader();
        this._buildGrid();
        this._startTimer();
        this.cameras.main.fadeIn(400);
    }

    // ─── Configuration ────────────────────────────────────────────────────────

    _config() {
        const age = GameState.ageGroup;
        if (age === '4-5') return { pairs: 6, cols: 3, rows: 4, timeLimit: 300 };
        if (age === '6-7') return { pairs: 8, cols: 4, rows: 4, timeLimit: 180 };
        return                   { pairs: 8, cols: 4, rows: 4, timeLimit: 120 };
    }

    // ─── Background ───────────────────────────────────────────────────────────

    _drawBackground() {
        const g = this.add.graphics();
        g.fillStyle(0x1a1a2e);
        g.fillRect(0, 0, this.W, this.H);
        g.lineStyle(1, 0xffffff, 0.04);
        for (let x = 0; x < this.W; x += 60) g.lineBetween(x, 0, x, this.H);
        for (let y = 0; y < this.H; y += 60) g.lineBetween(0, y, this.W, y);
    }

    // ─── Header ───────────────────────────────────────────────────────────────

    _drawHeader() {
        const W = this.W, H = this.H;
        const hdr = this.add.graphics();
        hdr.fillStyle(0x0f3460, 0.95);
        hdr.fillRect(0, 0, W, H * 0.13);

        this.add.text(W / 2, H * 0.065, '🧩 Memoria Matemática', {
            fontSize: Math.floor(H * 0.044) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#FFD700',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);

        this._makeSmallButton(55, H - 36, 100, 44, '← Salir', 0x555555, 0x333333, () => {
            if (this._timerEvent) this._timerEvent.remove();
            this.cameras.main.fade(300, 0, 0, 0);
            this.time.delayedCall(300, () => this.scene.start('HubScene'));
        });
    }

    // ─── Equation generation ──────────────────────────────────────────────────

    /**
     * Generate `count` unique math equation/result pairs.
     * The same equation will not appear twice in a single game.
     */
    _generateEquations(count) {
        const age  = GameState.ageGroup;
        const used = new Set();
        const pairs = [];
        let attempts = 0;

        while (pairs.length < count && attempts < 1000) {
            attempts++;
            let equation, result;

            if (age === '4-5') {
                // Addition only; both operands ≥ 1, sum ≤ 10
                const a = Phaser.Math.Between(1, 8);
                const b = Phaser.Math.Between(1, 10 - a);
                equation = a + ' + ' + b;
                result   = a + b;

            } else if (age === '6-7') {
                // 40% subtraction, 60% addition; numbers ≤ 20
                if (Math.random() < 0.4) {
                    const a = Phaser.Math.Between(5, 20);
                    const b = Phaser.Math.Between(1, a);
                    equation = a + ' − ' + b;
                    result   = a - b;
                } else {
                    const a = Phaser.Math.Between(1, 15);
                    const b = Phaser.Math.Between(1, 20 - a);
                    equation = a + ' + ' + b;
                    result   = a + b;
                }

            } else { // 8-10
                // 35% multiplication, 30% subtraction, 35% addition
                const roll = Math.random();
                if (roll < 0.35) {
                    const a = Phaser.Math.Between(2, 12);
                    const b = Phaser.Math.Between(2, 10);
                    equation = a + ' × ' + b;
                    result   = a * b;
                } else if (roll < 0.65) {
                    const a = Phaser.Math.Between(10, 50);
                    const b = Phaser.Math.Between(1, a);
                    equation = a + ' − ' + b;
                    result   = a - b;
                } else {
                    const a = Phaser.Math.Between(10, 50);
                    const b = Phaser.Math.Between(1, 50);
                    equation = a + ' + ' + b;
                    result   = a + b;
                }
            }

            if (!used.has(equation)) {
                used.add(equation);
                pairs.push({ equation, result });
            }
        }
        return pairs;
    }

    // ─── Grid builder ─────────────────────────────────────────────────────────

    _buildGrid() {
        const W = this.W, H = this.H;
        const cols = this._cols;
        const rows = this._rows;

        const pairs = this._generateEquations(this._totalPairs);

        // Build a flat array: one equation card + one result card per pair
        const cardData = [];
        pairs.forEach((pair, idx) => {
            cardData.push({ type: 'equation', display: pair.equation, pairId: idx });
            cardData.push({ type: 'result',   display: String(pair.result), pairId: idx });
        });
        Phaser.Utils.Array.Shuffle(cardData);

        // Layout metrics
        const gapX     = 10;
        const gapY     = 10;
        const gridLeft = 10;
        const gridTop  = H * 0.20;
        const availW   = W - gridLeft * 2;
        const availH   = H * 0.90 - gridTop;
        const cardW    = Math.floor((availW - gapX * (cols - 1)) / cols);
        const cardH    = Math.floor((availH - gapY * (rows - 1)) / rows);

        // Info bar between header and grid
        this._timerText = this.add.text(W / 2, H * 0.165, this._formatTime(this._timeLeft), {
            fontSize: Math.floor(H * 0.038) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#2ecc71',
            stroke: '#000',
            strokeThickness: 2
        }).setOrigin(0.5);

        this._pairsText = this.add.text(W - 12, H * 0.165, '0 / ' + this._totalPairs, {
            fontSize: Math.floor(H * 0.030) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#FFD700',
            backgroundColor: '#0f3460',
            padding: { x: 8, y: 4 }
        }).setOrigin(1, 0.5);

        // Create card objects
        this._cards = [];
        cardData.forEach((data, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const cx  = gridLeft + col * (cardW + gapX) + cardW / 2;
            const cy  = gridTop  + row * (cardH + gapY) + cardH / 2;
            this._cards.push(this._createCard(cx, cy, cardW, cardH, data));
        });
    }

    // ─── Card creation ────────────────────────────────────────────────────────

    _createCard(cx, cy, w, h, data) {
        const r          = 10;
        const backColor  = 0x2980b9;
        const frontColor = 0x16213e;
        const matchColor = 0x1e8449;

        const bg = this.add.graphics();

        const drawBack = () => {
            bg.clear();
            bg.fillStyle(0x000000, 0.25);
            bg.fillRoundedRect(cx - w / 2 + 2, cy - h / 2 + 3, w, h, r);
            bg.fillStyle(backColor);
            bg.fillRoundedRect(cx - w / 2, cy - h / 2, w, h, r);
            bg.lineStyle(2, 0xffffff, 0.30);
            bg.strokeRoundedRect(cx - w / 2, cy - h / 2, w, h, r);
        };

        const drawFront = (matched) => {
            bg.clear();
            bg.fillStyle(0x000000, 0.25);
            bg.fillRoundedRect(cx - w / 2 + 2, cy - h / 2 + 3, w, h, r);
            bg.fillStyle(matched ? matchColor : frontColor);
            bg.fillRoundedRect(cx - w / 2, cy - h / 2, w, h, r);
            bg.lineStyle(2, matched ? 0x2ecc71 : 0xFFD700, matched ? 0.9 : 0.7);
            bg.strokeRoundedRect(cx - w / 2, cy - h / 2, w, h, r);
        };

        drawBack();

        // Face-down label
        const backLabel = this.add.text(cx, cy, '?', {
            fontSize: Math.floor(h * 0.45) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#ffffff',
            stroke: '#000',
            strokeThickness: 2
        }).setOrigin(0.5).setAlpha(0.7);

        // Face-up label — font size adapts to content length and card width
        const isEquation   = data.type === 'equation';
        const charEstimate = Math.max(data.display.length, 4);
        const fontByWidth  = Math.floor(w * 1.6 / charEstimate);
        const fontByHeight = Math.floor(h * (isEquation ? 0.27 : 0.42));
        const fontSize     = Math.max(14, Math.min(fontByWidth, fontByHeight));

        const frontLabel = this.add.text(cx, cy, data.display, {
            fontSize: fontSize + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#ffffff',
            stroke: '#000',
            strokeThickness: 3,
            align: 'center',
            wordWrap: { width: w - 8 }
        }).setOrigin(0.5).setVisible(false);

        const card = {
            cx, cy, w, h,
            bg, backLabel, frontLabel,
            pairId: data.pairId,
            type:   data.type,
            isFlipped:  false,
            isMatched:  false,
            drawBack,
            drawFront
        };

        const zone = this.add.zone(cx, cy, w, h).setInteractive({ useHandCursor: true });
        zone.on('pointerdown', () => this._onCardTap(card));
        card.zone = zone;

        return card;
    }

    // ─── Game logic ───────────────────────────────────────────────────────────

    _onCardTap(card) {
        if (this._locked || card.isFlipped || card.isMatched) return;
        this._flipCard(card, true);
        this._flipped.push(card);
        if (this._flipped.length === 2) {
            this._locked = true;
            this._checkMatch();
        }
    }

    _flipCard(card, faceUp) {
        card.isFlipped = faceUp;
        if (faceUp) {
            card.drawFront(false);
            card.backLabel.setVisible(false);
            card.frontLabel.setVisible(true);
        } else {
            card.drawBack();
            card.backLabel.setVisible(true);
            card.frontLabel.setVisible(false);
        }
    }

    _checkMatch() {
        const [a, b] = this._flipped;
        if (a.pairId === b.pairId) {
            // ── Match ──────────────────────────────────────────────────────
            a.isMatched = b.isMatched = true;
            a.drawFront(true);
            b.drawFront(true);
            a.zone.disableInteractive();
            b.zone.disableInteractive();

            this._matchedPairs++;
            this._pairsText.setText(this._matchedPairs + ' / ' + this._totalPairs);

            this._flipped = [];
            this._locked  = false;

            if (this._matchedPairs >= this._totalPairs) {
                this.time.delayedCall(600, () => this._showEnd(true));
            }
        } else {
            // ── No match — flip back after a short delay ──────────────────
            this.time.delayedCall(900, () => {
                this._flipCard(a, false);
                this._flipCard(b, false);
                this._flipped = [];
                this._locked  = false;
            });
        }
    }

    // ─── Timer ────────────────────────────────────────────────────────────────

    _startTimer() {
        this._timerEvent = this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: () => {
                this._timeLeft--;
                if (this._timerText) {
                    this._timerText.setText(this._formatTime(this._timeLeft));
                    if (this._timeLeft <= 30) {
                        this._timerText.setColor('#e74c3c');
                    } else if (this._timeLeft <= 60) {
                        this._timerText.setColor('#e67e22');
                    }
                }
                if (this._timeLeft <= 0) {
                    this._timerEvent.remove();
                    this._showEnd(false);
                }
            }
        });
    }

    _formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return '⏱ ' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    }

    // ─── End screen ───────────────────────────────────────────────────────────

    _showEnd(won) {
        if (this._timerEvent) this._timerEvent.remove();
        this._locked = true;

        const W = this.W, H = this.H;

        // Dim overlay
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.75);
        overlay.fillRect(0, 0, W, H);

        const emoji = won ? '🌟🌟🌟' : '⏰';
        const title = won ? '¡Juego completado!' : '¡Tiempo agotado!';
        const msg   = won
            ? '¡Encontraste todas las parejas!'
            : 'Encontraste ' + this._matchedPairs + ' de ' + this._totalPairs + ' parejas.';

        this.add.text(W / 2, H * 0.28, emoji, {
            fontSize: Math.floor(H * 0.09) + 'px'
        }).setOrigin(0.5);

        this.add.text(W / 2, H * 0.42, title, {
            fontSize: Math.floor(H * 0.052) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: won ? '#FFD700' : '#e74c3c',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);

        this.add.text(W / 2, H * 0.53, msg, {
            fontSize: Math.floor(H * 0.035) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#ecf0f1'
        }).setOrigin(0.5);

        this._makeSmallButton(W / 2, H * 0.66, 230, 55, '🔄 Jugar de nuevo', 0x2980b9, 0x1a5276, () => {
            this.cameras.main.fade(300, 0, 0, 0);
            this.time.delayedCall(300, () => this.scene.start('MathMemoryScene'));
        });

        this._makeSmallButton(W / 2, H * 0.77, 230, 55, '🏠 Menú principal', 0x27ae60, 0x1e8449, () => {
            this.cameras.main.fade(300, 0, 0, 0);
            this.time.delayedCall(300, () => this.scene.start('HubScene'));
        });
    }

    // ─── Utility ──────────────────────────────────────────────────────────────

    _makeSmallButton(x, y, w, h, label, color, hoverColor, callback) {
        const bg = this.add.graphics();
        const r  = 12;
        const draw = (c) => {
            bg.clear();
            bg.fillStyle(c);
            bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, r);
        };
        draw(color);
        this.add.text(x, y, label, {
            fontSize: Math.floor(h * 0.44) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#fff'
        }).setOrigin(0.5);
        const zone = this.add.zone(x, y, w, h).setInteractive({ useHandCursor: true });
        zone.on('pointerover', () => draw(hoverColor));
        zone.on('pointerout',  () => draw(color));
        zone.on('pointerdown', callback);
    }
}
