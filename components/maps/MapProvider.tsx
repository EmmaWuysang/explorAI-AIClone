'use client';

import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

interface MapContextType {
  isLoaded: boolean;
  loadError: Error | undefined;
}

const MapContext = createContext<MapContextType>({ isLoaded: false, loadError: undefined });

export const useMap = () => useContext(MapContext);

interface MapProviderProps {
  children: ReactNode;
}

export default function MapProvider({ children }: MapProviderProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    
    if (!apiKey) {
      console.warn("Google Maps API key is missing");
      setLoadError(new Error("Google Maps API key is missing"));
      return;
    }

    try {
      setOptions({
        key: apiKey,
        v: "weekly",
        libraries: ["places", "geometry"],
      });

      importLibrary("maps").then(() => {
        setIsLoaded(true);
      }).catch((e: Error) => {
        console.error("Failed to load Google Maps:", e);
        setLoadError(e);
      });
    } catch (e) {
      console.error("Error setting up Google Maps:", e);
      setLoadError(e as Error);
    }

  }, []);

  return (
    <MapContext.Provider value={{ isLoaded, loadError }}>
      {children}
    </MapContext.Provider>
  );
}
