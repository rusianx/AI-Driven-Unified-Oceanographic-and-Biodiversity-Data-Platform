// Coordinate system validation utilities (WGS84 verification)

import { latLonToVector3, vector3ToLatLon, validateCoordinateSystem } from './coordinates';

// Run validation tests and print results to console
export function runValidationTests(): void {
  console.group('🌍 WGS84 Coordinate System Validation');
  
  const results = validateCoordinateSystem(5);
  
  console.log('\n📊 Test Results:');
  results.tests.forEach((test) => {
    const icon = test.passed ? '✅' : '❌';
    const errorStr = test.error !== undefined ? ` (error: ${test.error.toExponential(2)})` : '';
    console.log(`${icon} ${test.name}${errorStr}`);
  });
  
  console.log(`\n${results.passed ? '✅ All tests passed!' : '❌ Some tests failed'}`);
  
  // Additional visual tests with known cities
  console.group('\n🗺️  Known Location Tests');
  
  const cities = [
    { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
    { name: 'New York', lat: 40.7128, lon: -74.0060 },
    { name: 'London', lat: 51.5074, lon: -0.1278 },
    { name: 'Sydney', lat: -33.8688, lon: 151.2093 },
    { name: 'São Paulo', lat: -23.5505, lon: -46.6333 },
    { name: 'Cairo', lat: 30.0444, lon: 31.2357 },
  ];
  
  cities.forEach(city => {
    const vec = latLonToVector3(city.lat, city.lon, 5.0);
    const recovered = vector3ToLatLon(vec);
    const latError = Math.abs(recovered.lat - city.lat);
    const lonError = Math.abs(recovered.lon - city.lon);
    const totalError = latError + lonError;
    
    console.log(`${city.name}: (${city.lat.toFixed(1)}°, ${city.lon.toFixed(1)}°)`);
    console.log(`  → 3D: (${vec.x.toFixed(3)}, ${vec.y.toFixed(3)}, ${vec.z.toFixed(3)})`);
    console.log(`  → Round-trip error: ${totalError < 0.0001 ? '✅' : '⚠️'} ${totalError.toExponential(2)}°`);
    
    // Verify hemisphere
    if (city.lat > 0 && vec.y <= 0) {
      console.log('  ❌ ERROR: Northern hemisphere mapped to southern!');
    }
    if (city.lat < 0 && vec.y >= 0) {
      console.log('  ❌ ERROR: Southern hemisphere mapped to northern!');
    }
  });
  
  console.groupEnd();
  
  // Test height offset feature
  console.group('\n📏 Height Offset Tests');
  const base = latLonToVector3(0, 0, 5.0);
  const elevated1 = latLonToVector3(0, 0, 5.0, 0.5);
  const elevated2 = latLonToVector3(0, 0, 5.0, 1.0);
  
  console.log(`Base radius (r=5): length=${base.length().toFixed(3)}`);
  console.log(`+0.5 offset: length=${elevated1.length().toFixed(3)} ${Math.abs(elevated1.length() - 5.5) < 0.0001 ? '✅' : '❌'}`);
  console.log(`+1.0 offset: length=${elevated2.length().toFixed(3)} ${Math.abs(elevated2.length() - 6.0) < 0.0001 ? '✅' : '❌'}`);
  console.groupEnd();
  
  console.groupEnd();
  
  if (results.passed) {
    console.log('\n🎉 Coordinate system is accurate and ready for scientific visualization!\n');
  } else {
    console.error('\n⚠️  Coordinate system has errors - review implementation!\n');
  }
}

// Auto-run in development mode (optional)
if (import.meta.env.DEV) {
  // Uncomment to auto-run validation on hot reload:
  // runValidationTests();
}
