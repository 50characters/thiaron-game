/**
 * BootScene — checks app version, clears stale caches when needed,
 * restores a saved session if one exists, then transitions to the
 * appropriate scene.
 */
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    create() {
        const storedVersion = localStorage.getItem('thiaron_version');

        if (storedVersion !== APP_VERSION) {
            // New version detected — clear all SW caches to avoid stale assets.
            if ('caches' in window) {
                caches.keys()
                    .then(keys => Promise.all(keys.map(k => caches.delete(k))))
                    .catch(err => console.warn('Cache clear failed:', err));
            }
            // Discard any saved session that may be incompatible.
            GameState.clearSave();
            localStorage.setItem('thiaron_version', APP_VERSION);
        }

        // Restore a previous session if available.
        const hasSave = GameState.load();

        if (hasSave) {
            this.scene.start('HubScene');
        } else {
            this.scene.start('MenuScene');
        }
    }
}
