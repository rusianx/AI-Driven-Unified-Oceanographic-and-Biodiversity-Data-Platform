// Geographic coordinate conversion utilities (WGS84)

import * as THREE from 'three';

// Convert lat/lon to THREE.Vector3 on a sphere (supports height offset)
export function latLonToVector3(
  lat: number,
  lon: number,
  radius: number,
  heightOffset: number = 0
): THREE.Vector3 {
  // Apply height offset to effective radius
  const effectiveRadius = radius + heightOffset;

  // Convert degrees to radians
  // phi: polar angle from north pole (0 to π)
  const phi = (90 - lat) * (Math.PI / 180);
  
  // theta: azimuthal angle from -X axis (0 to 2π)
  const theta = (lon + 180) * (Math.PI / 180);

  // Spherical to Cartesian coordinate conversion
  // Standard spherical coordinate formulas:
  // x = r * sin(phi) * cos(theta)
  // y = r * cos(phi)
  // z = r * sin(phi) * sin(theta)
  // Note: Negative x to align with Three.js coordinate system
  const x = -(effectiveRadius * Math.sin(phi) * Math.cos(theta));
  const y = effectiveRadius * Math.cos(phi);
  const z = effectiveRadius * Math.sin(phi) * Math.sin(theta);

  return new THREE.Vector3(x, y, z);
}

// Test coordinates and expected results for verification

// Convert a THREE.Vector3 back to {lat, lon} in degrees
export function vector3ToLatLon(
  vector: THREE.Vector3
): { lat: number; lon: number } {
  // Normalize to unit sphere (radius-independent calculation)
  const normalized = vector.clone().normalize();
  
  // Calculate latitude from Y component
  // lat = 90° - polar angle (phi)
  // phi = arccos(y) where y ∈ [-1, 1]
  const lat = 90 - Math.acos(normalized.y) * (180 / Math.PI);
  
  // Calculate longitude from X and Z components
  // lon = azimuthal angle (theta) - 180°
  // theta = arctan2(z, -x) to match our coordinate system
  const lon = (Math.atan2(normalized.z, -normalized.x) * (180 / Math.PI)) - 180;

  return { lat, lon };
}

// Haversine distance between two lat/lon points (returns distance in same units as radius)
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  radius: number = 6371
): number {
  // Convert latitude and longitude differences to radians
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  // Haversine formula
  // a = sin²(Δlat/2) + cos(lat1) * cos(lat2) * sin²(Δlon/2)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  // c = 2 * atan2(√a, √(1-a))
  // Distance = radius * c
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return radius * c;
}

// Validate coordinate conversion functions (development utility)
export function validateCoordinateSystem(radius: number = 5): {
  passed: boolean;
  tests: Array<{ name: string; passed: boolean; error?: number }>;
} {
  const tolerance = 0.0001; // Acceptable floating-point error
  const tests: Array<{ name: string; passed: boolean; error?: number }> = [];

  // Test 1: Equator/Prime Meridian (0°, 0°) → (-radius, 0, 0)
  const test1 = latLonToVector3(0, 0, radius);
  const error1 = Math.abs(test1.x + radius) + Math.abs(test1.y) + Math.abs(test1.z);
  tests.push({ name: 'Equator/Prime (0,0)', passed: error1 < tolerance, error: error1 });

  // Test 2: North Pole (90°, 0°) → (0, radius, 0)
  const test2 = latLonToVector3(90, 0, radius);
  const error2 = Math.abs(test2.x) + Math.abs(test2.y - radius) + Math.abs(test2.z);
  tests.push({ name: 'North Pole (90,0)', passed: error2 < tolerance, error: error2 });

  // Test 3: South Pole (-90°, 0°) → (0, -radius, 0)
  const test3 = latLonToVector3(-90, 0, radius);
  const error3 = Math.abs(test3.x) + Math.abs(test3.y + radius) + Math.abs(test3.z);
  tests.push({ name: 'South Pole (-90,0)', passed: error3 < tolerance, error: error3 });

  // Test 4: 90°E Equator (0°, 90°) → (0, 0, radius)
  const test4 = latLonToVector3(0, 90, radius);
  const error4 = Math.abs(test4.x) + Math.abs(test4.y) + Math.abs(test4.z - radius);
  tests.push({ name: 'Equator/90E (0,90)', passed: error4 < tolerance, error: error4 });

  // Test 5: 90°W Equator (0°, -90°) → (0, 0, -radius)
  const test5 = latLonToVector3(0, -90, radius);
  const error5 = Math.abs(test5.x) + Math.abs(test5.y) + Math.abs(test5.z + radius);
  tests.push({ name: 'Equator/90W (0,-90)', passed: error5 < tolerance, error: error5 });

  // Test 6: Round-trip conversion (forward and back)
  const originalLat = 35.6762;
  const originalLon = 139.6503;
  const vec = latLonToVector3(originalLat, originalLon, radius);
  const { lat: recoveredLat, lon: recoveredLon } = vector3ToLatLon(vec);
  const error6 = Math.abs(recoveredLat - originalLat) + Math.abs(recoveredLon - originalLon);
  tests.push({ name: 'Round-trip Tokyo', passed: error6 < tolerance, error: error6 });

  // Test 7: Height offset
  const test7 = latLonToVector3(0, 0, radius, 1.0);
  const length7 = test7.length();
  const error7 = Math.abs(length7 - (radius + 1.0));
  tests.push({ name: 'Height offset', passed: error7 < tolerance, error: error7 });

  const allPassed = tests.every((t) => t.passed);
  return { passed: allPassed, tests };
}
