class System {
    public name: string;
    public status: string;

    constructor(name: string, status: string) {
        this.name = name;
        this.status = status;
    }

    activate(): void {
        console.log(`${this.name} system activated!`);
        this.status = "active";
    }
}

class Engine extends System {
    public powerOutput: number;
    private engineEfficiency: number;

    constructor(name: string, status: string, powerOutput: number, engineEfficiency: number) {
        super(name, status);
        this.powerOutput = powerOutput;
        this.engineEfficiency = engineEfficiency;
    }

    increasePower(): void {
        console.log(`Increasing engine power! Current output: ${this.powerOutput}`);
        this.powerOutput += 10;
    }

    // Getter for private engineEfficiency
    getEngineEfficiency(): number {
        return this.engineEfficiency;
    }

    // Setter for private engineEfficiency
    setEngineEfficiency(efficiency: number): void {
        this.engineEfficiency = efficiency;
    }
}

class Shield extends System {
    public capacity: number;
    protected shieldModulatorFrequency: number;

    constructor(name: string, status: string, capacity: number, shieldModulatorFrequency: number) {
        super(name, status);
        this.capacity = capacity;
        this.shieldModulatorFrequency = shieldModulatorFrequency;
    }

    engageShields(): void {
        console.log(`Shields engaged! Capacity: ${this.capacity}`);
    }
}

class SuperShield extends Shield {
    logShieldFrequency(): void {
        console.log(`Current frequency: ${this.shieldModulatorFrequency}`);
    }
}

// Create instances
const engine = new Engine("Main Engine", "standby", 100, 0.8);
engine.activate();
engine.increasePower();

const shield = new Shield("Deflector Shield", "inactive", 500, 3.14);
shield.activate();
shield.engageShields();