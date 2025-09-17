


const TelemetryCallback = (sensorReading: number, time: number) => void;

function logTelemetry(data: number, timestamp: number): void {
    console.log(`Data: ${data}, Timestamp: ${timestamp}`)
}
