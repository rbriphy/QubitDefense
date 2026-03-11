// Quantum mechanics - complex numbers, quantum states, gates, and measurements

// Complex number operations
const Complex = {
    create: (re, im) => ({ re, im }),
    
    add: (a, b) => ({ 
        re: a.re + b.re, 
        im: a.im + b.im 
    }),
    
    sub: (a, b) => ({ 
        re: a.re - b.re, 
        im: a.im - b.im 
    }),
    
    mul: (a, b) => ({ 
        re: a.re * b.re - a.im * b.im, 
        im: a.re * b.im + a.im * b.re 
    }),
    
    scale: (a, s) => ({ 
        re: a.re * s, 
        im: a.im * s 
    }),
    
    norm: (a) => Math.sqrt(a.re * a.re + a.im * a.im),
    
    conjugate: (a) => ({ 
        re: a.re, 
        im: -a.im 
    })
};

// Create a new quantum state |ψ⟩ = α|0⟩ + β|1⟩
// Initial state is |0⟩ (full health)
function createQuantumState() {
    return { 
        alpha: Complex.create(1, 0),
        beta: Complex.create(0, 0)
    };
}

// Normalize state to ensure |α|² + |β|² = 1
function normalize(state) {
    const normAlpha = Complex.norm(state.alpha);
    const normBeta = Complex.norm(state.beta);
    const total = Math.sqrt(normAlpha * normAlpha + normBeta * normBeta);
    
    if (total > 0.0001) {
        state.alpha = Complex.scale(state.alpha, 1/total);
        state.beta = Complex.scale(state.beta, 1/total);
    }
    return state;
}

// Rx gate - Rotation around X axis
// Rx(θ) = cos(θ/2)I - i sin(θ/2)X
function applyRx(state, angleDeg) {
    const angle = angleDeg * Math.PI / 180;
    const cos = Math.cos(angle / 2);
    const sin = Math.sin(angle / 2);
    
    // -i*sin = (0, -sin)
    const iSin = Complex.create(0, -sin);
    
    const newAlpha = Complex.add(
        Complex.scale(state.alpha, cos),
        Complex.mul(state.beta, iSin)
    );
    const newBeta = Complex.add(
        Complex.scale(state.beta, cos),
        Complex.mul(state.alpha, iSin)
    );
    
    state.alpha = newAlpha;
    state.beta = newBeta;
    return normalize(state);
}

// Ry gate - Rotation around Y axis
// Ry(θ) = cos(θ/2)I - sin(θ/2)Y
function applyRy(state, angleDeg) {
    const angle = angleDeg * Math.PI / 180;
    const cos = Math.cos(angle / 2);
    const sin = Math.sin(angle / 2);
    
    const newAlpha = Complex.add(
        Complex.scale(state.alpha, cos),
        Complex.scale(state.beta, -sin)
    );
    const newBeta = Complex.add(
        Complex.scale(state.beta, cos),
        Complex.scale(state.alpha, sin)
    );
    
    state.alpha = newAlpha;
    state.beta = newBeta;
    return normalize(state);
}

// Rz gate - Rotation around Z axis
// Rz(θ) = cos(θ/2)I - i sin(θ/2)Z
function applyRz(state, angleDeg) {
    const angle = angleDeg * Math.PI / 180;
    const cos = Math.cos(angle / 2);
    const sin = Math.sin(angle / 2);
    
    // Apply phase rotation: e^(-iθ/2) to alpha, e^(iθ/2) to beta
    const phaseAlpha = Complex.create(cos, -sin);
    const phaseBeta = Complex.create(cos, sin);
    
    state.alpha = Complex.mul(state.alpha, phaseAlpha);
    state.beta = Complex.mul(state.beta, phaseBeta);
    return normalize(state);
}

// Hadamard gate - creates superposition
// H = (1/√2)[[1,1],[1,-1]]
function applyHadamard(state) {
    const invSqrt2 = 1 / Math.sqrt(2);
    
    const newAlpha = Complex.add(
        Complex.scale(state.alpha, invSqrt2),
        Complex.scale(state.beta, invSqrt2)
    );
    const newBeta = Complex.add(
        Complex.scale(state.alpha, invSqrt2),
        Complex.scale(state.beta, -invSqrt2)
    );
    
    state.alpha = newAlpha;
    state.beta = newBeta;
    return normalize(state);
}

// Z-basis measurement (standard)
// |0⟩ = survive (full HP), |1⟩ = die
function measureZ(state) {
    const probOne = Complex.norm(state.beta) ** 2;
    const roll = Math.random();
    
    if (roll < probOne) {
        return { collapsed: true, alive: false, basis: 'Z', result: '|1⟩' };
    } else {
        return { collapsed: true, alive: true, basis: 'Z', result: '|0⟩' };
    }
}

// X-basis measurement (+ basis)
// Measures in X basis: |+⟩ and |-⟩ eigenstates
// Only Z-basis kills - X measurement never kills, just collapses state
function measureX(state) {
    // P(|+⟩) = |⟨+|ψ⟩|² = |(α+β)/√2|²
    const alphaPlusBeta = Complex.add(state.alpha, state.beta);
    const probPlus = (Complex.norm(alphaPlusBeta) ** 2) / 2;
    const roll = Math.random();
    
    const invSqrt2 = 1 / Math.sqrt(2);
    
    if (roll < probPlus) {
        // Collapsed to |+⟩ = (|0⟩ + |1⟩)/√2
        return { 
            collapsed: true, 
            alive: true,  // X measurement never kills
            basis: 'X', 
            result: '|+⟩',
            // Set collapsed state to |+⟩
            newState: {
                alpha: Complex.create(invSqrt2, 0),
                beta: Complex.create(invSqrt2, 0)
            }
        };
    } else {
        // Collapsed to |-⟩ = (|0⟩ - |1⟩)/√2
        return { 
            collapsed: true, 
            alive: true,  // X measurement never kills
            basis: 'X', 
            result: '|-⟩',
            // Set collapsed state to |-⟩
            newState: {
                alpha: Complex.create(invSqrt2, 0),
                beta: Complex.create(-invSqrt2, 0)
            }
        };
    }
}

// Y-basis measurement
// Measures in Y basis: |↗⟩ and |↙⟩ eigenstates
// Only Z-basis kills - Y measurement never kills, just collapses state
function measureY(state) {
    // Y basis states: |↗⟩ = (|0⟩ + i|1⟩)/√2, |↙⟩ = (|0⟩ - i|1⟩)/√2
    // P(|↗⟩) = |⟨↗|ψ⟩|² = |(α* - iβ*)/√2|²
    const alphaConj = Complex.conjugate(state.alpha);
    const betaConj = Complex.conjugate(state.beta);
    const minusIBeta = Complex.create(-betaConj.im, betaConj.re);
    const alphaMinusIBeta = Complex.add(alphaConj, minusIBeta);
    const probUp = (Complex.norm(alphaMinusIBeta) ** 2) / 2;
    const roll = Math.random();
    
    const invSqrt2 = 1 / Math.sqrt(2);
    
    if (roll < probUp) {
        // Collapsed to |↗⟩ = (|0⟩ + i|1⟩)/√2
        return { 
            collapsed: true, 
            alive: true,  // Y measurement never kills
            basis: 'Y', 
            result: '|↗⟩',
            // Set collapsed state to |↗⟩
            newState: {
                alpha: Complex.create(invSqrt2, 0),
                beta: Complex.create(0, invSqrt2)
            }
        };
    } else {
        // Collapsed to |↙⟩ = (|0⟩ - i|1⟩)/√2
        return { 
            collapsed: true, 
            alive: true,  // Y measurement never kills
            basis: 'Y', 
            result: '|↙⟩',
            // Set collapsed state to |↙⟩
            newState: {
                alpha: Complex.create(invSqrt2, 0),
                beta: Complex.create(0, -invSqrt2)
            }
        };
    }
}

// Generic measure function - dispatches to correct basis
function measure(state, basis = 'Z') {
    if (basis === 'X') return measureX(state);
    if (basis === 'Y') return measureY(state);
    return measureZ(state);
}

// Get health (probability of measuring |0⟩)
function getHealth(state) {
    return Complex.norm(state.alpha) ** 2;
}

// Get death probability (probability of measuring |1⟩)
function getDeathProb(state) {
    return Complex.norm(state.beta) ** 2;
}

// Convert quantum state to Bloch sphere coordinates
function stateToBloch(state) {
    const alpha = state.alpha;
    const beta = state.beta;
    
    const alphaMag = Complex.norm(alpha);
    const theta = 2 * Math.acos(Math.min(1, Math.max(0, alphaMag)));
    
    let phi = 0;
    if (Complex.norm(beta) > 0.001) {
        const betaPhase = Math.atan2(beta.im, beta.re);
        const alphaPhase = Math.atan2(alpha.im, alpha.re);
        phi = betaPhase - alphaPhase;
        if (phi < 0) phi += 2 * Math.PI;
    }
    
    return { theta, phi };
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Complex,
        createQuantumState,
        normalize,
        applyRx,
        applyRy,
        applyRz,
        applyHadamard,
        measure,
        measureZ,
        measureX,
        measureY,
        getHealth,
        getDeathProb,
        stateToBloch
    };
}
