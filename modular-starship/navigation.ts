
import { NavSystem } from './types.js'

export class Navigation implements NavSystem {
  x: number;
  y: number;
  z: number;

  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  setCourse(x: number, y: number, z: number): void {
    this.x = x;
    this.y = y;
    this.z = z;
    console.log("Course set to:", this.x, this.y, this.z);
  }
}