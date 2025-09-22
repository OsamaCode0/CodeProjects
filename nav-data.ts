interface NavigationLogEntry {
  timestamp: number;
  coordinates: [number, number, number];
  speed: number;
  event: string;
  notes: string;
}

type NavigationData = Pick<NavigationLogEntry, 'timestamp' | 'coordinates'>;
type LogSummary = Omit<NavigationLogEntry, 'notes'>;  // Only remove notes

const navData: NavigationData = {
  timestamp: 1625247600,
  coordinates: [34.05, -118.25, 500]
};

const logSmry: LogSummary = {
  timestamp: 1625247600,
  coordinates: [34.05, -118.25, 500],
  speed: 250,
  event: "Engine Check"
  // notes is intentionally omitted
};