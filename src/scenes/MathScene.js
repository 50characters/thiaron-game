/**
 * MathScene — Addition and subtraction game, adapted by age group.
 *
 *   4-5  : addition only, numbers 1-10, dot-counting visual aid
 *   6-7  : addition + subtraction, numbers up to 20
 *   8-10 : addition + subtraction, numbers up to 100
 */
class MathScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MathScene' });
    }

    create() {
        this.W = this.scale.width;
        this.H = this.scale.height;

        this.score = 0;
        this.streak = GameState.consecutiveCorrect || 0;
        this.round = 0;
        this.totalRounds = 12;
        this.maxNum = GameState.mathMax();
        this.canSubtract = GameState.ageGroup !== '4-5';
        this.showDots = GameState.ageGroup === '4-5';

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

        const opLabel = this.canSubtract ? '➕➖ Matemáticas' : '➕ Sumas';
        this.add.text(W / 2, H * 0.065, opLabel, {
            fontSize: Math.floor(H * 0.048) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#FFD700',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);

        this._makeSmallButton(55, H - 30, 90, 40, '← Salir', 0x555555, 0x333333, () => {
            GameState.consecutiveCorrect = this.streak;
            this.cameras.main.fade(300, 0, 0, 0);
            this.time.delayedCall(300, () => this.scene.start('HubScene'));
        });
    }

    _buildQuestion() {
        const W = this.W, H = this.H;
        if (this._qGroup) this._qGroup.destroy(true);
        this._qGroup = this.add.group();

        if (this.round >= this.totalRounds) { this._showEnd(); return; }

        // Generate problem
        const { a, b, op, answer } = this._generateProblem();
        this._correctAnswer = answer;

        // Score display
        this._qGroup.add(this.add.text(W - 12, 8, '⭐ ' + this.score, {
            fontSize: Math.floor(H * 0.032) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#FFD700',
            backgroundColor: '#0f3460',
            padding: { x: 8, y: 4 }
        }).setOrigin(1, 0));

        // Soccer balls counter
        const ballStr = '⚽'.repeat(Math.max(0, GameState.soccerBalls));
        this._qGroup.add(this.add.text(12, 8, ballStr || '—', {
            fontSize: Math.floor(H * 0.032) + 'px',
            fontFamily: 'Arial, sans-serif',
            color: '#fff',
            backgroundColor: '#27ae60',
            padding: { x: 8, y: 4 }
        }).setOrigin(0, 0));

        // Progress
        this._qGroup.add(this.add.text(W / 2, H * 0.17, 'Ronda ' + (this.round + 1) + ' / ' + this.totalRounds, {
            fontSize: Math.floor(H * 0.028) + 'px', color: '#bdc3c7'
        }).setOrigin(0.5));

        // Streak flame
        if (this.streak >= 3) {
            this._qGroup.add(this.add.text(12, H * 0.135, '🔥 ×' + this.streak, {
                fontSize: Math.floor(H * 0.032) + 'px', color: '#ff6b35',
                backgroundColor: '#2c0000', padding: { x: 8, y: 4 }
            }).setOrigin(0, 0));
        }

        // Problem card
        const cardW = Math.min(W * 0.72, 400);
        const cardH = H * 0.19;
        const cx = W / 2;
        const cy = H * (this.showDots ? 0.31 : 0.37);

        const card = this.add.graphics();
        card.fillStyle(0x16213e);
        card.fillRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 22);
        card.lineStyle(4, 0xFFD700, 0.85);
        card.strokeRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 22);
        this._qGroup.add(card);

        const opSymbol = op === '+' ? '+' : '−';
        const problemStr = a + ' ' + opSymbol + ' ' + b + ' = ?';
        const pTxt = this.add.text(cx, cy, problemStr, {
            fontSize: Math.floor(H * 0.072) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#ffffff',
            stroke: '#000',
            strokeThickness: 5
        }).setOrigin(0.5);
        this._qGroup.add(pTxt);

        this.tweens.add({
            targets: [card, pTxt],
            scaleX: { from: 0.5, to: 1 },
            scaleY: { from: 0.5, to: 1 },
            duration: 350,
            ease: 'Back.Out'
        });

        // Visual dot aid for age 4-5
        if (this.showDots && a <= 10 && b <= 10) {
            this._drawDotAid(cx, H * 0.49, a, b, op);
        }

        // Answer buttons
        const choices = this._generateChoices(answer);
        const btnW = Math.min(W * 0.38, 200);
        const btnH = Math.floor(H * 0.1);
        const sy = this.showDots ? H * 0.65 : H * 0.56;
        const sx = W / 2 - btnW - 10;

        choices.forEach((val, i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const bx = sx + col * (btnW + 20) + btnW / 2;
            const by = sy + row * (btnH + 14) + btnH / 2;
            this._makeAnswerButton(bx, by, btnW, btnH, val, val === answer);
        });

        // Streak indicator (3 dots → 1 ball)
        const streakDots = [];
        for (let i = 0; i < 3; i++) {
            streakDots.push(i < (this.streak % 3) ? '🟢' : '⚪');
        }
        this._qGroup.add(this.add.text(W / 2, H * 0.895, streakDots.join(' '), {
            fontSize: Math.floor(H * 0.038) + 'px'
        }).setOrigin(0.5));
        this._qGroup.add(this.add.text(W / 2, H * 0.944, '3 seguidos = 1 balón ⚽', {
            fontSize: Math.floor(H * 0.028) + 'px',
            fontFamily: 'Arial, sans-serif',
            color: '#bdc3c7'
        }).setOrigin(0.5));
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

    _generateProblem() {
        const max = this.maxNum;
        let a, b, op, answer;

        if (this.canSubtract && Math.random() < 0.45) {
            op = '-';
            a = Phaser.Math.Between(Math.floor(max * 0.1), max);
            b = Phaser.Math.Between(0, a);
            answer = a - b;
        } else {
            op = '+';
            const half = Math.floor(max / 2);
            a = Phaser.Math.Between(1, half);
            b = Phaser.Math.Between(1, max - a);
            answer = a + b;
        }
        return { a, b, op, answer };
    }

    _generateChoices(correct) {
        const set = new Set([correct]);
        let attempts = 0;
        while (set.size < 4 && attempts < 100) {
            attempts++;
            const range = Math.max(5, Math.floor(this.maxNum * 0.15));
            const delta = Phaser.Math.Between(-range, range);
            const val = Math.max(0, correct + delta);
            if (val !== correct) set.add(val);
        }
        return Phaser.Utils.Array.Shuffle(Array.from(set));
    }

    _drawDotAid(cx, cy, a, b, op) {
        const W = this.W, H = this.H;
        const dotR = Math.floor(H * 0.016);
        const spacing = dotR * 2.8;
        const g = this.add.graphics();
        this._qGroup.add(g);

        const drawDots = (count, startX, color) => {
            g.fillStyle(color);
            for (let i = 0; i < count; i++) {
                g.fillCircle(startX + i * spacing, cy, dotR);
            }
        };

        const groupA_w = a * spacing;
        const groupB_w = b * spacing;
        const totalW = groupA_w + groupB_w + spacing * 1.5;
        const startX = cx - totalW / 2;

        drawDots(a, startX, 0x3498db);
        if (op === '+') {
            drawDots(b, startX + groupA_w + spacing * 1.5, 0xe74c3c);
        } else {
            // For subtraction, show group A and cross-out b dots
            g.fillStyle(0xe74c3c, 0.3);
            for (let i = a - b; i < a; i++) {
                g.fillCircle(startX + i * spacing, cy, dotR);
            }
            // Cross lines on removed dots
            g.lineStyle(2, 0xe74c3c);
            for (let i = a - b; i < a; i++) {
                const dx = startX + i * spacing;
                g.lineBetween(dx - dotR, cy - dotR, dx + dotR, cy + dotR);
                g.lineBetween(dx + dotR, cy - dotR, dx - dotR, cy + dotR);
            }
        }

        // Labels
        const labelA = this.add.text(startX + groupA_w / 2, cy + dotR * 2.5, String(a), {
            fontSize: Math.floor(H * 0.028) + 'px', color: '#3498db'
        }).setOrigin(0.5);
        this._qGroup.add(labelA);
    }

    _makeAnswerButton(x, y, w, h, value, isCorrect) {
        const r = Math.floor(h * 0.3);
        const bg = this.add.graphics();
        this._qGroup.add(bg);
        const baseColor = 0x16a085;

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

        const txt = this.add.text(x, y, String(value), {
            fontSize: Math.floor(h * 0.44) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#fff',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);
        this._qGroup.add(txt);

        const zone = this.add.zone(x, y, w, h).setInteractive({ useHandCursor: true });
        this._qGroup.add(zone);

        zone.on('pointerover', () => draw(0x0e6655));
        zone.on('pointerout',  () => draw(baseColor));
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
                if (this.streak > 0 && this.streak % 3 === 0) {
                    GameState.soccerBalls++;
                    this._showBallReward();
                }
                GameState.consecutiveCorrect = this.streak;
            } else {
                draw(0xe74c3c);
                this.streak = 0;
                GameState.consecutiveCorrect = 0;
                const hint = this.add.text(this.W / 2, this.H * 0.87, 'La respuesta era: ' + this._correctAnswer, {
                    fontSize: Math.floor(h * 0.36) + 'px',
                    color: '#FFD700',
                    backgroundColor: '#0f3460',
                    padding: { x: 10, y: 5 }
                }).setOrigin(0.5);
                this._qGroup.add(hint);
            }
            this.round++;
            this.time.delayedCall(1000, () => this._buildQuestion());
        });
    }

    _showEnd() {
        const W = this.W, H = this.H;
        const pct = Math.round((this.score / this.totalRounds) * 100);
        const emoji = pct >= 80 ? '🌟🌟🌟' : pct >= 50 ? '⭐⭐' : '⭐';

        this.add.text(W / 2, H * 0.28, '¡Ejercicio terminado!', {
            fontSize: Math.floor(H * 0.052) + 'px',
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

        const msg = pct >= 80 ? '¡Eres un genio de las matemáticas!' : pct >= 50 ? '¡Muy bien, sigue así!' : '¡No te rindas, practica más!';
        this.add.text(W / 2, H * 0.64, msg, {
            fontSize: Math.floor(H * 0.032) + 'px', color: '#2ecc71'
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
