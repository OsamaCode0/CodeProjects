
type Thruster = {name: string; powerLevel: number} 

type Thrusters = {left: Thruster; right: Thruster; main: Thruster}

let thrusters: Thrusters = {
     left: {name: 'left', powerLevel: 0},
     right: {name: 'right', powerLevel: 0},
     main: {name: 'main', powerLevel: 0}, 
}

function setThrusterPower(thruster: keyof Thrusters, powerLevel: number): string {
  if (powerLevel < 0 || powerLevel > 100) {
    throw new Error('Power level must be between 0 and 100');
  }
  if (thruster in thrusters) {
    thrusters[thruster].powerLevel = powerLevel;
        return `${thrusters[thruster].name}: ${powerLevel}% output`; 

  } else  {
        throw new Error(`Invalid thruster designation: ${thruster}`);  // PROPER ERROR
  }

}

