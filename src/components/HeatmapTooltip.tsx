// HeatmapTooltip component: displays lat/lon/value with dataset units

import React from 'react';
import type { HeatmapDataPoint } from '../types/heatmap';
import { datasetRegistry, type DatasetKey } from '../data/datasetRegistry';
import './HeatmapTooltip.css';

export interface HeatmapTooltipProps {
  point: HeatmapDataPoint | null;
  datasetKey: DatasetKey;
}

// Format latitude/longitude with hemisphere indicator
function formatCoordinate(value: number, isLatitude: boolean): string {
  const abs = Math.abs(value);
  const direction = isLatitude
    ? value >= 0 ? 'N' : 'S'
    : value >= 0 ? 'E' : 'W';
  return `${abs.toFixed(2)}° ${direction}`;
}

// Format data value with precision based on range
function formatValue(value: number, range: number): string {
  if (range < 1) return value.toFixed(4);
  if (range < 10) return value.toFixed(3);
  if (range < 100) return value.toFixed(2);
  return value.toFixed(1);
}

// React component for heatmap point tooltip
export const HeatmapTooltip: React.FC<HeatmapTooltipProps> = ({
  point,
  datasetKey,
}) => {
  if (!point) {
    return null;
  }

  const dataset = datasetRegistry.getDataset(datasetKey);
  if (!dataset) {
    return null;
  }

  const { metadata, min, max } = dataset;
  const range = max - min;

  return (
    <div className="heatmap-tooltip">
      <div className="heatmap-tooltip-header">
        {metadata.name}
      </div>
      
      <div className="heatmap-tooltip-grid">
        <div className="heatmap-tooltip-row">
          <span className="heatmap-tooltip-label">Latitude:</span>
          <span className="heatmap-tooltip-value">
            {formatCoordinate(point.lat, true)}
          </span>
        </div>
        
        <div className="heatmap-tooltip-row">
          <span className="heatmap-tooltip-label">Longitude:</span>
          <span className="heatmap-tooltip-value">
            {formatCoordinate(point.lon, false)}
          </span>
        </div>
        
        <div className="heatmap-tooltip-row heatmap-tooltip-row-highlight">
          <span className="heatmap-tooltip-label">Value:</span>
          <span className="heatmap-tooltip-value">
            {formatValue(point.value, range)} {metadata.units}
          </span>
        </div>
      </div>

      {point.metadata && Object.keys(point.metadata).length > 0 && (
        <div className="heatmap-tooltip-metadata">
          {Object.entries(point.metadata).map(([key, value]) => (
            <div key={key} className="heatmap-tooltip-metadata-item">
              <span className="heatmap-tooltip-metadata-key">{key}:</span>
              <span className="heatmap-tooltip-metadata-value">{String(value)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HeatmapTooltip;
