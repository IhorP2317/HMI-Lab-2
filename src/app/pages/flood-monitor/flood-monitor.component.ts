import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  model,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { WaterLevelStatus } from '../../core/enums/water-level-status';
import { TemperatureStatus } from '../../core/enums/temperature-status';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RainStatus } from '../../core/enums/rain-status';
import { SnowStatus } from '../../core/enums/snow-status';
import { FloodStatus } from '../../core/enums/flood_status';
import { FloodRule } from '../../core/models/flood_rule';
import { FACTOR_OPTIONS, FactorType } from '../../core/constants/constants';
import { Panel } from 'primeng/panel';
import { Button } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { Card } from 'primeng/card';
import { Dialog } from 'primeng/dialog';
import { Select } from 'primeng/select';
import { NgClass } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { concat, defer, of } from 'rxjs';

@Component({
  selector: 'app-flood-monitor',
  imports: [
    ReactiveFormsModule,
    Panel,
    Button,
    DropdownModule,
    Card,
    Dialog,
    Select,
    NgClass,
  ],
  templateUrl: './flood-monitor.component.html',
  styleUrl: './flood-monitor.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FloodMonitorComponent {
  private formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  rules: FloodRule[] = [
    {
      waterLevel: WaterLevelStatus.HIGH,
      rain: RainStatus.STRONG,
      result: FloodStatus.EVACUATE,
    },

    // 2. High Water Level + High Temperature + Lots of Snow + Moderate Rain → Evacuate
    {
      waterLevel: WaterLevelStatus.HIGH,
      temperature: TemperatureStatus.HIGH,
      snow: SnowStatus.LOT,
      rain: RainStatus.MODERATE,
      result: FloodStatus.EVACUATE,
    },

    // 3. Medium Temperature + Lots of Snow + Strong Rain → Increase Attention
    {
      waterLevel: WaterLevelStatus.HIGH,
      temperature: TemperatureStatus.MEDIUM,
      snow: SnowStatus.LOT,
      rain: RainStatus.MODERATE,
      result: FloodStatus.INCREASE_ATTENTION,
    },

    // 4. High Water Level + High Temperature + No Rain → No Concern
    {
      waterLevel: WaterLevelStatus.HIGH,
      temperature: TemperatureStatus.MEDIUM,
      snow: SnowStatus.LOT,
      rain: RainStatus.NONE,
      result: FloodStatus.NO_CONCERN,
    },

    // 5. Moderate Water Level + Moderate Temperature + Moderate Rain → No Concern
    {
      waterLevel: WaterLevelStatus.HIGH,
      temperature: TemperatureStatus.HIGH,
      snow: SnowStatus.LITTLE,
      rain: RainStatus.NONE,
      result: FloodStatus.NO_CONCERN,
    },

    // 6. Moderate Water Level + High Temperature + No Rain → No Concern
    {
      waterLevel: WaterLevelStatus.MODERATE,
      temperature: TemperatureStatus.HIGH,
      snow: SnowStatus.LOT,
      rain: RainStatus.STRONG,
      result: FloodStatus.INCREASE_ATTENTION,
    },

    // 7. Moderate Water Level + Medium Temperature + Strong Rain → Increase Attention
    {
      waterLevel: WaterLevelStatus.MODERATE,
      temperature: TemperatureStatus.MEDIUM,
      snow: SnowStatus.LOT,
      rain: RainStatus.STRONG,
      result: FloodStatus.NO_CONCERN,
    },

    // 8. Moderate Water Level + Medium Temperature + No Rain → No Concern
    {
      waterLevel: WaterLevelStatus.MODERATE,
      snow: SnowStatus.LITTLE,
      rain: RainStatus.STRONG,
      result: FloodStatus.NO_CONCERN,
    },

    // 9. Moderate Water Level + High Temperature + Snow Little + No Rain → No Concern
    {
      waterLevel: WaterLevelStatus.HIGH,
      rain: RainStatus.MODERATE,
      result: FloodStatus.NO_CONCERN,
    },
  ] as const;

  waterLevel: WritableSignal<WaterLevelStatus> = signal<WaterLevelStatus>(
    WaterLevelStatus.MODERATE,
  );
  waterLevelImgUrl: Signal<string> = computed(() => {
    switch (this.waterLevel()) {
      case WaterLevelStatus.HIGH:
        return 'assets/images/high_water_level.png';
      case WaterLevelStatus.MODERATE:
        return 'assets/images/moderate_water_level.png';
    }
  });
  temperatureStatus: WritableSignal<TemperatureStatus> =
    signal<TemperatureStatus>(TemperatureStatus.MEDIUM);
  temperatureStatusImgUrl: Signal<string> = computed(() => {
    switch (this.temperatureStatus()) {
      case TemperatureStatus.HIGH:
        return 'assets/images/high_temperature.png';
      case TemperatureStatus.MEDIUM:
        return 'assets/images/moderate_temperature.png';
    }
  });
  rainStatus: WritableSignal<RainStatus> = signal<RainStatus>(RainStatus.NONE);
  rainStatusImgUrl: Signal<string> = computed(() => {
    switch (this.rainStatus()) {
      case RainStatus.STRONG:
        return 'assets/images/strong_rain.png';
      case RainStatus.MODERATE:
        return 'assets/images/moderate_rain.png';
      case RainStatus.NONE:
        return 'assets/images/no_rain.png';
    }
  });
  snowStatus: WritableSignal<SnowStatus> = signal<SnowStatus>(
    SnowStatus.LITTLE,
  );
  snowStatusImgUrl: Signal<string> = computed(() => {
    switch (this.snowStatus()) {
      case SnowStatus.LOT:
        return 'assets/images/lot_snow.png';
      case SnowStatus.LITTLE:
        return 'assets/images/little_snow.png';
    }
  });
  simulationInterval = 5000 as const;
  floodStatus: Signal<FloodStatus> = computed(() => {
    const w = this.waterLevel();
    const t = this.temperatureStatus();
    const s = this.snowStatus();
    const r = this.rainStatus();

    for (const rule of this.rules) {
      if (
        (rule.waterLevel === undefined || rule.waterLevel === w) &&
        (rule.temperature === undefined || rule.temperature === t) &&
        (rule.snow === undefined || rule.snow === s) &&
        (rule.rain === undefined || rule.rain === r)
      ) {
        return rule.result;
      }
    }
    return FloodStatus.NO_CONCERN;
  });
  floodStatusImgUrl: Signal<string> = computed(() => {
    switch (this.floodStatus()) {
      case FloodStatus.EVACUATE:
        return 'assets/images/evacuate.png';
      case FloodStatus.INCREASE_ATTENTION:
        return 'assets/images/increase_attention.png';
      case FloodStatus.NO_CONCERN:
        return 'assets/images/no_concern.png';
    }
  });
  isFactorSettingsDialogVisible = model(false);
  waterLevelOptions = Object.values(WaterLevelStatus);
  temperatureOptions = Object.values(TemperatureStatus);
  rainOptions = Object.values(RainStatus);
  snowOptions = Object.values(SnowStatus);
  form = this.formBuilder.group({
    factorType: this.formBuilder.control<FactorType>('waterLevel'),
    factorValue: this.formBuilder.control<string>(this.waterLevel()),
  });
  private factorType = toSignal(
    defer(() => {
      return concat(
        of(this.form.controls.factorType.value),
        this.form.controls.factorType.valueChanges,
      );
    }),
  );
  currentValueOptions = computed(() => {
    const factorType = this.factorType() as FactorType;

    switch (factorType) {
      case 'waterLevel':
        return this.waterLevelOptions.map((value) => ({ label: value, value }));
      case 'temperature':
        return this.temperatureOptions.map((value) => ({
          label: value,
          value,
        }));
      case 'rain':
        return this.rainOptions.map((value) => ({ label: value, value }));
      case 'snow':
        return this.snowOptions.map((value) => ({ label: value, value }));
      default:
        return [];
    }
  });
  activeRuleIndex = signal(0);
  simulationTimeRemaining = signal(5000);
  isSimulationRunning = signal(false);
  simulationIntervalIds: Array<ReturnType<typeof setInterval>> | null = null;
  onFactorTypeClick(factorType: FactorType, factorValue: string) {
    this.form.controls.factorType.setValue(factorType);
    this.form.controls.factorValue.setValue(factorValue);
    this.isFactorSettingsDialogVisible.set(true);
  }
  applyValue(): void {
    const factorType = this.form.controls.factorType.value;
    const factorValue = this.form.controls.factorValue.value;
    switch (factorType) {
      case 'waterLevel':
        this.waterLevel.set(factorValue as WaterLevelStatus);
        break;
      case 'temperature':
        this.temperatureStatus.set(factorValue as TemperatureStatus);
        break;
      case 'snow':
        this.snowStatus.set(factorValue as SnowStatus);
        break;
      case 'rain':
        this.rainStatus.set(factorValue as RainStatus);
        break;
    }
    this.isFactorSettingsDialogVisible.set(false);
  }
  startFloodSimulation() {
    let currentRuleIndex = this.activeRuleIndex();

    this.stopFloodSimulation();

    this.isSimulationRunning.set(true);
    this.simulationTimeRemaining.set(this.simulationInterval);

    const simulationSteps = this.rules.map((rule) => ({
      waterLevel: rule.waterLevel || this.waterLevel(),
      temperature: rule.temperature || this.temperatureStatus(),
      snow: rule.snow || this.snowStatus(),
      rain: rule.rain || this.rainStatus(),
      result: rule.result,
    }));

    console.log(
      'Starting flood simulation with',
      simulationSteps.length,
      'steps',
    );

    this.simulationIntervalIds = [];

    let startTime = Date.now();
    const timerInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, this.simulationInterval - elapsed);
      this.simulationTimeRemaining.set(remaining);

      if (remaining <= 0) {
        startTime = Date.now();
      }
    }, 100);
    this.simulationIntervalIds.push(timerInterval);

    const ruleInterval = setInterval(() => {
      const currentStep = simulationSteps[currentRuleIndex];

      this.waterLevel.set(currentStep.waterLevel);
      this.temperatureStatus.set(currentStep.temperature);
      this.snowStatus.set(currentStep.snow);
      this.rainStatus.set(currentStep.rain);

      console.log(`Simulating rule ${currentRuleIndex + 1}:`, currentStep);

      currentRuleIndex = (currentRuleIndex + 1) % simulationSteps.length;
      this.activeRuleIndex.set(currentRuleIndex);

      startTime = Date.now(); // Reset the timer when rule changes
      this.simulationTimeRemaining.set(this.simulationInterval); // Reset to full time
    }, this.simulationInterval);
    this.simulationIntervalIds.push(ruleInterval);
  }
  stopFloodSimulation() {
    if (this.simulationIntervalIds) {
      this.simulationIntervalIds.forEach((id) => clearInterval(id));
      this.simulationIntervalIds = null;
      this.isSimulationRunning.set(false);
    }
  }

  protected readonly FACTOR_OPTIONS = FACTOR_OPTIONS;
}
