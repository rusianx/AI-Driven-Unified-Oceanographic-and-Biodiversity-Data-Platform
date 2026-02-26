// Color scale utilities for oceanographic data visualization

import * as THREE from 'three';

export type ColorScale = 'salinity' | 'chlorophyll' | 'temperature' | 'depth';

// Color scale definitions: gradient stops as [position (0-1), color hex]
const COLOR_SCALE_DEFINITIONS: Record<ColorScale, Array<[number, string]>> = {
  // Salinity: Blue (low) → Green (mid) → Red (high)
  // Typical range: 32-37 PSU
  salinity: [
    [0.0, '#0066cc'],  // Deep blue (low salinity)
    [0.3, '#00aacc'],  // Cyan
    [0.5, '#00cc88'],  // Teal-green
    [0.7, '#88cc00'],  // Yellow-green
    [0.9, '#cc8800'],  // Orange
    [1.0, '#cc0000'],  // Red (high salinity)
  ],

  // Chlorophyll: Dark blue (low) → Bright green (high)
  // Typical range: 0.01-10 mg/m³ (log scale)
  chlorophyll: [
    [0.0, '#000033'],  // Very dark blue (oligotrophic)
    [0.2, '#000088'],  // Dark blue
    [0.4, '#0044cc'],  // Blue
    [0.6, '#00aa66'],  // Blue-green
    [0.8, '#44cc44'],  // Green
    [1.0, '#88ff44'],  // Bright yellow-green (eutrophic)
  ],

  // Temperature: Cool blues → Warm reds
  // Typical range: -2°C to 30°C
  temperature: [
    [0.0, '#000088'],  // Cold blue
    [0.25, '#0088cc'], // Ocean blue
    [0.5, '#00cc88'],  // Cyan-green
    [0.75, '#ffcc00'], // Yellow
    [1.0, '#ff3300'],  // Hot red
  ],

  // Ocean depth: Surface cyan → Deep purple-black
  depth: [
    [0.0, '#00ffff'],  // Cyan (surface)
    [0.25, '#0088ff'], // Light blue
    [0.5, '#0044aa'],  // Deep blue
    [0.75, '#220055'], // Purple
    [1.0, '#000000'],  // Black (abyssal)
  ],
};

// Interpolate gradient stops and return a THREE.Color for a normalized value
export function getColorFromScale(
  value: number,
  scale: ColorScale
): THREE.Color {
  const normalized = Math.max(0, Math.min(1, value));
  const stops = COLOR_SCALE_DEFINITIONS[scale];

  // Find the two stops to interpolate between
  let lowerStop = stops[0];
  let upperStop = stops[stops.length - 1];

  for (let i = 0; i < stops.length - 1; i++) {
    if (normalized >= stops[i][0] && normalized <= stops[i + 1][0]) {
      lowerStop = stops[i];
      upperStop = stops[i + 1];
      break;
    }
  }

  // Calculate interpolation factor between the two stops
  const range = upperStop[0] - lowerStop[0];
  const t = range > 0 ? (normalized - lowerStop[0]) / range : 0;

  // Interpolate between colors
  const colorLower = new THREE.Color(lowerStop[1]);
  const colorUpper = new THREE.Color(upperStop[1]);

  return colorLower.lerp(colorUpper, t);
}

// Get color as {r,g,b} in 0-1 range using same interpolation logic
export function getColorFromScaleRGB(
  value: number,
  scale: ColorScale
): { r: number; g: number; b: number } {
  const normalized = Math.max(0, Math.min(1, value));
  const stops = COLOR_SCALE_DEFINITIONS[scale];

  // Find the two stops to interpolate between
  let lowerStop = stops[0];
  let upperStop = stops[stops.length - 1];

  for (let i = 0; i < stops.length - 1; i++) {
    if (normalized >= stops[i][0] && normalized <= stops[i + 1][0]) {
      lowerStop = stops[i];
      upperStop = stops[i + 1];
      break;
    }
  }

  // Calculate interpolation factor between the two stops
  const range = upperStop[0] - lowerStop[0];
  const t = range > 0 ? (normalized - lowerStop[0]) / range : 0;

  // Parse hex colors and interpolate
  const colorLower = new THREE.Color(lowerStop[1]);
  const colorUpper = new THREE.Color(upperStop[1]);
  const result = colorLower.lerp(colorUpper, t);

  return { r: result.r, g: result.g, b: result.b };
}

// Return RGBA array [r,g,b,a] in 0-255 range for Deck.gl
export function getColorFromScaleArray(
  value: number,
  scale: ColorScale,
  alpha: number = 255
): [number, number, number, number] {
  const rgb = getColorFromScaleRGB(value, scale);
  return [rgb.r * 255, rgb.g * 255, rgb.b * 255, alpha];
}

// Generate Float32Array color gradient for shader uniforms
export function generateColorGradientArray(
  scale: ColorScale,
  resolution: number = 256
): Float32Array {
  const colors = new Float32Array(resolution * 3);

  for (let i = 0; i < resolution; i++) {
    const t = i / (resolution - 1);
    const color = getColorFromScale(t, scale);

    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  return colors;
}

// Create a 1D DataTexture gradient for shaders
export function createGradientTexture(scale: ColorScale): THREE.DataTexture {
  const resolution = 256;
  const data = generateColorGradientArray(scale, resolution);

  const texture = new THREE.DataTexture(
    data,
    resolution,
    1,
    THREE.RGBFormat,
    THREE.FloatType
  );

  texture.needsUpdate = true;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  return texture;
}

// Normalize numeric array to 0-1 with optional percentile clipping
export function normalizeDataValues(
  values: number[],
  options: {
    min?: number;
    max?: number;
    clipPercentile?: number; // Clip outliers (e.g., 0.02 = clip 2% on each end)
  } = {}
): number[] {
  if (values.length === 0) return [];

  let { min, max } = options;
  const clipPercentile = options.clipPercentile;

  // Calculate min/max if not provided
  if (min === undefined || max === undefined) {
    const sorted = [...values].sort((a, b) => a - b);

    if (clipPercentile && clipPercentile > 0) {
      const clipCount = Math.floor(sorted.length * clipPercentile);
      min = min ?? sorted[clipCount];
      max = max ?? sorted[sorted.length - 1 - clipCount];
    } else {
      min = min ?? sorted[0];
      max = max ?? sorted[sorted.length - 1];
    }
  }

  const range = max - min;
  if (range === 0) return values.map(() => 0.5);

  return values.map((v) => {
    const normalized = (v - min!) / range;
    return Math.max(0, Math.min(1, normalized));
  });
}

// Return metadata for a given color scale for UI display
export function getColorScaleInfo(scale: ColorScale): {
  name: string;
  description: string;
  typicalRange: string;
  unit: string;
} {
  const info = {
    salinity: {
      name: 'Salinity',
      description: 'Ocean salt concentration',
      typicalRange: '32-37',
      unit: 'PSU',
    },
    chlorophyll: {
      name: 'Chlorophyll-a',
      description: 'Phytoplankton abundance',
      typicalRange: '0.01-10',
      unit: 'mg/m³',
    },
    temperature: {
      name: 'Temperature',
      description: 'Sea surface temperature',
      typicalRange: '-2 to 30',
      unit: '°C',
    },
    depth: {
      name: 'Depth',
      description: 'Ocean floor depth',
      typicalRange: '0-11000',
      unit: 'm',
    },
  };

  return info[scale];
}

// Convert THREE.Color to GLSL vec3 string
export function colorToVec3(color: THREE.Color): string {
  return `vec3(${color.r.toFixed(4)}, ${color.g.toFixed(4)}, ${color.b.toFixed(4)})`;
}

// Generate GLSL function code for the given color scale
export function generateColorScaleGLSL(scale: ColorScale): string {
  const stops = COLOR_SCALE_DEFINITIONS[scale];
  let glslCode = '// Color scale: ' + scale + '\nvec3 getScaleColor(float value) {\n';
  glslCode += '  float t = clamp(value, 0.0, 1.0);\n';

  for (let i = 0; i < stops.length - 1; i++) {
    const [pos1, color1] = stops[i];
    const [pos2, color2] = stops[i + 1];
    const c1 = new THREE.Color(color1);
    const c2 = new THREE.Color(color2);

    if (i === 0) {
      glslCode += `  if (t <= ${pos2.toFixed(3)}) {\n`;
    } else {
      glslCode += `  else if (t <= ${pos2.toFixed(3)}) {\n`;
    }

    glslCode += `    float localT = (t - ${pos1.toFixed(3)}) / ${(pos2 - pos1).toFixed(3)};\n`;
    glslCode += `    return mix(${colorToVec3(c1)}, ${colorToVec3(c2)}, localT);\n`;
    glslCode += '  }\n';
  }

  const lastColor = new THREE.Color(stops[stops.length - 1][1]);
  glslCode += `  return ${colorToVec3(lastColor)};\n`;
  glslCode += '}\n';

  return glslCode;
}
