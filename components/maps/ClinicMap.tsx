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

  // Expose search method
  useImperativeHandle(ref, () => ({
    search: (query: string) => {
      if (!mapInstance || !placesServiceRef.current) return;

      const request = {
        query: query,
        fields: ['name', 'geometry', 'formatted_address', 'place_id', 'types'],
        locationBias: mapInstance.getBounds(), // Bias towards current view
      };

      placesServiceRef.current.findPlaceFromQuery(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
          clearMarkers();
          
          const bounds = new google.maps.LatLngBounds();

          results.forEach(place => {
            createMarker(place);
            if (place.geometry?.location) {
              bounds.extend(place.geometry.location);
            }
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
      const map = new google.maps.Map(mapRef.current, {
        center: { lat: 37.7749, lng: -122.4194 }, // Default to SF
        zoom: 13,
        styles: [
          // Dark/Premium Map Style
          { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
          {
            featureType: "administrative.locality",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
          },
          {
            featureType: "poi",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
          },
          {
            featureType: "poi.park",
            elementType: "geometry",
            stylers: [{ color: "#263c3f" }],
          },
          {
            featureType: "poi.park",
            elementType: "labels.text.fill",
            stylers: [{ color: "#6b9a76" }],
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#38414e" }],
          },
          {
            featureType: "road",
            elementType: "geometry.stroke",
            stylers: [{ color: "#212a37" }],
          },
          {
            featureType: "road",
            elementType: "labels.text.fill",
            stylers: [{ color: "#9ca5b3" }],
          },
          {
            featureType: "road.highway",
            elementType: "geometry",
            stylers: [{ color: "#746855" }],
          },
          {
            featureType: "road.highway",
            elementType: "geometry.stroke",
            stylers: [{ color: "#1f2835" }],
          },
          {
            featureType: "road.highway",
            elementType: "labels.text.fill",
            stylers: [{ color: "#f3d19c" }],
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#17263c" }],
          },
          {
            featureType: "water",
            elementType: "labels.text.fill",
            stylers: [{ color: "#515c6d" }],
          },
          {
            featureType: "water",
            elementType: "labels.text.stroke",
            stylers: [{ color: "#17263c" }],
          },
        ],
        disableDefaultUI: true,
        zoomControl: true,
      });
      setMapInstance(map);
      placesServiceRef.current = new google.maps.places.PlacesService(map);
    }
  }, [isLoaded, mapInstance]);

  // Auto-search for nearby pharmacies and clinics on load
  useEffect(() => {
    if (mapInstance && placesServiceRef.current) {
      const searchNearby = (type: string) => {
        const request: google.maps.places.PlaceSearchRequest = {
          location: mapInstance.getCenter()!,
          radius: 5000, // 5km radius
          type: type
        };

        placesServiceRef.current?.nearbySearch(request, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            results.forEach(place => {
              createMarker(place);
            });
          }
        });
      };

      // Clear initial markers to avoid duplicates if re-running
      clearMarkers();

      // Search for both types
      searchNearby('pharmacy');
      searchNearby('doctor');
      searchNearby('hospital');
    }
  }, [mapInstance]);

  if (loadError) {
    return (
      <GlassCard className="h-[400px] flex items-center justify-center text-red-500">
        Error loading maps: {loadError.message}
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
      
      {/* Legend Overlay */}
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
