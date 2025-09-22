

interface NavigationLogEntry {
  timestamp: number,
  coordinates: [number, number, number],
  speed: number,
  event: string,
  notes: string,
}

type navigationData = Pick<NavigationLogEntry, 'timestamp' | 'coordinates'>

type logSummary = Omit<NavigationLogEntry, 'timestamp' | 'coordinates' | 'speed' | 'event'>


const navData: navigationData[] = [
  { timestamp: 1625247600, 
  coordinates: [34.05, -118.25, 500]}
]

const logSmry: logSummary[] = [
  { notes: 'Engine check performed at 250 knots.' }
]