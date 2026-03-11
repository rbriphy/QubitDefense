// Main game loop and game state

// Canvas setup
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Get all tower keys
const ALL_TOWER_KEYS = Object.keys(TOWER_TYPES);

// Global game state
const game = {
    credits: 100,
    wave: 1,
    lives: 20,
    kills: 0,
    running: false,
    waveInProgress: false,
    selectedTower: 'measure',
    speed: 1,
    paused: false,
    enemies: [],
    towers: [],
    particles: [],
    spawnTimer: 0,
    enemiesToSpawn: 0,
    firstSpawnDone: false,
    gameOver: false,
    victory: false,
    hoveredEnemy: null,
    pinnedEnemy: null,
    unlockedTowers: []
};

// Function to get unlocked towers based on game mode and current wave
function getUnlockedTowers() {
    if (gameMode === 'sandbox') {
        return [...ALL_TOWER_KEYS];
    }
    
    if (gameMode === 'tutorial') {
        return [...TUTORIAL_UNLOCKS];
    }
    
    // Career mode: unlock towers based on wave
    const unlocked = [];
    for (const waveNum of Object.keys(CAREER_UNLOCKS).map(Number).sort((a, b) => a - b)) {
        if (game.wave >= waveNum) {
            unlocked.push(...CAREER_UNLOCKS[waveNum]);
        }
    }
    return unlocked;
}

// Check if a tower is unlocked
function isTowerUnlocked(towerType) {
    return game.unlockedTowers.includes(towerType);
}

// Initialize game for the selected mode
function initGameForMode(mode) {
    gameMode = mode;
    game.unlockedTowers = getUnlockedTowers();
    
    // Select first available tower
    if (game.unlockedTowers.length > 0) {
        game.selectedTower = game.unlockedTowers[0];
    }
    
    // Give more credits in tutorial mode
    if (gameMode === 'tutorial') {
        game.credits = 200;
    }
    
    updateTowerButtons();
}

// Check for newly unlocked towers after wave completion
function checkUnlocks() {
    if (gameMode === 'sandbox' || gameMode === 'tutorial') return;
    
    const previousUnlocked = [...game.unlockedTowers];
    game.unlockedTowers = getUnlockedTowers();
    
    // Find newly unlocked towers
    const newUnlocks = game.unlockedTowers.filter(t => !previousUnlocked.includes(t));
    
    if (newUnlocks.length > 0) {
        for (const tower of newUnlocks) {
            log(`New tower unlocked: ${TOWER_TYPES[tower].label}!`, 'spawn');
        }
        // Make newly unlocked towers visible in the sidebar
        showNewTowerButtons(newUnlocks);
    }
    
    updateTowerButtons();
}

// Show newly unlocked tower buttons in the sidebar
function showNewTowerButtons(newTowerTypes) {
    newTowerTypes.forEach(towerType => {
        const btn = document.querySelector(`.tower-btn[data-tower="${towerType}"]`);
        if (btn) {
            btn.style.display = 'flex';
            btn.classList.remove('locked');
            btn.disabled = false;
        }
    });
}

// Update tower button states based on unlocks
function updateTowerButtons() {
    document.querySelectorAll('.tower-btn').forEach(btn => {
        const towerType = btn.dataset.tower;
        if (isTowerUnlocked(towerType)) {
            btn.classList.remove('locked');
            btn.disabled = false;
            btn.style.display = 'flex';
        } else {
            if (gameMode === 'career' || gameMode === 'tutorial') {
                // In career and tutorial modes, hide locked towers completely
                btn.style.display = 'none';
            } else {
                // In sandbox mode, show as locked but visible
                btn.classList.add('locked');
                btn.disabled = true;
                btn.style.display = 'flex';
            }
        }
    });
}

// Update UI elements
function updateUI() {
    document.getElementById('credits').textContent = game.credits;
    document.getElementById('wave').textContent = game.wave;
    document.getElementById('lives').textContent = game.lives;
    document.getElementById('kills').textContent = game.kills;
}

// Get the appropriate wave config for the current game mode
function getCurrentWaveConfig() {
    if (gameMode === 'tutorial') {
        return TUTORIAL_WAVES[game.wave - 1] || TUTORIAL_WAVES[0];
    }
    return WAVES[game.wave - 1];
}

// Get the total number of waves for current mode
function getTotalWaves() {
    if (gameMode === 'tutorial') {
        return TUTORIAL_WAVES.length;
    }
    return WAVES.length;
}

// Main game loop
let lastTime = 0;

function gameLoop(timestamp) {
    const dt = (timestamp - lastTime) * game.speed;
    lastTime = timestamp;
    
    // Clear canvas
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = '#00ffff15';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) { 
        ctx.beginPath(); 
        ctx.moveTo(x, 0); 
        ctx.lineTo(x, canvas.height); 
        ctx.stroke(); 
    }
    for (let y = 0; y < canvas.height; y += 40) { 
        ctx.beginPath(); 
        ctx.moveTo(0, y); 
        ctx.lineTo(canvas.width, y); 
        ctx.stroke(); 
    }
    
    // Draw path
    drawPath();
    
    // Game logic
    if (game.running && !game.gameOver && !game.victory && !game.paused) {
        // Spawn enemies
        if (game.enemiesToSpawn > 0) {
            game.spawnTimer += dt;
            const waveConfig = getCurrentWaveConfig();
            const spawnDelay = game.firstSpawnDone ? waveConfig.interval : 1000;
            if (waveConfig && game.spawnTimer >= spawnDelay) {
                game.firstSpawnDone = true;
                game.enemies.push(new Enemy());
                game.enemiesToSpawn--;
                game.spawnTimer = 0;
            }
        }
        
        // Update towers
        for (const tower of game.towers) { 
            tower.update(); 
            tower.checkAndApply(game.enemies); 
        }
        
        // Update enemies
        for (let i = game.enemies.length - 1; i >= 0; i--) {
            const enemy = game.enemies[i];
            enemy.update();
            
            if (enemy.reachedEnd && enemy.alive) {
                game.lives--;
                if (game.pinnedEnemy === enemy) game.pinnedEnemy = null;
                game.enemies.splice(i, 1);
                log('Enemy escaped! -1 life', 'spawn');
                if (typeof playSound === 'function') { playSound('lifeLost', { volume: 0.8 }); }
                
                // In tutorial mode, don't end game on escape
                if (game.lives <= 0 && gameMode !== 'tutorial') { 
                    game.gameOver = true; 
                    log('GAME OVER', 'kill'); 
                    if (typeof playSound === 'function') playSound('gameOver', { volume: 1.0 });
                    // Hide end game button, show return to menu button
                    document.getElementById('end-game-btn').style.display = 'none';
                    document.getElementById('return-menu-btn').classList.remove('hidden');
                    // Stop game music
                    audioManager.stopBackgroundMusic();
                }
            } else if (!enemy.alive) {
                if (game.pinnedEnemy === enemy) game.pinnedEnemy = null;
                
                // Notify tutorial manager of kill
                if (gameMode === 'tutorial' && typeof tutorialManager !== 'undefined') {
                    tutorialManager.onEnemyKilled();
                }
                
                game.enemies.splice(i, 1);
            }
        }
        
        // Update particles
        updateParticles();
        
        // Check wave complete
        if (game.waveInProgress && game.enemiesToSpawn === 0 && game.enemies.length === 0) {
            game.waveInProgress = false;
            game.wave++;
            checkUnlocks();
            document.getElementById('start-btn').disabled = false;
            
            const totalWaves = getTotalWaves();
            if (game.wave > totalWaves) { 
                if (gameMode === 'tutorial') {
                    // Tutorial victory - advance to next tutorial step
                    if (typeof tutorialManager !== 'undefined') {
                        tutorialManager.checkStepCompletion();
                    }
                    game.wave = 1;
                    game.enemiesToSpawn = 0;
                    game.waveInProgress = false;
                    document.getElementById('start-btn').disabled = false;
                } else {
                    game.victory = true; 
                    log('VICTORY!', 'kill'); 
                    if (typeof playSound === 'function') playSound('victory', { volume: 1.0 });
                    // Hide end game button, show return to menu button
                    document.getElementById('end-game-btn').style.display = 'none';
                    document.getElementById('return-menu-btn').classList.remove('hidden');
                    // Stop game music
                    audioManager.stopBackgroundMusic();
                }
            }
            else {
                if (gameMode === 'tutorial') {
                    // In tutorial, check for step completion after wave
                    if (typeof tutorialManager !== 'undefined') {
                        tutorialManager.tutorialWavesCompleted++;
                        tutorialManager.checkStepCompletion();
                    }
                } else {
                    log(`Wave complete! Wave ${game.wave} ready.`, 'kill');
                }
                if (typeof playSound === 'function' && !game.gameOver) playSound('waveComplete', { volume: 0.7 });
            }
        }
    }
    
    // Draw game objects
    for (const tower of game.towers) tower.draw();
    for (const enemy of game.enemies) enemy.draw();
    drawParticles();
    
    // Draw placement preview
    drawPlacementPreview();
    
    // Draw game over / victory screens
    if (game.gameOver) {
        ctx.fillStyle = 'rgba(80, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ff0000';
        ctx.font = '50px "Orbitron"';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2);
    }
    
    if (game.victory) {
        ctx.fillStyle = 'rgba(0, 60, 30, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#00ff00';
        ctx.font = '50px "Orbitron"';
        ctx.textAlign = 'center';
        ctx.fillText('VICTORY!', canvas.width/2, canvas.height/2);
    }
    
    // Draw paused screen
    if (game.paused && !game.gameOver && !game.victory) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffcc00';
        ctx.font = '50px "Orbitron"';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', canvas.width/2, canvas.height/2);
    }
    
    updateUI();
    updateHoverInfo();
    requestAnimationFrame(gameLoop);
}

// Start the game
function startGame() {
    game.running = true;
    requestAnimationFrame(gameLoop);
}

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { game, updateUI, gameLoop, startGame, getCurrentWaveConfig, getTotalWaves };
}
