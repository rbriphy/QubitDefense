// Systems - particles, path drawing, input handling

// Particle system
function createParticles(x, y, color, count = 8) {
    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
        const speed = 1.5 + Math.random() * 1.5;
        game.particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 25,
            color,
            size: 2 + Math.random() * 2
        });
    }
}

function updateParticles() {
    for (let i = game.particles.length - 1; i >= 0; i--) {
        const p = game.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        if (p.life <= 0) game.particles.splice(i, 1);
    }
}

function drawParticles() {
    for (const p of game.particles) {
        ctx.globalAlpha = p.life / 25;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

// Draw the enemy path
function drawPath() {
    // Main path
    ctx.strokeStyle = '#00ffff44';
    ctx.lineWidth = 40;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    ctx.moveTo(PATH[0].x, PATH[0].y);
    for (let i = 1; i < PATH.length; i++) ctx.lineTo(PATH[i].x, PATH[i].y);
    ctx.stroke();
    
    // Inner path
    ctx.strokeStyle = '#00ffff33';
    ctx.lineWidth = 28;
    ctx.stroke();
    
    // Waypoints
    ctx.fillStyle = '#00ffff55';
    for (const point of PATH) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Labels
    ctx.fillStyle = '#00ff00';
    ctx.font = '12px "Orbitron"';
    ctx.textAlign = 'center';
    ctx.fillText('START', PATH[0].x, PATH[0].y - 30);
    
    ctx.fillStyle = '#ff0000';
    ctx.fillText('END', PATH[PATH.length-1].x, PATH[PATH.length-1].y - 30);
}

// Draw Bloch sphere visualization
function drawBlochSphere(cx, cy, radius, state) {
    const bloch = stateToBloch(state);
    const theta = bloch.theta;
    const phi = bloch.phi;
    
    // Convert to 2D projection
    const x = Math.sin(theta) * Math.cos(phi);
    const y = Math.sin(theta) * Math.sin(phi);
    const z = Math.cos(theta);
    
    const projX = cx + (x * 0.7 - z * 0.7) * radius;
    const projY = cy + (y - (x * 0.3 + z * 0.3)) * radius;
    
    // Draw sphere outline
    ctx.strokeStyle = '#00ffff44';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw vertical axis
    ctx.strokeStyle = '#00ffff22';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, cy - radius);
    ctx.lineTo(cx, cy + radius);
    ctx.stroke();
    
    // Draw labels
    ctx.fillStyle = '#00ffff88';
    ctx.font = '7px "Share Tech Mono"';
    ctx.textAlign = 'center';
    ctx.fillText('|0⟩', cx, cy - radius - 3);
    ctx.fillText('|1⟩', cx, cy + radius + 7);
    
    // Draw state vector
    const health = getHealth(state);
    const deathProb = getDeathProb(state);
    
    const r = Math.floor(255 * deathProb);
    const g = Math.floor(255 * (1 - deathProb) * 0.5);
    const b = Math.floor(255 * health);
    const color = `rgb(${r},${g},${b})`;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(projX, projY);
    ctx.stroke();
    
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(projX, projY, 3, 0, Math.PI * 2);
    ctx.fill();
}

// Point to line segment distance calculation
function pointToSegmentDistance(px, py, x1, y1, x2, y2) {
    const A = px - x1, B = py - y1, C = x2 - x1, D = y2 - y1;
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = lenSq !== 0 ? dot / lenSq : -1;
    
    let xx, yy;
    if (param < 0) { xx = x1; yy = y1; }
    else if (param > 1) { xx = x2; yy = y2; }
    else { xx = x1 + param * C; yy = y1 + param * D; }
    
    return Math.sqrt((px - xx)**2 + (py - yy)**2);
}

// Update hover info display
function updateHoverInfo() {
    const info = document.getElementById('selected-enemy-info');
    if (!info) return; // Guard against missing element
    
    // Use pinned enemy if set, otherwise use hovered enemy
    const targetEnemy = game.pinnedEnemy || game.hoveredEnemy;
    
    if (targetEnemy) {
        const state = targetEnemy.quantumState;
        const alphaMag = Complex.norm(state.alpha);
        const betaMag = Complex.norm(state.beta);
        const alphaPhase = Math.atan2(state.alpha.im, state.alpha.re) * 180 / Math.PI;
        const betaPhase = Math.atan2(state.beta.im, state.beta.re) * 180 / Math.PI;
        const isPinned = game.pinnedEnemy;
        const headerText = isPinned ? 'QUANTUM STATE (PINNED)' : 'QUANTUM STATE';
        info.innerHTML = `<strong>${headerText}</strong><br>α: ${alphaMag.toFixed(2)}∠${alphaPhase.toFixed(0)}°<br>β: ${betaMag.toFixed(2)}∠${betaPhase.toFixed(0)}°`;
    } else {
        info.textContent = 'Hover enemy for state';
    }
}

// Log message to message log
function log(msg, type = '') {
    const logEl = document.getElementById('message-log');
    if (!logEl) return; // Guard against missing element
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.textContent = msg;
    logEl.insertBefore(entry, logEl.firstChild);
    if (logEl.children.length > 15) logEl.removeChild(logEl.lastChild);
}

// Input handling variables
let placementPreview = null;

// Setup input event listeners
function setupInput() {
    const canvas = document.getElementById('game');
    
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        
        // Check if near path
        let nearPath = false;
        for (let i = 0; i < PATH.length - 1; i++) {
            const dist = pointToSegmentDistance(x, y, PATH[i].x, PATH[i].y, PATH[i+1].x, PATH[i+1].y);
            if (dist < 30) { nearPath = true; break; }
        }
        
        placementPreview = nearPath ? { x, y } : null;
        
        // Check for hovered enemy
        game.hoveredEnemy = null;
        for (const enemy of game.enemies) {
            if (!enemy.alive) continue;
            const dx = enemy.x - x;
            const dy = enemy.y - y;
            if (Math.sqrt(dx*dx + dy*dy) < enemy.size + 15) {
                game.hoveredEnemy = enemy;
                
                // Notify tutorial manager of enemy hover (only if on correct step)
                if (gameMode === 'tutorial' && 
                    typeof tutorialManager !== 'undefined' &&
                    tutorialManager.isActive &&
                    tutorialManager.steps[tutorialManager.currentStep].id === 'hoverEnemy') {
                    tutorialManager.onEnemyHovered();
                }
                break;
            }
        }
        
        updateHoverInfo();
    });
    
    // Click to place tower or pin enemy
    canvas.addEventListener('click', (e) => {
        if (game.gameOver || game.victory) return;
        
        // If hovering over an enemy, pin/unpin it
        if (game.hoveredEnemy) {
            if (game.pinnedEnemy === game.hoveredEnemy) {
                // Unpin if already pinned
                game.pinnedEnemy = null;
            } else {
                // Pin the hovered enemy
                game.pinnedEnemy = game.hoveredEnemy;
            }
            return;
        }
        
        // If no valid placement preview, deselect the tower
        if (!placementPreview) {
            game.selectedTower = null;
            game.pinnedEnemy = null;
            document.querySelectorAll('.tower-btn').forEach(b => b.classList.remove('selected'));
            return;
        }
        
        // Clear pinned enemy when placing a tower
        game.pinnedEnemy = null;
        
        // Check if tower is unlocked
        if (!isTowerUnlocked(game.selectedTower)) return;
        
        const cost = TOWER_TYPES[game.selectedTower].cost;
        if (game.credits < cost) { 
            if (typeof playSound === 'function') playSound('error', { volume: 0.5 });
            return; 
        }
        
        // Check not on existing tower
        for (const tower of game.towers) {
            const dx = tower.x - placementPreview.x;
            const dy = tower.y - placementPreview.y;
            if (Math.sqrt(dx*dx + dy*dy) < 30) return;
        }
        
        game.towers.push(new Tower(placementPreview.x, placementPreview.y, game.selectedTower)); if (typeof playSound === 'function') playSound('towerPlace', { volume: 0.6 });
        game.credits -= cost;
        
        // Notify tutorial manager of tower placement
        if (gameMode === 'tutorial' && typeof tutorialManager !== 'undefined') {
            tutorialManager.onTowerPlaced();
        }
    });
    
    // Click on sidebar to deselect tower
    document.getElementById('sidebar').addEventListener('click', (e) => {
        if (game.gameOver || game.victory) return;
        // Don't deselect if clicking on a tower button (they handle their own selection)
        if (e.target.closest('.tower-btn')) return;
        // Deselect tower when clicking on sidebar
        game.selectedTower = null;
        document.querySelectorAll('.tower-btn').forEach(b => b.classList.remove('selected'));
    });
    
    // Right-click to remove tower
    canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (game.gameOver || game.victory) return;
        
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        
        for (let i = 0; i < game.towers.length; i++) {
            const tower = game.towers[i];
            const dx = tower.x - x;
            const dy = tower.y - y;
            if (Math.sqrt(dx*dx + dy*dy) < 25) {
                const refund = Math.floor(TOWER_TYPES[tower.type].cost * 0.5);
                game.credits += refund;
                game.towers.splice(i, 1);
                log(`Removed (+${refund})`, 'collapse'); if (typeof playSound === 'function') playSound('towerRemove', { volume: 0.5 });
                
                // Notify tutorial manager of tower removal
                if (gameMode === 'tutorial' && typeof tutorialManager !== 'undefined') {
                    tutorialManager.checkStepCompletion();
                }
                break;
            }
        }
    });

    
    // Tower selection buttons
        document.querySelectorAll('.tower-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Check if tower is unlocked
            if (btn.classList.contains('locked')) return;
            
            document.querySelectorAll('.tower-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            game.selectedTower = btn.dataset.tower;
            
            // Notify tutorial manager of tower selection
            if (gameMode === 'tutorial' && typeof tutorialManager !== 'undefined') {
                tutorialManager.checkStepCompletion();
            }
        });
    });

    
    // Speed toggle buttons
    document.querySelectorAll('.speed-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            game.speed = parseInt(btn.dataset.speed);
        });
    });
    
    // Start wave button
    document.getElementById('start-btn').addEventListener('click', () => {
        if (game.waveInProgress || game.gameOver || game.victory) return;
        
        // Use the appropriate wave config based on game mode
        const waveConfig = (typeof getCurrentWaveConfig !== 'undefined') ? getCurrentWaveConfig() : WAVES[game.wave - 1];
        if (!waveConfig) { game.victory = true; log('VICTORY!', 'kill'); return; }
        
        game.waveInProgress = true;
        game.enemiesToSpawn = waveConfig.count;
        game.spawnTimer = 0;
        document.getElementById('start-btn').disabled = true;
        log(`Wave ${game.wave}: ${waveConfig.count} enemies`, 'spawn'); if (typeof playSound === 'function') playSound('waveStart', { volume: 0.7 });
        
        // Notify tutorial manager
        if (gameMode === 'tutorial' && typeof tutorialManager !== 'undefined') {
            tutorialManager.onWaveStarted();
        }
    });

}

// Draw placement preview
function drawPlacementPreview() {
    if (!placementPreview || game.gameOver || game.victory || !game.selectedTower) return;
    
    const config = TOWER_TYPES[game.selectedTower];
    
    // Tower preview
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = config.color;
    ctx.beginPath();
    ctx.arc(placementPreview.x, placementPreview.y, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    
    // Range indicator
    ctx.strokeStyle = config.color;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(placementPreview.x, placementPreview.y, 55, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createParticles,
        updateParticles,
        drawParticles,
        drawPath,
        drawBlochSphere,
        pointToSegmentDistance,
        updateHoverInfo,
        log,
        setupInput,
        drawPlacementPreview
    };
}
