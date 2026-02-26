// Hook: load CSV datasets and populate registry

import { useState, useEffect } from 'react';
import { loadCSVDataset } from '../utils/csvLoader';
import {
  datasetRegistry,
  DATASET_CONFIGS,
  type DatasetKey,
  type Dataset,
} from '../data/datasetRegistry';

export interface DatasetLoadingState {
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;
  loadedCount: number;
  totalCount: number;
}

// Loads datasets and returns loading state
export function useDatasets() {
  const [state, setState] = useState<DatasetLoadingState>({
    isLoading: true,
    isLoaded: false,
    error: null,
    loadedCount: 0,
    totalCount: Object.keys(DATASET_CONFIGS).length,
  });

  useEffect(() => {
    let isMounted = true;

    async function loadAllDatasets() {
      // Skip if already loaded
      const datasetKeys = Object.keys(DATASET_CONFIGS) as DatasetKey[];
      const alreadyLoaded = datasetKeys.every(key => datasetRegistry.isLoaded(key));
      
      if (alreadyLoaded) {
        console.log('[useDatasets] Datasets already loaded, skipping...');
        setState({
          isLoading: false,
          isLoaded: true,
          error: null,
          loadedCount: datasetKeys.length,
          totalCount: datasetKeys.length,
        });
        return;
      }
      
      console.log('[useDatasets] Starting dataset loading...');
      const startTime = performance.now();

      try {
        
        // Load datasets in parallel
        const loadPromises = datasetKeys.map(async (key) => {
          const config = DATASET_CONFIGS[key];
          console.log(`[useDatasets] Loading ${config.name} from ${config.filePath}...`);
          
          try {
            const parsed = await loadCSVDataset(config.filePath);
            
            // Register dataset
            datasetRegistry.setDataset(
              key,
              parsed.data,
              parsed.min,
              parsed.max,
              parsed.validCount,
              parsed.invalidCount
            );

            if (isMounted) {
              setState(prev => ({
                ...prev,
                loadedCount: prev.loadedCount + 1,
              }));
            }

            return { key, success: true };
          } catch (error) {
            console.error(`[useDatasets] Failed to load ${config.name}:`, error);
            return { key, success: false, error };
          }
        });

        // Wait for all to complete
        const results = await Promise.all(loadPromises);

        const loadTime = performance.now() - startTime;
        const successCount = results.filter(r => r.success).length;
        const failCount = results.length - successCount;

        if (!isMounted) return;

        if (failCount > 0) {
          const failedKeys = results.filter(r => !r.success).map(r => r.key);
          setState({
            isLoading: false,
            isLoaded: false,
            error: `Failed to load ${failCount} dataset(s): ${failedKeys.join(', ')}`,
            loadedCount: successCount,
            totalCount: datasetKeys.length,
          });
        } else {
          console.log(`[useDatasets] ✓ All ${successCount} datasets loaded in ${loadTime.toFixed(1)}ms`);
          setState({
            isLoading: false,
            isLoaded: true,
            error: null,
            loadedCount: successCount,
            totalCount: datasetKeys.length,
          });
        }
      } catch (error) {
        console.error('[useDatasets] Critical error during dataset loading:', error);
        if (isMounted) {
          setState({
            isLoading: false,
            isLoaded: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            loadedCount: 0,
            totalCount: Object.keys(DATASET_CONFIGS).length,
          });
        }
      }
    }

    loadAllDatasets();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    ...state,
    registry: datasetRegistry,
    getDataset: (key: DatasetKey): Dataset | undefined => datasetRegistry.getDataset(key),
    isDatasetLoaded: (key: DatasetKey): boolean => datasetRegistry.isLoaded(key),
  };
}
