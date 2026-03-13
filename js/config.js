// Game configuration constants

// Starting lives for the player
const STARTING_LIVES = 10;

// Starting credits for sandbox mode (unlimited)
const SANDBOX_STARTING_CREDITS = 999999;

// Starting credits for career mode
const CAREER_STARTING_CREDITS = 100;

// Tower types with costs, colors, and labels
const TOWER_TYPES = {
    hadamard: { cost: 15, color: '#00ffff', label: 'H' },
    rx20: { cost: 8, color: '#ff8888', label: 'X20' },
    rx45: { cost: 15, color: '#ff6666', label: 'X45' },
    rx90: { cost: 25, color: '#ff4444', label: 'X90' },
    ry20: { cost: 8, color: '#88ff88', label: 'Y20' },
    ry45: { cost: 15, color: '#66ff66', label: 'Y45' },
    ry90: { cost: 25, color: '#44ff44', label: 'Y90' },
    rz20: { cost: 5, color: '#ff88ff', label: 'Z20' },
    rz45: { cost: 8, color: '#ff66ff', label: 'Z45' },
    rz90: { cost: 12, color: '#ff44ff', label: 'Z90' },
    measure: { cost: 40, color: '#ffff66', label: 'Ψ' },
    measureX: { cost: 50, color: '#66ffff', label: '+' },
    measureY: { cost: 50, color: '#ffaa66', label: 'Y' }
};

// Career mode tower unlock progression (wave number when tower becomes available)
const CAREER_UNLOCKS = {
    1: ['rz45', 'hadamard', 'measure'],
    2: [],
    3: ['rz20','ry20', 'rx20'],
    4: [, 'rx45'],
    5: [],
    7: ['rx90','rz90','ry90'],
    8: ['ry45'],
    9: ['measureX'],
    10: ['measureY']
};

// Game mode: 'sandbox' or 'career'
let gameMode = 'sandbox';

// Path waypoints for enemies to follow
const PATH = [
    {x: -30, y: 100},
    {x: 150, y: 100},
    {x: 150, y: 280},
    {x: 450, y: 280},
    {x: 450, y: 100},
    {x: 700, y: 100},
    {x: 700, y: 500},
    {x: 300, y: 500},
    {x: 300, y: 650},
    {x: 850, y: 650},
    {x: 850, y: 380},
    {x: 1050, y: 380}
];

const SPAWN_INTERVAL = 8000;
// Wave definitions with enemy count and spawn interval
const WAVES = [
    { count: 5, interval: SPAWN_INTERVAL },
    { count: 8, interval: SPAWN_INTERVAL },
    { count: 12, interval: SPAWN_INTERVAL*0.8 },
    { count: 15, interval: SPAWN_INTERVAL*0.7 },
    { count: 20, interval: SPAWN_INTERVAL*0.6 }
];

// Tutorial waves - simplified for learning
const TUTORIAL_WAVES = [
    { count: 1, interval: 3000 },   // First wave: single enemy to learn
    { count: 3, interval: 2500 }    // Second wave: few enemies to test defense
];

// Tutorial mode tower unlocks - only Rx90 and Z-Measurement available
const TUTORIAL_UNLOCKS = ['rx90', 'measure'];

// Career mode custom wave messages (displayed at bottom of screen at end of each wave)
const WAVE_MESSAGES = [
    "Wave 1 Complete! Did you know even with the most optimal strategy there is a 15% chance of survival per enemy for wave 1? Hope you got lucky!",
    "Wave 2 Complete! Have some more gates, good luck figuring out how to use them.",
    "Wave 3 Complete! Another new gate coming your way. Now might be a good time to reconfigure your defense layout.",
    "Wave 4 Complete! The quantum gate shipment is delayed due to an AWS outage, you're on your own for this one.",
    "Wave 5 Complete! Victory is yours!"
];

// Display settings
let showWavefunction = true;
let showBlochSphere = true;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TOWER_TYPES, PATH, WAVES, showWavefunction, showBlochSphere };
}
