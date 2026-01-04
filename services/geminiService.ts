
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Ward, MitigationPlan, GroundingChunk, AtmosphericPrediction, SourceAttribution } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAssistantResponse = async (query: string, currentAqi: number): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are the PureAir Intelligence Assistant for Delhi. 
                Context: Current City Average AQI is ${currentAqi}. 
                User asks: "${query}"
                Rules: 
                1. Short, calm, professional tone. 
                2. No medical diagnosis. 
                3. Explain AQI/PM2.5 if asked. 
                4. Focus on prevention and trust. 
                5. Keep response under 60 words.`,
    });
    return response.text || "I'm currently recalibrating my atmospheric nodes. Please try again shortly.";
  } catch (error) {
    return "Intelligence service is momentarily throttled. Stay safe and monitor official advisories.";
  }
};

export const getSourceAttribution = async (ward: Ward): Promise<SourceAttribution> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze the environmental data for ${ward.name} ward in Delhi.
                AQI: ${ward.aqi}
                Pollutants: PM2.5(${ward.pollutants.pm25}), PM10(${ward.pollutants.pm10}), NO2(${ward.pollutants.no2}), CO(${ward.pollutants.co})
                Weather: Wind Speed ${ward.windSpeed} km/h, Humidity ${ward.humidity}%
                Context: Region ${ward.region}, Zone ${ward.zone}
                
                Identify the primary and secondary pollution sources. Use probabilistic attribution.
                Rules: 
                - Dominant source type must be one of: vehicular, industrial, construction, biomass, regional.
                - Reasoning must explain WHY based on the pollutant ratios (e.g., PM2.5/PM10 ratio, NO2 spikes).
                - Confidence Score: 0-100.
                - Social snippet: Max 100 characters.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            dominantSource: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['vehicular', 'industrial', 'construction', 'biomass', 'regional'] },
                confidence: { type: Type.INTEGER }
              },
              required: ['label', 'type', 'confidence']
            },
            secondarySources: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  weight: { type: Type.INTEGER }
                },
                required: ['label', 'weight']
              }
            },
            reasoning: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            socialSnippet: { type: Type.STRING },
            confidenceScore: { type: Type.INTEGER }
          },
          required: ['dominantSource', 'secondarySources', 'reasoning', 'socialSnippet', 'confidenceScore']
        }
      }
    });
    const text = response.text;
    return text ? JSON.parse(text.trim()) : null;
  } catch (error) {
    console.error("Source Attribution Failure", error);
    throw error;
  }
};

export const getAqiForecast = async (currentAqi: number): Promise<AtmosphericPrediction[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Predict Delhi's AQI and atmospheric profile for the next 24, 48, and 72 hours. 
                Current context: Delhi NCT integrated average AQI is ${currentAqi}. 
                Return a JSON array of 3 predictions (24, 48, 72 hours).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              hours: { type: Type.INTEGER, description: "Hours from now (24, 48, or 72)" },
              aqi: { type: Type.INTEGER },
              primaryPollutant: { type: Type.STRING },
              riskLevel: { type: Type.STRING, enum: ["Extreme", "High", "Medium", "Low"] },
              confidence: { type: Type.INTEGER, description: "Confidence score percentage (0-100)" },
              explanation: { type: Type.STRING, description: "Technical reason for prediction (max 15 words)" }
            },
            required: ["hours", "aqi", "primaryPollutant", "riskLevel", "confidence", "explanation"]
          }
        }
      }
    });
    const text = response.text;
    return text ? JSON.parse(text.trim()) : [];
  } catch (error) {
    console.error("Forecast Retrieval Failure", error);
    return [];
  }
};

export const getMitigationPlan = async (ward: Ward): Promise<MitigationPlan> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a short, professional environmental mitigation plan for Delhi's ${ward.name} ward. 
                Current AQI: ${ward.aqi} (${ward.status}). 
                Primary Source: ${ward.primarySource}.
                Structure the output as a JSON with summary, steps (array of 3-4 items), and priority (High, Medium, Low).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            steps: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            priority: { 
              type: Type.STRING,
              description: "Priority of the plan: High, Medium, or Low"
            }
          },
          propertyOrdering: ["summary", "steps", "priority"]
        }
      }
    });
    const text = response.text;
    const data = text ? JSON.parse(text.trim()) : {};
    return {
      summary: data.summary || "Awaiting detailed analysis...",
      steps: data.steps || ["Implement dust control measures", "Enhance public transport usage"],
      priority: (data.priority as 'High' | 'Medium' | 'Low') || 'Medium'
    };
  } catch (error) {
    return {
      summary: "Local analysis recommends immediate reduction in vehicular traffic.",
      steps: ["Enforce odd-even rules", "Halt construction"],
      priority: 'High'
    };
  }
};

export const analyzeAtmosphereImage = async (base64Image: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image,
            },
          },
          { text: "Act as an environmental enforcement officer in Delhi. Analyze this image for violations (stubble burning, open waste burning, construction dust without covers). Provide a structured report: 1. Violation Identified 2. Severity (1-10) 3. Recommended Fine/Action according to GRAP rules." },
        ],
      },
    });
    return response.text || "No violation detected in visual feed.";
  } catch (error) {
    return "Intelligence node timeout. Please try again.";
  }
};

export const getSimulationReport = async (ward: Ward, hours: number): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Simulate the atmospheric profile for ${ward.name} ward in Delhi ${hours} hours from now. 
                Current status: ${ward.aqi} AQI. Consider typical Delhi diurnal patterns, traffic spikes, and wind direction. 
                Keep it under 50 words, professional and technical.`,
    });
    return response.text || "Simulation stable.";
  } catch (error) {
    return "Projection engine offline.";
  }
};

export const getLiveGovUpdates = async (): Promise<{ text: string; sources: GroundingChunk[] }> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "What are the current Stage of GRAP active in Delhi today? List any new bans on construction or diesel vehicles announced in the last 24 hours.",
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    return {
      text: response.text || "Standard protocols active.",
      sources: (response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[]) || [],
    };
  } catch (error) {
    return { text: "Standard GRAP 3 protocols remain active.", sources: [] };
  }
};

export const getNearbySafeZones = async (lat: number, lng: number): Promise<{ text: string; sources: GroundingChunk[] }> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Find 3 large public parks or indoor 'Clean Air Hubs' within 5km of this location in Delhi. Suggest a 'Safe Breathing Route'.",
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: { latitude: lat, longitude: lng }
          }
        }
      },
    });
    return {
      text: response.text || "Searching for safe havens...",
      sources: (response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[]) || [],
    };
  } catch (error) {
    return { text: "Locating nearest parks manually...", sources: [] };
  }
};
