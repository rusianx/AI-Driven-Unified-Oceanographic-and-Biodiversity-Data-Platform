// DatasetLegend: show color scale, range and units for active dataset

import React, { useMemo } from 'react';
import { getColorFromScale, type ColorScale } from '../utils/colorScales';
import { datasetRegistry, type DatasetKey } from '../data/datasetRegistry';
import './DatasetLegend.css';

export interface DatasetLegendProps {
  datasetKey: DatasetKey;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

// Generate CSS gradient string from a color scale
function generateGradientString(colorScale: ColorScale): string {
  const steps = 20;
  const colors: string[] = [];
  
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const color = getColorFromScale(t, colorScale);
    colors.push(`rgb(${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(color.b * 255)})`);
  }
  
  return `linear-gradient(to right, ${colors.join(', ')})`;
}

// Format numeric values with dynamic precision
function formatValue(value: number, range: number): string {
  // More decimals for smaller ranges
  if (range < 1) return value.toFixed(4);
  if (range < 10) return value.toFixed(3);
  if (range < 100) return value.toFixed(2);
  return value.toFixed(1);
}

// React component rendering the dataset legend
export const DatasetLegend: React.FC<DatasetLegendProps> = ({
  datasetKey,
  position = 'bottom-right',
}) => {
  // Get dataset from registry
  const dataset = datasetRegistry.getDataset(datasetKey);

  // Generate gradient for color scale (call hook unconditionally)
  const gradientStyle = useMemo(() => {
    if (!dataset) return {};
    return { background: generateGradientString(dataset.metadata.colorScale) };
  }, [dataset]);

  if (!dataset) {
    return null;
  }

  const { metadata, min, max } = dataset;
  const range = max - min;

  return (
    <div className={`dataset-legend dataset-legend-${position}`}>
      <div className="dataset-legend-header">
        <span className="dataset-legend-title">{metadata.name}</span>
      </div>
      
      <div className="dataset-legend-gradient-container">
        <div className="dataset-legend-gradient" style={gradientStyle} />
      </div>
      
      <div className="dataset-legend-labels">
        <span className="dataset-legend-label-min">
          {formatValue(min, range)}
        </span>
        <span className="dataset-legend-units">
          {metadata.units}
        </span>
        <span className="dataset-legend-label-max">
          {formatValue(max, range)}
        </span>
      </div>
      
      <div className="dataset-legend-count">
        {dataset.validCount.toLocaleString()} data points
      </div>
    </div>
  );
};

export default DatasetLegend;
