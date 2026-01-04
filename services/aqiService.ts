
import { Station, Ward, AQILevel } from '../types';
import { getWardName } from '../data/officialWards';

// Free Token from https://aqicn.org/data-platform/token/
// Replace 'demo' with your real token for higher rate limits
const WAQI_TOKEN = 'demo'; 
const DELHI_BOUNDS = '28.3,76.8,29.0,77.5';

export const getStatusFromAQI = (aqi: number): AQILevel => {
  if (aqi > 300) return AQILevel.HAZARDOUS;
  if (aqi > 200) return AQILevel.SEVERE;
  if (aqi > 150) return AQILevel.POOR;
  if (aqi > 100) return AQILevel.MODERATE;
  return AQILevel.GOOD;
};

export const fetchRealTimeStations = async (): Promise<Station[]> => {
  try {
    const res = await fetch(`https://api.waqi.info/map/bounds/?latlng=${DELHI_BOUNDS}&token=${WAQI_TOKEN}`);
    const json = await res.json();
    if (json.status !== 'ok') return [];
    
    return json.data.map((s: any) => ({
      uid: s.uid,
      lat: s.lat,
      lon: s.lon,
      aqi: parseInt(s.aqi) || 0,
      stationName: s.station.name
    })).filter((s: Station) => s.aqi > 0);
  } catch (e) {
    console.error("WAQI Spatial Node Fetch Error", e);
    return [];
  }
};

/**
 * Uses a basic IDW (Inverse Distance Weighting) interpolation
 * to assign AQI to a ward based on nearby stations.
 */
export const interpolateWardAQI = (wardCentroid: [number, number], stations: Station[]): { aqi: number, nearest: string } => {
  if (stations.length === 0) return { aqi: 150, nearest: 'Historical Node' };
  
  let totalWeight = 0;
  let weightedAQISum = 0;
  let minDist = Infinity;
  let nearestStationName = stations[0].stationName;

  stations.forEach(s => {
    // Distance calculation using Euclidean (approximate for short distances)
    const d = Math.sqrt(Math.pow(s.lat - wardCentroid[0], 2) + Math.pow(s.lon - wardCentroid[1], 2));
    
    if (d < minDist) {
      minDist = d;
      nearestStationName = s.stationName;
    }

    // Weight is 1/d^2 for IDW
    const weight = 1 / (Math.pow(d, 2) + 0.00001); 
    totalWeight += weight;
    weightedAQISum += s.aqi * weight;
  });

  return { 
    aqi: Math.round(weightedAQISum / totalWeight), 
    nearest: nearestStationName 
  };
};
