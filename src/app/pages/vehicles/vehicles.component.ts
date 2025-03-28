import { Component, inject } from '@angular/core';
import { Vehicle, VehicleUsage } from '../../core/models/vehicle';
import { TableModule } from 'primeng/table';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Card } from 'primeng/card';
import { InputNumber } from 'primeng/inputnumber';
import { Button } from 'primeng/button';
import { BestCombination } from '../../core/models/best-combination';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-vehicles',
  imports: [TableModule, Card, ReactiveFormsModule, InputNumber, Button],
  templateUrl: './vehicles.component.html',
  styleUrl: './vehicles.component.css',
})
export class VehiclesComponent {
  private formBuilder = inject(NonNullableFormBuilder);
  private messageService = inject(MessageService);
  peopleCount: number = 0;
  freeSeats: number = 0;
  busesUsed: number = 0;
  vehicleUsages: VehicleUsage[] = [];
  vehicleForm = this.formBuilder.group({
    amountPeopleToEvacuate: this.formBuilder.control<number>(0, [
      Validators.required,
      Validators.min(1),
    ]),
  });

  vehicles: Vehicle[] = [
    {
      name: 'Mercedes Sprinter',
      imageSrc: 'assets/images/Mercedes_Sprinter.jpg',
      capacity: 12,
      units: 12,
    },
    {
      name: 'БАЗ «Волошка»',
      imageSrc: 'assets/images/BAZ-А081.11.jpg',
      capacity: 15,
      units: 5,
    },
    {
      name: '«Богдан» A-064',
      imageSrc: 'assets/images/Bogdan_A064.jpg',
      capacity: 17,
      units: 6,
    },
    {
      name: 'AeroLAZ',
      imageSrc: 'assets/images/AeroLAZ.jpg',
      capacity: 17,
      units: 8,
    },
    {
      name: '«Богдан» A-069',
      imageSrc: 'assets/images/Bogdan_A069.jpg',
      capacity: 18,
      units: 2,
    },
    {
      name: '«Богдан» A-091',
      imageSrc: 'assets/images/Bogdan_A091.jpeg',
      capacity: 21,
      units: 5,
    },
    {
      name: 'ЗАЗ A10C I-Ван',
      imageSrc: 'assets/images/ZAZ_A10C_I-VAN.jpg',
      capacity: 23,
      units: 2,
    },
  ];
  findBestCombination(peopleCount: number): BestCombination | null {
    const vehicleTypesCount = this.vehicles.length;
    // Dynamic programming approach with memoization
    const memo = new Map<string, BestCombination>();

    const findOptimalCombination = (
      index: number,
      remainingPeople: number,
    ): BestCombination | null => {
      // Memoization key
      const memoKey = `${index}-${remainingPeople}`;

      // Check memoized result
      if (memo.has(memoKey)) {
        return memo.get(memoKey)!;
      }

      // Base cases
      if (remainingPeople <= 0) {
        return {
          leftover: Math.abs(remainingPeople),
          busesUsed: 0,
          combination: new Array(vehicleTypesCount).fill(0),
        };
      }

      if (index >= vehicleTypesCount) {
        return null;
      }

      let bestResult: BestCombination | null = null;

      // Try different numbers of current bus type
      for (
        let vehicleCount = 0;
        vehicleCount <= this.vehicles[index].units;
        vehicleCount++
      ) {
        const currentBusSeats = vehicleCount * this.vehicles[index].capacity;

        // Recursive call for remaining people
        const subResult = findOptimalCombination(
          index + 1,
          remainingPeople - currentBusSeats,
        );

        if (subResult !== null) {
          const currentCombination = [...subResult.combination];
          currentCombination[index] = vehicleCount;

          const currentResult: BestCombination = {
            leftover: subResult.leftover,
            busesUsed: subResult.busesUsed + vehicleCount,
            combination: currentCombination,
          };

          // Comparison logic for finding the best combination
          if (
            bestResult === null ||
            currentResult.leftover < bestResult.leftover ||
            (currentResult.leftover === bestResult.leftover &&
              currentResult.busesUsed < bestResult.busesUsed)
          ) {
            bestResult = currentResult;
          }
        }
      }

      // Memoize and return the result
      if (bestResult) {
        memo.set(memoKey, bestResult);
      }
      return bestResult;
    };

    return findOptimalCombination(0, peopleCount);
  }
  calculateVehicles() {
    debugger;
    if (this.vehicleForm.invalid) return;
    this.peopleCount = this.vehicleForm.controls.amountPeopleToEvacuate.value;
    if (this.peopleCount <= 0) {
      this.resetVehicleAllocation();
      return;
    }

    // Find best combination
    const bestCombination = this.findBestCombination(this.peopleCount);

    // Handle insufficient transport
    if (!bestCombination) {
      this.showInsufficientTransportAlert();
      return;
    }

    // Generate bus usages
    this.vehicleUsages = this.vehicles
      .map((bus, index) => ({
        ...bus,
        usedVehicles: bestCombination.combination[index],
        takenSeats: bestCombination.combination[index] * bus.capacity,
      }))
      .filter((usage) => usage.usedVehicles > 0);

    // Update allocation details
    this.freeSeats = bestCombination.leftover;
    this.busesUsed = bestCombination.busesUsed;
  }

  private resetVehicleAllocation() {
    this.vehicleUsages = [];
    this.freeSeats = 0;
    this.busesUsed = 0;
  }

  private showInsufficientTransportAlert() {
    this.messageService.add({
      severity: 'error',
      summary: '🚨 Недостатньо транспорту для перевезення всіх пасажирів!',
      life: 100000,
    });
  }

  get totalCapacity(): number {
    return this.vehicles.reduce((sum, bus) => sum + bus.capacity, 0);
  }

  get totalUnits(): number {
    return this.vehicles.reduce((sum, bus) => sum + bus.units, 0);
  }

  get totalMinPeople(): number {
    return this.vehicles.reduce((sum, bus) => sum + bus.capacity, 0);
  }

  get totalMaxPeople(): number {
    return this.vehicles.reduce(
      (sum, bus) => sum + bus.capacity * bus.units,
      0,
    );
  }
}
