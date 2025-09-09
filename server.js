require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs').promises;
const ngrok = require('ngrok');

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
  raceMode: 'danger', // safe, hazard, danger, finish - Start with Danger mode
  raceTimer: null,
  raceTimeRemaining: 0,
  lapTimes: {}, // carNumber: { laps: [], fastestLap: null, currentLap: 0 }
  raceStartTime: null,
  lastUpdated: Date.now(),
};

// Get race duration from environment (10 minutes normal, 1 minute dev)
const RACE_DURATION = parseInt(process.env.RACE_DURATION) || 600000; // Default 10 minutes

// State persistence
const STATE_FILE = 'gameState.json';

async function saveGameState() {
  try {
    const stateToSave = cleanGameStateForEmission(gameState);
    stateToSave.lastUpdated = Date.now();
    await fs.writeFile(STATE_FILE, JSON.stringify(stateToSave, null, 2));
  } catch (error) {
    console.error('Error saving game state:', error);
  }
}

async function loadGameState() {
  try {
    const data = await fs.readFile(STATE_FILE, 'utf8');
    const loadedState = JSON.parse(data);

    // Calculate time elapsed since last save if race was active
    if (loadedState.raceStatus === 'active') {
      const timeElapsed = Date.now() - loadedState.lastUpdated;
      loadedState.raceTimeRemaining = Math.max(
        0,
        loadedState.raceTimeRemaining - timeElapsed
      );

      // If race time has expired, finish the race
      if (loadedState.raceTimeRemaining <= 0) {
        loadedState.raceStatus = 'finished';
        loadedState.raceMode = 'finish';
      }
    }

    // Merge loaded state with current state, preserving non-serializable properties
    gameState = {
      ...loadedState,
      raceTimer: null, // Will be recreated if needed
    };

    console.log('Game state loaded successfully');

    // If race was active, restart the timer
    if (loadedState.raceStatus === 'active') {
      startRaceTimer();
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('No saved game state found, starting fresh');
    } else {
      console.error('Error loading game state:', error);
    }
  }
}

function startRaceTimer() {
  // Clear any existing timer
  if (gameState.raceTimer) {
    clearInterval(gameState.raceTimer);
  }

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
    saveGameState();
  }, 3000);

  io.emit('gameState', cleanGameStateForEmission(gameState));
  saveGameState();
}

// Auto-save interval (every 5 seconds)
setInterval(() => {
  saveGameState();
}, 5000);

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
    saveGameState();
  });

  socket.on('removeRaceSession', (sessionId) => {
    gameState.raceSessions = gameState.raceSessions.filter(
      (session) => session.id !== sessionId
    );
    if (gameState.currentRaceIndex >= gameState.raceSessions.length) {
      gameState.currentRaceIndex = -1;
    }
    io.emit('gameState', cleanGameStateForEmission(gameState));
    saveGameState();
  });

  socket.on('addDriver', (data) => {
    const { sessionId, driverName, carNumber } = data;
    const session = gameState.raceSessions.find((s) => s.id === sessionId);

    if (session && session.drivers.length < 8) {
      // Check for duplicate names in the same session
      const nameExists = session.drivers.some(
        (driver) => driver.name === driverName
      );

      // If carNumber is provided, check for duplicate car numbers in the same session
      let carExists = false;
      if (carNumber) {
        carExists = session.drivers.some(
          (driver) => driver.carNumber === carNumber
        );
      }

      if (!nameExists && !carExists) {
        // If no car number provided, auto-assign the next available number
        let assignedCarNumber = carNumber;
        if (!assignedCarNumber) {
          const usedCars = session.drivers.map((d) => d.carNumber);
          assignedCarNumber = 1;
          while (usedCars.includes(assignedCarNumber)) {
            assignedCarNumber++;
          }
        }

        session.drivers.push({
          name: driverName,
          carNumber: assignedCarNumber,
        });
        io.emit('gameState', cleanGameStateForEmission(gameState));
        saveGameState();
      }
    }
  });

  socket.on('updateDriver', (data) => {
    const { sessionId, driverIndex, driverName, carNumber } = data;
    const session = gameState.raceSessions.find((s) => s.id === sessionId);

    if (session && session.drivers[driverIndex]) {
      // Check for duplicate names in the same session
      const nameExists = session.drivers.some(
        (driver, index) => driver.name === driverName && index !== driverIndex
      );

      // If carNumber is provided, check for duplicate car numbers in the same session
      let carExists = false;
      if (carNumber) {
        carExists = session.drivers.some(
          (driver, index) =>
            driver.carNumber === carNumber && index !== driverIndex
        );
      }

      if (!nameExists && !carExists) {
        session.drivers[driverIndex].name = driverName;
        // Only update car number if provided (null means auto-assign)
        if (carNumber) {
          session.drivers[driverIndex].carNumber = carNumber;
        }
        io.emit('gameState', cleanGameStateForEmission(gameState));
        saveGameState();
      }
    }
  });

  socket.on('removeDriver', (data) => {
    const { sessionId, driverIndex } = data;
    const session = gameState.raceSessions.find((s) => s.id === sessionId);
    if (session) {
      session.drivers.splice(driverIndex, 1);
      io.emit('gameState', cleanGameStateForEmission(gameState));
      saveGameState();
    }
  });

  // Handle race control
  socket.on('startRace', () => {
    if (gameState.raceSessions.length > 0) {
      gameState.currentRaceIndex = 0;
      gameState.raceStatus = 'active';
      gameState.raceMode = 'safe'; // Change from danger to safe when race starts
      gameState.raceTimeRemaining = RACE_DURATION;
      gameState.raceStartTime = Date.now();

      // Initialize lap times for current race
      gameState.lapTimes = {};
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
      saveGameState();
    }
  });

  socket.on('changeRaceMode', (mode) => {
    if (gameState.raceStatus === 'active' && mode !== 'finish') {
      gameState.raceMode = mode;
      io.emit('gameState', cleanGameStateForEmission(gameState));
      saveGameState();
    } else if (mode === 'finish') {
      finishRace();
    }
  });

  socket.on('endRaceSession', () => {
    if (gameState.raceStatus === 'finished') {
      // Remove the completed session from the list
      if (
        gameState.currentRaceIndex >= 0 &&
        gameState.currentRaceIndex < gameState.raceSessions.length
      ) {
        gameState.raceSessions.splice(gameState.currentRaceIndex, 1);
      }

      // Move to next session
      if (gameState.raceSessions.length > 0) {
        gameState.currentRaceIndex = 0; // Always set to the first session since we removed the completed one
      } else {
        gameState.currentRaceIndex = -1;
      }

      gameState.raceStatus = 'waiting';
      gameState.raceMode = 'danger'; // Change back to danger mode when session ends
      gameState.raceTimeRemaining = 0;
      gameState.lapTimes = {};

      // Clear race timer
      if (gameState.raceTimer) {
        clearInterval(gameState.raceTimer);
        gameState.raceTimer = null;
      }

      io.emit('gameState', cleanGameStateForEmission(gameState));
      saveGameState();
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
        saveGameState();
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Load saved state on server start and start server
loadGameState().then(() => {
  const PORT = process.env.PORT || 3000;
  const HOST = process.env.HOST || '0.0.0.0'; // Listen on all network interfaces

  server.listen(PORT, HOST, async () => {
    console.log(`Beachside Racetrack server running on ${HOST}:${PORT}`);
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

    console.log('\nTo access from other devices on your network:');
    console.log(`- Use your computer's IP address instead of localhost`);
    console.log(
      `- For example: http://192.168.1.100:${PORT} (replace with your actual IP)`
    );

    // Add ngrok setup if --ngrok flag is provided
    if (process.argv.includes('--ngrok')) {
      if (!process.env.NGROK_AUTHTOKEN) {
        console.error(
          '\nError: NGROK_AUTHTOKEN environment variable is not set.'
        );
        console.error(
          'Please get your authtoken from https://dashboard.ngrok.com/get-started/your-authtoken'
        );
        console.error(
          'Then set it: export NGROK_AUTHTOKEN=your_authtoken_here'
        );
        return;
      }

      try {
        console.log('\nSetting up ngrok tunnel...');
        await ngrok.authtoken(process.env.NGROK_AUTHTOKEN);
        const url = await ngrok.connect(PORT);

        console.log('\n✅ Ngrok tunnel established!');
        console.log('🌐 Public URL:', url);
        console.log(
          '\nYou can now access your application from anywhere using this URL.'
        );

        // Save the URL to a file
        await fs.writeFile(
          path.join(__dirname, 'ngrok-url.txt'),
          `Ngrok URL: ${url}\nGenerated at: ${new Date().toISOString()}\n`
        );

        console.log('\nURL saved to ngrok-url.txt');
      } catch (error) {
        console.error('Error creating ngrok tunnel:', error);
      }
    }
  });
});
