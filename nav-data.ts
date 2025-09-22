interface NavigationLogEntry {
    timestamp: number;
    coordinates: [number, number, number];
    speed: number;
    event: string;
    notes: string;
}


// ✅ CORRECT TYPE DEFINITIONS
type NavigationData = Pick<NavigationLogEntry, 'timestamp' | 'coordinates'>;
type LogSummary = Omit<NavigationLogEntry, 'notes'>;

// ✅ CORRECT navData - ONLY timestamp and coordinates
const navData: NavigationData = {
    timestamp: 1625247600,
    coordinates: [34.05, -118.25, 500]
    // ❌ NO speed, event, or notes here!
};

// ✅ CORRECT logSmry - ALL properties EXCEPT notes (MUST include speed and event)
const logSmry: LogSummary = {
    timestamp: 1625247600,
    coordinates: [34.05, -118.25, 500],
    speed: 250,          // ✅ MUST include speed
    event: 'Engine Check' // ✅ MUST include event
    // ❌ NO notes here!
};