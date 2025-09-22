interface NavigationLogEntry {
  timestamp: number;
  coordinates: [number, number, number];
  speed: number;
  event: string;
  notes: string;
}

// ✅ CORRECT: Only pick timestamp and coordinates
type NavigationData = Pick<NavigationLogEntry, 'timestamp' | 'coordinates'>;

// ✅ CORRECT: Only omit notes (not all other properties)
type LogSummary = Omit<NavigationLogEntry, 'notes'>;

// ✅ navData should ONLY have timestamp and coordinates (NO extra properties)
const navData: NavigationData = {
  timestamp: 1625247600,
  coordinates: [34.05, -118.25, 500]

};

const logSmry: LogSummary = {
  timestamp: 1625247600,
  coordinates: [34.05, -118.25, 500],
  speed: 250,
  event: "Engine Check"

};