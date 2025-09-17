


type TelemetryCallback = (sensorReading: number, time: number) => void;

function logTelematry(data: number, timestamp: number): void {
    console.log(`Data: ${data}, Timestamp: ${timestamp}`)
}
