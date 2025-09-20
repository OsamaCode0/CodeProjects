

interface shipConfig {
  engineType: string;
  maxSpeed: number;
  shieldCapacity: number;
} 

type partialShipConfig = Partial<shipConfig>

type readOnlyShipConfig = Readonly<shipConfig>


const initialConfig: shipConfig = {
  engineType: "Benzine",
  maxSpeed: 300,
  shieldCapacity: 0
}

const configUpdate: partialShipConfig = {

  engineType: "Electric",
  maxSpeed: 500,
  shieldCapacity: 100
}

const readOnlyConfig: readOnlyShipConfig = {
  engineType: "Benzine",
  maxSpeed: 300,
  shieldCapacity: 0
}
