# Public Displays (Shared Tasks)

## Responsibilities

- Show real-time race data

## 5.1 Leaderboard Module

### Tasks

#### UI Components

- Table sorted by fastest lap
- Position badges (1st: 🥇, 2nd: 🥈, etc.)
- Race timer/mode indicator

#### Data Binding

- Update leaderboard on gameState changes

## 5.2 Next Race Module

### Tasks

#### UI Components

- Driver cards (car number + name)
- "Proceed to Paddock" announcement

#### Logic

- Show next session (or waiting message)

## 5.3 Race Countdown Module

### Tasks

#### UI Components

- Large timer display
- Warning state (last 30 seconds)
- Race status indicator

## 5.4 Race Flags Module

### Tasks

#### UI Components

- Fullscreen flag animations:
  - Green (safe)
  - Yellow pulsing (hazard)
  - Red flashing (danger)
  - Checkered (finish)

## Function signatures

### Leaderboard Module

```javascript
// Socket Initialization
function initializeSocket(): void

// UI Updates
function updateUI(): void
function updateRaceInfo(): void
function updateLeaderboard(): void

// Timer Updates
function updateTimer(timeRemaining: number): void

// Fullscreen Control
function toggleFullscreen(): void
```

### Next Race Module

```javascript
// Socket Initialization
function initializeSocket(): void

// UI Updates
function updateUI(): void

// Fullscreen Control
function toggleFullscreen(): void
```

### Race Countdown Module

```javascript
// Socket Initialization
function initializeSocket(): void

// UI Updates
function updateUI(): void
function updateStatus(): void
function updateTimer(timeRemaining: number): void
function updateRaceInfo(): void

// Fullscreen Control
function toggleFullscreen(): void
```

### Race Flags Module

```javascript
// Socket Initialization
function initializeSocket(): void

// UI Updates
function updateFlag(): void

// Fullscreen Control
function toggleFullscreen(): void
```
