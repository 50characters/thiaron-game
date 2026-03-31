/**
 * SoccerScene — Mini-game: touch the moving ball to shoot it at the goalkeeper.
 *
 * Mechanic:
 *   • Player has GameState.soccerBalls shots (capped at 9).
 *   • A soccer ball slides right ↔ left automatically across the penalty area.
 *   • Tap / click the ball to shoot — direction is determined by the ball's
 *     current X position in the goal (left / centre / right zone).
 *   • The goalkeeper roams continuously with random patterns; its zone when
 *     the ball is kicked decides the outcome.
 *   • Shot zone ≠ goalkeeper zone → GOAL! ⚽
 *   • Shot zone == goalkeeper zone → SAVED! 🧤
 *   • After all shots are used, show a summary and return to HubScene.
 */
class SoccerScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SoccerScene' });
    }

    create() {
        this.W = this.scale.width;
        this.H = this.scale.height;

        this.shots = Math.min(GameState.soccerBalls, 9);  // max 9 shots
        this.shotsLeft = this.shots;
        this.goals = 0;
        this.shooting = false;
        this.hardMode = GameState.ageGroup === '8-10';

        GameState.soccerBalls = 0; // consume all balls

        this._drawPitch();
        this._drawGoal();
        this._drawGoalkeeper();
        this._drawUI();

        this._startGoalkeeperMovement();
        this._spawnBall();

        this.cameras.main.fadeIn(400);
    }

    _drawPitch() {
        const W = this.W, H = this.H;
        const g = this.add.graphics();

        // Sky
        g.fillStyle(0x87CEEB);
        g.fillRect(0, 0, W, H * 0.6);

        // Ground
        g.fillStyle(0x4caf50);
        g.fillRect(0, H * 0.6, W, H * 0.4);

        // Grass stripes
        g.fillStyle(0x43a047, 0.5);
        for (let i = 0; i < 6; i++) {
            if (i % 2 === 0) g.fillRect(0, H * 0.6 + i * (H * 0.07), W, H * 0.07);
        }

        // Penalty arc
        g.lineStyle(3, 0xffffff, 0.5);
        g.strokeCircle(W / 2, H * 0.95, W * 0.15);

        // Penalty spot
        g.fillStyle(0xffffff);
        g.fillCircle(W / 2, H * 0.82, 5);

        // Clouds
        g.fillStyle(0xffffff, 0.8);
        [[W * 0.15, H * 0.1], [W * 0.7, H * 0.08], [W * 0.45, H * 0.05]].forEach(([cx, cy]) => {
            g.fillEllipse(cx, cy, 100, 45);
            g.fillEllipse(cx + 30, cy - 10, 70, 35);
            g.fillEllipse(cx - 30, cy - 5, 60, 30);
        });
    }

    _drawGoal() {
        const W = this.W, H = this.H;
        const g = this.add.graphics();

        const goalW = W * 0.6;
        const goalH = H * 0.22;
        const gx = (W - goalW) / 2;
        const gy = H * 0.12;

        // Net background
        g.fillStyle(0xffffff, 0.15);
        g.fillRect(gx, gy, goalW, goalH);

        // Net lines
        g.lineStyle(1, 0xffffff, 0.4);
        for (let x = gx; x <= gx + goalW; x += goalW / 8) {
            g.lineBetween(x, gy, x, gy + goalH);
        }
        for (let y = gy; y <= gy + goalH; y += goalH / 4) {
            g.lineBetween(gx, y, gx + goalW, y);
        }

        // Posts
        g.lineStyle(6, 0xffffff, 1);
        g.lineBetween(gx, gy, gx, gy + goalH);
        g.lineBetween(gx + goalW, gy, gx + goalW, gy + goalH);
        g.lineBetween(gx, gy, gx + goalW, gy);
        // Crossbar shadow
        g.lineStyle(6, 0xcccccc, 0.5);
        g.lineBetween(gx, gy + 6, gx + goalW, gy + 6);

        this.goalBounds = { x: gx, y: gy, w: goalW, h: goalH };
    }

    _drawGoalkeeper() {
        const W = this.W, H = this.H;
        const g = this.add.graphics();

        const { x: gx, y: gy, w: gw, h: gh } = this.goalBounds;
        const cx = gx + gw / 2;
        const cy = gy + gh * 0.65;

        // Body (jersey)
        g.fillStyle(0xc0392b);  // red jersey
        g.fillRect(cx - 18, cy - 28, 36, 40);

        // Head
        g.fillStyle(0xf1c27d);  // skin
        g.fillCircle(cx, cy - 38, 20);

        // Hair
        g.fillStyle(0x5d4037);
        g.fillRect(cx - 18, cy - 56, 36, 14);
        g.fillEllipse(cx, cy - 56, 40, 18);

        // Eyes
        g.fillStyle(0x000000);
        g.fillCircle(cx - 7, cy - 40, 3);
        g.fillCircle(cx + 7, cy - 40, 3);

        // Gloves
        g.fillStyle(0xfdd835);  // yellow gloves
        g.fillCircle(cx - 26, cy - 14, 12);
        g.fillCircle(cx + 26, cy - 14, 12);

        // Legs
        g.fillStyle(0x1565c0);  // dark blue shorts
        g.fillRect(cx - 16, cy + 12, 14, 24);
        g.fillRect(cx + 2, cy + 12, 14, 24);

        // Boots
        g.fillStyle(0x212121);
        g.fillRect(cx - 19, cy + 34, 18, 10);
        g.fillRect(cx + 1, cy + 34, 18, 10);

        this.gkGraphics = g;
        this.gkBase = { cx, cy };
    }

    _drawUI() {
        const W = this.W, H = this.H;

        // Header
        const hdr = this.add.graphics();
        hdr.fillStyle(0x0f3460, 0.9);
        hdr.fillRect(0, 0, W, H * 0.1);

        this.add.text(W / 2, H * 0.05, '⚽ ¡A Marcar Goles!', {
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

        // Goals
        this.goalsTxt = this.add.text(W / 2, H * 0.67, '⚽ Goles: 0 / ' + this.shots, {
            fontSize: Math.floor(H * 0.036) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#2ecc71'
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
        this.add.text(W / 2, H * 0.92, '¡Toca el balón para disparar!', {
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
        return '🟡'.repeat(this.shotsLeft) + '⚫'.repeat(this.shots - this.shotsLeft);
    }

    // ─── Goalkeeper continuous movement ──────────────────────────────────────

    _startGoalkeeperMovement() {
        this.gkTween = null;
        this.gkTimer = null;
        this._gkMoveLoop();
    }

    _gkMoveLoop() {
        if (this.shooting || !this.scene.isActive()) return;

        // Random target: occasionally large dives, mostly small shifts
        const targets = [-80, -55, -30, 0, 30, 55, 80];
        const target = Phaser.Utils.Array.GetRandom(targets);

        // Age group '8-10' → faster, less predictable goalkeeper
        const duration = this.hardMode ? Phaser.Math.Between(150, 400) : Phaser.Math.Between(300, 750);

        this.gkTween = this.tweens.add({
            targets: this.gkGraphics,
            x: target,
            duration: duration,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                if (!this.shooting && this.scene.isActive()) {
                    const pause = this.hardMode ? Phaser.Math.Between(20, 150) : Phaser.Math.Between(80, 450);
                    this.gkTimer = this.time.delayedCall(pause, () => this._gkMoveLoop());
                }
            }
        });
    }

    _stopGoalkeeperMovement() {
        if (this.gkTimer) { this.gkTimer.remove(false); this.gkTimer = null; }
        if (this.gkTween) { this.gkTween.stop(); this.gkTween = null; }
    }

    // ─── Ball spawning and shooting ──────────────────────────────────────────

    _spawnBall() {
        const W = this.W, H = this.H;
        const { x: gx, w: gw } = this.goalBounds;

        if (this.ball) { this.ball.destroy(); this.ball = null; }
        if (this.ballTween) { this.ballTween.stop(); this.ballTween = null; }

        const leftX  = gx + gw * 0.1;
        const rightX = gx + gw * 0.9;
        const ballY  = H * 0.78;

        // Ball starts from the right and slides left first
        this.ball = this.add.text(rightX, ballY, '⚽', {
            fontSize: '52px'
        }).setOrigin(0.5).setDepth(4).setInteractive({ useHandCursor: true });

        this.ball.on('pointerdown', () => this._kickBall());

        // Bouncing tween: right → left → right → …
        this.ballTween = this.tweens.add({
            targets: this.ball,
            x: leftX,
            duration: 1300,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }

    _kickBall() {
        if (this.shotsLeft <= 0 || this.shooting) return;
        this.shooting = true;

        // Freeze the ball and the goalkeeper
        this.ballTween.stop();
        this.ball.disableInteractive();
        this._stopGoalkeeperMovement();

        // Determine shot direction from ball's X position within the goal
        const { x: gx, w: gw } = this.goalBounds;
        const relPos = (this.ball.x - gx) / gw;

        let playerDir;
        if      (relPos < 0.33) playerDir = 'left';
        else if (relPos > 0.67) playerDir = 'right';
        else                    playerDir = 'center';

        // Determine goalkeeper zone from its current horizontal offset
        const gkX = this.gkGraphics.x;
        let gkDir;
        if      (gkX < -25) gkDir = 'left';
        else if (gkX >  25) gkDir = 'right';
        else                gkDir = 'center';

        const isGoal = playerDir !== gkDir;

        // Animate goalkeeper reaction dive
        this._animateGoalkeeperReaction(gkDir);

        // Animate ball flying to goal
        this._animateBall(playerDir, isGoal);

        // Show result after short delay
        this.time.delayedCall(700, () => {
            if (isGoal) {
                this.goals++;
                this.resultTxt.setText('⚽ ¡GOL!').setColor('#FFD700');
            } else {
                this.resultTxt.setText('🧤 ¡Parado!').setColor('#e74c3c');
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
            this.goalsTxt.setText('⚽ Goles: ' + this.goals + ' / ' + this.shots);

            this.time.delayedCall(900, () => {
                this._resetGoalkeeper();
                if (this.ball) { this.ball.destroy(); this.ball = null; }

                if (this.shotsLeft <= 0) {
                    this.time.delayedCall(300, () => this._showSummary());
                } else {
                    this.shooting = false;
                    this._startGoalkeeperMovement();
                    this._spawnBall();
                }
            });
        });
    }

    _animateBall(dir, isGoal) {
        const { x: gx, y: gy, w: gw, h: gh } = this.goalBounds;

        const endX = dir === 'left'   ? gx + gw * 0.2
                   : dir === 'right'  ? gx + gw * 0.8
                   : gx + gw / 2;
        const endY = gy + gh * 0.5;

        this.tweens.add({
            targets: this.ball,
            x: endX,
            y: endY,
            scaleX: { from: 1.2, to: 0.7 },
            scaleY: { from: 1.2, to: 0.7 },
            duration: 600,
            ease: 'Power2'
        });
    }

    _animateGoalkeeperReaction(currentDir) {
        // Goalkeeper snaps to the extreme of its current zone
        const targetX = currentDir === 'left'  ? -85
                      : currentDir === 'right' ?  85
                      : 0;
        const targetY = currentDir === 'center' ? 0 : 18;

        this.tweens.add({
            targets: this.gkGraphics,
            x: targetX,
            y: targetY,
            duration: 400,
            ease: 'Power3'
        });
    }

    _resetGoalkeeper() {
        this.tweens.add({
            targets: this.gkGraphics,
            x: 0,
            y: 0,
            duration: 400,
            ease: 'Power2'
        });
    }

    _showSummary() {
        const W = this.W, H = this.H;

        // Overlay
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

        const pct = this.shots > 0 ? Math.round((this.goals / this.shots) * 100) : 0;
        const emoji = pct >= 80 ? '🌟🌟🌟' : pct >= 50 ? '⭐⭐' : '⭐';

        this.add.text(cx, py + panelH * 0.42, emoji, {
            fontSize: Math.floor(H * 0.065) + 'px'
        }).setOrigin(0.5);

        this.add.text(cx, py + panelH * 0.6, 'Goles: ' + this.goals + ' / ' + this.shots, {
            fontSize: Math.floor(H * 0.044) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#ecf0f1'
        }).setOrigin(0.5);

        const msg = pct >= 80 ? '¡Eres un crack!' : pct >= 50 ? '¡Muy bien!' : '¡Sigue practicando!';
        this.add.text(cx, py + panelH * 0.75, msg, {
            fontSize: Math.floor(H * 0.036) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#2ecc71'
        }).setOrigin(0.5);

        // Continue button
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
