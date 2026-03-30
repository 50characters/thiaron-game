# Thiaron — Juego Educativo

Un juego educativo HTML5 + Phaser 3 para niños de **4 a 10 años**, completamente responsivo (tablet y móvil).

## 🎮 Juegos incluidos

| Juego | Edades | Descripción |
|---|---|---|
| 🔤 Abecedario | 4-7 | Explorar letras (4-5) o adivinar la letra inicial (6-7) |
| 📖 Palabras | 4-10 | Relacionar emoji con la palabra española correcta |
| ➕ Matemáticas | 4-10 | Sumas y restas adaptadas a la edad |
| ✖️ Tablas | 6-10 | Tablas de multiplicar con recompensas de balones de fútbol |
| ⚽ Fútbol | 6-10 | Mini-juego: dispara al portero con los balones ganados |
| 🇬🇧 Inglés | 8-10 | Aprende palabras básicas en inglés |

## 🏆 Sistema de recompensas

- **Tablas de multiplicar**: cada 3 respuestas correctas seguidas → 🥅 **1 balón de fútbol**
- Acumula **3 o más balones** para desbloquear el mini-juego de fútbol en el Hub
- **Rachas de fuego** 🔥: aciertos consecutivos en cualquier juego
- **Estrellas** ⭐ al terminar cada partida según el porcentaje de aciertos

## 🚀 Cómo ejecutar

Abre `index.html` en un servidor local (necesario por CORS al cargar Phaser desde CDN):

```bash
# Opción 1: Python
python3 -m http.server 8080

# Opción 2: Node.js (npx serve)
npx serve .
```

Luego visita `http://localhost:8080` en el navegador.

## 📁 Estructura del proyecto

```
index.html                   ← Entrada principal
src/
  css/style.css              ← Estilos responsivos
  GameState.js               ← Estado compartido (edad, puntuación, balones)
  game.js                    ← Configuración Phaser 3
  scenes/
    BootScene.js             ← Arranque
    MenuScene.js             ← Selección de grupo de edad
    HubScene.js              ← Selector de juegos por edad
    MultiplicationScene.js   ← Tablas de multiplicar
    SoccerScene.js           ← Mini-juego de fútbol
    AlphabetScene.js         ← Abecedario
    WordsScene.js            ← Palabras en español
    EnglishScene.js          ← Palabras en inglés (8-10)
    MathScene.js             ← Sumas y restas
```

## 🛠 Tecnologías

- **HTML5** + CSS3
- **[Phaser 3](https://phaser.io/)** v3.60 (incluido localmente en `src/phaser.min.js`)
- Sin dependencias adicionales ni proceso de compilación
- Gráficos dibujados programáticamente (sin archivos de imagen externos)

## 📱 Compatibilidad

Diseñado para funcionar en:
- Tabletas (landscape/portrait)
- Móviles (portrait)
- Ordenadores de escritorio

El canvas se adapta automáticamente con `Phaser.Scale.FIT`.
