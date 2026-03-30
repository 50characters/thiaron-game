/**
 * SoccerScene — Mini-game: use earned soccer balls to shoot at the goalkeeper.
 *
 * Mechanic:
 *   • Player has GameState.soccerBalls shots (capped at displayed shots).
 *   • Each shot: click LEFT | CENTER | RIGHT.
 *   • Goalkeeper randomly dives to one direction.
 *   • Shot != goalkeeper direction → GOAL! ⚽
 *   • Shot == goalkeeper direction → SAVED! 🧤
 *   • After all shots used, show summary and return to HubScene.
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

        GameState.soccerBalls = 0; // consume all balls

        this._drawPitch();
        this._drawGoal();
        this._drawGoalkeeper();
        this._drawUI();
        this._drawShootButtons();

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
    }

    _shotsStr() {
        return '🟡'.repeat(this.shotsLeft) + '⚫'.repeat(this.shots - this.shotsLeft);
    }

    _drawShootButtons() {
        const W = this.W, H = this.H;
        const btnW = Math.min(W * 0.25, 160);
        const btnH = Math.floor(H * 0.1);
        const y = H * 0.79;
        const positions = [
            { label: '← Izquierda', dir: 'left',   x: W * 0.2,  color: 0xe74c3c, hover: 0xc0392b },
            { label: 'Centro',      dir: 'center', x: W * 0.5,  color: 0x8e44ad, hover: 0x6c3483 },
            { label: 'Derecha →',   dir: 'right',  x: W * 0.8,  color: 0x2980b9, hover: 0x1a5276 }
        ];

        this.shootBtns = [];

        positions.forEach(p => {
            const bg = this.add.graphics();
            const r = 14;

            const draw = (c, en) => {
                bg.clear();
                if (en) {
                    bg.fillStyle(0x000000, 0.2);
                    bg.fillRoundedRect(p.x - btnW / 2 + 3, y - btnH / 2 + 4, btnW, btnH, r);
                }
                bg.fillStyle(en ? c : 0x555555, en ? 1 : 0.5);
                bg.fillRoundedRect(p.x - btnW / 2, y - btnH / 2, btnW, btnH, r);
                bg.lineStyle(2, 0xffffff, en ? 0.5 : 0.2);
                bg.strokeRoundedRect(p.x - btnW / 2, y - btnH / 2, btnW, btnH, r);
            };
            draw(p.color, true);

            const txt = this.add.text(p.x, y, p.label, {
                fontSize: Math.floor(btnH * 0.3) + 'px',
                fontFamily: 'Arial Rounded MT Bold, Arial',
                color: '#fff',
                stroke: '#000',
                strokeThickness: 2
            }).setOrigin(0.5);

            const zone = this.add.zone(p.x, y, btnW, btnH).setInteractive({ useHandCursor: true });
            zone.on('pointerover', () => { if (!this.shooting) draw(p.hover, true); });
            zone.on('pointerout',  () => { if (!this.shooting) draw(p.color, true); });
            zone.on('pointerdown',   () => { if (!this.shooting) this._shoot(p.dir, draw, p.color); });

            this.shootBtns.push({ draw, color: p.color, zone, txt });
        });

        // Instruction
        this.add.text(W / 2, H * 0.92, '¡Elige la dirección del disparo!', {
            fontSize: Math.floor(H * 0.028) + 'px',
            fontFamily: 'Arial, sans-serif',
            color: '#bdc3c7'
        }).setOrigin(0.5);
    }

    _shoot(playerDir, draw, color) {
        if (this.shotsLeft <= 0 || this.shooting) return;
        this.shooting = true;

        const dirs = ['left', 'center', 'right'];
        const gkDir = Phaser.Utils.Array.GetRandom(dirs);
        const isGoal = playerDir !== gkDir;

        // Disable buttons during animation
        this.shootBtns.forEach(b => b.zone.disableInteractive());

        // Goalkeeper dive animation
        this._animateGoalkeeper(gkDir);

        // Animate ball
        this._animateBall(playerDir, isGoal);

        // Show result
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
                    this.shootBtns.forEach(b => {
                        b.zone.setInteractive({ useHandCursor: true });
                        b.draw(b.color, true);
                    });
                }
            });
        });
    }

    _animateBall(dir, isGoal) {
        const W = this.W, H = this.H;
        const { x: gx, y: gy, w: gw, h: gh } = this.goalBounds;

        const startX = W / 2;
        const startY = H * 0.82;

        const endX = dir === 'left'   ? gx + gw * 0.2
                   : dir === 'right'  ? gx + gw * 0.8
                   : gx + gw / 2;
        const endY = gy + gh * 0.5;

        this.ball = this.add.text(startX, startY, '⚽', {
            fontSize: '32px'
        }).setOrigin(0.5).setDepth(4);

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

    _animateGoalkeeper(dir) {
        const { cx, cy } = this.gkBase;
        const dx = dir === 'left' ? -80 : dir === 'right' ? 80 : 0;
        const dy = dir === 'center' ? 0 : 20;

        this.tweens.add({
            targets: this.gkGraphics,
            x: dx,
            y: dy,
            duration: 550,
            ease: 'Power2'
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
