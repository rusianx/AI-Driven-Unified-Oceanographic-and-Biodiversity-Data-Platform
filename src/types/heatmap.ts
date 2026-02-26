// Heatmap data types: shared interfaces for heatmap visualization

export interface HeatmapDataPoint {
  lat: number;
  lon: number;
  value: number;
  id?: string;
  metadata?: Record<string, unknown>;
}
