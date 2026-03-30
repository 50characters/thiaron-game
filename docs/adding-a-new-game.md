# Cómo añadir un nuevo juego

Esta guía explica paso a paso cómo agregar un nuevo módulo de juego a Thiaron.  
Como ejemplo crearemos un juego de **colores** (`ColorsScene`).

---

## Resumen del proceso

1. Crear el fichero de la escena en `src/scenes/`
2. Registrar el fichero en `index.html`
3. Registrar la escena en `src/game.js`
4. Añadir el botón de acceso en `src/scenes/HubScene.js`
5. (Opcional) Ampliar `GameState.js` si el juego necesita estado compartido

---

## Paso 1 — Crear la escena

Crea el fichero `src/scenes/ColorsScene.js`.  
Toda escena es una clase que extiende `Phaser.Scene`:

```js
/**
 * ColorsScene — Aprende los colores.
 * Muestra un parche de color y cuatro opciones de nombre.
 */
class ColorsScene extends Phaser.Scene {
    constructor() {
        // La key debe ser única y coincidir con la usada en game.js y HubScene
        super({ key: 'ColorsScene' });
    }

    create() {
        this.W = this.scale.width;
        this.H = this.scale.height;

        this.score = 0;
        this.round = 0;
        this.totalRounds = 10;

        this.colorData = [
            { name: 'Rojo',     hex: 0xe74c3c, wrong: ['Azul', 'Verde', 'Amarillo'] },
            { name: 'Azul',     hex: 0x2980b9, wrong: ['Rojo', 'Morado', 'Verde'] },
            { name: 'Verde',    hex: 0x27ae60, wrong: ['Amarillo', 'Rojo', 'Azul'] },
            { name: 'Amarillo', hex: 0xf1c40f, wrong: ['Rojo', 'Azul', 'Naranja'] },
            { name: 'Naranja',  hex: 0xe67e22, wrong: ['Rojo', 'Amarillo', 'Rosa'] },
            { name: 'Morado',   hex: 0x8e44ad, wrong: ['Azul', 'Rosa', 'Gris'] },
        ];

        this._drawBackground();
        this._drawHeader();
        this._buildQuestion();
        this.cameras.main.fadeIn(400);
    }

    // ── Fondo ────────────────────────────────────────────────────────────────

    _drawBackground() {
        const g = this.add.graphics();
        g.fillStyle(0x1a1a2e);
        g.fillRect(0, 0, this.W, this.H);
    }

    // ── Cabecera con título y botón de salida ─────────────────────────────────

    _drawHeader() {
        const W = this.W, H = this.H;

        const hdr = this.add.graphics();
        hdr.fillStyle(0x0f3460, 0.95);
        hdr.fillRect(0, 0, W, H * 0.13);

        this.add.text(W / 2, H * 0.065, '🎨 Colores', {
            fontSize: Math.floor(H * 0.048) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#FFD700',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Botón de salida — usa el patrón estándar del proyecto
        this._makeSmallButton(55, H - 30, 90, 40, '← Salir', 0x555555, 0x333333, () => {
            this.cameras.main.fade(300, 0, 0, 0);
            this.time.delayedCall(300, () => this.scene.start('HubScene'));
        });
    }

    // ── Pregunta ──────────────────────────────────────────────────────────────

    _buildQuestion() {
        const W = this.W, H = this.H;

        // Destruir elementos anteriores con un grupo
        if (this._qGroup) this._qGroup.destroy(true);
        this._qGroup = this.add.group();

        if (this.round >= this.totalRounds) {
            this._showEnd();
            return;
        }

        // Elegir un color aleatorio
        const item = Phaser.Utils.Array.GetRandom(this.colorData);
        this._correctName = item.name;

        // Puntuación
        this._qGroup.add(
            this.add.text(W - 12, 8, '⭐ ' + this.score, {
                fontSize: Math.floor(H * 0.032) + 'px',
                fontFamily: 'Arial Rounded MT Bold, Arial',
                color: '#FFD700',
                backgroundColor: '#0f3460',
                padding: { x: 8, y: 4 }
            }).setOrigin(1, 0)
        );

        // Pregunta
        this._qGroup.add(
            this.add.text(W / 2, H * 0.23, '¿Qué color es?', {
                fontSize: Math.floor(H * 0.038) + 'px',
                fontFamily: 'Arial Rounded MT Bold, Arial',
                color: '#ecf0f1'
            }).setOrigin(0.5)
        );

        // Parche de color
        const patchSize = Math.min(W * 0.45, 220);
        const cx = W / 2, cy = H * 0.42;

        const patch = this.add.graphics();
        patch.fillStyle(item.hex);
        patch.fillRoundedRect(cx - patchSize / 2, cy - patchSize / 2, patchSize, patchSize, 24);
        patch.lineStyle(4, 0xffffff, 0.5);
        patch.strokeRoundedRect(cx - patchSize / 2, cy - patchSize / 2, patchSize, patchSize, 24);
        this._qGroup.add(patch);

        // Animación de entrada
        this.tweens.add({
            targets: patch,
            scaleX: { from: 0.4, to: 1 },
            scaleY: { from: 0.4, to: 1 },
            duration: 350,
            ease: 'Back.Out'
        });

        // Opciones de respuesta (4 botones)
        const choices = Phaser.Utils.Array.Shuffle([item.name, ...item.wrong.slice(0, 3)]);
        const btnW = Math.min(W * 0.38, 200);
        const btnH = Math.floor(H * 0.1);
        const sx = W / 2 - btnW / 2 - 10;
        const sy = H * 0.67;

        choices.forEach((name, i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const bx = sx + col * (btnW + 20) + btnW / 2;
            const by = sy + row * (btnH + 14) + btnH / 2;
            this._makeAnswerButton(bx, by, btnW, btnH, name, name === item.name);
        });
    }

    _makeAnswerButton(x, y, w, h, label, isCorrect) {
        const r = Math.floor(h * 0.3);
        const bg = this.add.graphics();
        this._qGroup.add(bg);
        const baseColor = 0x8e44ad;

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
        zone.on('pointerout',  () => draw(baseColor));
        zone.on('pointerup', () => {
            // Deshabilitar todos los botones mientras se procesa la respuesta
            this._qGroup.getChildren().forEach(c => { if (c.input) c.input.enabled = false; });

            if (isCorrect) {
                draw(0x27ae60);
                this.score++;
                const bonus = this.add.text(x, y - 30, '✓ +1', {
                    fontSize: Math.floor(h * 0.44) + 'px', color: '#2ecc71'
                }).setOrigin(0.5);
                this.tweens.add({ targets: bonus, y: y - 80, alpha: 0, duration: 800,
                    onComplete: () => bonus.destroy() });
            } else {
                draw(0xe74c3c);
                const hint = this.add.text(this.W / 2, this.H * 0.82,
                    'Era: ' + this._correctName, {
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

    // ── Pantalla final ────────────────────────────────────────────────────────

    _showEnd() {
        const W = this.W, H = this.H;
        const pct = Math.round((this.score / this.totalRounds) * 100);
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

        this.add.text(W / 2, H * 0.54, 'Aciertos: ' + this.score + ' / ' + this.totalRounds, {
            fontSize: Math.floor(H * 0.042) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#ecf0f1'
        }).setOrigin(0.5);

        this._makeSmallButton(W / 2, H * 0.72, 200, 52, 'Continuar ▶', 0x27ae60, 0x1e8449, () => {
            this.cameras.main.fade(300, 0, 0, 0);
            this.time.delayedCall(300, () => this.scene.start('HubScene'));
        });
    }

    // ── Utilidad: botón pequeño (patrón estándar del proyecto) ────────────────

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
            color: '#fff'
        }).setOrigin(0.5);

        const zone = this.add.zone(x, y, w, h).setInteractive({ useHandCursor: true });
        zone.on('pointerover', () => draw(hoverColor));
        zone.on('pointerout',  () => draw(color));
        zone.on('pointerup',   callback);
    }
}
```

---

## Paso 2 — Registrar el fichero en `index.html`

Añade la etiqueta `<script>` **antes** de `src/game.js`:

```html
    <script src="src/scenes/MathScene.js"></script>

    <!-- ↓ Nuevo juego -->
    <script src="src/scenes/ColorsScene.js"></script>

    <!-- Game entry point -->
    <script src="src/game.js"></script>
```

---

## Paso 3 — Registrar la escena en `src/game.js`

Añade `ColorsScene` al array `scene`:

```js
const config = {
    // ...
    scene: [
        BootScene,
        MenuScene,
        HubScene,
        MultiplicationScene,
        SoccerScene,
        AlphabetScene,
        WordsScene,
        EnglishScene,
        MathScene,
        ColorsScene,   // ← añadir aquí
    ]
};
```

---

## Paso 4 — Añadir el botón en `HubScene.js`

Localiza el array `allGames` en `src/scenes/HubScene.js` y añade una entrada:

```js
const allGames = [
    { key: 'AlphabetScene',       label: 'Abecedario', emoji: '🔤', color: 0xe67e22, hover: 0xd35400, ages: ['4-5', '6-7'] },
    { key: 'WordsScene',          label: 'Palabras',   emoji: '📖', color: 0x8e44ad, hover: 0x6c3483, ages: ['4-5', '6-7', '8-10'] },
    { key: 'MathScene',           label: 'Matemáticas',emoji: '➕', color: 0x16a085, hover: 0x0e6655, ages: ['4-5', '6-7', '8-10'] },
    { key: 'MultiplicationScene', label: 'Tablas',     emoji: '✖️', color: 0xe74c3c, hover: 0xc0392b, ages: ['6-7', '8-10'] },
    { key: 'EnglishScene',        label: 'Inglés',     emoji: '🇬🇧', color: 0x2980b9, hover: 0x1a5276, ages: ['8-10'] },
    // ↓ Nuevo juego: visible para edades 4-5 y 6-7
    { key: 'ColorsScene',         label: 'Colores',    emoji: '🎨', color: 0xc0392b, hover: 0x96281b, ages: ['4-5', '6-7'] },
];
```

El campo `ages` acepta cualquier combinación de `'4-5'`, `'6-7'` y `'8-10'`. El Hub filtra automáticamente los juegos disponibles según el grupo de edad seleccionado.

---

## Paso 5 (opcional) — Ampliar `GameState.js`

Si tu juego necesita guardar estado entre sesiones (como una puntuación acumulada o un nivel), añádelo al objeto `GameState` en `src/GameState.js`:

```js
const GameState = {
    ageGroup: null,
    soccerBalls: 0,
    totalScore: 0,
    consecutiveCorrect: 0,

    colorsHighScore: 0,   // ← nuevo campo

    resetGame() {
        this.soccerBalls = 0;
        this.totalScore = 0;
        this.consecutiveCorrect = 0;
        // No resetear colorsHighScore: es persistente en la sesión
    },
    // ...
};
```

---

## Convenciones del proyecto

| Aspecto | Convención |
|---|---|
| Fondo | `this.add.graphics()` con `fillStyle(0x1a1a2e)` |
| Cabecera | Barra azul oscuro `0x0f3460` al 95% de opacidad, altura `H * 0.13` |
| Título en cabecera | `color: '#FFD700'`, `stroke: '#000'`, tamaño `H * 0.048` |
| Botón de salida | `_makeSmallButton(55, H-30, 90, 40, '← Salir', ...)` |
| Botón de respuesta | Fondo redondeado, sombra con offset +3/+4, hover oscurece el color |
| Acierto | Color `0x27ae60` (verde), texto flotante `✓ +1` |
| Error | Color `0xe74c3c` (rojo), pista con `backgroundColor: '#0f3460'` |
| Pantalla final | Emoji de estrellas, puntuación, botón `Continuar ▶` |
| Transición entre escenas | `this.cameras.main.fade(300, 0, 0, 0)` + `time.delayedCall(300, ...)` |
| Grupos de objetos | `this.add.group()` destruido al inicio de cada pregunta |

---

## Resultado esperado

Después de los 5 pasos anteriores, el nuevo juego de Colores aparecerá en el Hub para los grupos de edad 4-5 y 6-7, y seguirá el mismo flujo visual que el resto de juegos.
