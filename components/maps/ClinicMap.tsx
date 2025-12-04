'use client';

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { useMap } from './MapProvider';
import GlassCard from '@/components/ui/GlassCard';
import { Location } from '@/lib/db/mock-db';

interface ClinicMapProps {
  locations: Location[];
  onLocationSelect?: (location: Location) => void;
}

export interface ClinicMapRef {
  search: (query: string) => void;
}

const ClinicMap = forwardRef<ClinicMapRef, ClinicMapProps>(({ locations, onLocationSelect }, ref) => {
  const { isLoaded, loadError } = useMap();
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const markersRef = useRef<(google.maps.Marker | google.maps.marker.AdvancedMarkerElement)[]>([]);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  // Expose search method
  useImperativeHandle(ref, () => ({
    search: async (query: string) => {
      if (!mapInstance || !placesServiceRef.current) return;

      const { LatLngBounds } = await google.maps.importLibrary("core") as google.maps.CoreLibrary;

      const request = {
        query: query,
        fields: ['name', 'geometry', 'formatted_address', 'place_id', 'types'],
        locationBias: mapInstance.getBounds(),
      };

      placesServiceRef.current.findPlaceFromQuery(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
          clearMarkers();
          const bounds = new LatLngBounds();
          results.forEach(place => {
            createMarker(place);
            if (place.geometry?.location) bounds.extend(place.geometry.location);
          });
          mapInstance.fitBounds(bounds);
        }
      });
    }
  }));

  const clearMarkers = () => {
    markersRef.current.forEach(marker => {
      if ('setMap' in marker && typeof (marker as any).setMap === 'function') {
        (marker as google.maps.Marker).setMap(null);
      } else {
        // AdvancedMarkerElement
        (marker as any).map = null;
      }
    });
    markersRef.current = [];
  };

  const createMarker = async (place: google.maps.places.PlaceResult) => {
    if (!mapInstance || !place.geometry || !place.geometry.location) return;

    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;

    const isPharmacy = place.types?.includes('pharmacy');
    
    // Create DOM element for marker content
    const iconImg = document.createElement('img');
    iconImg.src = isPharmacy 
      ? 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png' 
      : 'https://maps.google.com/mapfiles/ms/icons/red-dot.png';
    iconImg.width = 32;
    iconImg.height = 32;

    const marker = new AdvancedMarkerElement({
      map: mapInstance,
      position: place.geometry.location,
      title: place.name,
      content: iconImg,
    });

    const locationData: Location = {
      id: place.place_id || Math.random().toString(),
      name: place.name || 'Unknown',
      type: isPharmacy ? 'pharmacy' : 'clinic',
      address: place.formatted_address || place.vicinity || '',
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
      rating: place.rating || 0,
      isOpen: place.opening_hours?.isOpen() || true,
      phone: ''
    };

    marker.addListener('click', () => {
      if (onLocationSelect) onLocationSelect(locationData);
    });

    markersRef.current.push(marker as unknown as google.maps.Marker); // Type cast for compatibility with ref
  };

  // Initialize Map
  useEffect(() => {
    console.log("ClinicMap: useEffect triggered", { isLoaded, hasMapRef: !!mapRef.current, hasMapInstance: !!mapInstance });
    const initMap = async () => {
      if (isLoaded && mapRef.current && !mapInstance) {
        console.log("ClinicMap: Starting initMap");
        try {
          // Use importLibrary to safely load the Map and Places classes
          console.log("ClinicMap: Importing libraries...");
          const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
          const { PlacesService } = await google.maps.importLibrary("places") as google.maps.PlacesLibrary;
          console.log("ClinicMap: Libraries imported");

          const map = new Map(mapRef.current, {
            center: { lat: 37.7749, lng: -122.4194 },
            zoom: 13,
            mapId: "DEMO_MAP_ID", // Required for AdvancedMarkerElement
            // styles: [] - Removed because mapId takes precedence for styling
            disableDefaultUI: true,
            zoomControl: true,
          });
          console.log("ClinicMap: Map instance created", map);
          setMapInstance(map);
          placesServiceRef.current = new PlacesService(map);
        } catch (e) {
          console.error("Error initializing map:", e);
          setMapError("Failed to initialize map. Please check API key permissions.");
        }
      } else {
        console.log("ClinicMap: Skipping initMap", { isLoaded, hasMapRef: !!mapRef.current, hasMapInstance: !!mapInstance });
      }
    };

    initMap();
  }, [isLoaded, mapInstance]);

  // Auto-search using new Places API
  useEffect(() => {
    if (mapInstance) {
      const searchNearby = async (type: string) => {
        try {
          const { Place, SearchNearbyRankPreference } = await google.maps.importLibrary("places") as google.maps.PlacesLibrary;
          
          // The new API uses Place.searchNearby
          const center = mapInstance.getCenter();
          if (!center) return;

          const request = {
            fields: ['displayName', 'location', 'formattedAddress', 'id', 'types', 'rating', 'regularOpeningHours'],
            locationRestriction: {
              center: center,
              radius: 5000,
            },
            includedPrimaryTypes: [type], // 'pharmacy', 'doctor', 'hospital'
            maxResultCount: 10,
            rankPreference: SearchNearbyRankPreference.POPULARITY,
          };

          // @ts-ignore - Types might not be fully updated for new API yet
          const { places } = await Place.searchNearby(request);

          if (places) {
            places.forEach((place: any) => {
              // Convert new Place object to compatible format for createMarker
              const placeResult: any = {
                name: place.displayName,
                geometry: { location: place.location },
                formatted_address: place.formattedAddress,
                place_id: place.id,
                types: place.types,
                rating: place.rating,
                opening_hours: { isOpen: () => place.regularOpeningHours?.isOpen },
                vicinity: place.formattedAddress // Fallback
              };
              createMarker(placeResult);
            });
          }
        } catch (e) {
          console.error(`Error searching for ${type}:`, e);
          // Fallback or silent fail
        }
      };

      clearMarkers();
      searchNearby('pharmacy');
      searchNearby('doctor');
      searchNearby('hospital');
    }
  }, [mapInstance]);

  if (loadError || mapError) {
    return (
      <GlassCard className="h-[400px] flex flex-col items-center justify-center text-center p-6">
        <div className="text-red-500 font-bold mb-2">Map Error</div>
        <p className="text-slate-500 text-sm mb-4">{loadError?.message || mapError}</p>
        <p className="text-xs text-slate-400 max-w-xs">
          Ensure &quot;Maps JavaScript API&quot; and &quot;Places API&quot; are enabled in your Google Cloud Console and that your API key has the correct referrer restrictions.
        </p>
      </GlassCard>
    );
  }

  if (!isLoaded) {
    return (
      <GlassCard className="h-[400px] flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading Maps...</div>
      </GlassCard>
    );
  }

  return (
    <GlassCard noPadding className="h-[400px] relative overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />
      
      <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur p-3 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://maps.google.com/mapfiles/ms/icons/blue-dot.png" className="w-4 h-4" alt="Pharmacy" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Pharmacy</span>
        </div>
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://maps.google.com/mapfiles/ms/icons/red-dot.png" className="w-4 h-4" alt="Clinic" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Clinic</span>
        </div>
      </div>
    </GlassCard>
  );
});

ClinicMap.displayName = 'ClinicMap';

export default ClinicMap;
