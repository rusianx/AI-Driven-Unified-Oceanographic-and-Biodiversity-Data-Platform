// Place data registry: hierarchical place names organized by zoom level

export type PlaceType = 'continent' | 'country' | 'region' | 'city' | 'town' | 'street';

export interface Place {
  name: string;
  lat: number;
  lon: number;
  type: PlaceType;
  minZoom: number; // Minimum camera distance to show this label
  maxZoom: number; // Maximum camera distance to show this label
  fontSize?: number; // Optional custom font size
  importance?: number; // 1-10, used for label priority
}

// Zoom level thresholds for label visibility based on camera distance
export const ZOOM_THRESHOLDS = {
  continents: { min: 8, max: 100 },
  countries: { min: 5, max: 15 },
  regions: { min: 3, max: 8 },
  cities: { min: 2, max: 6 },
  towns: { min: 1.5, max: 4 },
  streets: { min: 1, max: 2.5 },
};

// Complete place database organized by type for filtering
export const PLACES: Place[] = [
  // CONTINENTS (Always visible at far zoom)
  { name: 'North America', lat: 54.5, lon: -105.0, type: 'continent', minZoom: 8, maxZoom: 100, fontSize: 32, importance: 10 },
  { name: 'South America', lat: -8.8, lon: -55.5, type: 'continent', minZoom: 8, maxZoom: 100, fontSize: 32, importance: 10 },
  { name: 'Europe', lat: 54.0, lon: 15.0, type: 'continent', minZoom: 8, maxZoom: 100, fontSize: 32, importance: 10 },
  { name: 'Africa', lat: -8.7, lon: 34.5, type: 'continent', minZoom: 8, maxZoom: 100, fontSize: 32, importance: 10 },
  { name: 'Asia', lat: 34.0, lon: 100.0, type: 'continent', minZoom: 8, maxZoom: 100, fontSize: 32, importance: 10 },
  { name: 'Australia', lat: -25.0, lon: 133.0, type: 'continent', minZoom: 8, maxZoom: 100, fontSize: 32, importance: 10 },
  { name: 'Antarctica', lat: -75.0, lon: 0.0, type: 'continent', minZoom: 8, maxZoom: 100, fontSize: 32, importance: 10 },

  // MAJOR COUNTRIES (North America)
  { name: 'United States', lat: 37.1, lon: -95.7, type: 'country', minZoom: 5, maxZoom: 15, fontSize: 24, importance: 9 },
  { name: 'Canada', lat: 56.1, lon: -106.3, type: 'country', minZoom: 5, maxZoom: 15, fontSize: 24, importance: 9 },
  { name: 'Mexico', lat: 23.6, lon: -102.5, type: 'country', minZoom: 5, maxZoom: 15, fontSize: 24, importance: 9 },

  // MAJOR COUNTRIES (Europe)
  { name: 'United Kingdom', lat: 55.4, lon: -3.4, type: 'country', minZoom: 5, maxZoom: 15, fontSize: 24, importance: 9 },
  { name: 'France', lat: 46.2, lon: 2.2, type: 'country', minZoom: 5, maxZoom: 15, fontSize: 24, importance: 9 },
  { name: 'Germany', lat: 51.2, lon: 10.4, type: 'country', minZoom: 5, maxZoom: 15, fontSize: 24, importance: 9 },
  { name: 'Spain', lat: 40.5, lon: -3.7, type: 'country', minZoom: 5, maxZoom: 15, fontSize: 24, importance: 9 },
  { name: 'Italy', lat: 41.9, lon: 12.6, type: 'country', minZoom: 5, maxZoom: 15, fontSize: 24, importance: 9 },
  { name: 'Russia', lat: 61.5, lon: 105.3, type: 'country', minZoom: 5, maxZoom: 15, fontSize: 24, importance: 9 },

  // MAJOR COUNTRIES (Asia)
  { name: 'China', lat: 35.9, lon: 104.2, type: 'country', minZoom: 5, maxZoom: 15, fontSize: 24, importance: 9 },
  { name: 'India', lat: 20.6, lon: 78.9, type: 'country', minZoom: 5, maxZoom: 15, fontSize: 24, importance: 9 },
  { name: 'Japan', lat: 36.2, lon: 138.3, type: 'country', minZoom: 5, maxZoom: 15, fontSize: 24, importance: 9 },
  { name: 'South Korea', lat: 35.9, lon: 127.8, type: 'country', minZoom: 5, maxZoom: 15, fontSize: 24, importance: 8 },
  { name: 'Indonesia', lat: -0.8, lon: 113.9, type: 'country', minZoom: 5, maxZoom: 15, fontSize: 24, importance: 8 },

  // MAJOR COUNTRIES (South America)
  { name: 'Brazil', lat: -14.2, lon: -51.9, type: 'country', minZoom: 5, maxZoom: 15, fontSize: 24, importance: 9 },
  { name: 'Argentina', lat: -38.4, lon: -63.6, type: 'country', minZoom: 5, maxZoom: 15, fontSize: 24, importance: 8 },

  // MAJOR COUNTRIES (Africa)
  { name: 'Egypt', lat: 26.8, lon: 30.8, type: 'country', minZoom: 5, maxZoom: 15, fontSize: 24, importance: 8 },
  { name: 'South Africa', lat: -30.6, lon: 22.9, type: 'country', minZoom: 5, maxZoom: 15, fontSize: 24, importance: 8 },
  { name: 'Nigeria', lat: 9.1, lon: 8.7, type: 'country', minZoom: 5, maxZoom: 15, fontSize: 24, importance: 8 },

  // MAJOR COUNTRIES (Oceania)
  { name: 'Australia', lat: -25.3, lon: 133.8, type: 'country', minZoom: 5, maxZoom: 15, fontSize: 24, importance: 9 },
  { name: 'New Zealand', lat: -40.9, lon: 174.9, type: 'country', minZoom: 5, maxZoom: 15, fontSize: 24, importance: 8 },

  // US STATES/REGIONS
  { name: 'California', lat: 36.8, lon: -119.4, type: 'region', minZoom: 3, maxZoom: 8, fontSize: 20, importance: 8 },
  { name: 'Texas', lat: 31.0, lon: -97.6, type: 'region', minZoom: 3, maxZoom: 8, fontSize: 20, importance: 8 },
  { name: 'New York', lat: 42.2, lon: -74.9, type: 'region', minZoom: 3, maxZoom: 8, fontSize: 20, importance: 8 },
  { name: 'Florida', lat: 27.8, lon: -81.7, type: 'region', minZoom: 3, maxZoom: 8, fontSize: 20, importance: 8 },
  { name: 'Alaska', lat: 61.4, lon: -152.4, type: 'region', minZoom: 3, maxZoom: 8, fontSize: 20, importance: 7 },

  // MAJOR CITIES (North America)
  { name: 'New York City', lat: 40.7, lon: -74.0, type: 'city', minZoom: 2, maxZoom: 6, fontSize: 18, importance: 10 },
  { name: 'Los Angeles', lat: 34.1, lon: -118.2, type: 'city', minZoom: 2, maxZoom: 6, fontSize: 18, importance: 9 },
  { name: 'Chicago', lat: 41.9, lon: -87.6, type: 'city', minZoom: 2, maxZoom: 6, fontSize: 18, importance: 9 },
  { name: 'Washington DC', lat: 38.9, lon: -77.0, type: 'city', minZoom: 2, maxZoom: 6, fontSize: 18, importance: 9 },
  { name: 'San Francisco', lat: 37.8, lon: -122.4, type: 'city', minZoom: 2, maxZoom: 6, fontSize: 18, importance: 9 },
  { name: 'Boston', lat: 42.4, lon: -71.1, type: 'city', minZoom: 2, maxZoom: 6, fontSize: 18, importance: 8 },
  { name: 'Seattle', lat: 47.6, lon: -122.3, type: 'city', minZoom: 2, maxZoom: 6, fontSize: 18, importance: 8 },
  { name: 'Miami', lat: 25.8, lon: -80.2, type: 'city', minZoom: 2, maxZoom: 6, fontSize: 18, importance: 8 },
  { name: 'Toronto', lat: 43.7, lon: -79.4, type: 'city', minZoom: 2, maxZoom: 6, fontSize: 18, importance: 9 },
  { name: 'Vancouver', lat: 49.3, lon: -123.1, type: 'city', minZoom: 2, maxZoom: 6, fontSize: 18, importance: 8 },
  { name: 'Mexico City', lat: 19.4, lon: -99.1, type: 'city', minZoom: 2, maxZoom: 6, fontSize: 18, importance: 9 },

  // MAJOR CITIES (Europe)
  { name: 'London', lat: 51.5, lon: -0.1, type: 'city', minZoom: 2, maxZoom: 6, fontSize: 18, importance: 10 },
  { name: 'Paris', lat: 48.9, lon: 2.4, type: 'city', minZoom: 2, maxZoom: 6, fontSize: 18, importance: 10 },
  { name: 'Berlin', lat: 52.5, lon: 13.4, type: 'city', minZoom: 2, maxZoom: 6, fontSize: 18, importance: 9 },
  { name: 'Rome', lat: 41.9, lon: 12.5, type: 'city', minZoom: 2, maxZoom: 6, fontSize: 18, importance: 9 },
  { name: 'Madrid', lat: 40.4, lon: -3.7, type: 'city', minZoom: 2, maxZoom: 6, fontSize: 18, importance: 9 },
  { name: 'Moscow', lat: 55.8, lon: 37.6, type: 'city', minZoom: 2, maxZoom: 6, fontSize: 18, importance: 9 },
  { name: 'Amsterdam', lat: 52.4, lon: 4.9, type: 'city', minZoom: 2, maxZoom: 6, fontSize: 18, importance: 8 },

  // MAJOR CITIES (Asia)
  { name: 'Tokyo', lat: 35.7, lon: 139.8, type: 'city', minZoom: 2, maxZoom: 6, fontSize: 18, importance: 10 },
  { name: 'Beijing', lat: 39.9, lon: 116.4, type: 'city', minZoom: 2, maxZoom: 6, fontSize: 18, importance: 10 },
  { name: 'Shanghai', lat: 31.2, lon: 121.5, type: 'city', minZoom: 2, maxZoom: 6, fontSize: 18, importance: 9 },
  { name: 'Hong Kong', lat: 22.3, lon: 114.2, type: 'city', minZoom: 2, maxZoom: 6, fontSize: 18, importance: 9 },
  { name: 'Singapore', lat: 1.4, lon: 103.8, type: 'city', minZoom: 2, maxZoom: 6, fontSize: 18, importance: 9 },
  { name: 'Seoul', lat: 37.6, lon: 127.0, type: 'city', minZoom: 2, maxZoom: 6, fontSize: 18, importance: 9 },
  { name: 'Mumbai', lat: 19.1, lon: 72.9, type: 'city', minZoom: 2, maxZoom: 6, fontSize: 18, importance: 9 },
  { name: 'Delhi', lat: 28.7, lon: 77.1, type: 'city', minZoom: 2, maxZoom: 6, fontSize: 18, importance: 9 },
  { name: 'Bangkok', lat: 13.8, lon: 100.5, type: 'city', minZoom: 2, maxZoom: 6, fontSize: 18, importance: 8 },
  { name: 'Dubai', lat: 25.3, lon: 55.3, type: 'city', minZoom: 2, maxZoom: 6, fontSize: 18, importance: 9 },

  // MAJOR CITIES (South America)
  { name: 'São Paulo', lat: -23.6, lon: -46.7, type: 'city', minZoom: 2, maxZoom: 6, fontSize: 18, importance: 9 },
  { name: 'Rio de Janeiro', lat: -22.9, lon: -43.2, type: 'city', minZoom: 2, maxZoom: 6, fontSize: 18, importance: 9 },
  { name: 'Buenos Aires', lat: -34.6, lon: -58.4, type: 'city', minZoom: 2, maxZoom: 6, fontSize: 18, importance: 9 },

  // MAJOR CITIES (Africa)
  { name: 'Cairo', lat: 30.0, lon: 31.2, type: 'city', minZoom: 2, maxZoom: 6, fontSize: 18, importance: 9 },
  { name: 'Cape Town', lat: -33.9, lon: 18.4, type: 'city', minZoom: 2, maxZoom: 6, fontSize: 18, importance: 8 },
  { name: 'Lagos', lat: 6.5, lon: 3.4, type: 'city', minZoom: 2, maxZoom: 6, fontSize: 18, importance: 8 },

  // MAJOR CITIES (Oceania)
  { name: 'Sydney', lat: -33.9, lon: 151.2, type: 'city', minZoom: 2, maxZoom: 6, fontSize: 18, importance: 9 },
  { name: 'Melbourne', lat: -37.8, lon: 145.0, type: 'city', minZoom: 2, maxZoom: 6, fontSize: 18, importance: 8 },
  { name: 'Auckland', lat: -36.9, lon: 174.8, type: 'city', minZoom: 2, maxZoom: 6, fontSize: 18, importance: 8 },

  // SMALLER TOWNS (Examples from various regions)
  { name: 'Boulder', lat: 40.0, lon: -105.3, type: 'town', minZoom: 1.5, maxZoom: 4, fontSize: 16, importance: 6 },
  { name: 'Portland', lat: 45.5, lon: -122.7, type: 'town', minZoom: 1.5, maxZoom: 4, fontSize: 16, importance: 7 },
  { name: 'Austin', lat: 30.3, lon: -97.7, type: 'town', minZoom: 1.5, maxZoom: 4, fontSize: 16, importance: 7 },
  { name: 'Denver', lat: 39.7, lon: -104.9, type: 'town', minZoom: 1.5, maxZoom: 4, fontSize: 16, importance: 7 },
  { name: 'Phoenix', lat: 33.4, lon: -112.1, type: 'town', minZoom: 1.5, maxZoom: 4, fontSize: 16, importance: 7 },
  { name: 'Philadelphia', lat: 39.9, lon: -75.2, type: 'town', minZoom: 1.5, maxZoom: 4, fontSize: 16, importance: 7 },
  { name: 'San Diego', lat: 32.7, lon: -117.2, type: 'town', minZoom: 1.5, maxZoom: 4, fontSize: 16, importance: 7 },
  { name: 'Dallas', lat: 32.8, lon: -96.8, type: 'town', minZoom: 1.5, maxZoom: 4, fontSize: 16, importance: 7 },
  { name: 'Houston', lat: 29.8, lon: -95.4, type: 'town', minZoom: 1.5, maxZoom: 4, fontSize: 16, importance: 7 },

  // STREETS (Examples - only visible at very close zoom)
  { name: 'Broadway', lat: 40.7, lon: -73.9, type: 'street', minZoom: 1, maxZoom: 2.5, fontSize: 14, importance: 7 },
  { name: '5th Avenue', lat: 40.8, lon: -73.9, type: 'street', minZoom: 1, maxZoom: 2.5, fontSize: 14, importance: 7 },
  { name: 'Wall Street', lat: 40.7, lon: -74.0, type: 'street', minZoom: 1, maxZoom: 2.5, fontSize: 14, importance: 6 },
  { name: 'Champs-Élysées', lat: 48.9, lon: 2.3, type: 'street', minZoom: 1, maxZoom: 2.5, fontSize: 14, importance: 7 },
  { name: 'Oxford Street', lat: 51.5, lon: -0.1, type: 'street', minZoom: 1, maxZoom: 2.5, fontSize: 14, importance: 6 },
  { name: 'Hollywood Blvd', lat: 34.1, lon: -118.3, type: 'street', minZoom: 1, maxZoom: 2.5, fontSize: 14, importance: 6 },
  { name: 'Sunset Boulevard', lat: 34.1, lon: -118.4, type: 'street', minZoom: 1, maxZoom: 2.5, fontSize: 14, importance: 6 },
  { name: 'Las Ramblas', lat: 41.4, lon: 2.2, type: 'street', minZoom: 1, maxZoom: 2.5, fontSize: 14, importance: 6 },
  { name: 'Shibuya Crossing', lat: 35.7, lon: 139.7, type: 'street', minZoom: 1, maxZoom: 2.5, fontSize: 14, importance: 6 },
  { name: 'Orchard Road', lat: 1.3, lon: 103.8, type: 'street', minZoom: 1, maxZoom: 2.5, fontSize: 14, importance: 6 },
];

// Return places visible for given camera distance
export function getVisiblePlaces(cameraDistance: number): Place[] {
  return PLACES.filter(place => 
    cameraDistance >= place.minZoom && 
    cameraDistance <= place.maxZoom
  );
}

// Return places filtered by PlaceType
export function getPlacesByType(type: PlaceType): Place[] {
  return PLACES.filter(place => place.type === type);
}
