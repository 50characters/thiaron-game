/**
 * game.js — Phaser 3 game configuration and entry point.
 */
const config = {
    type: Phaser.AUTO,
    backgroundColor: '#1a1a2e',
    input: {
        activePointers: 3
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.NO_CENTER,
        width: 540,
        height: 960,
        parent: 'game-container'
    },
    scene: [
        BootScene,
        MenuScene,
        HubScene,
        MultiplicationScene,
        SoccerScene,
        BasketballScene,
        AlphabetScene,
        WordsScene,
        EnglishScene,
        MathScene,
        ReadingScene
    ]
};

// eslint-disable-next-line no-unused-vars
const game = new Phaser.Game(config);
