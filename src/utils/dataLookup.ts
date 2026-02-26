// Data lookup utilities: nearest neighbor search and interpolation helpers

import { haversineDistance } from './coordinates';
import type { DataPoint } from '../data/datasetRegistry';

// Result type for nearest-point lookup
export interface NearestPointResult {
  point: DataPoint;
  distance: number; // Great circle distance in degrees
  index: number;
}

// Find nearest valid data point to target coordinate using haversine distance
export function findNearestPoint(
  targetLat: number,
  targetLon: number,
  dataset: DataPoint[],
  maxDistance: number = 5.0
): NearestPointResult | null {
  if (!dataset || dataset.length === 0) {
    return null;
  }

  let nearestPoint: DataPoint | null = null;
  let nearestDistance = Infinity;
  let nearestIndex = -1;

  for (let i = 0; i < dataset.length; i++) {
    const point = dataset[i];

    // Skip invalid data points
    if (point.value === -999) {
      continue;
    }

    // Calculate great circle distance
    const distance = haversineDistance(
      targetLat,
      targetLon,
      point.lat,
      point.lon,
      1.0 // Normalized to degrees
    );

    // Update if closer and within max range
    if (distance < nearestDistance && distance <= maxDistance) {
      nearestDistance = distance;
      nearestPoint = point;
      nearestIndex = i;
    }
  }

  if (nearestPoint === null) {
    return null;
  }

  return {
    point: nearestPoint,
    distance: nearestDistance,
    index: nearestIndex,
  };
}

// Return k nearest points for interpolation (sorted by distance)
export function findKNearestPoints(
  targetLat: number,
  targetLon: number,
  dataset: DataPoint[],
  k: number = 4,
  maxDistance: number = 5.0
): NearestPointResult[] {
  if (!dataset || dataset.length === 0) {
    return [];
  }

  // Calculate distances for all points
  const pointsWithDistance: NearestPointResult[] = [];

  for (let i = 0; i < dataset.length; i++) {
    const point = dataset[i];

    // Skip invalid data points
    if (point.value === -999) {
      continue;
    }

    const distance = haversineDistance(
      targetLat,
      targetLon,
      point.lat,
      point.lon,
      1.0
    );

    if (distance <= maxDistance) {
      pointsWithDistance.push({
        point,
        distance,
        index: i,
      });
    }
  }

  // Sort by distance and return top k
  pointsWithDistance.sort((a, b) => a.distance - b.distance);
  return pointsWithDistance.slice(0, k);
}

// Interpolate value with inverse distance weighting (IDW)
export function interpolateValue(
  targetLat: number,
  targetLon: number,
  dataset: DataPoint[],
  k: number = 4,
  power: number = 2,
  maxDistance: number = 5.0
): number | null {
  const nearestPoints = findKNearestPoints(targetLat, targetLon, dataset, k, maxDistance);

  if (nearestPoints.length === 0) {
    return null;
  }

  // If exact match (distance ~0), return that value directly
  if (nearestPoints[0].distance < 0.001) {
    return nearestPoints[0].point.value;
  }

  // Inverse distance weighting
  let weightedSum = 0;
  let weightSum = 0;

  for (const result of nearestPoints) {
    const weight = 1.0 / Math.pow(result.distance, power);
    weightedSum += weight * result.point.value;
    weightSum += weight;
  }

  return weightSum > 0 ? weightedSum / weightSum : null;
}

// SpatialIndex placeholder: structure for future spatial indexing enhancements
export class SpatialIndex {
  private gridSize: number;
  private grid: Map<string, DataPoint[]>;

  constructor(dataset: DataPoint[], gridSize: number = 10) {
    this.gridSize = gridSize;
    this.grid = new Map();
    this.buildIndex(dataset);
  }

  // Build spatial grid index dividing the world into grid cells
  private buildIndex(dataset: DataPoint[]): void {
    for (const point of dataset) {
      if (point.value === -999) continue;

      const key = this.getCellKey(point.lat, point.lon);
      if (!this.grid.has(key)) {
        this.grid.set(key, []);
      }
      this.grid.get(key)!.push(point);
    }

    console.log(`[SpatialIndex] Built index with ${this.grid.size} cells`);
  }

  // Compute grid cell key string for a lat/lon
  private getCellKey(lat: number, lon: number): string {
    const latCell = Math.floor((lat + 90) / (180 / this.gridSize));
    const lonCell = Math.floor((lon + 180) / (360 / this.gridSize));
    return `${latCell},${lonCell}`;
  }

  // Retrieve candidate points from nearby grid cells
  getCandidatePoints(lat: number, lon: number, searchRadius: number = 1): DataPoint[] {
    const candidates: DataPoint[] = [];
    const centerKey = this.getCellKey(lat, lon);
    
    // Parse center cell coordinates
    const [centerLat, centerLon] = centerKey.split(',').map(Number);

    // Search in radius around center cell
    for (let dLat = -searchRadius; dLat <= searchRadius; dLat++) {
      for (let dLon = -searchRadius; dLon <= searchRadius; dLon++) {
        const key = `${centerLat + dLat},${centerLon + dLon}`;
        const points = this.grid.get(key);
        if (points) {
          candidates.push(...points);
        }
      }
    }

    return candidates;
  }

  // Optimized nearest-point lookup using the spatial index
  findNearest(
    targetLat: number,
    targetLon: number,
    maxDistance: number = 5.0
  ): NearestPointResult | null {
    const candidates = this.getCandidatePoints(targetLat, targetLon, 2);
    return findNearestPoint(targetLat, targetLon, candidates, maxDistance);
  }
}
