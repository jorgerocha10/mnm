'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Custom map styling
const customMapStyle = [
  { featureType: "all", elementType: "all", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ visibility: "on" }, { color: "#000000" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ visibility: "on" }] },
];

// Google Maps API Key from environment variables
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

// Show a warning if the API key is missing
if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
  console.warn('Google Maps API key is missing. Map functionality will be limited.');
}

// Type definitions for Google Maps
declare global {
  interface Window {
    google: any;
    initMap: () => void;
    [key: string]: any; // Add index signature to allow dynamic property access
  }
}

interface InteractiveMapProps {
  frameType: string;
  frameSize: string;
  initialAddress?: string;
  initialCoordinates?: { lat: number; lng: number };
  showRotate?: boolean;
  orientation?: 'horizontal' | 'vertical';
  onOrientationChange?: (orientation: 'horizontal' | 'vertical') => void;
  onLocationSelect: (location: {
    address?: string;
    coordinates: { lat: number; lng: number };
    zoom: number;
  }) => void;
}

export default function InteractiveMap({
  frameType,
  frameSize,
  initialAddress,
  initialCoordinates,
  showRotate = false,
  orientation = 'horizontal',
  onOrientationChange,
  onLocationSelect,
}: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [autocomplete, setAutocomplete] = useState<any>(null);
  const [searchValue, setSearchValue] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{
    address?: string;
    coordinates: { lat: number; lng: number };
    zoom: number;
  }>({
    coordinates: initialCoordinates || { lat: 40.7128, lng: -74.0060 }, // Default to NYC
    zoom: 13,
  });

  // Load Google Maps API
  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      setIsLoading(false);
      return;
    }

    // Check if API key is missing
    if (!GOOGLE_MAPS_API_KEY) {
      setLoadError('Google Maps API key is missing. Please check your environment configuration.');
      setIsLoading(false);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector(`script[src*="maps.googleapis.com/maps/api"]`);
    if (existingScript) {
      // If script is already loading, wait for it
      const checkGoogleMapsLoaded = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkGoogleMapsLoaded);
          setIsLoaded(true);
          setIsLoading(false);
        }
      }, 100);
      
      return () => {
        clearInterval(checkGoogleMapsLoaded);
      };
    }

    setIsLoading(true);
    
    // Create a unique callback name to avoid conflicts
    const callbackName = `initMap_${Math.random().toString(36).substring(2, 9)}`;
    
    // Set up callback
    window[callbackName] = () => {
      setIsLoaded(true);
      setIsLoading(false);
    };
    
    // Create script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    scriptRef.current = script;
    
    // Handle errors
    script.onerror = () => {
      setLoadError('Failed to load Google Maps. Please refresh the page and try again.');
      setIsLoading(false);
      // Remove the script on error
      if (script.parentNode) {
        try {
          script.parentNode.removeChild(script);
        } catch (e) {
          console.error("Error removing script:", e);
        }
      }
    };
    
    // Add script to document
    document.head.appendChild(script);
    
    // Cleanup
    return () => {
      // Clean up the global callback
      if (window[callbackName]) {
        delete window[callbackName];
      }
      
      // Don't remove the script on unmount as it might be used by other components
      // This prevents the "Failed to execute 'removeChild' on 'Node'" error
    };
  }, []);

  // Initialize map when Google Maps script is loaded
  useEffect(() => {
    if (isLoaded && mapRef.current && !map) {
      initializeMap();
    }
  }, [isLoaded, mapRef.current]);

  // Add a resize handler to ensure map resizes with container
  useEffect(() => {
    if (!map) return;

    const handleResize = () => {
      if (map && window.google) {
        window.google.maps.event.trigger(map, 'resize');
        
        // Re-center the map on the marker if it exists
        if (marker && marker.getPosition()) {
          map.setCenter(marker.getPosition());
        }
      }
    };

    // Create a ResizeObserver to detect container size changes
    if (typeof ResizeObserver !== 'undefined' && mapRef.current) {
      const resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(mapRef.current);
      
      return () => {
        if (mapRef.current) {
          resizeObserver.unobserve(mapRef.current);
        }
        resizeObserver.disconnect();
      };
    }

    // Fallback to window resize listener
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [map, marker]);

  const initializeMap = () => {
    if (!mapRef.current || !window.google || !window.google.maps) {
      setLoadError('Google Maps failed to initialize. Please refresh the page.');
      return;
    }

    try {
      const initialLocation = initialCoordinates || { lat: 40.7128, lng: -74.0060 }; // Default to NYC
      
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: initialLocation,
        zoom: 13,
        disableDefaultUI: false, // Enable default UI for better user experience
        zoomControl: true,
        styles: customMapStyle,
        gestureHandling: 'cooperative',
      });

      const markerInstance = new window.google.maps.Marker({
        position: initialLocation,
        map: mapInstance,
        draggable: true,
        animation: window.google.maps.Animation.DROP,
      });

      // Set up marker drag event
      markerInstance.addListener('dragend', () => {
        const position = markerInstance.getPosition();
        if (position) {
          const newLocation = {
            coordinates: { lat: position.lat(), lng: position.lng() },
            zoom: mapInstance.getZoom() || 13,
          };
          setSelectedLocation(newLocation);
          onLocationSelect(newLocation);
          
          // Reverse geocode to get address
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: position }, (results: any, status: string) => {
            if (status === 'OK' && results && results[0]) {
              setSearchValue(results[0].formatted_address);
              setSelectedLocation({
                ...newLocation,
                address: results[0].formatted_address,
              });
              onLocationSelect({
                ...newLocation,
                address: results[0].formatted_address,
              });
            }
          });
        }
      });

      // Set up map click event
      mapInstance.addListener('click', (e: any) => {
        if (e.latLng) {
          markerInstance.setPosition(e.latLng);
          const newLocation = {
            coordinates: { lat: e.latLng.lat(), lng: e.latLng.lng() },
            zoom: mapInstance.getZoom() || 13,
          };
          setSelectedLocation(newLocation);
          onLocationSelect(newLocation);
          
          // Reverse geocode to get address
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: e.latLng }, (results: any, status: string) => {
            if (status === 'OK' && results && results[0]) {
              setSearchValue(results[0].formatted_address);
              setSelectedLocation({
                ...newLocation,
                address: results[0].formatted_address,
              });
              onLocationSelect({
                ...newLocation,
                address: results[0].formatted_address,
              });
            }
          });
        }
      });

      // Initialize autocomplete
      if (searchInputRef.current) {
        const autocompleteInstance = new window.google.maps.places.Autocomplete(searchInputRef.current);
        autocompleteInstance.addListener('place_changed', () => {
          const place = autocompleteInstance.getPlace();
          if (place.geometry && place.geometry.location) {
            mapInstance.setCenter(place.geometry.location);
            markerInstance.setPosition(place.geometry.location);
            
            const newLocation = {
              address: place.formatted_address,
              coordinates: { 
                lat: place.geometry.location.lat(), 
                lng: place.geometry.location.lng() 
              },
              zoom: mapInstance.getZoom() || 13,
            };
            
            setSelectedLocation(newLocation);
            onLocationSelect(newLocation);
          }
        });
        setAutocomplete(autocompleteInstance);
      }

      setMap(mapInstance);
      setMarker(markerInstance);

      // If initial address is provided, geocode it
      if (initialAddress && initialAddress.length > 0) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: initialAddress }, (results: any, status: string) => {
          if (status === 'OK' && results && results[0] && results[0].geometry && results[0].geometry.location) {
            mapInstance.setCenter(results[0].geometry.location);
            markerInstance.setPosition(results[0].geometry.location);
            setSearchValue(initialAddress);
          }
        });
      }
      
      // If initial coordinates are provided, center the map
      if (initialCoordinates) {
        mapInstance.setCenter(initialCoordinates);
        markerInstance.setPosition(initialCoordinates);
        
        // Reverse geocode to get address
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: initialCoordinates }, (results: any, status: string) => {
          if (status === 'OK' && results && results[0]) {
            setSearchValue(results[0].formatted_address);
          }
        });
      }
    } catch (error) {
      console.error('Error initializing map:', error);
      setLoadError('Error initializing map. Please refresh the page and try again.');
    }
  };

  // Update map when frame type or size changes
  useEffect(() => {
    if (map) {
      map.setOptions({ styles: customMapStyle });
    }
  }, [map, frameType, frameSize]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue || !map || !marker) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: searchValue }, (results: any, status: string) => {
      if (status === 'OK' && results && results[0] && results[0].geometry && results[0].geometry.location) {
        map.setCenter(results[0].geometry.location);
        marker.setPosition(results[0].geometry.location);
        
        const newLocation = {
          address: results[0].formatted_address,
          coordinates: { 
            lat: results[0].geometry.location.lat(), 
            lng: results[0].geometry.location.lng() 
          },
          zoom: map.getZoom() || 13,
        };
        
        setSelectedLocation(newLocation);
        onLocationSelect(newLocation);
      }
    });
  };

  // Determine if the frame size is square or rectangular
  const isSquare = [
    'SIZE_6X6', 
    'SIZE_8_5X8_5', 
    'SIZE_12X12', 
    'SIZE_16X16', 
    'SIZE_20X20'
  ].includes(frameSize);

  // Calculate frame dimensions based on size and orientation
  const getFrameDimensions = () => {
    // Special dimensions for key holder sizes
    if (frameSize === 'SIZE_4_5X8_5') {
      return orientation === 'horizontal' 
        ? 'aspect-[1.89/1] w-full max-w-[510px]'  // 4.5" × 8.5" (aspect ratio ~1.89:1)
        : 'aspect-[0.53/1] w-full max-w-[270px]';  // 8.5" × 4.5" (aspect ratio ~0.53:1)
    }
    if (frameSize === 'SIZE_6X12') {
      return orientation === 'horizontal'
        ? 'aspect-[2/1] w-full max-w-[600px]'  // 6" × 12" (aspect ratio 2:1)
        : 'aspect-[0.5/1] w-full max-w-[300px]';  // 12" × 6" (aspect ratio 0.5:1)
    }
    
    // Default dimensions for other sizes
    if (isSquare) {
      return 'aspect-[1/1] w-full max-w-[480px]';  // Square (aspect ratio 1:1)
    }
    
    return orientation === 'horizontal' 
      ? 'aspect-[1.31/1] w-full max-w-[630px]'  // Horizontal rectangle (aspect ratio ~1.31:1)
      : 'aspect-[0.76/1] w-full max-w-[480px]';  // Vertical rectangle (aspect ratio ~0.76:1)
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="relative">
        <form onSubmit={handleSearchSubmit} className="flex items-center mb-4">
          <div className="relative flex-grow">
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search for a location..."
              value={searchValue}
              onChange={handleSearchChange}
              className="pl-10 pr-4 py-2 w-full"
              disabled={isLoading || !!loadError}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#95A7B5] w-4 h-4" />
          </div>
          <Button 
            type="submit" 
            className="ml-2 bg-[#A76825] hover:bg-[#8a561e] text-white"
            disabled={isLoading || !!loadError}
          >
            Search
          </Button>
          {showRotate && !isSquare && (
            <Button
              type="button"
              variant="outline"
              className="ml-2 border-[#95A7B5] text-[#253946] hover:bg-[#95A7B5]/10"
              onClick={() => onOrientationChange?.(orientation === 'horizontal' ? 'vertical' : 'horizontal')}
            >
              <svg
                className={`w-4 h-4 transition-transform ${orientation === 'vertical' ? 'rotate-90' : ''}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3" />
                <path d="M9 21h6" />
                <path d="M12 17v4" />
                <path d="M3 11h18" />
              </svg>
            </Button>
          )}
        </form>
      </div>

      {loadError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
      )}

      <div className="relative flex justify-center w-full">
        {/* Map container with frame styling applied directly */}
        <div 
          ref={mapRef} 
          className={`${getFrameDimensions()} relative rounded-sm overflow-hidden shadow-lg flex items-center justify-center bg-gray-100`}
          style={{
            border: `20px solid ${frameType === 'PINE' ? '#D2BDA2' : '#3E2723'}`,
            backgroundImage: frameType === 'PINE' 
              ? 'linear-gradient(45deg, rgba(210, 189, 162, 0.8) 25%, rgba(200, 175, 145, 0.8) 25%, rgba(200, 175, 145, 0.8) 50%, rgba(210, 189, 162, 0.8) 50%, rgba(210, 189, 162, 0.8) 75%, rgba(200, 175, 145, 0.8) 75%, rgba(200, 175, 145, 0.8) 100%)'
              : 'linear-gradient(45deg, rgba(62, 39, 35, 0.8) 25%, rgba(51, 32, 29, 0.8) 25%, rgba(51, 32, 29, 0.8) 50%, rgba(62, 39, 35, 0.8) 50%, rgba(62, 39, 35, 0.8) 75%, rgba(51, 32, 29, 0.8) 75%, rgba(51, 32, 29, 0.8) 100%)',
            backgroundSize: '20px 20px',
            padding: '0px',
          }}
        >
          {isLoading && (
            <div className="text-center absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A76825]"></div>
                <p className="mt-2 text-[#253946]">Loading map...</p>
              </div>
            </div>
          )}
          
          {loadError && (
            <div className="text-center p-4 absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
              <div 
                className="w-full h-full bg-cover bg-center"
                style={{ 
                  backgroundImage: "url('https://placehold.co/600x400/95A7B5/FFFFFF?text=Map+Preview')"
                }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 text-sm text-[#253946]">
        <div className="flex items-center">
          <MapPin className="w-4 h-4 mr-1 text-[#A76825]" />
          <span>
            {selectedLocation.address || 
             `${selectedLocation.coordinates.lat.toFixed(6)}, ${selectedLocation.coordinates.lng.toFixed(6)}`}
          </span>
        </div>
        <div>
          Zoom: {selectedLocation.zoom}
        </div>
      </div>
    </div>
  );
} 