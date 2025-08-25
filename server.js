require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Utility function to clean game state before emission
function cleanGameStateForEmission(state) {
  // Create a shallow copy
  const cleanState = { ...state };

  // Remove non-serializable properties
  delete cleanState.raceTimer;

  // Handle nested objects
  cleanState.raceSessions = state.raceSessions.map((session) => ({
    ...session,
  }));
  cleanState.lapTimes = { ...state.lapTimes };

  return cleanState;
}

// Check for required environment variables
const requiredKeys = ['RECEPTIONIST_KEY', 'OBSERVER_KEY', 'SAFETY_KEY'];
const missingKeys = requiredKeys.filter((key) => !process.env[key]);

if (missingKeys.length > 0) {
  console.error('Error: Missing required environment variables:');
  missingKeys.forEach((key) => console.error(`  - ${key}`));
  console.error('\nUsage example:');
  console.error('export RECEPTIONIST_KEY=8ded6076');
  console.error('export OBSERVER_KEY=662e0f6c');
  console.error('export SAFETY_KEY=a2d393bc');
  console.error('npm start');
  process.exit(1);
}

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Application state
let gameState = {
  raceSessions: [],
  currentRaceIndex: -1,
  raceStatus: 'waiting', // waiting, active, finished
  raceMode: 'safe', // safe, hazard, danger, finish
  raceTimer: null,
  raceTimeRemaining: 0,
  lapTimes: {}, // carNumber: { laps: [], fastestLap: null, currentLap: 0 }
  raceStartTime: null,
};

// Get race duration from environment (10 minutes normal, 1 minute dev)
const RACE_DURATION = parseInt(process.env.RACE_DURATION) || 600000; // Default 10 minutes

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/front-desk', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'front-desk.html'));
});

app.get('/race-control', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'race-control.html'));
});

app.get('/lap-line-tracker', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'lap-line-tracker.html'));
});

app.get('/leaderboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'leaderboard.html'));
});

app.get('/next-race', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'next-race.html'));
});

app.get('/race-countdown', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'race-countdown.html'));
});

app.get('/race-flags', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'race-flags.html'));
});

// Authentication endpoint
app.post('/authenticate', (req, res) => {
  const { key, interface: interfaceType } = req.body;

  // 500ms delay before responding (security requirement)
  setTimeout(() => {
    let isValid = false;

    switch (interfaceType) {
      case 'front-desk':
        isValid = key === process.env.RECEPTIONIST_KEY;
        break;
      case 'race-control':
        isValid = key === process.env.SAFETY_KEY;
        break;
      case 'lap-line-tracker':
        isValid = key === process.env.OBSERVER_KEY;
        break;
    }

    res.json({ success: isValid });
  }, 500);
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Send initial state to client
  socket.emit('gameState', cleanGameStateForEmission(gameState));

  // Handle race session management
  socket.on('addRaceSession', (data) => {
    const newSession = {
      id: Date.now(),
      drivers: [],
      createdAt: new Date(),
    };
    gameState.raceSessions.push(newSession);
    io.emit('gameState', cleanGameStateForEmission(gameState));
  });

  socket.on('removeRaceSession', (sessionId) => {
    gameState.raceSessions = gameState.raceSessions.filter(
      (session) => session.id !== sessionId
    );
    if (gameState.currentRaceIndex >= gameState.raceSessions.length) {
      gameState.currentRaceIndex = -1;
    }
    io.emit('gameState', cleanGameStateForEmission(gameState));
  });

  socket.on('addDriver', (data) => {
    const { sessionId, driverName } = data;
    const session = gameState.raceSessions.find((s) => s.id === sessionId);

    if (session && session.drivers.length < 8) {
      // Check for duplicate names in the same session
      const nameExists = session.drivers.some(
        (driver) => driver.name === driverName
      );
      if (!nameExists) {
        // Assign next available car number
        const usedCars = session.drivers.map((d) => d.carNumber);
        let carNumber = 1;
        while (usedCars.includes(carNumber)) {
          carNumber++;
        }

        session.drivers.push({
          name: driverName,
          carNumber: carNumber,
        });
        io.emit('gameState', cleanGameStateForEmission(gameState));
      }
    }
  });

  socket.on('editDriver', (data) => {
    const { sessionId, driverIndex, newName } = data;
    const session = gameState.raceSessions.find((s) => s.id === sessionId);

    if (session && session.drivers[driverIndex]) {
      // Check for duplicate names in the same session
      const nameExists = session.drivers.some(
        (driver, index) => driver.name === newName && index !== driverIndex
      );

      if (!nameExists) {
        session.drivers[driverIndex].name = newName;
        io.emit('gameState', cleanGameStateForEmission(gameState));
      }
    }
  });

  socket.on('removeDriver', (data) => {
    const { sessionId, driverIndex } = data;
    const session = gameState.raceSessions.find((s) => s.id === sessionId);
    if (session) {
      session.drivers.splice(driverIndex, 1);
      io.emit('gameState', cleanGameStateForEmission(gameState));
    }
  });

  // Handle race control
  socket.on('startRace', () => {
    if (gameState.raceSessions.length > 0) {
      gameState.currentRaceIndex = 0;
      gameState.raceStatus = 'active';
      gameState.raceMode = 'safe';
      gameState.raceTimeRemaining = RACE_DURATION;
      gameState.raceStartTime = Date.now();

      // Clear ALL previous lap times when starting a new race
      gameState.lapTimes = {};

      // Initialize lap times for current race
      const currentSession = gameState.raceSessions[gameState.currentRaceIndex];
      if (currentSession) {
        currentSession.drivers.forEach((driver) => {
          gameState.lapTimes[driver.carNumber] = {
            laps: [],
            fastestLap: null,
            currentLap: 0,
            driverName: driver.name,
          };
        });
      }

      // Start race timer
      startRaceTimer();
      io.emit('gameState', cleanGameStateForEmission(gameState));
    }
  });

  socket.on('changeRaceMode', (mode) => {
    if (gameState.raceStatus === 'active' && mode !== 'finish') {
      gameState.raceMode = mode;
      io.emit('gameState', cleanGameStateForEmission(gameState));
    } else if (mode === 'finish') {
      finishRace();
    }
  });

  socket.on('endRaceSession', () => {
    if (gameState.raceStatus === 'finished') {
      // Clear lap times when ending a session
      gameState.lapTimes = {};

      // Move to next session
      if (gameState.currentRaceIndex < gameState.raceSessions.length - 1) {
        gameState.currentRaceIndex++;
      } else {
        gameState.currentRaceIndex = -1;
      }

      gameState.raceStatus = 'waiting';
      gameState.raceMode = 'danger';
      gameState.raceTimeRemaining = 0;

      // Clear race timer
      if (gameState.raceTimer) {
        clearInterval(gameState.raceTimer);
        gameState.raceTimer = null;
      }

      io.emit('gameState', cleanGameStateForEmission(gameState));
    }
  });

  // Handle lap recording
  socket.on('recordLap', (carNumber) => {
    if (gameState.raceStatus === 'active' || gameState.raceMode === 'finish') {
      const carData = gameState.lapTimes[carNumber];
      if (carData) {
        const lapTime = Date.now() - gameState.raceStartTime;
        const lapDuration =
          carData.laps.length > 0
            ? lapTime - carData.laps[carData.laps.length - 1]
            : lapTime;

        carData.laps.push(lapTime);
        carData.currentLap++;

        // Update fastest lap
        if (!carData.fastestLap || lapDuration < carData.fastestLap) {
          carData.fastestLap = lapDuration;
        }

        io.emit('gameState', cleanGameStateForEmission(gameState));
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

function startRaceTimer() {
  gameState.raceTimer = setInterval(() => {
    gameState.raceTimeRemaining -= 1000;

    if (gameState.raceTimeRemaining <= 0) {
      finishRace();
    } else {
      io.emit('raceTimer', gameState.raceTimeRemaining);
    }
  }, 1000);
}

function finishRace() {
  gameState.raceMode = 'finish';
  gameState.raceTimeRemaining = 0;

  if (gameState.raceTimer) {
    clearInterval(gameState.raceTimer);
    gameState.raceTimer = null;
  }

  // After a short delay, mark race as finished
  setTimeout(() => {
    gameState.raceStatus = 'finished';
    io.emit('gameState', cleanGameStateForEmission(gameState));
  }, 3000);

  io.emit('gameState', cleanGameStateForEmission(gameState));
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Beachside Racetrack server running on port ${PORT}`);
  console.log(`Race duration: ${RACE_DURATION / 1000} seconds`);
  console.log('\nAvailable interfaces:');
  console.log(
    `- Front Desk (Receptionist): http://localhost:${PORT}/front-desk`
  );
  console.log(
    `- Race Control (Safety Official): http://localhost:${PORT}/race-control`
  );
  console.log(
    `- Lap Line Tracker (Observer): http://localhost:${PORT}/lap-line-tracker`
  );
  console.log(
    `- Leaderboard (Spectators): http://localhost:${PORT}/leaderboard`
  );
  console.log(`- Next Race (Drivers): http://localhost:${PORT}/next-race`);
  console.log(
    `- Race Countdown (Drivers): http://localhost:${PORT}/race-countdown`
  );
  console.log(`- Race Flags (Drivers): http://localhost:${PORT}/race-flags`);
});
