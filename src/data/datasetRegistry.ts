// Dataset registry and metadata

import type { ColorScale } from '../utils/colorScales';

// Dataset key type
export type DatasetKey = 'chlorophyll' | 'salinity';

// Data point type
export interface DataPoint {
  lat: number;
  lon: number;
  value: number;
}

// Dataset metadata
export interface DatasetMetadata {
  key: DatasetKey;
  name: string;
  description: string;
  units: string;
  colorScale: ColorScale;
  filePath: string;
}

// Dataset container
export interface Dataset {
  metadata: DatasetMetadata;
  data: DataPoint[];
  min: number;
  max: number;
  validCount: number;
  invalidCount: number;
  isLoaded: boolean;
}

// Dataset configs
export const DATASET_CONFIGS: Record<DatasetKey, DatasetMetadata> = {
  chlorophyll: {
    key: 'chlorophyll',
    name: 'Chlorophyll-a Concentration',
    description: 'Ocean chlorophyll-a concentration from ALGE dataset',
    units: 'mg/m³',
    colorScale: 'chlorophyll',
    filePath: '/ALGE.yearly.2025.bbox=84,20,-85,19.csv',
  },
  salinity: {
    key: 'salinity',
    name: 'Sea Surface Salinity',
    description: 'Ocean surface salinity from SURF dataset',
    units: 'PSU',
    colorScale: 'salinity',
    filePath: '/SURF.yearly.2025.bbox=84,20,-85,19.csv',
  },
};

// Registry class
class DatasetRegistry {
  private datasets: Map<DatasetKey, Dataset> = new Map();
  private loadingPromises: Map<DatasetKey, Promise<void>> = new Map();

  // Get available dataset keys
  getAvailableDatasets(): DatasetKey[] {
    return Object.keys(DATASET_CONFIGS) as DatasetKey[];
  }

  // Get dataset metadata
  getMetadata(key: DatasetKey): DatasetMetadata {
    return DATASET_CONFIGS[key];
  }

  // Check loaded
  isLoaded(key: DatasetKey): boolean {
    const dataset = this.datasets.get(key);
    return dataset?.isLoaded || false;
  }

  // Get dataset
  getDataset(key: DatasetKey): Dataset | undefined {
    return this.datasets.get(key);
  }

  // Set dataset data
  setDataset(
    key: DatasetKey,
    data: DataPoint[],
    min: number,
    max: number,
    validCount: number,
    invalidCount: number
  ): void {
    const metadata = DATASET_CONFIGS[key];
    this.datasets.set(key, {
      metadata,
      data,
      min,
      max,
      validCount,
      invalidCount,
      isLoaded: true,
    });
    console.log(`[Dataset Registry] ✓ Registered ${metadata.name} (${validCount} points)`);
  }

  // Get all loaded datasets
  getAllLoadedDatasets(): Map<DatasetKey, Dataset> {
    return new Map(this.datasets);
  }

  // Clear datasets
  clear(): void {
    this.datasets.clear();
    this.loadingPromises.clear();
  }

  // Get display name
  getDisplayName(key: DatasetKey): string {
    return DATASET_CONFIGS[key].name;
  }

  // Get units
  getUnits(key: DatasetKey): string {
    return DATASET_CONFIGS[key].units;
  }

  // Get color scale
  getColorScale(key: DatasetKey): ColorScale {
    return DATASET_CONFIGS[key].colorScale;
  }
}

// Global registry instance
export const datasetRegistry = new DatasetRegistry();

// Type guard for dataset key
export function isDatasetKey(key: string): key is DatasetKey {
  return key === 'chlorophyll' || key === 'salinity';
}

// Dataset statistics summary
export function getDatasetStats(dataset: Dataset): {
  name: string;
  units: string;
  min: number;
  max: number;
  count: number;
  range: number;
} {
  return {
    name: dataset.metadata.name,
    units: dataset.metadata.units,
    min: dataset.min,
    max: dataset.max,
    count: dataset.validCount,
    range: dataset.max - dataset.min,
  };
}
