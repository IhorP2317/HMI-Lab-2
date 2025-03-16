import { WaterLevelStatus } from '../enums/water-level-status';
import { TemperatureStatus } from '../enums/temperature-status';
import { SnowStatus } from '../enums/snow-status';
import { RainStatus } from '../enums/rain-status';
import { FloodStatus } from '../enums/flood_status';

export interface FloodRule {
  waterLevel?: WaterLevelStatus;
  temperature?: TemperatureStatus;
  snow?: SnowStatus;
  rain?: RainStatus;
  result: FloodStatus;
}
