// Define the type for selectable factors
export type FactorType = 'waterLevel' | 'temperature' | 'snow' | 'rain';

// Define a constant array of objects for better readability & safety
export const FACTOR_OPTIONS: { label: string; value: FactorType }[] = [
  { label: 'Рівень води', value: 'waterLevel' },
  { label: 'Температура', value: 'temperature' },
  { label: 'Сніг', value: 'snow' },
  { label: 'Дощ', value: 'rain' },
] as const;
