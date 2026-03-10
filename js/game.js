// Main game loop and game state

// Canvas setup
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

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
    gameOver: false,
    victory: false,
    hoveredEnemy: null,
    pinnedEnemy: null
};

// Update UI elements
function updateUI() {
    document.getElementById('credits').textContent = game.credits;
    document.getElementById('wave').textContent = game.wave;
    document.getElementById('lives').textContent = game.lives;
    document.getElementById('kills').textContent = game.kills;
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
            const waveConfig = WAVES[game.wave - 1];
            if (waveConfig && game.spawnTimer >= waveConfig.interval) {
                game.enemies.push(new Enemy()); if (typeof playSound === 'function') { playSound('enemySpawn', { volume: 0.3, pitch: 0.9 + Math.random() * 0.2 }); }
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
                if (typeof playSound === 'function') { playSound('enemyEscape', { volume: 0.8 }); playSound('lifeLost', { volume: 0.6 }); }
                if (game.lives <= 0) { game.gameOver = true; log('GAME OVER', 'kill'); if (typeof playSound === 'function') playSound('gameOver', { volume: 1.0 }); }
            } else if (!enemy.alive) {
                if (game.pinnedEnemy === enemy) game.pinnedEnemy = null;
                game.enemies.splice(i, 1);
            }
        }
        
        // Update particles
        updateParticles();
        
        // Check wave complete
        if (game.waveInProgress && game.enemiesToSpawn === 0 && game.enemies.length === 0) {
            game.waveInProgress = false;
            game.wave++;
            document.getElementById('start-btn').disabled = false;
            if (game.wave > WAVES.length) { game.victory = true; log('VICTORY!', 'kill'); if (typeof playSound === 'function') playSound('victory', { volume: 1.0 }); }
            else log(`Wave complete! Wave ${game.wave} ready.`, 'kill'); if (typeof playSound === 'function') playSound('waveComplete', { volume: 0.7 });
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
    module.exports = { game, updateUI, gameLoop, startGame };
}
