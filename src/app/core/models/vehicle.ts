export interface Vehicle {
  name: string;
  imageSrc: string;
  capacity: number;
  units: number;
}
export interface VehicleUsage extends Vehicle {
  usedVehicles: number;
  takenSeats: number;
}
