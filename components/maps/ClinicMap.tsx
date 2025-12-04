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
  const markersRef = useRef<google.maps.Marker[]>([]);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  // Expose search method
  useImperativeHandle(ref, () => ({
    search: (query: string) => {
      if (!mapInstance || !placesServiceRef.current) return;

      const request = {
        query: query,
        fields: ['name', 'geometry', 'formatted_address', 'place_id', 'types'],
        locationBias: mapInstance.getBounds(),
      };

      placesServiceRef.current.findPlaceFromQuery(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
          clearMarkers();
          const bounds = new google.maps.LatLngBounds();
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
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
  };

  const createMarker = (place: google.maps.places.PlaceResult) => {
    if (!mapInstance || !place.geometry || !place.geometry.location) return;

    const isPharmacy = place.types?.includes('pharmacy');
    const marker = new google.maps.Marker({
      map: mapInstance,
      position: place.geometry.location,
      title: place.name,
      animation: google.maps.Animation.DROP,
      icon: {
        url: isPharmacy
          ? 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png' 
          : 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
      }
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

    markersRef.current.push(marker);
  };

  // Initialize Map
  useEffect(() => {
    if (isLoaded && mapRef.current && !mapInstance) {
      try {
        const map = new google.maps.Map(mapRef.current, {
          center: { lat: 37.7749, lng: -122.4194 },
          zoom: 13,
          styles: [
            { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
            { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
            { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
            { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
            { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
            { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
            { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
            { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
            { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
            { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
            { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
            { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
            { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
            { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] },
          ],
          disableDefaultUI: true,
          zoomControl: true,
        });
        setMapInstance(map);
        placesServiceRef.current = new google.maps.places.PlacesService(map);
      } catch (e) {
        console.error("Error initializing map:", e);
        setMapError("Failed to initialize map. Please check API key permissions.");
      }
    }
  }, [isLoaded, mapInstance]);

  // Auto-search
  useEffect(() => {
    if (mapInstance && placesServiceRef.current) {
      const searchNearby = (type: string) => {
        const request: google.maps.places.PlaceSearchRequest = {
          location: mapInstance.getCenter()!,
          radius: 5000,
          type: type
        };

        placesServiceRef.current?.nearbySearch(request, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            results.forEach(place => createMarker(place));
          } else if (status === google.maps.places.PlacesServiceStatus.REQUEST_DENIED) {
             console.error("Places API Request Denied. Check API Key permissions.");
             setMapError("Places API Request Denied. Please enable 'Places API' in Google Cloud Console.");
          }
        });
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
