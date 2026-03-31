/**
 * ReadingScene — Reading comprehension game for ages 8-10.
 *
 * Passage data is loaded from src/data/reading_passages.json so that
 * content can be updated independently of the game logic.
 *
 * Shows a short text passage (scrollable) and asks multiple-choice
 * questions about it. Texts are shuffled to minimise repetition.
 *
 * Each passage has 3 questions; the game plays through 9 questions
 * total (3 passages × 3 questions).
 */
class ReadingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ReadingScene' });
    }

    preload() {
        this.load.json('readingPassages', 'src/data/reading_passages.json');
    }

    create() {
        this.W = this.scale.width;
        this.H = this.scale.height;

        this.score       = 0;
        this.streak      = 0;
        this.passageIdx  = 0;       // current passage (0-based)
        this.questionIdx = 0;       // question within the current passage
        this.totalPasses = 3;       // passages per game session

        // Load passages from cache (preloaded in preload()) and shuffle
        const data = this.cache.json.get('readingPassages');
        this._passages = Phaser.Utils.Array.Shuffle(data.passages).slice(0, this.totalPasses);
        this._totalQuestions = this._passages.reduce((s, p) => s + p.questions.length, 0);
        this._answeredQuestions = 0;

        this._wheelHandler = null;
        this.events.once('shutdown', () => this._removeWheelHandler());

        this._drawBackground();
        this._drawHeader();
        this._showPassage();
        this.cameras.main.fadeIn(400);
    }

    // ─── Background & header ─────────────────────────────────────────────────

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

        this.add.text(W / 2, H * 0.065, '📖 Lectura', {
            fontSize: Math.floor(H * 0.048) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#FFD700',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);

        this._makeSmallButton(55, H - 30, 90, 40, '← Salir', 0x555555, 0x333333, () => {
            this._removeWheelHandler();
            this.cameras.main.fade(300, 0, 0, 0);
            this.time.delayedCall(300, () => this.scene.start('HubScene'));
        });
    }

    // ─── Passage display ─────────────────────────────────────────────────────

    _showPassage() {
        const W = this.W, H = this.H;

        // Remove previous wheel handler before rebuilding
        this._removeWheelHandler();

        if (this._mainGroup) this._mainGroup.destroy(true);
        this._mainGroup = this.add.group();

        const passage = this._passages[this.passageIdx];

        // progress indicator
        const overallRound = this._answeredQuestions + 1;
        this._mainGroup.add(this.add.text(W / 2, H * 0.17,
            'Pregunta ' + overallRound + ' / ' + this._totalQuestions, {
            fontSize: Math.floor(H * 0.028) + 'px',
            color: '#bdc3c7'
        }).setOrigin(0.5));

        // score
        this._mainGroup.add(this.add.text(W - 12, 8, '⭐ ' + this.score, {
            fontSize: Math.floor(H * 0.032) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#FFD700',
            backgroundColor: '#0f3460',
            padding: { x: 8, y: 4 }
        }).setOrigin(1, 0));

        // streak
        if (this.streak >= 3) {
            this._mainGroup.add(this.add.text(12, 8, '🔥 ×' + this.streak, {
                fontSize: Math.floor(H * 0.032) + 'px',
                color: '#ff6b35',
                backgroundColor: '#2c0000',
                padding: { x: 8, y: 4 }
            }).setOrigin(0, 0));
        }

        // passage title
        this._mainGroup.add(this.add.text(W / 2, H * 0.22, passage.title, {
            fontSize: Math.floor(H * 0.038) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#FFD700',
            stroke: '#000',
            strokeThickness: 2
        }).setOrigin(0.5));

        // ── Scrollable text box ───────────────────────────────────────────────
        const boxPad = 14;
        const boxW   = W * 0.88;
        const boxH   = H * 0.30;
        const boxX   = (W - boxW) / 2;
        const boxY   = H * 0.27;

        // Background card
        const textBox = this.add.graphics();
        textBox.fillStyle(0x0d2137, 0.95);
        textBox.fillRoundedRect(boxX, boxY, boxW, boxH, 18);
        textBox.lineStyle(2, 0x2980b9, 0.8);
        textBox.strokeRoundedRect(boxX, boxY, boxW, boxH, 18);
        this._mainGroup.add(textBox);

        // Passage text object — may be taller than the box
        const passageText = this.add.text(
            boxX + boxPad,
            boxY + boxPad,
            passage.text,
            {
                fontSize: Math.floor(H * 0.027) + 'px',
                fontFamily: 'Arial, sans-serif',
                color: '#ecf0f1',
                wordWrap: { width: boxW - boxPad * 2 },
                lineSpacing: 4
            }
        ).setOrigin(0, 0);
        this._mainGroup.add(passageText);

        // Geometry mask — clips the text to the box boundaries
        const maskGfx = this.make.graphics({ add: false });
        maskGfx.fillStyle(0xffffff);
        maskGfx.fillRect(boxX + 2, boxY + 2, boxW - 4, boxH - 4);
        passageText.setMask(maskGfx.createGeometryMask());

        // Scroll logic
        const visibleH  = boxH - 2 * boxPad;
        const maxScroll = Math.max(0, passageText.height - visibleH);
        let   scrollY   = 0;

        const applyScroll = (newVal) => {
            scrollY = Phaser.Math.Clamp(newVal, 0, maxScroll);
            passageText.y = boxY + boxPad - scrollY;
        };

        if (maxScroll > 0) {
            // Animated "scroll" hint at the bottom-right of the box
            const arrow = this.add.text(
                boxX + boxW - 10, boxY + boxH - 8, '▼ desliza',
                { fontSize: '13px', color: '#7fb3d3' }
            ).setOrigin(1, 1);
            this._mainGroup.add(arrow);
            this.tweens.add({
                targets: arrow, alpha: { from: 1, to: 0.2 },
                duration: 600, yoyo: true, repeat: -1
            });
        }

        // Interactive drag zone over the text box
        const scrollZone = this.add.zone(
            boxX + boxW / 2, boxY + boxH / 2, boxW, boxH
        ).setInteractive();
        this._mainGroup.add(scrollZone);

        let dragStartY      = 0;
        let dragStartScroll = 0;
        scrollZone.on('pointerdown', (p) => {
            dragStartY      = p.y;
            dragStartScroll = scrollY;
        });
        scrollZone.on('pointermove', (p) => {
            if (!p.isDown) return;
            applyScroll(dragStartScroll + (dragStartY - p.y));
        });

        // Mouse-wheel / trackpad scroll
        this._wheelHandler = (pointer, gameObjects, deltaX, deltaY) => {
            applyScroll(scrollY + deltaY * 0.5);
        };
        this.input.on('wheel', this._wheelHandler);

        // ── Question ─────────────────────────────────────────────────────────
        const q = passage.questions[this.questionIdx];
        this._mainGroup.add(this.add.text(W / 2, H * 0.645, q.q, {
            fontSize: Math.floor(H * 0.033) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#ecf0f1',
            wordWrap: { width: W * 0.9 },
            align: 'center'
        }).setOrigin(0.5));

        this._correctAnswer = q.correct;

        // answer buttons (2 × 2 grid) — height adapts to wrapped text
        const choices = Phaser.Utils.Array.Shuffle([q.correct, ...q.wrong]);
        const btnW  = Math.min(W * 0.44, 230);
        const minH  = Math.floor(H * 0.085);
        const vPad  = 14;
        const gapX  = 10;
        const gapY  = 10;
        const sy    = H * 0.715;

        // Maximum height each row may occupy so the grid stays on screen
        const maxRowH = Math.floor((H * 0.965 - sy - gapY) / 2);

        // Measure each button's required height at the given font size
        const measureHeights = (fs) => choices.map(ch => {
            const t = this.add.text(-9999, -9999, ch, {
                fontSize: fs + 'px',
                fontFamily: 'Arial Rounded MT Bold, Arial',
                wordWrap: { width: btnW - 20 },
                align: 'center'
            });
            const needed = Math.max(minH, Math.ceil(t.height) + vPad * 2);
            t.destroy();
            return needed;
        });

        // Start at a comfortable font size (~28% of minH); shrink until everything fits
        let fSize = Math.floor(minH * 0.28);
        let btnHeights = measureHeights(fSize);
        while (Math.max(...btnHeights) > maxRowH && fSize > 13) { // 13px is the minimum readable size
            fSize--;
            btnHeights = measureHeights(fSize);
        }

        const row0H = Math.min(maxRowH, Math.max(btnHeights[0], btnHeights[1]));
        const row1H = Math.min(maxRowH, Math.max(btnHeights[2], btnHeights[3]));
        const gridW = btnW * 2 + gapX;
        const sx    = (W - gridW) / 2;

        choices.forEach((choice, i) => {
            const col  = i % 2;
            const row  = Math.floor(i / 2);
            const rowH = row === 0 ? row0H : row1H;
            const bx   = sx + col * (btnW + gapX) + btnW / 2;
            const by   = sy + (row === 0 ? row0H / 2 : row0H + gapY + row1H / 2);
            this._makeAnswerButton(bx, by, btnW, rowH, choice, choice === q.correct, fSize);
        });

        // Entrance animation for the text card
        this.tweens.add({
            targets: textBox,
            alpha: { from: 0, to: 1 },
            duration: 400,
            ease: 'Quad.Out'
        });
    }

    // ─── Answer buttons ───────────────────────────────────────────────────────

    _makeAnswerButton(x, y, w, h, label, isCorrect, fontSize) {
        const fs = fontSize !== undefined ? fontSize : Math.floor(h * 0.30);
        const r  = Math.floor(h * 0.25);
        const bg = this.add.graphics();
        this._mainGroup.add(bg);

        const baseColor = 0x1a5276;
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

        const txt = this.add.text(x, y, label, {
            fontSize: fs + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#fff',
            stroke: '#000',
            strokeThickness: 2,
            wordWrap: { width: w - 20 },
            align: 'center'
        }).setOrigin(0.5);
        this._mainGroup.add(txt);

        const zone = this.add.zone(x, y, w, h).setInteractive({ useHandCursor: true });
        this._mainGroup.add(zone);

        zone.on('pointerover', () => draw(0x2980b9));
        zone.on('pointerout',  () => draw(baseColor));
        zone.on('pointerdown', () => {
            // Disable all buttons immediately
            this._mainGroup.getChildren().forEach(c => { if (c.input) c.input.enabled = false; });

            if (isCorrect) {
                draw(0x27ae60);
                this.score++;
                this.streak++;
                const bonus = this.add.text(x, y - 28, '✓ +1', {
                    fontSize: Math.floor(h * 0.44) + 'px',
                    color: '#2ecc71'
                }).setOrigin(0.5);
                this.tweens.add({ targets: bonus, y: y - 80, alpha: 0, duration: 800, onComplete: () => bonus.destroy() });
            } else {
                draw(0xe74c3c);
                this.streak = 0;
                const hint = this.add.text(this.W / 2, this.H * 0.97,
                    'Correcto: ' + this._correctAnswer, {
                    fontSize: Math.floor(h * 0.34) + 'px',
                    color: '#FFD700',
                    backgroundColor: '#0f3460',
                    padding: { x: 10, y: 5 }
                }).setOrigin(0.5, 1);
                this._mainGroup.add(hint);
            }

            this._answeredQuestions++;
            this.time.delayedCall(1000, () => this._advance());
        });
    }

    // ─── Advance logic ────────────────────────────────────────────────────────

    _advance() {
        const passage = this._passages[this.passageIdx];
        this.questionIdx++;

        if (this.questionIdx >= passage.questions.length) {
            // Move to next passage
            this.passageIdx++;
            this.questionIdx = 0;
        }

        if (this.passageIdx >= this._passages.length) {
            this._showEnd();
        } else {
            this._showPassage();
        }
    }

    // ─── End screen ───────────────────────────────────────────────────────────

    _showEnd() {
        if (this._mainGroup) this._mainGroup.destroy(true);

        const W = this.W, H = this.H;
        const pct = Math.round((this.score / this._totalQuestions) * 100);
        const emoji = pct >= 80 ? '🌟🌟🌟' : pct >= 50 ? '⭐⭐' : '⭐';

        this.add.text(W / 2, H * 0.28, '¡Juego terminado!', {
            fontSize: Math.floor(H * 0.055) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#FFD700',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);

        this.add.text(W / 2, H * 0.42, emoji, {
            fontSize: Math.floor(H * 0.08) + 'px'
        }).setOrigin(0.5);

        this.add.text(W / 2, H * 0.54,
            'Aciertos: ' + this.score + ' / ' + this._totalQuestions, {
            fontSize: Math.floor(H * 0.042) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#ecf0f1'
        }).setOrigin(0.5);

        const msg = pct >= 80
            ? '¡Eres un lector increíble! 🚀'
            : pct >= 50
            ? '¡Muy bien hecho! Sigue leyendo 📚'
            : '¡Practica más lectura! 💪';

        this.add.text(W / 2, H * 0.64, msg, {
            fontSize: Math.floor(H * 0.034) + 'px',
            color: '#2ecc71'
        }).setOrigin(0.5);

        this._makeSmallButton(W / 2, H * 0.77, 220, 52, 'Continuar ▶', 0x27ae60, 0x1e8449, () => {
            this.cameras.main.fade(300, 0, 0, 0);
            this.time.delayedCall(300, () => this.scene.start('HubScene'));
        });
    }

    // ─── Utility ─────────────────────────────────────────────────────────────

    _removeWheelHandler() {
        if (this._wheelHandler) {
            this.input.off('wheel', this._wheelHandler);
            this._wheelHandler = null;
        }
    }

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
            fontSize: Math.floor(h * 0.46) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#fff'
        }).setOrigin(0.5);
        const zone = this.add.zone(x, y, w, h).setInteractive({ useHandCursor: true });
        zone.on('pointerover', () => draw(hoverColor));
        zone.on('pointerout',  () => draw(color));
        zone.on('pointerdown', callback);
    }
}
