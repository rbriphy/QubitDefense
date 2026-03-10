// Entity classes - Enemy and Tower

// Enemy class - represents a quantum enemy that travels along the path
class Enemy {
    constructor() {
        this.x = PATH[0].x;
        this.y = PATH[0].y;
        this.pathIndex = 0;
        this.speed = 0.7;
        this.quantumState = createQuantumState();
        this.size = 20;
        this.alive = true;
        this.reachedEnd = false;
        this.flashTimer = 0;
    }
    
    // Move along the path
    update() {
        if (!this.alive) return;
        
        const target = PATH[this.pathIndex + 1];
        if (!target) {
            this.reachedEnd = true;
            return;
        }
        
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const currentSpeed = this.speed * game.speed;
        
        if (dist < currentSpeed) {
            this.pathIndex++;
            if (this.pathIndex >= PATH.length - 1) {
                this.reachedEnd = true;
            }
        } else {
            this.x += (dx / dist) * currentSpeed;
            this.y += (dy / dist) * currentSpeed;
        }
        
        if (this.flashTimer > 0) this.flashTimer--;
    }
    
    // Apply a quantum gate to this enemy's state
    applyGate(gateType) {
        switch (gateType) {
            case 'hadamard': if (typeof playSound === 'function') playSound('gateApply', { volume: 0.4 }); 
                applyHadamard(this.quantumState); 
                break;
            case 'rx20': applyRx(this.quantumState, 20); break;
            case 'rx45': applyRx(this.quantumState, 45); break;
            case 'rx90': applyRx(this.quantumState, 90); break;
            case 'ry20': applyRy(this.quantumState, 20); break;
            case 'ry45': applyRy(this.quantumState, 45); break;
            case 'ry90': applyRy(this.quantumState, 90); break;
            case 'rz20': applyRz(this.quantumState, 20); break;
            case 'rz45': applyRz(this.quantumState, 45); break;
            case 'rz90': applyRz(this.quantumState, 90); break;
            case 'measure': if (typeof playSound === 'function') playSound('measurement', { volume: 0.5 });
                const resultZ = measure(this.quantumState, 'Z');
                this.handleMeasurement(resultZ);
                break;
            case 'measureX': if (typeof playSound === 'function') playSound('measurement', { volume: 0.5 });
                const resultX = measure(this.quantumState, 'X');
                this.handleMeasurement(resultX);
                break;
            case 'measureY': if (typeof playSound === 'function') playSound('measurement', { volume: 0.5 });
                const resultY = measure(this.quantumState, 'Y');
                this.handleMeasurement(resultY);
                break;
        }
    }
    
    // Handle measurement result (collapse or survival)
    handleMeasurement(result) {
        if (result.collapsed) {
            this.flashTimer = 20;
            if (!result.alive) {
                this.alive = false;
                game.kills++;
                game.credits += 15; if (typeof playSound === 'function') playSound('creditGain', { volume: 0.5 });
                log(`Collapsed to ${result.result} (${result.basis}) - KILLED!`, 'kill'); if (typeof playSound === 'function') playSound('enemyKill', { volume: 0.8 });
                createParticles(this.x, this.y, '#00ff00');
            } else {
                this.quantumState = createQuantumState();
                log(`Collapsed to ${result.result} (${result.basis}) - SURVIVED!`, 'collapse'); if (typeof playSound === 'function') playSound('enemySurvive', { volume: 0.6 });
                createParticles(this.x, this.y, '#ff0000');
            }
        }
    }
    
    // Draw the enemy on the canvas
    draw() {
        if (!this.alive) return;
        
        const health = getHealth(this.quantumState);
        const deathProb = getDeathProb(this.quantumState);
        
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.flashTimer > 0 ? '#ffffff' : '#00ffff';
        
        const r = Math.floor(255 * deathProb);
        const g = Math.floor(255 * health * 0.7);
        const b = Math.floor(255 * health);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.restore();
        
        // Draw quantum state info (wavefunction labels)
        if (showWavefunction) {
            const amp0 = this.quantumState.alpha;
            const amp1 = this.quantumState.beta;
            ctx.fillStyle = '#ffffff';
            ctx.font = '16px "Share Tech Mono"';
            ctx.textAlign = 'center';
            
            const formatAmp = (amp) => {
                const re = `${amp.re >= 0 ? '' : '-'}${Math.abs(amp.re).toFixed(2)}`;
                if (Math.abs(amp.im) < 0.005) return re;
                return `${re}${amp.im >= 0 ? '+' : '-'}${Math.abs(amp.im).toFixed(2)}i`;
            };
            
            ctx.fillText(`|0⟩:${formatAmp(amp0)}`, this.x, this.y - this.size - 20);
            ctx.fillText(`|1⟩:${formatAmp(amp1)}`, this.x, this.y - this.size - 3);
        }
        
        // Draw health bar
        const barWidth = 40;
        const barHeight = 4;
        ctx.fillStyle = '#333333';
        ctx.fillRect(this.x - barWidth/2, this.y + this.size + 5, barWidth, barHeight);
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(this.x - barWidth/2, this.y + this.size + 5, barWidth * health, barHeight);
        
        // Draw mini Bloch sphere
        if (showBlochSphere) {
            drawBlochSphere(this.x + 25, this.y + 25, 12, this.quantumState);
        }
    }
}

// Tower class - places quantum gates on enemies
class Tower {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.range = 55;
        this.cooldown = 0;
        this.maxCooldown = 35;
        this.pulseTimer = 0;
    }
    
    // Update tower state (cooldown, animation)
    update() {
        if (this.cooldown > 0) this.cooldown -= game.speed;
        this.pulseTimer += game.speed;
    }
    
    // Draw the tower
    draw() {
        const config = TOWER_TYPES[this.type];
        
        // Draw range indicator
        ctx.save();
        ctx.globalAlpha = 0.08 + Math.sin(this.pulseTimer * 0.1) * 0.03;
        ctx.fillStyle = config.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        // Draw tower body
        ctx.fillStyle = '#111';
        ctx.strokeStyle = config.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Draw inner circle
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = config.color;
        ctx.fillStyle = config.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        // Draw label
        ctx.fillStyle = '#000';
        ctx.font = 'bold 11px "Orbitron"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(config.label, this.x, this.y);
    }
    
    // Check for enemies in range and apply gate
    checkAndApply(enemies) {
        if (this.cooldown > 0) return;
        
        for (const enemy of enemies) {
            if (!enemy.alive) continue;
            
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < this.range) {
                enemy.applyGate(this.type);
                this.cooldown = this.maxCooldown;
                createParticles(this.x, this.y, TOWER_TYPES[this.type].color, 4); if (typeof playSound === 'function') playSound('towerActivate', { volume: 0.4 });
                break;
            }
        }
    }
}

// Export classes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Enemy, Tower };
}
