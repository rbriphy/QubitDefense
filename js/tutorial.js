// Tutorial Mode - Interactive guided gameplay for new players

class TutorialManager {
    constructor() {
        this.currentStep = 0;
        this.isActive = false;
        this.isComplete = false;
        this.tutorialEnemiesKilled = 0;
        this.tutorialWavesCompleted = 0;
        this.placedTowers = 0;
        this.hasSeenEnemy = false;
        this.hasHoveredEnemy = false;
        this.tutorialEnemy = null;
        this.steps = this.initSteps();
    }

    // Initialize all tutorial steps
    initSteps() {
        return [
            // Phase 1: Introduction (Steps 0-1)
            {
                id: 'welcome',
                title: 'Welcome to Qubit Defense!',
                instruction: 'In this tutorial, you\'ll learn the basics of quantum tower defense. Click "Continue" to begin.',
                highlightElement: null,
                requiredAction: 'continue',
                onComplete: () => {
                    this.advanceStep();
                }
            },
            {
                id: 'goal',
                title: 'The Goal',
                instruction: 'Enemies travel along the path from START to END. Your job is to kill them before they escape! Each escaped enemy costs you 1 life.',
                highlightElement: null,
                requiredAction: 'continue',
                onComplete: () => {
                    this.advanceStep();
                }
            },
            
            // Phase 2: Tower Basics (Steps 2-5)
            {
                id: 'selectTower',
                title: 'Select a Tower',
                instruction: 'Click on "Ψ" (Z-Measurement) in the sidebar to select this tower. Measurement towers force enemies to collapse their quantum state!',
                highlightElement: '.tower-btn[data-tower="measure"]',
                requiredAction: 'selectTower',
                towerToSelect: 'measure',
                completionCondition: () => {
                    return game.selectedTower === 'measure';
                }
            },
            {
                id: 'placeTower',
                title: 'Place a Tower',
                instruction: 'Move your mouse over the path and left-click to place the tower. Place it near the highlighted area (later in the path).',
                highlightElement: '#game',
                requiredAction: 'placeTower',
                placementHint: { x: -410, y: 100 },  // Middle of path - good for measurement tower (between points 4-5)
                towerPlaced: false,
                completionCondition: () => {
                    if (game.towers.length >= 1) {
                        this.steps[this.currentStep].towerPlaced = true;
                        return true;
                    }
                    return false;
                }
            },
            {
                id: 'removeTower',
                title: 'Remove a Tower',
                instruction: 'Right-click on your placed tower to remove it. You\'ll receive a partial refund. This is useful if you want to reposition a tower!',
                highlightElement: null,
                requiredAction: 'removeTower',
                towerWasRemoved: false,
                completionCondition: () => {
                    // First check if tower was previously placed in step 3
                    const placeTowerStep = this.steps.find(s => s.id === 'placeTower');
                    if (placeTowerStep && placeTowerStep.towerPlaced && game.towers.length === 0) {
                        this.steps[this.currentStep].towerWasRemoved = true;
                        return true;
                    }
                    return false;
                }
            },
            {
                id: 'placeTowerAgain',
                title: 'Place the Tower Again',
                instruction: 'Now place the tower again near the path. You\'ll need it to defend against enemies!',
                highlightElement: '#game',
                requiredAction: 'placeTower',
                placementHint: { x: -410, y: 100 },  // Later in path - good for measurement tower
                completionCondition: () => {
                    return game.towers.length >= 1;
                }
            },
            
            // Phase 5: Rotation towers (Steps 6-7)
            {
                id: 'rotationGates',
                title: 'Rotation Gates',
                instruction: 'Rotation towers (Rx, Ry, Rz) rotate the enemy\'s quantum state on the Bloch sphere, changing the probability of death. Select the X90 (Rx90°) tower.',
                highlightElement: '.tower-btn[data-tower="rx90"]',
                requiredAction: 'selectTower',
                towerToSelect: 'rx90',
                completionCondition: () => {
                    return game.selectedTower === 'rx90';
                }
            },
            {
                id: 'placeRotation',
                title: 'Build a Defense',
                instruction: 'Place 2 rotation towers along the path before your measurement tower. These will move the enemy toward |1⟩ (death state).',
                highlightElement: null,
                requiredAction: 'placeTower',
                towerToSelect: 'rx90',
                placementHints: [
                    { x: -850, y: 25 },  // Earlier in path (between start point and first turn) - good for rotation towers
                    { x: -700, y: 25 }   // Second rotation tower position - REPLACE WITH YOUR COORDINATES
                ],
                completionCondition: () => {
                    return game.towers.length >= 3;
                }
            },
            
            // Phase 6: Start first wave (Step 8)
            {
                id: 'startWave1',
                title: 'Start Your First Wave',
                instruction: 'Click the "START WAVE" button to begin spawning enemies. A single enemy will appear - watch it travel along the path!',
                highlightElement: '#start-btn',
                requiredAction: 'startWave',
                completionCondition: () => {
                    return game.waveInProgress;
                }
            },
            
            // Phase 7: Understanding quantum state (Step 9)
            {
                id: 'hoverEnemy',
                title: 'Understanding Quantum State',
                instruction: 'Hover your mouse over the enemy to see its quantum state. The sidebar shows the probability amplitudes α and β. |0⟩ means survive, |1⟩ means die! You can click on an enemy to pin its quantum state in the sidebar.',
                highlightElement: null,
                requiredAction: 'hoverEnemy',
                completionCondition: () => {
                    return this.hasHoveredEnemy;
                }
            },
            
            // Phase 8: Final wave (Steps 10-11)
            {
                id: 'startWave2',
                title: 'Final Wave',
                instruction: 'After a round is over, click START WAVE again to send the next wave of enemies through your defenses. Watch how the quantum state changes as it passes each tower!',
                highlightElement: '#start-btn',
                requiredAction: 'startWave',
                completionCondition: () => {
                    return game.waveInProgress && game.wave === 2;
                }
            },
            {
                id: 'watchResult',
                title: 'Quantum Collapse!',
                instruction: 'When the enemy reaches the measurement tower, its quantum state will collapse to either |0⟩ (survive) or |1⟩ (die). The probability depends on how you positioned your rotation towers!',
                highlightElement: null,
                requiredAction: 'waitForKill',
                completionCondition: () => {
                    // Wait for either kill or enemy escapes
                    return this.tutorialEnemiesKilled >= 1 || (game.enemies.length === 0 && !game.waveInProgress);
                }
            },
            
            // Phase 9: Completion (Step 12)
            {
                id: 'complete',
                title: 'Tutorial Complete!',
                instruction: 'Congratulations! You\'ve learned the basics of quantum tower defense. In Career Mode, new tower types will unlock as you progress through waves. Good luck!',
                highlightElement: null,
                requiredAction: 'continue',
                onComplete: () => {
                    this.completeTutorial();
                }
            }
        ];
    }

    // Start the tutorial
    start() {
        // Check if tutorial was already completed (but allow restart from menu)
        const forceStart = sessionStorage.getItem('forceTutorial') === 'true';
        if (!forceStart && localStorage.getItem('tutorialCompleted') === 'true') {
            return false;
        }
        sessionStorage.removeItem('forceTutorial');
        
        this.isActive = true;
        this.currentStep = 0;
        this.isComplete = false;
        this.tutorialEnemiesKilled = 0;
        this.tutorialWavesCompleted = 0;
        this.placedTowers = 0;
        this.hasSeenEnemy = false;
        this.hasHoveredEnemy = false;
        
        this.createUI();
        this.showStep(0);
        return true;
    }

    // Force start tutorial (from menu)
    forceStart() {
        sessionStorage.setItem('forceTutorial', 'true');
        localStorage.removeItem('tutorialCompleted');
    }

    // Create tutorial UI overlay
    createUI() {
        // Remove existing tutorial UI if any
        this.removeUI();
        
        const overlay = document.createElement('div');
        overlay.id = 'tutorial-overlay';
        overlay.innerHTML = `
            <div class="tutorial-header">
                <span class="tutorial-progress">Step <span id="tutorial-step-num">1</span> of <span id="tutorial-total-steps">12</span></span>
                <button id="tutorial-skip-btn" class="tutorial-skip-btn">Skip Tutorial</button>
            </div>
            <h3 id="tutorial-title">Welcome</h3>
            <p id="tutorial-instruction">Instructions go here</p>
            <button id="tutorial-continue-btn" class="tutorial-continue-btn">Continue</button>
            <div class="tutorial-hint-arrow" id="tutorial-hint"></div>
            <div id="tutorial-placement-hint" class="tutorial-placement-hint"></div>
        `;
        
        document.getElementById('game-container').appendChild(overlay);
        
        // Set up event listeners
        document.getElementById('tutorial-continue-btn').addEventListener('click', () => {
            const step = this.steps[this.currentStep];
            if (step.requiredAction === 'continue' && step.onComplete) {
                step.onComplete();
            }
        });
        
        document.getElementById('tutorial-skip-btn').addEventListener('click', () => {
            this.skipTutorial();
        });
        
        // Update total steps display
        document.getElementById('tutorial-total-steps').textContent = this.steps.length;
    }

    // Remove tutorial UI
    removeUI() {
        const existing = document.getElementById('tutorial-overlay');
        if (existing) {
            existing.remove();
        }
        
        // Remove all highlights
        document.querySelectorAll('.tutorial-highlight').forEach(el => {
            el.classList.remove('tutorial-highlight');
        });
    }

    // Show a specific tutorial step
    showStep(stepIndex) {
        if (stepIndex >= this.steps.length) {
            this.completeTutorial();
            return;
        }
        
        this.currentStep = stepIndex;
        const step = this.steps[stepIndex];
        
        // Update UI
        document.getElementById('tutorial-step-num').textContent = stepIndex + 1;
        document.getElementById('tutorial-title').textContent = step.title;
        document.getElementById('tutorial-instruction').textContent = step.instruction;
        
        // Show/hide continue button based on action type
        const continueBtn = document.getElementById('tutorial-continue-btn');
        continueBtn.style.display = step.requiredAction === 'continue' ? 'inline-block' : 'none';
        
        // Handle tower pre-selection
        if (step.towerToSelect) {
            game.selectedTower = step.towerToSelect;
            document.querySelectorAll('.tower-btn').forEach(btn => {
                btn.classList.remove('selected');
                if (btn.dataset.tower === step.towerToSelect) {
                    btn.classList.add('selected');
                }
            });
        }
        
        // Highlight element
        this.highlightElement(step.highlightElement);
        
        // Show placement hint if specified (supports both single hint and array of hints)
        const hints = step.placementHints || (step.placementHint ? [step.placementHint] : null);
        this.showPlacementHints(hints);
        
        // Clear previous hint
        const hint = document.getElementById('tutorial-hint');
        hint.style.display = 'none';
    }

    // Show placement hint circle(s) on the game area
    showPlacementHints(coords) {
        const hintEl = document.getElementById('tutorial-placement-hint');
        if (!hintEl) return;
        
        // Handle both single coordinate and array of coordinates
        const coordsArray = Array.isArray(coords) ? coords : (coords ? [coords] : []);
        
        if (coordsArray.length === 0) {
            hintEl.style.display = 'none';
            return;
        }
        
        const canvas = document.getElementById('game');
        const container = document.getElementById('game-container');
        if (!canvas || !container) return;
        
        const canvasRect = canvas.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        // Clear previous hints and create new ones
        hintEl.innerHTML = '';
        
        coordsArray.forEach(coord => {
            const hintCircle = document.createElement('div');
            hintCircle.className = 'tutorial-placement-hint-circle';
            
            // Calculate position relative to container (subtract 30 to center the 60x60 circle)
            const left = (canvasRect.left - containerRect.left) + coord.x - 30;
            const top = (canvasRect.top - containerRect.top) + coord.y - 30;
            
            hintCircle.style.left = left + 'px';
            hintCircle.style.top = top + 'px';
            hintEl.appendChild(hintCircle);
        });
        
        hintEl.style.display = 'block';
    }

    // Highlight a specific element
    highlightElement(selector) {
        // Remove all existing highlights
        document.querySelectorAll('.tutorial-highlight').forEach(el => {
            el.classList.remove('tutorial-highlight');
        });
        
        if (!selector) return;
        
        setTimeout(() => {
            const el = document.querySelector(selector);
            if (el) {
                el.classList.add('tutorial-highlight');
                
                // Position hint arrow
                const hint = document.getElementById('tutorial-hint');
                const rect = el.getBoundingClientRect();
                const containerRect = document.getElementById('game-container').getBoundingClientRect();
                
                hint.style.display = 'block';
                hint.style.top = (rect.bottom - containerRect.top + 10) + 'px';
                hint.style.left = (rect.left - containerRect.left + rect.width/2) + 'px';
            }
        }, 100);
    }

    // Advance to next step
    advanceStep() {
        this.showStep(this.currentStep + 1);
    }

    // Check if current step is complete
    checkStepCompletion() {
        if (!this.isActive) return;
        
        const step = this.steps[this.currentStep];
        if (!step.completionCondition) return;
        
        if (step.completionCondition()) {
            // Small delay before advancing
            setTimeout(() => {
                this.advanceStep();
            }, 500);
        }
    }

    // Handle enemy kill in tutorial
    onEnemyKilled() {
        this.tutorialEnemiesKilled++;
        this.checkStepCompletion();
    }

    // Handle enemy hover in tutorial
    onEnemyHovered() {
        // Prevent multiple triggers - only process first hover
        if (this.hasHoveredEnemy) return;
        
        this.hasHoveredEnemy = true;
        this.checkStepCompletion();
    }

    // Handle tower placed in tutorial
    onTowerPlaced() {
        this.placedTowers++;
        this.checkStepCompletion();
    }

    // Handle wave started in tutorial
    onWaveStarted() {
        this.checkStepCompletion();
    }

    // Complete the tutorial
    completeTutorial() {
        this.isActive = false;
        this.isComplete = true;
        localStorage.setItem('tutorialCompleted', 'true');
        
        // Show completion message
        const overlay = document.getElementById('tutorial-overlay');
        if (overlay) {
            overlay.innerHTML = `
                <div class="tutorial-complete">
                    <h3>🎉 Tutorial Complete!</h3>
                    <p>You\'re now ready to play Career Mode!</p>
                    <button id="tutorial-finish-btn" class="tutorial-continue-btn">Start Playing</button>
                </div>
            `;
            
            document.getElementById('tutorial-finish-btn').addEventListener('click', () => {
                this.endTutorial();
            });
        }
    }

    // Skip the tutorial
    skipTutorial() {
        this.isActive = false;
        this.isComplete = true;
        localStorage.setItem('tutorialCompleted', 'true');
        this.endTutorial();
    }

    // End tutorial and return to menu
    endTutorial() {
        this.removeUI();
        
        // Stop the game and return to menu
        game.running = false;
        document.getElementById('game-container').classList.add('hidden');
        document.getElementById('title-screen').classList.remove('hidden');
    }

    // Reset tutorial state (for restart)
    reset() {
        this.currentStep = 0;
        this.isActive = false;
        this.isComplete = false;
        this.removeUI();
    }
}

// Global tutorial manager instance
const tutorialManager = new TutorialManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TutorialManager, tutorialManager };
}
