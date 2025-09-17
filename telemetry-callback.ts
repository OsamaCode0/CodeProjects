type TelemetryCallback = (sensorReading: number, time: number) => void;

const logTelemetry: TelemetryCallback = (data, timestamp) => {
  console.log(`Data: ${data}, Timestamp: ${timestamp}`);
};