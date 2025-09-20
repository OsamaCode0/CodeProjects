 
type CrewMember = {
  name: string;
  role: string;
  id: number;
}

type SensorReading = {
  type: string;
  value: number;
  isCritical?: boolean;
}

 const crewMember1: CrewMember = {
  name: "Alice",
  role: "Captain",
  id: 1
 }

 const sensorReading1: SensorReading = {
  type: "Temperature",
  value: 25,
  isCritical: false
 }


const sensorReading2: SensorReading = {
  type: "Radiation",
  value: 150
}
