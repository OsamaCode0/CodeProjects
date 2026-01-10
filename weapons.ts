

import { WeaponSystem } from "./types";


export class Weapons implements WeaponSystem {
  target: string | null

  constructor(target: string | null) {
    this.target = target;
    }

  lockTarget(target: string | null) {
    this.target = target;
    console.log("Target locked:", this.target);
  }
  fire() {
    console.log("Fire!");
  }
}