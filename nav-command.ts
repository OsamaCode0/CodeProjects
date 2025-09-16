

type TimeStamp = {
  timestamp: Date;
}

type Destination = {
  planetName: string;
  sector: string;
} & TimeStamp;

type WarpDrive = {
  warpFactor: number;
} & TimeStamp;

type NavigationCommand = Destination | WarpDrive;



let destination: Destination = {
  planetName: "Mars",
  sector: "Beta",
  timestamp: new Date(),
}

let warpdrive = {
  warpFactor: 5,
  timestamp: new Date(),
}

const navigationCommand: NavigationCommand = warpdrive;