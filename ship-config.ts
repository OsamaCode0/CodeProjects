

interface ShipConfig {
  engineType: string;
  maxSpeed: number;
  shieldCapacity: number;
} 

type PartialShipConfig = Partial<ShipConfig>

type ReadonlyShipConfig = Readonly<ShipConfig>


const initialConfig: ShipConfig = {
  engineType: "Benzine",
  maxSpeed: 300,
  shieldCapacity: 0
}

const configUpdate: PartialShipConfig = {
  engineType: "Electric",
  maxSpeed: 500
}

const readOnlyConfig: ReadonlyShipConfig = initialConfig;
