/**
 * BasketballScene — Mini-game: touch the moving ball to shoot it at the basket.
 *
 * Mechanic:
 *   • Player has GameState.soccerBalls shots (capped at 9).
 *   • A basketball slides right ↔ left automatically below the hoop.
 *   • Tap / click the ball to shoot — a basket only counts when the ball is
 *     in the centre zone (aligned with the hoop) when tapped.
 *   • The defender roams continuously with random patterns; if it is in the
 *     centre zone when the ball is thrown the shot is blocked.
 *   • Shot zone = centre AND defender NOT at centre → BASKET! 🏀
 *   • Shot zone ≠ centre (left or right)             → MISS (wide of hoop)
 *   • Shot zone = centre AND defender at centre      → BLOCKED! 🙌
 *   • After all shots are used, show a summary and return to HubScene.
 */
class BasketballScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BasketballScene' });
    }

    create() {
        this.W = this.scale.width;
        this.H = this.scale.height;

        this.shots = Math.min(GameState.soccerBalls, 9);  // max 9 shots
        this.shotsLeft = this.shots;
        this.baskets = 0;
        this.shooting = false;
        this.youngMode = GameState.ageGroup === '4-5'; // no defender + larger ball for youngest group

        GameState.soccerBalls = 0; // consume all balls

        this._drawCourt();
        this._drawHoop();
        if (!this.youngMode) {
            this._drawDefender();
        }
        this._drawUI();

        if (!this.youngMode) {
            this._startDefenderMovement();
        }
        this._spawnBall();

        this.cameras.main.fadeIn(400);
    }

    _drawCourt() {
        const W = this.W, H = this.H;
        const g = this.add.graphics();

        // Arena background (dark)
        g.fillStyle(0x1a1a2e);
        g.fillRect(0, 0, W, H * 0.55);

        // Crowd silhouette
        g.fillStyle(0x2c3e50);
        for (let i = 0; i < 12; i++) {
            const cx = (W / 12) * i + W / 24;
            const cy = H * 0.42 + Math.sin(i * 1.3) * 18;
            g.fillEllipse(cx, cy, 36, 50);
        }

        // Court floor (hardwood)
        g.fillStyle(0xc68642);
        g.fillRect(0, H * 0.55, W, H * 0.45);

        // Hardwood stripes
        g.fillStyle(0xb5762e, 0.45);
        for (let i = 0; i < 8; i++) {
            g.fillRect(0, H * 0.55 + i * (H * 0.055), W, H * 0.028);
        }

        // Three-point arc (partial, from above)
        g.lineStyle(4, 0xffffff, 0.6);
        g.beginPath();
        g.arc(W / 2, H * 0.55, W * 0.38, 0, Math.PI, false);
        g.strokePath();

        // Free throw lane rectangle
        const laneW = W * 0.36;
        const laneH = H * 0.18;
        const lx = (W - laneW) / 2;
        const ly = H * 0.55;
        g.lineStyle(3, 0xffffff, 0.5);
        g.strokeRect(lx, ly, laneW, laneH);

        // Free throw circle
        g.strokeCircle(W / 2, ly + laneH, laneW * 0.42);

        // Center of court dot
        g.fillStyle(0xffffff, 0.7);
        g.fillCircle(W / 2, H * 0.82, 6);

        // Spotlights effect
        g.fillStyle(0xffffff, 0.03);
        g.fillTriangle(W * 0.2, 0, W * 0.1, H * 0.5, W * 0.3, H * 0.5);
        g.fillTriangle(W * 0.8, 0, W * 0.7, H * 0.5, W * 0.9, H * 0.5);
    }

    _drawHoop() {
        const W = this.W, H = this.H;
        const g = this.add.graphics();

        const cx = W / 2;
        const backboardY = H * 0.13;
        const backboardW = W * 0.28;
        const backboardH = H * 0.13;

        // Backboard
        g.fillStyle(0xffffff, 0.9);
        g.fillRect(cx - backboardW / 2, backboardY, backboardW, backboardH);
        g.lineStyle(4, 0xcccccc, 1);
        g.strokeRect(cx - backboardW / 2, backboardY, backboardW, backboardH);

        // Inner box on backboard
        const ibW = backboardW * 0.45;
        const ibH = backboardH * 0.4;
        g.lineStyle(3, 0xff6600, 0.8);
        g.strokeRect(cx - ibW / 2, backboardY + backboardH * 0.45, ibW, ibH);

        // Support pole
        g.fillStyle(0x888888);
        g.fillRect(cx - 5, backboardY + backboardH, 10, H * 0.1);

        // Rim (orange horizontal oval/ellipse)
        const rimY = backboardY + backboardH + 8;
        const rimR = W * 0.09;
        g.lineStyle(6, 0xff6600, 1);
        g.strokeEllipse(cx, rimY, rimR * 2, rimR * 0.5);

        // Net (lines hanging from rim)
        g.lineStyle(2, 0xffffff, 0.7);
        const netTop = rimY + rimR * 0.25;
        const netBottom = rimY + H * 0.06;
        const netSegs = 8;
        for (let i = 0; i <= netSegs; i++) {
            const angle = (i / netSegs) * Math.PI;
            const nx = cx - rimR * Math.cos(angle);
            g.lineBetween(nx, netTop, cx, netBottom);
        }
        // Horizontal net lines
        for (let i = 0; i < 4; i++) {
            const ny = netTop + (i * (netBottom - netTop)) / 4;
            const spread = rimR * (1 - (i / 4) * 0.7);
            g.lineBetween(cx - spread, ny, cx + spread, ny);
        }

        this.hoopBounds = {
            x: cx - W * 0.45,
            y: backboardY,
            w: W * 0.9,
            h: backboardH + rimR * 2,
            rimY: rimY,
            rimR: rimR,
            cx: cx
        };
    }

    _drawDefender() {
        const W = this.W, H = this.H;
        const g = this.add.graphics();

        const { rimY, cx } = this.hoopBounds;
        const defCy = rimY + H * 0.12;
        const defCx = cx;

        // Body (orange jersey)
        g.fillStyle(0xe67e22);
        g.fillRect(defCx - 16, defCy - 26, 32, 36);
        // Jersey number
        g.fillStyle(0xffffff);
        g.fillRect(defCx - 5, defCy - 18, 10, 14);

        // Head
        g.fillStyle(0xf1c27d);
        g.fillCircle(defCx, defCy - 38, 18);

        // Hair
        g.fillStyle(0x3d2b1f);
        g.fillRect(defCx - 16, defCy - 54, 32, 12);
        g.fillEllipse(defCx, defCy - 54, 36, 16);

        // Eyes
        g.fillStyle(0x000000);
        g.fillCircle(defCx - 6, defCy - 40, 3);
        g.fillCircle(defCx + 6, defCy - 40, 3);

        // Arms (raised in block position)
        g.fillStyle(0xf1c27d);
        g.fillRect(defCx - 34, defCy - 36, 18, 10);
        g.fillRect(defCx + 16, defCy - 36, 18, 10);
        // Hands
        g.fillCircle(defCx - 26, defCy - 36, 8);
        g.fillCircle(defCx + 26, defCy - 36, 8);

        // Shorts
        g.fillStyle(0x16213e);
        g.fillRect(defCx - 14, defCy + 10, 12, 22);
        g.fillRect(defCx + 2, defCy + 10, 12, 22);

        // Shoes
        g.fillStyle(0xffffff);
        g.fillRect(defCx - 17, defCy + 30, 16, 9);
        g.fillRect(defCx + 1, defCy + 30, 16, 9);
        g.fillStyle(0xe74c3c);
        g.fillRect(defCx - 17, defCy + 36, 16, 3);
        g.fillRect(defCx + 1, defCy + 36, 16, 3);

        this.defGraphics = g;
        this.defBase = { cx: defCx, cy: defCy };
    }

    _drawUI() {
        const W = this.W, H = this.H;

        // Header
        const hdr = this.add.graphics();
        hdr.fillStyle(0x0f3460, 0.9);
        hdr.fillRect(0, 0, W, H * 0.1);

        this.add.text(W / 2, H * 0.05, '🏀 ¡A Encestar!', {
            fontSize: Math.floor(H * 0.046) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#FFD700',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Shots counter
        this.shotsTxt = this.add.text(W / 2, H * 0.62, this._shotsStr(), {
            fontSize: Math.floor(H * 0.042) + 'px',
            fontFamily: 'Arial, sans-serif',
            color: '#fff'
        }).setOrigin(0.5);

        // Baskets counter
        this.basketsTxt = this.add.text(W / 2, H * 0.67, '🏀 Canastas: 0 / ' + this.shots, {
            fontSize: Math.floor(H * 0.036) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#f39c12'
        }).setOrigin(0.5);

        // Result message placeholder
        this.resultTxt = this.add.text(W / 2, H * 0.44, '', {
            fontSize: Math.floor(H * 0.065) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#FFD700',
            stroke: '#000',
            strokeThickness: 5
        }).setOrigin(0.5).setDepth(5);

        // Instruction
        this.add.text(W / 2, H * 0.92, '¡Toca el balón para lanzar!', {
            fontSize: Math.floor(H * 0.028) + 'px',
            fontFamily: 'Arial, sans-serif',
            color: '#bdc3c7'
        }).setOrigin(0.5);

        // Back button
        this._makeSmallButton(55, H - 30, 90, 40, '← Salir', 0x555555, 0x333333, () => {
            this.cameras.main.fade(300, 0, 0, 0);
            this.time.delayedCall(300, () => this.scene.start('HubScene'));
        });
    }

    _shotsStr() {
        return '🏀'.repeat(this.shotsLeft) + '⚫'.repeat(this.shots - this.shotsLeft);
    }

    // ─── Defender continuous movement ────────────────────────────────────────

    _startDefenderMovement() {
        this.defTween = null;
        this.defTimer = null;
        this._defMoveLoop();
    }

    _defMoveLoop() {
        if (this.shooting || !this.scene.isActive()) return;

        const targets = [-80, -55, -30, 0, 30, 55, 80];
        const target = Phaser.Utils.Array.GetRandom(targets);
        const duration = Phaser.Math.Between(300, 750);

        this.defTween = this.tweens.add({
            targets: this.defGraphics,
            x: target,
            duration: duration,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                if (!this.shooting && this.scene.isActive()) {
                    const pause = Phaser.Math.Between(80, 450);
                    this.defTimer = this.time.delayedCall(pause, () => this._defMoveLoop());
                }
            }
        });
    }

    _stopDefenderMovement() {
        if (this.defTimer) { this.defTimer.remove(false); this.defTimer = null; }
        if (this.defTween) { this.defTween.stop(); this.defTween = null; }
    }

    // ─── Ball spawning and shooting ──────────────────────────────────────────

    _spawnBall() {
        const W = this.W, H = this.H;
        const { x: hx, w: hw } = this.hoopBounds;

        if (this.ball) { this.ball.destroy(); this.ball = null; }
        if (this.ballTween) { this.ballTween.stop(); this.ballTween = null; }

        const leftX  = hx + hw * 0.1;
        const rightX = hx + hw * 0.9;
        const ballY  = H * 0.78;

        this.ball = this.add.text(rightX, ballY, '🏀', {
            fontSize: this.youngMode ? '52px' : '36px'
        }).setOrigin(0.5).setDepth(4).setInteractive({ useHandCursor: true });

        this.ball.on('pointerdown', () => this._throwBall());

        this.ballTween = this.tweens.add({
            targets: this.ball,
            x: leftX,
            duration: 1300,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }

    _throwBall() {
        if (this.shotsLeft <= 0 || this.shooting) return;
        this.shooting = true;

        this.ballTween.stop();
        this.ball.disableInteractive();
        if (!this.youngMode) {
            this._stopDefenderMovement();
        }

        // Determine shot direction from ball's X relative to hoop width
        const { x: hx, w: hw } = this.hoopBounds;
        const relPos = (this.ball.x - hx) / hw;

        let playerDir;
        if      (relPos < 0.33) playerDir = 'left';
        else if (relPos > 0.67) playerDir = 'right';
        else                    playerDir = 'center';

        // A basket only scores when the ball passes through the centre (where the hoop is)
        let isBasket = (playerDir === 'center');
        let isBlocked = false;
        if (!this.youngMode) {
            const defX = this.defGraphics.x;
            let defDir;
            if      (defX < -25) defDir = 'left';
            else if (defX >  25) defDir = 'right';
            else                 defDir = 'center';
            // Also blocked when the defender is guarding the centre
            if (defDir === 'center') { isBasket = false; isBlocked = true; }
            this._animateDefenderReaction(defDir);
        }
        this._animateBall(playerDir, isBasket);

        this.time.delayedCall(700, () => {
            if (isBasket) {
                this.baskets++;
                this.resultTxt.setText('🏀 ¡CANASTA!').setColor('#FFD700');
            } else if (isBlocked) {
                this.resultTxt.setText('🙌 ¡Bloqueado!').setColor('#e74c3c');
            } else {
                this.resultTxt.setText('💨 ¡Fallado!').setColor('#e74c3c');
            }

            this.tweens.add({
                targets: this.resultTxt,
                scaleX: { from: 0.5, to: 1.1 },
                scaleY: { from: 0.5, to: 1.1 },
                duration: 350,
                ease: 'Back.Out',
                onComplete: () => {
                    this.time.delayedCall(600, () => {
                        this.tweens.add({
                            targets: this.resultTxt,
                            alpha: 0, duration: 300,
                            onComplete: () => { this.resultTxt.setAlpha(1).setText(''); }
                        });
                    });
                }
            });

            this.shotsLeft--;
            this.shotsTxt.setText(this._shotsStr());
            this.basketsTxt.setText('🏀 Canastas: ' + this.baskets + ' / ' + this.shots);

            this.time.delayedCall(900, () => {
                if (!this.youngMode) {
                    this._resetDefender();
                }
                if (this.ball) { this.ball.destroy(); this.ball = null; }

                if (this.shotsLeft <= 0) {
                    this.time.delayedCall(300, () => this._showSummary());
                } else {
                    this.shooting = false;
                    if (!this.youngMode) {
                        this._startDefenderMovement();
                    }
                    this._spawnBall();
                }
            });
        });
    }

    _animateBall(dir, isBasket) {
        const { rimY, cx } = this.hoopBounds;

        const endX = dir === 'left'  ? cx - this.W * 0.15
                   : dir === 'right' ? cx + this.W * 0.15
                   : cx;
        const endY = rimY;

        this.tweens.add({
            targets: this.ball,
            x: endX,
            y: endY,
            scaleX: { from: 1.2, to: 0.6 },
            scaleY: { from: 1.2, to: 0.6 },
            duration: 600,
            ease: 'Power2'
        });
    }

    _animateDefenderReaction(currentDir) {
        const targetX = currentDir === 'left'  ? -85
                      : currentDir === 'right' ?  85
                      : 0;
        const targetY = currentDir === 'center' ? -10 : 12;

        this.tweens.add({
            targets: this.defGraphics,
            x: targetX,
            y: targetY,
            duration: 400,
            ease: 'Power3'
        });
    }

    _resetDefender() {
        this.tweens.add({
            targets: this.defGraphics,
            x: 0,
            y: 0,
            duration: 400,
            ease: 'Power2'
        });
    }

    _showSummary() {
        const W = this.W, H = this.H;

        const ov = this.add.graphics();
        ov.fillStyle(0x000000, 0.7);
        ov.fillRect(0, 0, W, H);

        const panelW = W * 0.7;
        const panelH = H * 0.55;
        const px = (W - panelW) / 2;
        const py = (H - panelH) / 2;

        const panel = this.add.graphics();
        panel.fillStyle(0x0f3460);
        panel.fillRoundedRect(px, py, panelW, panelH, 24);
        panel.lineStyle(4, 0xFFD700, 0.9);
        panel.strokeRoundedRect(px, py, panelW, panelH, 24);

        const cx = W / 2;

        this.add.text(cx, py + panelH * 0.18, '🏆 Resultado Final', {
            fontSize: Math.floor(H * 0.048) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#FFD700',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);

        const pct = this.shots > 0 ? Math.round((this.baskets / this.shots) * 100) : 0;
        const emoji = pct >= 80 ? '🌟🌟🌟' : pct >= 50 ? '⭐⭐' : '⭐';

        this.add.text(cx, py + panelH * 0.42, emoji, {
            fontSize: Math.floor(H * 0.065) + 'px'
        }).setOrigin(0.5);

        this.add.text(cx, py + panelH * 0.6, 'Canastas: ' + this.baskets + ' / ' + this.shots, {
            fontSize: Math.floor(H * 0.044) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#ecf0f1'
        }).setOrigin(0.5);

        const msg = pct >= 80 ? '¡Eres una estrella!' : pct >= 50 ? '¡Muy bien!' : '¡Sigue practicando!';
        this.add.text(cx, py + panelH * 0.75, msg, {
            fontSize: Math.floor(H * 0.036) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#f39c12'
        }).setOrigin(0.5);

        this._makeSmallButton(cx, py + panelH * 0.9, 200, 50, 'Continuar ▶', 0x27ae60, 0x1e8449, () => {
            this.cameras.main.fade(300, 0, 0, 0);
            this.time.delayedCall(300, () => this.scene.start('HubScene'));
        });
    }

    _makeSmallButton(x, y, w, h, label, color, hoverColor, callback) {
        const bg = this.add.graphics();
        const r = 12;
        const draw = (c) => {
            bg.clear();
            bg.fillStyle(c);
            bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, r);
        };
        draw(color);
        this.add.text(x, y, label, {
            fontSize: Math.floor(h * 0.46) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#fff',
            stroke: '#000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(10);
        const zone = this.add.zone(x, y, w, h).setInteractive({ useHandCursor: true }).setDepth(10);
        zone.on('pointerover', () => draw(hoverColor));
        zone.on('pointerout',  () => draw(color));
        zone.on('pointerdown',   callback);
    }
}
