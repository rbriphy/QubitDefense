// Audio System for Quantum TD
// Provides sound effect management and playback

// Sound effect definitions - maps events to sound file names
const SOUND_EFFECTS = {
    // Game state sounds
    gameStart: 'game_start.mp3',
    gameOver: 'game_over.mp3',
    victory: 'victory.mp3',
    waveStart: 'wave_start.mp3',
    waveComplete: 'wave_complete.mp3',
    
    // Tower sounds
    towerPlace: 'tower_place.mp3',
    towerRemove: 'tower_remove.mp3',
    towerActivate: 'tower_activate.mp3',
    towerCooldown: 'tower_cooldown.mp3',
    
    // Enemy sounds
    enemySpawn: 'enemy_spawn.mp3',
    enemyEscape: 'enemy_escape.mp3',
    enemyKill: 'enemy_kill.mp3',
    enemySurvive: 'enemy_survive.mp3',
    
    // Quantum effect sounds
    gateApply: 'gate_apply.mp3',
    measurement: 'measurement.mp3',
    collapse: 'collapse.mp3',
    superposition: 'superposition.mp3',
    
    // UI sounds
    buttonClick: 'button_click.mp3',
    error: 'error.mp3',
    select: 'select.mp3',
    creditGain: 'credit_gain.mp3',
    creditSpend: 'credit_spend.mp3',
    lifeLost: 'life_lost.mp3'
};

// Sound categories for volume control
const SOUND_CATEGORIES = {
    music: { volume: 0.5, muted: false },
    sfx: { volume: 0.7, muted: false },
    ui: { volume: 0.5, muted: false },
    quantum: { volume: 0.6, muted: false }
};

// Audio Manager Class
class AudioManager {
    constructor() {
        this.sounds = {};
        this.audioContext = null;
        this.masterVolume = 1.0;
        this.initialized = false;
        this.loadingSounds = {};
    }
    
    // Initialize the audio system
    async init() {
        if (this.initialized) return;
        
        try {
            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
            console.log('Audio system initialized');
        } catch (e) {
            console.warn('Audio initialization failed:', e);
        }
    }
    
    // Resume audio context (needed for browser autoplay policies)
    async resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }
    
    // Load a sound file
    loadSound(name, filepath) {
        if (!this.initialized) return;
        
        // Skip if already loaded or loading
        if (this.sounds[name] || this.loadingSounds[name]) return;
        
        this.loadingSounds[name] = true;
        
        const audio = new Audio();
        audio.preload = 'auto';
        
        audio.addEventListener('canplaythrough', () => {
            this.sounds[name] = audio;
            delete this.loadingSounds[name];
            console.log(`Sound loaded: ${name}`);
        });
        
        audio.addEventListener('error', (e) => {
            console.warn(`Failed to load sound: ${name} - ${filepath}`);
            delete this.loadingSounds[name];
        });
        
        audio.src = filepath;
    }
    
    // Load all game sounds
    loadAllSounds() {
        const audioPath = 'audio/';
        
        // Game state
        this.loadSound('gameStart', audioPath + SOUND_EFFECTS.gameStart);
        this.loadSound('gameOver', audioPath + SOUND_EFFECTS.gameOver);
        this.loadSound('victory', audioPath + SOUND_EFFECTS.victory);
        this.loadSound('waveStart', audioPath + SOUND_EFFECTS.waveStart);
        this.loadSound('waveComplete', audioPath + SOUND_EFFECTS.waveComplete);
        
        // Towers
        this.loadSound('towerPlace', audioPath + SOUND_EFFECTS.towerPlace);
        this.loadSound('towerRemove', audioPath + SOUND_EFFECTS.towerRemove);
        this.loadSound('towerActivate', audioPath + SOUND_EFFECTS.towerActivate);
        
        // Enemies
        this.loadSound('enemySpawn', audioPath + SOUND_EFFECTS.enemySpawn);
        this.loadSound('enemyEscape', audioPath + SOUND_EFFECTS.enemyEscape);
        this.loadSound('enemyKill', audioPath + SOUND_EFFECTS.enemyKill);
        this.loadSound('enemySurvive', audioPath + SOUND_EFFECTS.enemySurvive);
        
        // Quantum effects
        this.loadSound('gateApply', audioPath + SOUND_EFFECTS.gateApply);
        this.loadSound('measurement', audioPath + SOUND_EFFECTS.measurement);
        this.loadSound('collapse', audioPath + SOUND_EFFECTS.collapse);
        
        // UI
        this.loadSound('buttonClick', audioPath + SOUND_EFFECTS.buttonClick);
        this.loadSound('error', audioPath + SOUND_EFFECTS.error);
        this.loadSound('select', audioPath + SOUND_EFFECTS.select);
        this.loadSound('creditGain', audioPath + SOUND_EFFECTS.creditGain);
        this.loadSound('creditSpend', audioPath + SOUND_EFFECTS.creditSpend);
        this.loadSound('lifeLost', audioPath + SOUND_EFFECTS.lifeLost);
    }
    
    // Play a sound by name
    play(soundName, options = {}) {
        if (!this.initialized || !this.sounds[soundName]) {
            // Sound not loaded yet - silently skip (or log in debug mode)
            return;
        }
        
        const sound = this.sounds[soundName];
        
        // Clone the audio for overlapping playback
        const soundClone = sound.cloneNode();
        
        // Apply volume
        const category = options.category || 'sfx';
        const categoryVolume = SOUND_CATEGORIES[category]?.volume || 1.0;
        const volume = (options.volume || 1.0) * categoryVolume * this.masterVolume;
        soundClone.volume = Math.max(0, Math.min(1, volume));
        
        // Apply pitch variation if specified
        if (options.pitch) {
            soundClone.playbackRate = options.pitch;
        }
        
        // Play the sound
        soundClone.play().catch(e => {
            // Ignore play errors (often browser autoplay restrictions)
        });
    }
    
    // Play a sound with category shortcut
    playSfx(name, options = {}) {
        this.play(name, { ...options, category: 'sfx' });
    }
    
    playQuantum(name, options = {}) {
        this.play(name, { ...options, category: 'quantum' });
    }
    
    playUI(name, options = {}) {
        this.play(name, { ...options, category: 'ui' });
    }
    
    // Set master volume (0.0 to 1.0)
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }
    
    // Set category volume
    setCategoryVolume(category, volume) {
        if (SOUND_CATEGORIES[category]) {
            SOUND_CATEGORIES[category].volume = Math.max(0, Math.min(1, volume));
        }
    }
    
    // Mute/unmute category
    setCategoryMuted(category, muted) {
        if (SOUND_CATEGORIES[category]) {
            SOUND_CATEGORIES[category].muted = muted;
        }
    }
    
    // Check if a sound is loaded
    isLoaded(name) {
        return !!this.sounds[name];
    }
    
    // Stop all currently playing sounds
    stopAll() {
        // Note: This won't work with cloned audio nodes
        // For a more complete solution, we'd need to track playing instances
    }
}

// Global audio manager instance
const audioManager = new AudioManager();

// Convenience function to play sounds from anywhere
function playSound(name, options) {
    audioManager.play(name, options);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        SOUND_EFFECTS, 
        SOUND_CATEGORIES, 
        AudioManager, 
        audioManager,
        playSound 
    };
}
