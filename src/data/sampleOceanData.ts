// Example/sample ocean data generators for demos and tests

export interface OceanDataPoint {
  lat: number;
  lon: number;
  value: number;
  metadata?: {
    temperature?: number;
    salinity?: number;
    depth?: number;
  };
}

// Generate sample ocean temperature data across regions
export function generateSampleOceanData(count: number = 100): OceanDataPoint[] {
  const data: OceanDataPoint[] = [];
  
  // Define major ocean regions (rough boundaries)
  const oceanRegions = [
    { name: 'Pacific', latMin: -60, latMax: 60, lonMin: -180, lonMax: -70 },
    { name: 'Atlantic', latMin: -60, latMax: 60, lonMin: -70, lonMax: 20 },
    { name: 'Indian', latMin: -60, latMax: 30, lonMin: 20, lonMax: 120 },
    { name: 'Southern', latMin: -70, latMax: -40, lonMin: -180, lonMax: 180 },
    { name: 'Arctic', latMin: 60, latMax: 90, lonMin: -180, lonMax: 180 },
  ];
  
  for (let i = 0; i < count; i++) {
    // Pick random ocean region
    const region = oceanRegions[Math.floor(Math.random() * oceanRegions.length)];
    
    // Generate random point in region
    const lat = region.latMin + Math.random() * (region.latMax - region.latMin);
    const lon = region.lonMin + Math.random() * (region.lonMax - region.lonMin);
    
    // Generate sample value (0-1 range)
    // Could represent temperature, salinity, etc.
    const value = Math.random();
    
    data.push({
      lat,
      lon,
      value,
      metadata: {
        temperature: 15 + value * 15, // 15-30°C
        salinity: 32 + value * 5, // 32-37 PSU
      },
    });
  }
  
  return data;
}

// Generate example data along an ocean current path
export function generateOceanCurrentData(): OceanDataPoint[] {
  const data: OceanDataPoint[] = [];
  
  // Simplified Gulf Stream path
  const gulfStreamPath = [
    { lat: 25, lon: -80 },
    { lat: 30, lon: -75 },
    { lat: 35, lon: -70 },
    { lat: 40, lon: -65 },
    { lat: 42, lon: -55 },
    { lat: 45, lon: -45 },
  ];
  
  gulfStreamPath.forEach((point, index) => {
    // Add multiple points along each segment
    const value = index / gulfStreamPath.length;
    
    for (let offset = -2; offset <= 2; offset++) {
      data.push({
        lat: point.lat + offset * 0.5,
        lon: point.lon,
        value,
        metadata: {
          temperature: 20 + value * 8,
        },
      });
    }
  });
  
  return data;
}

// Generate gridded ocean data for a rectangular region
export function generateGriddedOceanData(
  latMin: number,
  latMax: number,
  lonMin: number,
  lonMax: number,
  resolution: number = 10
): OceanDataPoint[] {
  const data: OceanDataPoint[] = [];
  
  const latStep = (latMax - latMin) / resolution;
  const lonStep = (lonMax - lonMin) / resolution;
  
  for (let i = 0; i <= resolution; i++) {
    for (let j = 0; j <= resolution; j++) {
      const lat = latMin + i * latStep;
      const lon = lonMin + j * lonStep;
      
      // Generate synthetic data pattern
      const value = 
        (Math.sin(lat * 0.1) + 1) * 0.5 *
        (Math.cos(lon * 0.1) + 1) * 0.5;
      
      data.push({ lat, lon, value });
    }
  }
  
  return data;
}

// Sample ocean measurement stations (example locations)
export const SAMPLE_OCEAN_STATIONS = [
  { lat: 50.0, lon: -145.0, value: 0.6, name: 'Station Papa' }, // North Pacific
  { lat: 0.0, lon: -110.0, value: 0.8, name: 'Equatorial Pacific' },
  { lat: -54.5, lon: 3.4, value: 0.3, name: 'Southern Ocean' },
  { lat: 31.5, lon: -64.2, value: 0.7, name: 'Bermuda BATS' },
  { lat: 59.0, lon: -39.0, value: 0.5, name: 'Iceland Basin' },
  { lat: -12.0, lon: 96.5, value: 0.9, name: 'Indian Ocean' },
  { lat: 35.0, lon: 139.0, value: 0.75, name: 'Kuroshio Extension' },
];
