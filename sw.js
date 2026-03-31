/**
 * sw.js — Service Worker for Thiaron PWA.
 * Caches all game assets so the game works offline once loaded.
 */

const CACHE_NAME = 'thiaron-v2';

const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './src/css/style.css',
    './src/phaser.min.js',
    './src/GameState.js',
    './src/version.js',
    './src/game.js',
    './src/scenes/BootScene.js',
    './src/scenes/MenuScene.js',
    './src/scenes/HubScene.js',
    './src/scenes/MultiplicationScene.js',
    './src/scenes/SoccerScene.js',
    './src/scenes/BasketballScene.js',
    './src/scenes/AlphabetScene.js',
    './src/scenes/WordsScene.js',
    './src/scenes/EnglishScene.js',
    './src/scenes/MathScene.js'
];

// Install: cache all assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

// Activate: remove old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

// Fetch: serve from cache, fall back to network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) return cached;
            return fetch(event.request).catch(() => {
                // Offline and not cached – return a minimal fallback for navigation requests
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
            });
        })
    );
});
