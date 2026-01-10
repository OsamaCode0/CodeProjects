const ngrok = require('ngrok');
const fs = require('fs').promises;
const path = require('path');

async function setupNgrok() {
  try {
    console.log('Starting ngrok tunnel...');

    // Start ngrok tunnel
    const url = await ngrok.connect({
      proto: 'http',
      addr: process.env.PORT || 3000,
      region: 'us', // You can change this to eu, ap, au, sa, jp, in
      onStatusChange: (status) => {
        console.log('Ngrok status:', status);
      },
      onLogEvent: (data) => {
        // console.log('Ngrok log:', data);
      },
    });

    console.log('Ngrok tunnel established!');
    console.log('Public URL:', url);
    console.log(
      '\nYou can now access your application from anywhere using this URL.'
    );
    console.log('\nInterfaces:');
    console.log(`- Main Page: ${url}/`);
    console.log(`- Front Desk: ${url}/front-desk`);
    console.log(`- Race Control: ${url}/race-control`);
    console.log(`- Lap Line Tracker: ${url}/lap-line-tracker`);
    console.log(`- Leaderboard: ${url}/leaderboard`);
    console.log(`- Next Race: ${url}/next-race`);
    console.log(`- Race Countdown: ${url}/race-countdown`);
    console.log(`- Race Flags: ${url}/race-flags`);

    // Save the URL to a file for easy reference
    await fs.writeFile(
      path.join(__dirname, 'ngrok-url.txt'),
      `Ngrok URL: ${url}\nGenerated at: ${new Date().toISOString()}\n`
    );

    console.log('\nURL saved to ngrok-url.txt');

    // Handle cleanup on process exit
    process.on('SIGINT', async () => {
      console.log('\nClosing ngrok tunnel...');
      await ngrok.disconnect();
      await ngrok.kill();
      process.exit(0);
    });
  } catch (error) {
    console.error('Error creating ngrok tunnel:', error);
    process.exit(1);
  }
}

// Check if ngrok authtoken is set
if (!process.env.NGROK_AUTHTOKEN) {
  console.error('Error: NGROK_AUTHTOKEN environment variable is not set.');
  console.error(
    'Please get your authtoken from https://dashboard.ngrok.com/get-started/your-authtoken'
  );
  console.error('Then set it: export NGROK_AUTHTOKEN=your_authtoken_here');
  process.exit(1);
}

// Set ngrok authtoken first, then setup tunnel
ngrok.authtoken(process.env.NGROK_AUTHTOKEN).then(() => {
  setupNgrok();
});
