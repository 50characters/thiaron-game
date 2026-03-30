/**
 * MultiplicationScene — Times-tables quiz.
 *
 * Rules:
 *   • Show a multiplication problem with 4 answer choices.
 *   • Every 3 consecutive correct answers → earn 1 soccer ball (⚽).
 *   • When 3+ balls accumulated the HubScene offers the soccer mini-game.
 *   • Wrong answer resets the consecutive streak.
 */
class MultiplicationScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MultiplicationScene' });
    }

    create() {
        this.W = this.scale.width;
        this.H = this.scale.height;

        const range = GameState.multiplicationRange();
        this.minFactor = range.min;
        this.maxFactor = range.max;

        this.streak = GameState.consecutiveCorrect || 0;
        this.score = 0;
        this.totalAnswered = 0;

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

        // Header bar
        const hdr = this.add.graphics();
        hdr.fillStyle(0x0f3460, 0.95);
        hdr.fillRect(0, 0, W, H * 0.13);

        this.add.text(W / 2, H * 0.065, '✖️  Tablas de Multiplicar', {
            fontSize: Math.floor(H * 0.048) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#FFD700',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Back button
        this._makeSmallButton(55, H - 30, 90, 40, '← Salir', 0x555555, 0x333333, () => {
            GameState.consecutiveCorrect = this.streak;
            this.cameras.main.fade(300, 0, 0, 0);
            this.time.delayedCall(300, () => this.scene.start('HubScene'));
        });
    }

    _buildQuestion() {
        const W = this.W, H = this.H;

        // Clear previous question elements
        if (this._questionGroup) this._questionGroup.destroy(true);
        this._questionGroup = this.add.group();

        // Generate problem
        const a = Phaser.Math.Between(this.minFactor, this.maxFactor);
        const b = Phaser.Math.Between(this.minFactor, this.maxFactor);
        this._correctAnswer = a * b;

        // Status row: streak + balls
        this._refreshStatus();

        // Problem card
        const cardW = Math.min(W * 0.75, 420);
        const cardH = H * 0.2;
        const cardX = W / 2;
        const cardY = H * 0.33;

        const card = this.add.graphics();
        card.fillStyle(0x16213e);
        card.fillRoundedRect(cardX - cardW / 2, cardY - cardH / 2, cardW, cardH, 20);
        card.lineStyle(3, 0xFFD700, 0.8);
        card.strokeRoundedRect(cardX - cardW / 2, cardY - cardH / 2, cardW, cardH, 20);
        this._questionGroup.add(card);

        const questionTxt = this.add.text(cardX, cardY, a + ' × ' + b + ' = ?', {
            fontSize: Math.floor(H * 0.075) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#ffffff',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);
        this._questionGroup.add(questionTxt);

        // Generate 4 unique choices
        const choices = this._generateChoices(this._correctAnswer);

        const btnW = Math.min(W * 0.38, 200);
        const btnH = Math.floor(H * 0.105);
        const startX = W / 2 - btnW / 2 - 14;
        const startY = H * 0.54;

        choices.forEach((val, i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const bx = startX + col * (btnW + 28) + btnW / 2;
            const by = startY + row * (btnH + 18) + btnH / 2;
            this._makeAnswerButton(bx, by, btnW, btnH, val, val === this._correctAnswer);
        });
    }

    _generateChoices(correct) {
        const set = new Set([correct]);
        while (set.size < 4) {
            const delta = Phaser.Math.Between(-8, 8);
            const val = Math.max(0, correct + delta);
            if (val !== correct) set.add(val);
        }
        return Phaser.Utils.Array.Shuffle(Array.from(set));
    }

    _makeAnswerButton(x, y, w, h, value, isCorrect) {
        const r = Math.floor(h * 0.3);
        const bg = this.add.graphics();
        this._questionGroup.add(bg);

        const draw = (c) => {
            bg.clear();
            bg.fillStyle(0x000000, 0.2);
            bg.fillRoundedRect(x - w / 2 + 3, y - h / 2 + 4, w, h, r);
            bg.fillStyle(c);
            bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, r);
            bg.lineStyle(2, 0xffffff, 0.4);
            bg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, r);
        };
        draw(0x2980b9);

        const txt = this.add.text(x, y, String(value), {
            fontSize: Math.floor(h * 0.44) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#fff',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);
        this._questionGroup.add(txt);

        const zone = this.add.zone(x, y, w, h).setInteractive({ useHandCursor: true });
        this._questionGroup.add(zone);

        zone.on('pointerover', () => draw(0x1a5276));
        zone.on('pointerout',  () => draw(0x2980b9));
        zone.on('pointerdown', () => {
            this._questionGroup.getChildren().forEach(c => {
                if (c.input) c.input.enabled = false;
            });
            if (isCorrect) {
                draw(0x27ae60);
                this._onCorrect(x, y);
            } else {
                draw(0xe74c3c);
                this._onWrong(x, y, value, this._correctAnswer);
            }
        });
    }

    _onCorrect(x, y) {
        this.streak++;
        this.score++;
        this.totalAnswered++;

        const W = this.W, H = this.H;

        // Floating +1 text
        const bonus = this.add.text(x, y - 30, '✓ +1', {
            fontSize: Math.floor(H * 0.05) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#2ecc71'
        }).setOrigin(0.5);
        this.tweens.add({ targets: bonus, y: y - 90, alpha: 0, duration: 900, onComplete: () => bonus.destroy() });

        // Ball earned?
        if (this.streak % 3 === 0) {
            GameState.soccerBalls++;
            this._showBallReward();
        }

        GameState.consecutiveCorrect = this.streak;
        this._refreshStatus();

        this.time.delayedCall(900, () => this._buildQuestion());
    }

    _onWrong(x, y, chosen, correct) {
        this.totalAnswered++;
        this.streak = 0;
        GameState.consecutiveCorrect = 0;

        const W = this.W, H = this.H;
        const txt = this.add.text(x, y - 30, '✗ ' + chosen, {
            fontSize: Math.floor(H * 0.048) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#e74c3c'
        }).setOrigin(0.5);
        this.tweens.add({ targets: txt, y: y - 80, alpha: 0, duration: 900, onComplete: () => txt.destroy() });

        // Show correct answer hint
        const hint = this.add.text(W / 2, H * 0.82, 'La respuesta era: ' + correct, {
            fontSize: Math.floor(H * 0.038) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#FFD700',
            backgroundColor: '#0f3460',
            padding: { x: 12, y: 6 }
        }).setOrigin(0.5);
        this._questionGroup.add(hint);

        this._refreshStatus();
        this.time.delayedCall(1400, () => this._buildQuestion());
    }

    _showBallReward() {
        const W = this.W, H = this.H;
        const panel = this.add.text(W / 2, H * 0.5, '⚽ ¡Ganaste un balón!', {
            fontSize: Math.floor(H * 0.055) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#FFD700',
            stroke: '#000',
            strokeThickness: 4,
            backgroundColor: '#16213e',
            padding: { x: 16, y: 10 }
        }).setOrigin(0.5).setDepth(10);

        this.tweens.add({
            targets: panel,
            scaleX: { from: 0.5, to: 1 },
            scaleY: { from: 0.5, to: 1 },
            alpha: { from: 0, to: 1 },
            duration: 400,
            ease: 'Back.Out',
            onComplete: () => {
                this.time.delayedCall(800, () => {
                    this.tweens.add({ targets: panel, alpha: 0, duration: 400, onComplete: () => panel.destroy() });
                });
            }
        });
    }

    _refreshStatus() {
        const W = this.W, H = this.H;
        if (this._statusGroup) this._statusGroup.destroy(true);
        this._statusGroup = this.add.group();

        // Score
        const scoreTxt = this.add.text(W - 12, 8, '⭐ ' + this.score, {
            fontSize: Math.floor(H * 0.032) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#FFD700',
            backgroundColor: '#0f3460',
            padding: { x: 8, y: 4 }
        }).setOrigin(1, 0);
        this._statusGroup.add(scoreTxt);

        // Soccer balls row
        const ballStr = '⚽'.repeat(Math.max(0, GameState.soccerBalls));
        const ballTxt = this.add.text(12, 8, ballStr || '—', {
            fontSize: Math.floor(H * 0.032) + 'px',
            fontFamily: 'Arial, sans-serif',
            color: '#fff',
            backgroundColor: '#27ae60',
            padding: { x: 8, y: 4 }
        }).setOrigin(0, 0);
        this._statusGroup.add(ballTxt);

        // Streak indicator
        const streakDots = [];
        for (let i = 0; i < 3; i++) {
            streakDots.push(i < (this.streak % 3) ? '🟢' : '⚪');
        }
        const streakTxt = this.add.text(W / 2, H * 0.885, streakDots.join(' '), {
            fontSize: Math.floor(H * 0.038) + 'px'
        }).setOrigin(0.5);
        this._statusGroup.add(streakTxt);

        const hintTxt = this.add.text(W / 2, H * 0.935, '3 seguidos = 1 balón ⚽', {
            fontSize: Math.floor(H * 0.028) + 'px',
            fontFamily: 'Arial, sans-serif',
            color: '#bdc3c7'
        }).setOrigin(0.5);
        this._statusGroup.add(hintTxt);
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
            fontSize: Math.floor(h * 0.48) + 'px',
            fontFamily: 'Arial, sans-serif',
            color: '#fff'
        }).setOrigin(0.5);
        const zone = this.add.zone(x, y, w, h).setInteractive({ useHandCursor: true });
        zone.on('pointerover', () => draw(hoverColor));
        zone.on('pointerout',  () => draw(color));
        zone.on('pointerdown',   callback);