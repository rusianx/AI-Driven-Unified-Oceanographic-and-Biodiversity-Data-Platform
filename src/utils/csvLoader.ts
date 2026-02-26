// CSV Data loader: parses CSV datasets, filters -999, computes min/max

export interface CSVDataPoint {
  lat: number;
  lon: number;
  value: number;
}

export interface ParsedDataset {
  data: CSVDataPoint[];
  min: number;
  max: number;
  validCount: number;
  invalidCount: number;
}

// Parse a CSV row into a CSVDataPoint; returns null for invalid rows
function parseCSVRow(row: string, rowIndex: number): CSVDataPoint | null {
  const trimmed = row.trim();
  if (!trimmed || trimmed.toLowerCase().startsWith('latitude')) {
    return null; // Skip header or empty rows
  }

  const parts = trimmed.split(',').map(p => p.trim());
  if (parts.length !== 3) {
    console.warn(`Invalid row at line ${rowIndex}: expected 3 columns, got ${parts.length}`);
    return null;
  }

  const lat = parseFloat(parts[0]);
  const lon = parseFloat(parts[1]);
  const value = parseFloat(parts[2]);

  // Validate parsed values
  if (isNaN(lat) || isNaN(lon) || isNaN(value)) {
    console.warn(`Invalid numeric values at line ${rowIndex}:`, parts);
    return null;
  }

  // Filter out missing/invalid data (-999)
  if (value === -999) {
    return null;
  }

  // Validate coordinate ranges
  if (lat < -90 || lat > 90) {
    console.warn(`Invalid latitude ${lat} at line ${rowIndex}`);
    return null;
  }
  if (lon < -180 || lon > 180) {
    console.warn(`Invalid longitude ${lon} at line ${rowIndex}`);
    return null;
  }

  return { lat, lon, value };
}

// Load and parse a CSV file; returns a ParsedDataset with stats
export async function loadCSVDataset(filePath: string): Promise<ParsedDataset> {
  try {
    console.log(`[CSV Loader] Loading dataset from: ${filePath}`);
    const startTime = performance.now();

    // Fetch CSV file
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${filePath}: ${response.status} ${response.statusText}`);
    }

    const csvText = await response.text();
    const rows = csvText.split('\n');

    console.log(`[CSV Loader] Parsing ${rows.length} rows...`);

    const dataPoints: CSVDataPoint[] = [];
    let min = Infinity;
    let max = -Infinity;
    let invalidCount = 0;

    // Parse each row
    for (let i = 0; i < rows.length; i++) {
      const point = parseCSVRow(rows[i], i + 1);
      if (point) {
        dataPoints.push(point);
        min = Math.min(min, point.value);
        max = Math.max(max, point.value);
      } else if (rows[i].trim() && !rows[i].toLowerCase().includes('latitude')) {
        invalidCount++;
      }
    }

    const loadTime = performance.now() - startTime;

    console.log(`[CSV Loader] ✓ Loaded ${dataPoints.length} valid points in ${loadTime.toFixed(1)}ms`);
    console.log(`[CSV Loader]   Range: ${min.toFixed(4)} to ${max.toFixed(4)}`);
    console.log(`[CSV Loader]   Invalid/missing: ${invalidCount} points`);

    // Handle edge case: no valid data
    if (dataPoints.length === 0) {
      console.warn(`[CSV Loader] Warning: No valid data points found in ${filePath}`);
      return {
        data: [],
        min: 0,
        max: 0,
        validCount: 0,
        invalidCount,
      };
    }

    return {
      data: dataPoints,
      min,
      max,
      validCount: dataPoints.length,
      invalidCount,
    };
  } catch (error) {
    console.error(`[CSV Loader] Error loading ${filePath}:`, error);
    throw error;
  }
}

// Load multiple CSV datasets in parallel and return mapping of parsed datasets
export async function loadMultipleDatasets(
  filePaths: Record<string, string>
): Promise<Record<string, ParsedDataset>> {
  console.log(`[CSV Loader] Loading ${Object.keys(filePaths).length} datasets...`);
  const startTime = performance.now();

  const entries = Object.entries(filePaths);
  const promises = entries.map(async ([key, path]) => {
    const dataset = await loadCSVDataset(path);
    return [key, dataset] as const;
  });

  const results = await Promise.all(promises);
  const datasets = Object.fromEntries(results);

  const totalTime = performance.now() - startTime;
  const totalPoints = Object.values(datasets).reduce((sum, d) => sum + d.validCount, 0);

  console.log(`[CSV Loader] ✓ All datasets loaded in ${totalTime.toFixed(1)}ms`);
  console.log(`[CSV Loader]   Total valid points: ${totalPoints.toLocaleString()}`);

  return datasets;
}

// Convert ParsedDataset to heatmap point format for visualization
export function convertToHeatmapFormat(
  dataset: ParsedDataset,
  metadata?: Record<string, unknown>
): Array<{ lat: number; lon: number; value: number; metadata?: Record<string, unknown> }> {
  return dataset.data.map((point, index) => ({
    lat: point.lat,
    lon: point.lon,
    value: point.value,
    id: `point-${index}`,
    ...(metadata && { metadata }),
  }));
}
