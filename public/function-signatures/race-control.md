// Authentication
function authenticate(): Promise<void>

// Socket Initialization
function initializeSocket(): void

// UI Updates
function updateUI(): void

// Race Control
function startRace(): void
function changeRaceMode(mode: 'safe' | 'hazard' | 'danger' | 'finish'): void
function endRaceSession(): void
