// Sample heatmap data generators for testing and demo

import type { HeatmapDataPoint } from '../types/heatmap';

// Generate realistic salinity data (subtropical gyres higher)
export function generateSalinityData(count: number = 500): HeatmapDataPoint[] {
  const data: HeatmapDataPoint[] = [];

  // Define ocean regions with typical salinity patterns
  const regions = [
    { name: 'Pacific', latMin: -50, latMax: 50, lonMin: -180, lonMax: -70 },
    { name: 'Atlantic', latMin: -50, latMax: 60, lonMin: -70, lonMax: 20 },
    { name: 'Indian', latMin: -50, latMax: 25, lonMin: 20, lonMax: 120 },
  ];

  for (let i = 0; i < count; i++) {
    const region = regions[i % regions.length];

    const lat = region.latMin + Math.random() * (region.latMax - region.latMin);
    const lon = region.lonMin + Math.random() * (region.lonMax - region.lonMin);

    // Salinity model: higher at mid-latitudes (subtropical gyres)
    // Lower near equator (rainfall) and poles (freshwater input)
    const latFactor = 1 - Math.abs(lat / 90) * 0.3; // Higher at mid-latitudes
    const subtropicalBump = Math.exp(-Math.pow((Math.abs(lat) - 25) / 15, 2)); // Peak at ±25°

    // Base salinity: 33-37 PSU (normalized to 0-1)
    let salinity = 34 + 2 * latFactor + subtropicalBump;

    // Add regional variation
    salinity += (Math.random() - 0.5) * 0.5;

    // Normalize to 0-1 (assuming range 32-38 PSU)
    const value = (salinity - 32) / 6;

    data.push({
      lat,
      lon,
      value: Math.max(0, Math.min(1, value)),
      metadata: { salinity: salinity.toFixed(2) + ' PSU' },
    });
  }

  return data;
}

// Generate chlorophyll-a data (coastal upwelling & polar highs)
export function generateChlorophyllData(count: number = 500): HeatmapDataPoint[] {
  const data: HeatmapDataPoint[] = [];

  // Coastal upwelling zones (high productivity)
  const coastalZones = [
    { lat: 35, lon: -125, radius: 10 }, // California Current
    { lat: -20, lon: -70, radius: 8 },  // Peru Current
    { lat: 25, lon: -17, radius: 12 },  // Canary Current
    { lat: -35, lon: 18, radius: 10 },  // Benguela Current
  ];

  // Generate points across oceans
  for (let i = 0; i < count; i++) {
    let lat, lon, value;

    // 30% chance of being in coastal upwelling zone
    if (Math.random() < 0.3 && coastalZones.length > 0) {
      const zone = coastalZones[Math.floor(Math.random() * coastalZones.length)];
      lat = zone.lat + (Math.random() - 0.5) * zone.radius * 2;
      lon = zone.lon + (Math.random() - 0.5) * zone.radius * 2;

      // High chlorophyll in upwelling zones (log scale: 0.5-10 mg/m³)
      const chlorophyll = 0.5 + Math.random() * 5;
      value = Math.log10(chlorophyll + 0.01) / 2 + 0.5; // Normalize
    } else {
      // Open ocean
      lat = -60 + Math.random() * 120;
      lon = -180 + Math.random() * 360;

      // Lower chlorophyll away from coast and at low latitudes
      const latFactor = Math.abs(lat) / 60; // Higher at poles
      const chlorophyll = 0.05 + latFactor * 0.5 + Math.random() * 0.3;
      value = Math.log10(chlorophyll + 0.01) / 2 + 0.5;
    }

    data.push({
      lat,
      lon,
      value: Math.max(0, Math.min(1, value)),
      metadata: { region: 'Ocean' },
    });
  }

  return data;
}

// Generate sea surface temperature data (equator warm, poles cool)
export function generateTemperatureData(count: number = 500): HeatmapDataPoint[] {
  const data: HeatmapDataPoint[] = [];

  for (let i = 0; i < count; i++) {
    const lat = -70 + Math.random() * 140;
    const lon = -180 + Math.random() * 360;

    // Temperature model: warmer at equator
    // Range: -2°C (polar) to 30°C (tropical)
    const latEffect = Math.cos((lat * Math.PI) / 180);
    const baseTemp = 15 + 13 * latEffect; // 2-28°C

    // Seasonal variation (simplified)
    const seasonalVariation = (Math.random() - 0.5) * 4;

    const temperature = baseTemp + seasonalVariation;

    // Normalize to 0-1 (range: -2 to 32°C)
    const value = (temperature - (-2)) / 34;

    data.push({
      lat,
      lon,
      value: Math.max(0, Math.min(1, value)),
      metadata: { temperature: temperature.toFixed(1) + '°C' },
    });
  }

  return data;
}

// Generate gridded heatmap data for a regular lat/lon grid
export function generateGriddedHeatmap(
  latRes: number = 30,
  lonRes: number = 60,
  dataType: 'salinity' | 'chlorophyll' | 'temperature' = 'temperature'
): HeatmapDataPoint[] {
  const data: HeatmapDataPoint[] = [];

  const latStep = 140 / latRes; // -70 to 70
  const lonStep = 360 / lonRes; // -180 to 180

  for (let i = 0; i <= latRes; i++) {
    for (let j = 0; j <= lonRes; j++) {
      const lat = -70 + i * latStep;
      const lon = -180 + j * lonStep;

      let value: number;

      switch (dataType) {
        case 'salinity':
          // Salinity gradient
          value = 0.3 + 0.4 * Math.cos((lat * Math.PI) / 90);
          value += 0.1 * Math.sin((lon * Math.PI) / 90);
          break;

        case 'chlorophyll':
          // Chlorophyll: higher at poles and coasts
          value = 0.2 + 0.5 * (Math.abs(lat) / 70);
          value += 0.2 * Math.sin((lon * Math.PI) / 60);
          break;

        case 'temperature':
        default:
          // Temperature: warm at equator
          value = 0.8 - 0.6 * (Math.abs(lat) / 70);
          value += 0.1 * Math.cos((lon * Math.PI) / 90);
          break;
      }

      // Add noise
      value += (Math.random() - 0.5) * 0.1;

      data.push({
        lat,
        lon,
        value: Math.max(0, Math.min(1, value)),
      });
    }
  }

  return data;
}

// Generate clustered ocean data to mimic survey patterns
export function generateClusteredOceanData(
  clusterCount: number = 10,
  pointsPerCluster: number = 50
): HeatmapDataPoint[] {
  const data: HeatmapDataPoint[] = [];

  // Create cluster centers (e.g., research station areas)
  const clusters: Array<{ lat: number; lon: number; baseValue: number }> = [];

  for (let i = 0; i < clusterCount; i++) {
    clusters.push({
      lat: -60 + Math.random() * 120,
      lon: -180 + Math.random() * 360,
      baseValue: Math.random(),
    });
  }

  // Generate points around each cluster
  clusters.forEach((cluster) => {
    for (let i = 0; i < pointsPerCluster; i++) {
      // Gaussian distribution around cluster center
      const latOffset = (Math.random() + Math.random() - 1) * 5;
      const lonOffset = (Math.random() + Math.random() - 1) * 5;

      const lat = cluster.lat + latOffset;
      const lon = cluster.lon + lonOffset;

      // Value with cluster correlation + local variation
      const value =
        cluster.baseValue * 0.7 +
        Math.random() * 0.3;

      data.push({
        lat,
        lon,
        value: Math.max(0, Math.min(1, value)),
        metadata: { cluster: clusters.indexOf(cluster) },
      });
    }
  });

  return data;
}

// Generate El Niño-style SST anomaly pattern (east-west gradient)
export function generateElNinoPattern(): HeatmapDataPoint[] {
  const data: HeatmapDataPoint[] = [];

  // Focus on equatorial Pacific
  for (let lat = -20; lat <= 20; lat += 2) {
    for (let lon = -180; lon <= -70; lon += 3) {
      // El Niño: warm water in eastern Pacific
      const distanceFromEquator = Math.abs(lat);
      const distanceFromDateline = Math.abs(lon + 180);

      // Warm anomaly decreases with distance from equator and gets warmer eastward
      let anomaly = 1.0 - distanceFromEquator / 30;
      anomaly *= 0.3 + 0.7 * (1 - distanceFromDateline / 110);

      // Add some noise
      anomaly += (Math.random() - 0.5) * 0.1;

      data.push({
        lat,
        lon,
        value: Math.max(0, Math.min(1, anomaly)),
        metadata: { pattern: 'El Niño SST Anomaly' },
      });
    }
  }

  return data;
}
