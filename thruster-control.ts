
type Thruster = {name: string; powerLevel: number} 

type Thrusters = {left: Thruster; right: Thruster; main: Thruster}

let thursters: Thrusters = {
     left: {name: 'left', powerLevel: 0},
     right: {name: 'right', powerLevel: 0},
     main: {name: 'main', powerLevel: 0}, 
}

function setThrustPower(thurster: string, powerLevel: number): void {
  if (powerLevel < 0 || powerLevel > 100) {
    throw new Error('Power level must be between 0 and 100');
  }
  if (thurster in thursters) {
    thursters[thurster as keyof Thrusters].powerLevel = powerLevel;
  } else {
    throw new Error('Invalid thruster name');
  }
}  {

}