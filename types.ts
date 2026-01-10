

export interface NavSystem{ 

  x: number,
  z: number,
  y: number,
  setCourse(x: number, y: number, z: number): void;

}

export interface EngineSystem {
  powerLevel: number
  setPowerLevel(powerLevel: number): void
}

export interface WeaponSystem{
  target: string | null
  lockTarget(target: string | null): void
  fire(): void
}