// MapLibre + Deck.gl scene for oceanographic visualization

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Map, { NavigationControl } from 'react-map-gl/maplibre';
import type { StyleSpecification } from 'maplibre-gl';
import { DeckGL } from '@deck.gl/react';
import { ScatterplotLayer, PolygonLayer } from '@deck.gl/layers';
import type { PickingInfo, Layer } from '@deck.gl/core';
import type { MapViewState } from '@deck.gl/core';

import { datasetRegistry } from '../data/datasetRegistry';
import { getColorFromScale } from '../utils/colorScales';
import type { DatasetKey } from '../data/datasetRegistry';
import type { HeatmapDataPoint } from '../types/heatmap';
import { DatasetLegend } from './DatasetLegend';

import 'maplibre-gl/dist/maplibre-gl.css';
import './MapLibreDeckScene.css';

// Types

interface MapLibreDeckSceneProps {
  heatmapData?: HeatmapDataPoint[];
  activeDataset?: DatasetKey;
  showHeatmap?: boolean;
  selectedPoint?: HeatmapDataPoint | null;
  opacity?: number;
  onLocationClick?: (lat: number, lon: number) => void;
}

interface TooltipInfo {
  x: number;
  y: number;
  lat: number;
  lon: number;
  value: number;
  units: string;
}

// Configuration

// Default view state
const  INITIAL_VIEW_STATE: MapViewState = {
  longitude: -20,  // Atlantic Ocean - good center for global ocean data
  latitude: 20,    // Slightly north to see more data
  zoom: 2,         // Global view showing continents
  pitch: 0,
  bearing: 0,
};

// MapLibre style (replace tile source as needed)
const MAPLIBRE_STYLE: StyleSpecification = {
  version: 8 as const,
  sources: {
    'osm-tiles': {
      type: 'raster' as const,
      tiles: [
        // Tile options (local or OSM)
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'osm-tiles-layer',
      type: 'raster' as const,
      source: 'osm-tiles',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

// Component

export const MapLibreDeckScene: React.FC<MapLibreDeckSceneProps> = ({
  heatmapData = [],
  activeDataset = 'chlorophyll',
  showHeatmap = false,
  selectedPoint = null,
  opacity = 0.8,
  onLocationClick,
}) => {
  // State
  const [viewState, setViewState] = useState<MapViewState>(INITIAL_VIEW_STATE);
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);
  const [cursor, setCursor] = useState<string>('grab');
  const [mounted, setMounted] = useState(false);

  // Mount safety (deferred)
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 200);
    return () => clearTimeout(timer);
  }, []);

  // Dataset metadata (recomputed when data changes)
  const dataset = useMemo(() => {
    return datasetRegistry.getDataset(activeDataset);
  }, [activeDataset]);

  // ====== FLY TO SELECTED POINT ======
  useEffect(() => {
    if (selectedPoint) {
      const timer = setTimeout(() => {
        setViewState((prev: MapViewState) => ({
          ...prev,
          longitude: selectedPoint.lon,
          latitude: selectedPoint.lat,
          zoom: Math.max(prev.zoom, 4),
          transitionDuration: 1000,
          transitionInterpolator: undefined,
        }));
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [selectedPoint]);

  // ====== DATA LAYER: SCATTERPLOT ======
  const scatterplotLayer = useMemo(() => {
    if (!showHeatmap || !dataset || !dataset.isLoaded || heatmapData.length === 0) {
      console.log('[MapLibreDeckScene] No layer:', { showHeatmap, dataset: !!dataset, isLoaded: dataset?.isLoaded, dataCount: heatmapData.length });
      return null;
    }

    const { min, max, metadata } = dataset;
    const colorScale = metadata.colorScale;
    
    // Debug: Log first few data points to verify coordinates
    console.log('[MapLibreDeckScene] Creating ScatterplotLayer with', heatmapData.length, 'points');
    const samples = heatmapData.slice(0, 5).map(d => ({ lat: d.lat, lon: d.lon, value: d.value }));
    console.log('[MapLibreDeckScene] Sample coordinates:', JSON.stringify(samples, null, 2));
    console.log('[MapLibreDeckScene] Value range:', { min, max, colorScale });

    return new ScatterplotLayer({
      id: 'oceanographic-scatterplot',
      data: heatmapData,
      pickable: true,
      opacity: opacity,
      stroked: true,
      filled: true,
      radiusScale: 1,
      radiusMinPixels: 4,  // Minimum 4 pixels - always visible
      radiusMaxPixels: 30, // Maximum 30 pixels when zoomed in
      lineWidthMinPixels: 1,
      getPosition: (d: HeatmapDataPoint) => [d.lon, d.lat, 0],
      getRadius: 1,
      getFillColor: (d: HeatmapDataPoint) => {
        // Normalize value to 0-1 range
        const range = max - min;
        const normalized = range > 0 ? (d.value - min) / range : 0.5; // Default to mid-scale if no range
        
        // Clamp to ensure valid range
        const clamped = Math.max(0, Math.min(1, normalized));
        
        // Get color from scale
        const color = getColorFromScale(clamped, colorScale);
        
        // Convert to 0-255 RGB values
        const r = Math.round(color.r * 255);
        const g = Math.round(color.g * 255);
        const b = Math.round(color.b * 255);
        
        // Debug logging removed from render to keep hooks and render pure
        
        return [r, g, b, 230];
      },
      getLineColor: [255, 255, 255, 100], // White outline for better visibility
      updateTriggers: {
        getFillColor: [activeDataset, min, max],
      },
    });
  }, [showHeatmap, heatmapData, activeDataset, dataset, opacity]);

  // ====== HIGHLIGHT LAYER: SELECTED POINT ======
  const highlightLayer = useMemo(() => {
    if (!selectedPoint) return null;

    // Create a circle polygon around the selected point
    const segments = 32;
    const radius = 2.0; // degrees
    const circle: [number, number][] = [];
    
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      circle.push([
        selectedPoint.lon + Math.cos(angle) * radius,
        selectedPoint.lat + Math.sin(angle) * radius,
      ]);
    }

    return new PolygonLayer({
      id: 'highlight-polygon',
      data: [{ polygon: circle }],
      pickable: false,
      stroked: true,
      filled: true,
      lineWidthMinPixels: 3,
      getPolygon: (d: { polygon: [number, number][] }) => d.polygon,
      getFillColor: [255, 255, 0, 100], // Yellow fill
      getLineColor: [255, 0, 0, 255],   // Red border
      getLineWidth: 4,
    });
  }, [selectedPoint]);

  // ====== LAYERS ARRAY ======
  const layers: Layer[] = useMemo(() => {
    const result: Layer[] = [];
    if (scatterplotLayer) result.push(scatterplotLayer);
    if (highlightLayer) result.push(highlightLayer);
    return result;
  }, [scatterplotLayer, highlightLayer]);

  // ====== PICKING / HOVER ======
  const onHover = useCallback((info: PickingInfo) => {
    if (info.object && dataset) {
      const point = info.object as HeatmapDataPoint;
      setTooltip({
        x: info.x,
        y: info.y,
        lat: point.lat,
        lon: point.lon,
        value: point.value,
        units: dataset.metadata.units,
      });
      setCursor('pointer');
    } else {
      setTooltip(null);
      setCursor('grab');
    }
  }, [dataset]);

  // ====== CLICK HANDLER ======
  const onClick = useCallback((info: PickingInfo) => {
    if (info.object) {
      const point = info.object as HeatmapDataPoint;
      if (onLocationClick) {
        onLocationClick(point.lat, point.lon);
      }
    }
  }, [onLocationClick]);

  // ====== RENDER ======
  // Prevent rendering until component is fully mounted to avoid WebGL race conditions
  if (!mounted) {
    return (
      <div className="maplibre-deck-container">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          background: '#1a1a1a',
          color: '#fff',
          fontSize: '1.2rem'
        }}>
          Initializing map...
        </div>
      </div>
    );
  }

  return (
    <div className="maplibre-deck-container">
      <DeckGL
        viewState={viewState}
        onViewStateChange={(params) => setViewState(params.viewState as MapViewState)}
        controller={true}
        layers={layers}
        onHover={onHover}
        onClick={onClick}
        getCursor={() => cursor}
        onError={(error) => {
          // Handle Deck.gl errors gracefully
          console.error('[MapLibreDeckScene] Deck.gl error:', error);
        }}
      >
          <Map
            reuseMaps
            mapStyle={MAPLIBRE_STYLE}
            attributionControl={false}
          >
          <NavigationControl position="top-right" />
        </Map>
      </DeckGL>


      {tooltip && (
        <div
          className="deck-tooltip"
          style={{
            position: 'absolute',
            left: tooltip.x + 10,
            top: tooltip.y + 10,
            pointerEvents: 'none',
          }}
        >
          <div><strong>Lat:</strong> {tooltip.lat.toFixed(4)}°</div>
          <div><strong>Lon:</strong> {tooltip.lon.toFixed(4)}°</div>
          <div><strong>Value:</strong> {tooltip.value.toFixed(3)} {tooltip.units}</div>
        </div>
      )}


      {showHeatmap && dataset && (
        <DatasetLegend
          datasetKey={activeDataset}
          position="bottom-left"
        />
      )}


      <div className="maplibre-deck-info">
        <div className="info-badge">
          Ocean Reef By DataDrift
        </div>
        <div className="info-text">
          MapLibre GL + Deck.gl • Offline-capable • GPU-accelerated
        </div>
        {selectedPoint && (
          <div className="info-text" style={{ 
            marginTop: '0.5rem', 
            padding: '0.5rem',
            background: 'rgba(255, 255, 0, 0.2)',
            borderRadius: '4px',
            border: '1px solid rgba(255, 255, 0, 0.5)'
          }}>
            Highlighting: {selectedPoint.lat.toFixed(4)}°, {selectedPoint.lon.toFixed(4)}°
          </div>
        )}
      </div>
    </div>
  );
}