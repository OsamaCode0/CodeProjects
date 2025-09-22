

import {EngineSystem} from './types.js'


export class Engines implements EngineSystem {  // ✅ Correct interface
    powerLevel: number;  // ✅ Add type

    constructor(powerLevel: number) {  // ✅ Add parameter type
        this.powerLevel = powerLevel;
    }

    setPowerLevel(powerLevel: number): void {
      this.powerLevel = powerLevel;
      console.log("Engine power level updated to:", this.powerLevel);
    }  // ✅ Missing required method from interface!
    setPower(powerLevel: number): void {
        this.powerLevel = powerLevel;
        console.log("Engine power set to:", this.powerLevel);
    }
}