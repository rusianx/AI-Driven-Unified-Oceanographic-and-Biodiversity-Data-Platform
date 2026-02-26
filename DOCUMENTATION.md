# DataDrift - 3D Ocean Globe Viewer

An advanced, highly interactive 3D global ocean map built with React, Three.js, and react-three-fiber.

## ✨ Features

### Core Rendering
- **True Spherical Earth**: WGS84 lat/lon mapping with accurate geographic projection
- **High Performance**: WebGL-powered rendering targeting 60 FPS on mid-range GPUs
- **Configurable**: Adjustable globe radius and visual settings
- **Ocean-First Design**: Deep dark-blue ocean material with physically-based rendering
- **Optional Landmasses**: Muted, semi-transparent, or toggleable land visualization
- **Atmospheric Glow**: Beautiful depth effect with optional atmosphere shader

### Interactions
- **Orbit Controls**: Smooth camera rotation with inertia-based damping
- **Mouse/Touch Support**: Drag to rotate, scroll/pinch to zoom
- **Raycasting**: Precise hover detection for ocean coordinates
- **Focus Animation**: Double-click any ocean point to smoothly focus camera
- **Reset Camera**: Return to default view with one click
- **Real-time Coordinates**: Display hover and selected lat/lon coordinates

### Technical Architecture
- **Modular Components**:
  - `Globe.tsx` - Main sphere renderer with materials and geometry
  - `CameraController.tsx` - Orbit controls and focus animations
  - `LightingSetup.tsx` - Physically-based lighting configuration
  - `OceanScene.tsx` - Scene coordinator
- **Utility Functions**:
  - `coordinates.ts` - WGS84 coordinate transformations (lat/lon ↔ 3D)
  - `globeConfig.ts` - Configuration interfaces and defaults
- **Type-Safe**: Full TypeScript implementation
- **Clean Code**: Well-commented and maintainable

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development
The app will run at `http://localhost:5173/`

## 🎮 Controls

| Action | Control |
|--------|---------|
| Rotate Globe | Left-click drag |
| Zoom In/Out | Mouse wheel / Pinch |
| Focus Location | Double-click ocean point |
| Toggle Landmasses | Checkbox in UI panel |
| Toggle Atmosphere | Checkbox in UI panel |
| Reset Camera | "Reset Camera" button |

## ⚙️ Configuration

Edit `src/utils/globeConfig.ts` to customize:

```typescript
export const DEFAULT_GLOBE_CONFIG: GlobeConfig = {
  radius: 5,                    // Globe size
  segments: 128,                // Geometry detail
  oceanColor: '#0a1929',        // Ocean material color
  landColor: '#2d3436',         // Land color
  landOpacity: 0.3,             // Land transparency
  showLand: true,               // Show/hide landmasses
  atmosphereGlow: true,         // Atmospheric effect
  specularIntensity: 0.4,       // Ocean highlights
};

export const DEFAULT_CAMERA_CONFIG: CameraConfig = {
  minDistance: 7,               // Minimum zoom
  maxDistance: 25,              // Maximum zoom
  defaultDistance: 12,          // Starting position
  dampingFactor: 0.05,          // Rotation smoothness
  rotationSpeed: 0.5,           // Mouse sensitivity
  zoomSpeed: 0.5,               // Scroll sensitivity
  enableInertia: true,          // Momentum after drag
};
```

## 📁 Project Structure

```
src/
├── components/
│   ├── Globe.tsx              # Main sphere renderer
│   ├── CameraController.tsx   # Camera & controls
│   ├── LightingSetup.tsx      # Scene lighting
│   └── OceanScene.tsx         # Scene coordinator
├── utils/
│   ├── coordinates.ts         # Lat/lon transformations
│   └── globeConfig.ts         # Configuration
├── App.tsx                    # Main app with UI
└── main.tsx                   # Entry point
```

## 🔧 Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Three.js** - 3D graphics library
- **react-three-fiber** - React renderer for Three.js
- **@react-three/drei** - Helpful Three.js abstractions
- **Vite** - Build tool and dev server

## 🎨 Visual Design

- **Ocean-Focused**: Dark blue/near-black ocean dominates the view
- **Physically-Based**: Specular highlights simulate realistic water reflection
- **Depth Effect**: Atmospheric glow provides visual depth
- **Muted Land**: Semi-transparent landmasses don't overpower ocean data
- **Dark Theme**: Space-like background complements the globe

## 🚀 Performance Optimizations

- Optimized sphere geometry (configurable segment count)
- Efficient material reuse via useMemo
- Raycasting on single ocean mesh
- GPU-accelerated shaders for atmosphere
- Conditional rendering of optional elements
- Smooth animations with requestAnimationFrame

## 🎯 Implementation Highlights

### Coordinate System
The application uses WGS84 coordinate system with precise lat/lon to 3D Cartesian conversions:

```typescript
// Utilities in src/utils/coordinates.ts
latLonToVector3(lat, lon, radius)  // Convert coordinates to 3D
vector3ToLatLon(vector, radius)    // Convert 3D back to coordinates
haversineDistance(...)             // Calculate great circle distance
```

### Camera System
Sophisticated camera controller with:
- Smooth interpolated animations using easeInOutCubic
- Focus-on-click with automatic camera repositioning
- Damped orbit controls for natural feel
- Configurable zoom and rotation limits

### Rendering Pipeline
1. **Globe Base**: Spherical geometry with ocean material
2. **Landmasses**: Optional procedural geometry (placeholder for real data)
3. **Atmosphere**: Custom shader with additive blending
4. **Lighting**: Multi-light setup (ambient, directional, hemisphere)
5. **Interaction**: Raycasting for precise hover/click detection

## 📝 API Reference

### OceanScene Props
```typescript
interface OceanSceneProps {
  globeConfig?: Partial<GlobeConfig>;
  cameraConfig?: Partial<CameraConfig>;
  onLocationClick?: (lat: number, lon: number) => void;
  onLocationHover?: (lat: number, lon: number) => void;
}
```

### Globe Props
```typescript
interface GlobeProps {
  config: GlobeConfig;
  onHover?: (point: THREE.Vector3 | null, lat: number, lon: number) => void;
  onClick?: (point: THREE.Vector3, lat: number, lon: number) => void;
  rotation?: THREE.Euler;
}
```

### CameraController Props
```typescript
interface CameraControllerProps {
  config: CameraConfig;
  onCameraChange?: (position: THREE.Vector3) => void;
  focusTarget?: THREE.Vector3 | null;
  onFocusComplete?: () => void;
}
```

## 🔮 Future Enhancements

- [ ] Real coastline data integration
- [ ] Ocean current visualization
- [ ] Temperature/salinity data layers
- [ ] 3D underwater terrain
- [ ] Multiple globe textures/themes
- [ ] VR/AR support
- [ ] Data point markers and overlays
- [ ] Animation timeline controls
- [ ] Custom viewport projections

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Feel free to open issues or submit PRs.
