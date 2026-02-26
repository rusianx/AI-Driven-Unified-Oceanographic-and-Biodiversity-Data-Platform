// Ocean identification utilities: classify lat/lon into major ocean regions

export type OceanName = 
  | 'Pacific Ocean'
  | 'Atlantic Ocean'
  | 'Indian Ocean'
  | 'Southern Ocean'
  | 'Arctic Ocean'
  | 'Unknown';

// Simplified geographic boundaries for major oceans (for fast classification)
const OCEAN_BOUNDARIES = {
  // Southern Ocean: All waters south of 60°S
  southern: {
    latRange: [-90, -60],
    lonRange: [-180, 180],
  },

  // Arctic Ocean: Waters north of 65°N (roughly)
  // Bounded by North America, Europe, and Asia
  arctic: {
    latRange: [65, 90],
    lonRange: [-180, 180],
  },

  // Atlantic Ocean: Rough vertical strip between Americas and Europe/Africa
  // Western boundary: ~100°W to 20°W (highly simplified)
  atlantic: {
    latRange: [-60, 65],
    lonRanges: [
      { min: -100, max: 20 }, // Main Atlantic
    ],
  },

  // Indian Ocean: Between Africa, Asia, and Australia
  // Roughly 20°E to 147°E, south of Asia
  indian: {
    latRange: [-60, 25],
    lonRanges: [
      { min: 20, max: 147 },
    ],
  },

  // Pacific Ocean: The remainder (largest ocean)
  // Everything not classified as another ocean
  pacific: {
    // Pacific fills the remaining space
    latRange: [-60, 65],
    lonRanges: [
      { min: 147, max: 180 },  // Western Pacific
      { min: -180, max: -100 }, // Eastern Pacific
    ],
  },
};

// Check longitude within range (handles ±180° wrapping)
function isLonInRange(lon: number, min: number, max: number): boolean {
  if (min <= max) {
    return lon >= min && lon <= max;
  } else {
    // Handle wrapping around ±180°
    return lon >= min || lon <= max;
  }
}

// Determine ocean name for given lat/lon using priority rules
export function identifyOcean(lat: number, lon: number): OceanName {
  // Priority 1: Southern Ocean (all waters south of 60°S)
  if (lat <= OCEAN_BOUNDARIES.southern.latRange[1]) {
    return 'Southern Ocean';
  }

  // Priority 2: Arctic Ocean (north of 65°N)
  if (lat >= OCEAN_BOUNDARIES.arctic.latRange[0]) {
    return 'Arctic Ocean';
  }

  // Priority 3: Atlantic Ocean
  const { latRange: atlLatRange, lonRanges: atlLonRanges } = OCEAN_BOUNDARIES.atlantic;
  if (lat >= atlLatRange[0] && lat <= atlLatRange[1]) {
    for (const range of atlLonRanges) {
      if (isLonInRange(lon, range.min, range.max)) {
        return 'Atlantic Ocean';
      }
    }
  }

  // Priority 4: Indian Ocean
  const { latRange: indLatRange, lonRanges: indLonRanges } = OCEAN_BOUNDARIES.indian;
  if (lat >= indLatRange[0] && lat <= indLatRange[1]) {
    for (const range of indLonRanges) {
      if (isLonInRange(lon, range.min, range.max)) {
        return 'Indian Ocean';
      }
    }
  }

  // Priority 5: Pacific Ocean (everything else in valid range)
  const { latRange: pacLatRange, lonRanges: pacLonRanges } = OCEAN_BOUNDARIES.pacific;
  if (lat >= pacLatRange[0] && lat <= pacLatRange[1]) {
    for (const range of pacLonRanges) {
      if (isLonInRange(lon, range.min, range.max)) {
        return 'Pacific Ocean';
      }
    }
  }

  // Fallback: If not in any specific range, assume Pacific (largest ocean)
  if (lat > -60 && lat < 65) {
    return 'Pacific Ocean';
  }

  return 'Unknown';
}

// Return a visualization color for a named ocean
export function getOceanColor(ocean: OceanName): string {
  const colors: Record<OceanName, string> = {
    'Pacific Ocean': '#1e3a8a',      // Deep blue
    'Atlantic Ocean': '#1e40af',     // Medium blue
    'Indian Ocean': '#2563eb',       // Lighter blue
    'Southern Ocean': '#0ea5e9',     // Cyan-blue
    'Arctic Ocean': '#60a5fa',       // Light blue
    'Unknown': '#475569',            // Gray
  };
  return colors[ocean];
}

// Return informational metadata for a named ocean
export function getOceanInfo(ocean: OceanName): {
  name: string;
  area: string;
  avgDepth: string;
  description: string;
} {
  const info: Record<OceanName, {
    name: string;
    area: string;
    avgDepth: string;
    description: string;
  }> = {
    'Pacific Ocean': {
      name: 'Pacific Ocean',
      area: '~165 million km²',
      avgDepth: '~4,280 m',
      description: 'The largest and deepest ocean, covering ~46% of Earth\'s water surface',
    },
    'Atlantic Ocean': {
      name: 'Atlantic Ocean',
      area: '~106 million km²',
      avgDepth: '~3,646 m',
      description: 'Second-largest ocean, separating Americas from Europe and Africa',
    },
    'Indian Ocean': {
      name: 'Indian Ocean',
      area: '~70 million km²',
      avgDepth: '~3,741 m',
      description: 'Third-largest ocean, bounded by Asia, Africa, and Australia',
    },
    'Southern Ocean': {
      name: 'Southern Ocean',
      area: '~20 million km²',
      avgDepth: '~3,270 m',
      description: 'Encircles Antarctica, south of 60°S latitude',
    },
    'Arctic Ocean': {
      name: 'Arctic Ocean',
      area: '~14 million km²',
      avgDepth: '~1,205 m',
      description: 'Smallest and shallowest ocean, surrounding the North Pole',
    },
    'Unknown': {
      name: 'Unknown',
      area: 'N/A',
      avgDepth: 'N/A',
      description: 'Location not classified',
    },
  };

  return info[ocean];
}

// Development test: validate ocean identification against known points
export function validateOceanIdentification(): {
  passed: boolean;
  tests: Array<{ name: string; expected: OceanName; actual: OceanName; passed: boolean }>;
} {
  const tests = [
    { name: 'Mid-Pacific', lat: 0, lon: 160, expected: 'Pacific Ocean' as OceanName },
    { name: 'Mid-Atlantic', lat: 30, lon: -40, expected: 'Atlantic Ocean' as OceanName },
    { name: 'Mid-Indian', lat: -10, lon: 80, expected: 'Indian Ocean' as OceanName },
    { name: 'Antarctica Coast', lat: -70, lon: 0, expected: 'Southern Ocean' as OceanName },
    { name: 'North Pole Region', lat: 85, lon: 0, expected: 'Arctic Ocean' as OceanName },
    { name: 'Eastern Pacific', lat: 10, lon: -120, expected: 'Pacific Ocean' as OceanName },
    { name: 'South Atlantic', lat: -30, lon: -20, expected: 'Atlantic Ocean' as OceanName },
  ];

  const results = tests.map(test => {
    const actual = identifyOcean(test.lat, test.lon);
    return {
      ...test,
      actual,
      passed: actual === test.expected,
    };
  });

  const allPassed = results.every(r => r.passed);
  return { passed: allPassed, tests: results };
}
