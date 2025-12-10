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
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.warn("Google Maps API key is missing");
      setLoadError(new Error("Google Maps API key is missing"));
      return;
    }

    try {
      // Initialize loader options once
      const bootstrap = async () => {
        try {
          // We can call importLibrary directly. setOptions is global and should be called once.
          // However, calling it multiple times with the same options *should* be fine, but the warning says otherwise.
          // Let's just use importLibrary which implicitly loads the API if not loaded.
          // But we need to set the key.
          
          // Check if google.maps is already available to avoid re-initializing
          if (window.google?.maps) {
            setIsLoaded(true);
            return;
          }

          setOptions({
            key: apiKey,
            v: "weekly",
            libraries: ["places", "geometry"],
          });

          await importLibrary("maps");
          setIsLoaded(true);
        } catch (e) {
          console.error("Failed to load Google Maps:", e);
          setLoadError(e as Error);
        }
      };

      bootstrap();
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
