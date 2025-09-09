# Beachside Racetrack Management System

A real-time racetrack management system for Beachside Racetrack that allows employees to manage races and provides real-time information to drivers and spectators.

## Features

- **Front Desk Interface**: Configure race sessions and manage drivers
- **Race Control Interface**: Start races and control race modes
- **Lap Line Tracker**: Record lap times as cars cross the lap line
- **Public Displays**: Leaderboard, next race information, countdown timer, and race flags
- **Real-time Updates**: All interfaces update in real-time using Socket.IO
- **Access Control**: Secure employee interfaces with access keys
- **Remote Access**: Access from anywhere using ngrok tunnels
- **Data Persistence**: Race data is saved and restored on server restart

## Installation

1. Clone or download the project files
2. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

Set the required environment variables before starting the server:

```bash
# Required access keys for employee interfaces
export RECEPTIONIST_KEY=your_receptionist_key_here
export OBSERVER_KEY=your_observer_key_here
export SAFETY_KEY=your_safety_key_here

# Optional: For ngrok remote access
export NGROK_AUTHTOKEN=your_ngrok_authtoken_here

# Optional: Custom port (default: 3000)
export PORT=3000
```

## Running the Server

### Production Mode (10-minute races)

```bash
npm start
```

### Development Mode (1-minute races)

```bash
npm run dev
```

### Development Mode with Ngrok (1-minute races + public URL)

```bash
npm run dev:ngrok
```

### Ngrok Only (after server is running)

```bash
npm run ngrok
```

## Accessing the Interfaces

### Local Access

The server will start and be accessible on all network interfaces. You can access it from:

- **Local machine**: `http://localhost:3000`
- **Other devices on your network**: `http://[your-computer-ip]:3000`

To find your computer's IP address:

- Windows: Run `ipconfig` in Command Prompt
- Mac/Linux: Run `ifconfig` in Terminal

### Remote Access via Ngrok

When using ngrok, you'll get a public URL that looks like: `https://abc123.ngrok.io`

This URL can be accessed from anywhere on the internet - perfect for testing on mobile devices or sharing with others.

### Available Interfaces

| Interface        | Route               | Persona           | Access Key       |
| ---------------- | ------------------- | ----------------- | ---------------- |
| Main Page        | `/`                 | All               | None             |
| Front Desk       | `/front-desk`       | Receptionist      | RECEPTIONIST_KEY |
| Race Control     | `/race-control`     | Safety Official   | SAFETY_KEY       |
| Lap Line Tracker | `/lap-line-tracker` | Lap-line Observer | OBSERVER_KEY     |
| Leaderboard      | `/leaderboard`      | Spectators        | None             |
| Next Race        | `/next-race`        | Race Drivers      | None             |
| Race Countdown   | `/race-countdown`   | Race Drivers      | None             |
| Race Flags       | `/race-flags`       | Race Drivers      | None             |

## User Guide

### Front Desk Interface (/front-desk)

**Persona: Receptionist**

- **Add New Race Sessions**: Click "Add New Race Session" button
- **Add Drivers**: Enter driver name and click "Add Driver"
- **Edit Drivers**: Click "Edit" next to a driver to modify name or car number
- **Remove Drivers**: Click "Remove" next to a driver
- **Manual Car Assignment**: Toggle "Manual car assignment" to assign specific car numbers
- **Session Management**: Remove entire sessions with "Remove Session" button

**Access Key Required**: RECEPTIONIST_KEY

### Race Control Interface (/race-control)

**Persona: Safety Official**

- **Start Race**: Click "Start Race" button when ready (only available when sessions exist)
- **Control Race Modes**:
  - **Safe (Green)**: Normal racing conditions
  - **Hazard (Yellow)**: Caution - slow down, no overtaking
  - **Danger (Red)**: Stop immediately
  - **Finish (Chequered)**: Race complete, return to pits
- **End Race Session**: Click "End Race Session" after race is finished and cars have returned

**Access Key Required**: SAFETY_KEY

### Lap Line Tracker (/lap-line-tracker)

**Persona: Lap-line Observer**

- **Large Touch Buttons**: One button for each car number (1-8)
- **Record Laps**: Tap the button when a car crosses the lap line
- **Visual Feedback**: Button flashes green on successful lap recording
- **Real-time Updates**: Lap counts update immediately on leaderboard
- **Disabled When Inactive**: Buttons are disabled between races

**Access Key Required**: OBSERVER_KEY

### Public Displays

#### Leaderboard (/leaderboard)

**Persona: Spectators**

- **Real-time Rankings**: Drivers ordered by fastest lap time
- **Current Lap Count**: Shows how many laps each car has completed
- **Fastest Lap Time**: Displays best time for each driver
- **Race Timer**: Countdown showing time remaining
- **Race Status**: Current race mode (Safe, Hazard, Danger, Finish)
- **Fullscreen Mode**: Button to enter fullscreen display

#### Next Race (/next-race)

**Persona: Race Drivers**

- **Upcoming Session**: Shows next race's drivers and car assignments
- **Paddock Notification**: Displays "PROCEED TO PADDOCK" when race is ready
- **Car Numbers**: Large display of assigned car numbers
- **Driver Names**: Clear listing of all drivers in next session

#### Race Countdown (/race-countdown)

**Persona: Race Drivers**

- **Large Timer**: Easy-to-read countdown display
- **Status Indicator**: Shows race status (Waiting, Race Active, Finished)
- **Visual Warning**: Timer turns red and pulses when under 1 minute remaining
- **Race Information**: Shows number of drivers in current race

#### Race Flags (/race-flags)

**Persona: Race Drivers**

- **Current Flag Status**: Large emoji representation of current flag
- **Animated Display**:
  - Green flag: Bouncing animation
  - Yellow flag: Standard display
  - Red flag: Pulsing danger animation
  - Chequered flag: Spinning animation
- **Status Explanation**: Clear description of what each flag means
- **Fullscreen Support**: Optimized for large track-side displays

## Network Access

### Local Network Access

The server is configured to listen on all network interfaces (`0.0.0.0`), making it accessible from other devices on your network:

1. Find your computer's IP address:
   - Windows: `ipconfig` → Look for "IPv4 Address"
   - Mac/Linux: `ifconfig` → Look for "inet" address
2. On another device (phone, tablet, etc.), open a web browser
3. Navigate to `http://[your-computer-ip]:3000` (e.g., `http://192.168.1.100:3000`)
4. You can now access any of the interfaces from the device

### Remote Access via Ngrok

For access from anywhere on the internet:

1. **Sign up for ngrok**: Go to https://dashboard.ngrok.com and create a free account
2. **Get your authtoken**: Find your authtoken in the dashboard
3. **Set environment variable**:
   ```bash
   export NGROK_AUTHTOKEN=your_authtoken_here
   ```
4. **Run with ngrok**:
   - For development: `npm run dev:ngrok`
   - Or run server first: `npm start`, then in another terminal: `npm run ngrok`
5. **Copy the ngrok URL**: Look for the "Public URL" in the console output (e.g., `https://abc123.ngrok.io`)
6. **Share access**: Send this URL to anyone who needs to access the application

## System Workflow

1. **Setup**: Receptionist creates race sessions and adds drivers at Front Desk
2. **Preparation**: Drivers check Next Race display for their assignments
3. **Start**: Safety Official starts the race from Race Control
4. **Racing**: Lap-line Observer records laps as cars cross the line
5. **Monitoring**: Spectators watch real-time rankings on Leaderboard
6. **Safety**: Safety Official changes race modes as needed for track conditions
7. **Finish**: Race automatically finishes when timer expires, or manually by Safety Official
8. **Reset**: Safety Official ends session to prepare for next race

## Technology Stack

- **Backend**: Node.js with Express
- **Real-time Communication**: Socket.IO
- **Frontend**: HTML, CSS, JavaScript
- **Persistence**: JSON file storage with automatic saving
- **Tunneling**: ngrok for public access
- **Security**: Environment-based access control

## Security Features

- **Employee Authentication**: Access keys required for employee interfaces
- **Security Delay**: 500ms delay on failed authentication attempts
- **Environment Variables**: Secure configuration through environment variables
- **HTTPS Tunnels**: ngrok provides secure HTTPS tunnels for remote access
- **Input Validation**: Server-side validation of all operations

## Data Persistence

The system automatically saves its state every 5 seconds to `gameState.json`. If the server restarts:

- Race sessions are preserved
- Current race status is maintained
- Lap times and driver information are restored
- Timer continues from where it left off

## Mobile Optimization

- **Race Control**: Designed for mobile use by Safety Officials
- **Lap Line Tracker**: Large touch targets optimized for tablets
- **Responsive Design**: All interfaces work on various screen sizes
- **Touch-Friendly**: All interactive elements optimized for touch screens

## Troubleshooting

### Common Issues

1. **"Missing required environment variables"**

   - Solution: Set all required environment variables (RECEPTIONIST_KEY, OBSERVER_KEY, SAFETY_KEY)

2. **"Cannot access from other devices"**

   - Solution: Check your firewall settings and ensure the server is running on `0.0.0.0`

3. **"Ngrok tunnel failed"**

   - Solution: Verify your NGROK_AUTHTOKEN is correct and your ngrok account is active

4. **"Socket connection failed"**
   - Solution: Ensure all devices are on the same network or using the correct ngrok URL

### Getting Help

1. Check the console output for error messages
2. Verify all environment variables are set correctly
3. Ensure no other applications are using port 3000
4. Check that your network allows the necessary connections

## Development

For development and testing:

- Use `npm run dev` for 1-minute races instead of 10-minute races
- The system automatically persists state between restarts
- All interfaces support hot-reloading when files change
- Check browser developer console for debug information
