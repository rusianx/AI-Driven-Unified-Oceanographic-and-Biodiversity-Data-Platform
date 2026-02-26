// Dataset selector: dropdown UI for switching datasets (type-safe)

import React from 'react';
import { DATASET_CONFIGS, type DatasetKey } from '../data/datasetRegistry';
import './DatasetSelector.css';

export interface DatasetSelectorProps {
  activeDataset: DatasetKey | null;
  onDatasetChange: (dataset: DatasetKey | null) => void;
  disabled?: boolean;
}

// Pure UI dropdown component for dataset selection
export const DatasetSelector: React.FC<DatasetSelectorProps> = ({
  activeDataset,
  onDatasetChange,
  disabled = false,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    if (value === '') {
      onDatasetChange(null);
    } else {
      onDatasetChange(value as DatasetKey);
    }
  };

  return (
    <div className="dataset-selector">
      <label htmlFor="dataset-select" className="dataset-selector-label">
        Dataset:
      </label>
      <select
        id="dataset-select"
        className="dataset-selector-dropdown"
        value={activeDataset || ''}
        onChange={handleChange}
        disabled={disabled}
      >
        <option value="">-- Select Dataset --</option>
        {Object.entries(DATASET_CONFIGS).map(([key, config]) => (
          <option key={key} value={key}>
            {config.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DatasetSelector;
