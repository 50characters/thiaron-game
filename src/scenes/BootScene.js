/**
 * BootScene — minimal boot that transitions immediately to MenuScene.
 */
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    create() {
        this.scene.start('MenuScene');
    }
}
