# Beachside Racetrack Management System

A real-time race management system built with Node.js and Socket.IO for Beachside Racetrack. This system provides comprehensive race session management, real-time lap tracking, and multiple interfaces for different user personas.

## Features

- **Real-time updates** using Socket.IO across all interfaces
- **Multi-interface system** with role-based access control
- **Race session management** with driver and car assignments
- **Live lap tracking** and leaderboard updates
- **Race mode control** with visual flag displays
- **Responsive design** optimized for various devices and screen sizes

## System Requirements

- Node.js (version 14 or higher)
- npm (Node Package Manager)

## Installation

1. Clone or download the project files
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```

## Environment Variables

Before starting the server, you must set the required access keys as environment variables:

```bash
export RECEPTIONIST_KEY=your_receptionist_key
export OBSERVER_KEY=your_observer_key
export SAFETY_KEY=your_safety_key
```

**Example:**

```bash
export RECEPTIONIST_KEY=8ded6076
export OBSERVER_KEY=662e0f6c
export SAFETY_KEY=a2d393bc
```

The server will not start without these environment variables being set.

## Starting the Server

### Production Mode (10-minute races)

```bash
npm start
```

### Development Mode (1-minute races)

```bash
npm run dev
```

The server will start on port 3000 by default. You can access the system at `http://localhost:3000`

## User Interfaces

The system provides multiple interfaces accessible via different routes:

### Employee Interfaces (Password Protected)

| Interface            | User              | Route               | Purpose                                        |
| -------------------- | ----------------- | ------------------- | ---------------------------------------------- |
| **Front Desk**       | Receptionist      | `/front-desk`       | Configure race sessions, add/remove drivers    |
| **Race Control**     | Safety Official   | `/race-control`     | Start races, control race modes, manage safety |
| **Lap Line Tracker** | Lap-line Observer | `/lap-line-tracker` | Record lap times as cars cross the lap line    |

### Public Displays

| Interface          | User         | Route             | Purpose                                    |
| ------------------ | ------------ | ----------------- | ------------------------------------------ |
| **Leader Board**   | Spectators   | `/leaderboard`    | View real-time lap times and standings     |
| **Next Race**      | Race Drivers | `/next-race`      | See upcoming race info and car assignments |
| **Race Countdown** | Race Drivers | `/race-countdown` | View race countdown timer and status       |
| **Race Flags**     | Race Drivers | `/race-flags`     | See current race mode and flag status      |

## User Guide

### 1. Configure Race Sessions (Front Desk)

1. Access `/front-desk` and enter your receptionist access key
2. Click "Add New Race Session" to create a new race
3. Add drivers to the session (up to 8 drivers per session)
   - Each driver name must be unique within the session
   - Cars are automatically assigned (1-8)
4. Remove drivers or entire sessions as needed

### 2. Control Races (Race Control)

1. Access `/race-control` and enter your safety official access key
2. Once race sessions are configured, click "Start Race" to begin
3. Use race mode controls during the race:
   - **Safe (Green)**: Normal racing conditions
   - **Hazard (Yellow)**: Drive slowly due to hazard
   - **Danger (Red)**: Stop driving immediately
   - **Finish (Chequered)**: Race finished, return to pit lane
4. Click "End Race Session" when all cars have returned to the pit lane

### 3. Record Lap Times (Lap Line Tracker)

1. Access `/lap-line-tracker` and enter your observer access key
2. During active races, large car number buttons will be enabled
3. Press the corresponding car number button each time a car crosses the lap line
4. Buttons are disabled when the race ends
5. View current lap counts and fastest lap times for each car

### 4. View Public Displays

The public displays update automatically in real-time:

- **Leader Board**: Shows current race standings sorted by fastest lap time
- **Next Race**: Displays upcoming race drivers and car assignments
- **Race Countdown**: Shows remaining race time and status
- **Race Flags**: Full-screen flag display showing current race mode

All public displays include a fullscreen button for optimal viewing on large monitors.

## Race Session Flow

1. **Configuration**: Receptionist adds race sessions and drivers at Front Desk
2. **Driver Briefing**: Safety Official reviews next race information
3. **Race Start**: Safety Official starts the race, changing mode to "Safe"
4. **Lap Recording**: Observer records lap times as cars cross the lap line
5. **Race Control**: Safety Official manages race modes as needed
6. **Race Finish**: Either timer expires or Safety Official sets "Finish" mode
7. **Session End**: Safety Official ends session, moves to next race

## Race Modes and Flag Colors

| Mode       | Display               | Description                       |
| ---------- | --------------------- | --------------------------------- |
| **Safe**   | Solid Green           | Normal racing conditions          |
| **Hazard** | Solid Yellow          | Drive slowly, hazard on track     |
| **Danger** | Solid Red             | Stop driving immediately          |
| **Finish** | Chequered Black/White | Race finished, return to pit lane |

## Technical Details

- **Server**: Node.js with Express framework
- **Real-time Communication**: Socket.IO
- **Frontend**: Vanilla JavaScript (no frameworks)
- **Data Storage**: In-memory (data is lost on server restart for MVP)
- **Security**: Environment variable authentication with 500ms response delay
- **Timer**: Configurable race duration (10 minutes production, 1 minute development)

## Troubleshooting

### Server Won't Start

- Ensure all required environment variables are set
- Check that Node.js and npm are installed
- Verify port 3000 is available

### Authentication Issues

- Double-check environment variable values
- Remember there's a 500ms delay before auth response
- Ensure you're using the correct interface key

### Real-time Updates Not Working

- Check browser console for JavaScript errors
- Ensure Socket.IO connection is established
- Try refreshing the page

## Support

For technical support or questions about the system, please refer to the documentation or contact the development team.
