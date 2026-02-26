// Main application: UI and data orchestration

import { useState, useMemo, useCallback } from 'react';
import './App.css';
import { MapLibreDeckScene } from './components/MapLibreDeckScene';
import type { HeatmapDataPoint } from './types/heatmap';
import { useDatasets } from './hooks/useDatasets';
import { DatasetSelector } from './components/DatasetSelector';
import type { DatasetKey } from './data/datasetRegistry';
import { getColorFromScaleRGB } from './utils/colorScales';

// Sort options
type SortOption = 'default' | 'value-asc' | 'value-desc';

function App() {
  const [selectedPoint, setSelectedPoint] = useState<HeatmapDataPoint | null>(null);
  const [coordSearchFilter, setCoordSearchFilter] = useState('');
  const [maxCoordsDisplay, setMaxCoordsDisplay] = useState(50);
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [showTopOnly, setShowTopOnly] = useState(false);
  const [topCount, setTopCount] = useState(100);
  
  // Dataset loading state
  const { isLoading: datasetsLoading, isLoaded: datasetsLoaded, error: datasetsError, getDataset } = useDatasets();
  
  // Active dataset (null = none)
  const [activeDataset, setActiveDataset] = useState<DatasetKey | null>(null);
  
  // Heatmap opacity
  const [heatmapOpacity, setHeatmapOpacity] = useState(0.8);
  
  // Current dataset metadata
  const currentDataset = useMemo(() => {
    if (!activeDataset || !datasetsLoaded) return null;
    return getDataset(activeDataset);
  }, [activeDataset, datasetsLoaded, getDataset]);
  
  // All heatmap data from current dataset
  const allHeatmapData = useMemo((): HeatmapDataPoint[] => {
    if (!datasetsLoaded || !activeDataset) return [];
    
    const dataset = getDataset(activeDataset);
    if (!dataset) return [];
    
    // Map to HeatmapDataPoint
    return dataset.data.map((point, index) => ({
      lat: point.lat,
      lon: point.lon,
      value: point.value,
      id: `${activeDataset}-${index}`,
    }));
  }, [datasetsLoaded, activeDataset, getDataset]);
  
  // Optional: filter top N values (chlorophyll only)
  const heatmapData = useMemo((): HeatmapDataPoint[] => {
    if (!showTopOnly || activeDataset !== 'chlorophyll') return allHeatmapData;
    
    // Sort by value descending and take top N highest values
    return [...allHeatmapData]
      .sort((a, b) => b.value - a.value)
      .slice(0, topCount);
  }, [allHeatmapData, showTopOnly, topCount, activeDataset]);
  
  // Get point color
  const getPointColor = useCallback((value: number): string => {
    if (!currentDataset) return '#8ab4f8';
    
    const { min, max, metadata } = currentDataset;
    const range = max - min;
    const normalized = range > 0 ? (value - min) / range : 0.5;
    const clamped = Math.max(0, Math.min(1, normalized));
    
    const rgb = getColorFromScaleRGB(clamped, metadata.colorScale);
    return `rgb(${Math.round(rgb.r * 255)}, ${Math.round(rgb.g * 255)}, ${Math.round(rgb.b * 255)})`;
  }, [currentDataset]);

  const handleCoordinateClick = (point: HeatmapDataPoint) => {
    setSelectedPoint(point);
  };

  // Filter, sort and limit displayed coordinates
  const displayCoords = useMemo(() => {
    if (!datasetsLoaded || !activeDataset) return [];
    
    let filtered = [...heatmapData];
    
    // Apply search filter
    if (coordSearchFilter.trim()) {
      const filter = coordSearchFilter.toLowerCase();
      filtered = filtered.filter(point => 
        point.lat.toFixed(4).includes(filter) ||
        point.lon.toFixed(4).includes(filter) ||
        point.value.toFixed(4).includes(filter)
      );
    }
    
    // Apply sorting
    if (sortOption === 'value-asc') {
      filtered.sort((a, b) => a.value - b.value);
    } else if (sortOption === 'value-desc') {
      filtered.sort((a, b) => b.value - a.value);
    }
    
    return filtered.slice(0, maxCoordsDisplay);
  }, [heatmapData, coordSearchFilter, maxCoordsDisplay, datasetsLoaded, activeDataset, sortOption]);

  return (
    <div className="app-container">
      
      <div className="scene-container">
        <MapLibreDeckScene
          heatmapData={heatmapData}
          activeDataset={activeDataset || 'chlorophyll'}
          showHeatmap={datasetsLoaded && activeDataset !== null}
          selectedPoint={selectedPoint}
          opacity={heatmapOpacity}
        />
      </div>

      
      <div className="controls-panel">
        <h1>Ocean Map Viewer</h1>

        <div className="control-section">
          <h3>Dataset</h3>
          
          
          {datasetsLoading && (
            <div style={{ 
              padding: '1rem', 
              background: 'rgba(138, 180, 248, 0.1)', 
              borderRadius: '4px',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              <div style={{ marginBottom: '0.5rem' }}>Loading datasets...</div>
              <div style={{ fontSize: '0.85em', color: 'rgba(255,255,255,0.6)' }}>
                Please wait...
              </div>
            </div>
          )}
          
          
          {datasetsError && (
            <div style={{ 
              padding: '1rem', 
              background: 'rgba(255, 100, 100, 0.2)', 
              borderRadius: '4px',
              marginBottom: '1rem',
              color: '#ff6666'
            }}>
              <div style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>Error Loading Datasets</div>
              <div style={{ fontSize: '0.85em' }}>{datasetsError}</div>
            </div>
          )}
          
          
          {datasetsLoaded && (
            <>
              <div style={{ marginTop: '0.5rem' }}>
                <DatasetSelector
                  activeDataset={activeDataset}
                  onDatasetChange={setActiveDataset}
                  disabled={false}
                />
              </div>

              <div style={{ marginTop: '0.75rem' }}>
                <label style={{ fontSize: '0.85em', color: 'rgba(138, 180, 248, 0.8)', marginBottom: '0.3rem', display: 'block' }}>
                  Opacity: {heatmapOpacity.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={heatmapOpacity}
                  onChange={(e) => setHeatmapOpacity(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ fontSize: '0.8em', color: 'rgba(255,255,255,0.6)', marginTop: '0.75rem' }}>
                {heatmapData.length.toLocaleString()} data points
                {activeDataset === 'chlorophyll' && showTopOnly && ` (top ${topCount} of ${allHeatmapData.length})`}
              </div>
              
              
              {activeDataset === 'chlorophyll' && (
                <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '4px' }}>
                  <label className="control-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={showTopOnly}
                      onChange={(e) => setShowTopOnly(e.target.checked)}
                    />
                    <span style={{ fontSize: '0.85em' }}>Show Top Values Only</span>
                  </label>
                  
                  {showTopOnly && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <label style={{ fontSize: '0.8em', color: 'rgba(138, 180, 248, 0.8)', display: 'block', marginBottom: '0.25rem' }}>
                        Count: {topCount}
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="500"
                        step="10"
                        value={topCount}
                        onChange={(e) => setTopCount(parseInt(e.target.value))}
                        style={{ width: '100%' }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7em', color: 'rgba(255,255,255,0.5)' }}>
                        <span>10</span>
                        <span>500</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        
        {selectedPoint && (
          <div className="control-section">
            <h3>Selected Point</h3>
            <div className="coords-display clicked">
              <span className="coords-value">
                {selectedPoint.lat.toFixed(4)}°, {selectedPoint.lon.toFixed(4)}°
              </span>
              <div style={{ fontSize: '0.85em', marginTop: '0.25rem', color: 'rgba(138, 180, 248, 0.8)' }}>
                Value: {selectedPoint.value.toFixed(4)}
              </div>
            </div>
          </div>
        )}
          
        
        {datasetsLoaded && activeDataset && (
          <div className="control-section">
            <h3>Data Points</h3>
            <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '0.85em', color: 'rgba(138, 180, 248, 0.8)' }}>
                Total: {heatmapData.length}
              </label>
              <button 
                onClick={() => setSelectedPoint(null)}
                style={{
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75em',
                  background: 'rgba(138, 180, 248, 0.2)',
                  border: '1px solid rgba(138, 180, 248, 0.3)',
                  borderRadius: '3px',
                  color: '#8ab4f8',
                  cursor: 'pointer'
                }}
              >
                Clear
              </button>
            </div>
            
            
            <div style={{ marginBottom: '0.5rem' }}>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                style={{
                  width: '100%',
                  padding: '0.4rem',
                  background: 'rgba(10, 25, 41, 0.8)',
                  border: '1px solid rgba(138, 180, 248, 0.3)',
                  borderRadius: '4px',
                  color: '#8ab4f8',
                  fontSize: '0.85em'
                }}
              >
                <option value="default">Sort: Default</option>
                <option value="value-asc">Sort: Value (Low → High)</option>
                <option value="value-desc">Sort: Value (High → Low)</option>
              </select>
            </div>
            
            <input
              type="text"
              placeholder="Search coordinates..."
              value={coordSearchFilter}
              onChange={(e) => setCoordSearchFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.4rem',
                marginBottom: '0.5rem',
                background: 'rgba(10, 25, 41, 0.8)',
                border: '1px solid rgba(138, 180, 248, 0.3)',
                borderRadius: '4px',
                color: '#8ab4f8',
                fontSize: '0.85em'
              }}
            />
            
            <div style={{
              maxHeight: '300px',
              overflowY: 'auto',
              border: '1px solid rgba(138, 180, 248, 0.3)',
              borderRadius: '4px',
              background: 'rgba(10, 25, 41, 0.6)'
            }}>
              {displayCoords.map((point, idx) => {
                const pointColor = getPointColor(point.value);
                return (
                  <div
                    key={point.id || idx}
                    onClick={() => handleCoordinateClick(point)}
                    style={{
                      padding: '0.5rem',
                      borderBottom: idx < displayCoords.length - 1 ? '1px solid rgba(138, 180, 248, 0.1)' : 'none',
                      cursor: 'pointer',
                      background: selectedPoint?.id === point.id ? 'rgba(138, 180, 248, 0.2)' : 'transparent',
                      transition: 'background 0.2s',
                      fontSize: '0.8em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(138, 180, 248, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = selectedPoint?.id === point.id ? 'rgba(138, 180, 248, 0.2)' : 'transparent';
                    }}
                  >
                    
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: pointColor,
                      flexShrink: 0,
                      border: '1px solid rgba(255,255,255,0.3)'
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '500', color: '#8ab4f8' }}>
                        {point.lat.toFixed(4)}°, {point.lon.toFixed(4)}°
                      </div>
                      <div style={{ color: pointColor, fontSize: '0.9em', marginTop: '0.1rem', fontWeight: '500' }}>
                        Value: {point.value.toFixed(4)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {displayCoords.length < heatmapData.length && (
              <div style={{
                marginTop: '0.5rem',
                textAlign: 'center',
                fontSize: '0.75em',
                color: 'rgba(255,255,255,0.6)'
              }}>
                Showing {displayCoords.length} of {heatmapData.length} points
                <button
                  onClick={() => setMaxCoordsDisplay(prev => prev + 50)}
                  style={{
                    marginLeft: '0.5rem',
                    padding: '0.2rem 0.5rem',
                    background: 'rgba(138, 180, 248, 0.2)',
                    border: '1px solid rgba(138, 180, 248, 0.3)',
                    borderRadius: '3px',
                    color: '#8ab4f8',
                    fontSize: '0.9em',
                    cursor: 'pointer'
                  }}
                >
                  Load More
                </button>
              </div>
            )}
          </div>
        )}

        
        <div className="control-section instructions">
          <h3>Controls</h3>
          <ul>
            <li>Drag to pan</li>
            <li>Scroll to zoom</li>
            <li>Click points to select</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
