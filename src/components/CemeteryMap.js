import React, { useCallback, useMemo, useState } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

const getMapContainerStyle = (height = '600px') => ({
  width: '100%',
  height: height,
});

const defaultCenter = {
  lat: -29.8587, // Durban/eThekwini center
  lng: 31.0218,
};

const defaultZoom = 11; // Zoom level to show entire eThekwini area

const CemeteryMap = ({ cemeteries = [], plots = [], crematoriums = [], onPlotClick, selectedPlot, mapHeight = '600px' }) => {
  const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'AIzaSyDYOQ5BN6VL2UnqjSc2e_ZnAB7-dTkj3yo';
  const [activeInfoWindow, setActiveInfoWindow] = useState(null);
  const [map, setMap] = useState(null);

  const mapOptions = useMemo(() => ({
    disableDefaultUI: false,
    clickableIcons: true,
    zoomControl: true,
    mapTypeControl: true,
    scaleControl: true,
    streetViewControl: true,
    rotateControl: true,
    fullscreenControl: true,
    gestureHandling: 'greedy',
    styles: [
      {
        featureType: 'all',
        elementType: 'labels',
        stylers: [{ visibility: 'on' }]
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#e0e0e0' }]
      }
    ],
  }), []);

  const onLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
    
    // If we have multiple cemeteries, fit bounds to show all of them
    if (cemeteries.length > 1) {
      const bounds = new window.google.maps.LatLngBounds();
      
      cemeteries.forEach(cemetery => {
        if (cemetery.gpsLatitude && cemetery.gpsLongitude) {
          bounds.extend({ lat: cemetery.gpsLatitude, lng: cemetery.gpsLongitude });
        }
      });
      
      // Add plots if available
      plots.forEach(plot => {
        let position = null;
        if (plot.location && plot.location.coordinates) {
          const [lng, lat] = plot.location.coordinates;
          position = { lat, lng };
        } else if (plot.gpsLatitude && plot.gpsLongitude) {
          position = { lat: plot.gpsLatitude, lng: plot.gpsLongitude };
        }
        if (position) bounds.extend(position);
      });
      
      // Add crematoriums if available
      crematoriums.forEach(crematorium => {
        let position = null;
        if (crematorium.location && crematorium.location.coordinates) {
          const [lng, lat] = crematorium.location.coordinates;
          position = { lat, lng };
        } else if (crematorium.gpsLatitude && crematorium.gpsLongitude) {
          position = { lat: crematorium.gpsLatitude, lng: crematorium.gpsLongitude };
        }
        if (position) bounds.extend(position);
      });
      
      if (!bounds.isEmpty()) {
        mapInstance.fitBounds(bounds, { padding: 80 });
        
        // Set maximum zoom to prevent zooming in too close
        const listener = window.google.maps.event.addListener(mapInstance, 'bounds_changed', () => {
          const currentZoom = mapInstance.getZoom();
          if (currentZoom > 13) {
            mapInstance.setZoom(13);
          }
          window.google.maps.event.removeListener(listener);
        });
      }
    } else if (cemeteries.length === 1 && cemeteries[0].gpsLatitude && cemeteries[0].gpsLongitude) {
      // Single cemetery: center on it
      const cemeteryPosition = { 
        lat: cemeteries[0].gpsLatitude, 
        lng: cemeteries[0].gpsLongitude 
      };
      
      mapInstance.setCenter(cemeteryPosition);
      
      // If we have plots or crematoriums, fit bounds to show them around the cemetery
      const hasPlotsOrCrematoriums = plots.length > 0 || crematoriums.length > 0;
      
      if (hasPlotsOrCrematoriums) {
        const bounds = new window.google.maps.LatLngBounds();
        bounds.extend(cemeteryPosition);
        
        plots.forEach(plot => {
          let position = null;
          if (plot.location && plot.location.coordinates) {
            const [lng, lat] = plot.location.coordinates;
            position = { lat, lng };
          } else if (plot.gpsLatitude && plot.gpsLongitude) {
            position = { lat: plot.gpsLatitude, lng: plot.gpsLongitude };
          }
          if (position) bounds.extend(position);
        });
        
        crematoriums.forEach(crematorium => {
          let position = null;
          if (crematorium.location && crematorium.location.coordinates) {
            const [lng, lat] = crematorium.location.coordinates;
            position = { lat, lng };
          } else if (crematorium.gpsLatitude && crematorium.gpsLongitude) {
            position = { lat: crematorium.gpsLatitude, lng: crematorium.gpsLongitude };
          }
          if (position) bounds.extend(position);
        });
        
        mapInstance.fitBounds(bounds, { padding: 50 });
        
        const listener = window.google.maps.event.addListener(mapInstance, 'bounds_changed', () => {
          const currentZoom = mapInstance.getZoom();
          if (currentZoom > 18) {
            mapInstance.setZoom(18);
          }
          window.google.maps.event.removeListener(listener);
        });
      } else {
        mapInstance.setZoom(16);
      }
    } else if (plots.length > 0 || crematoriums.length > 0) {
      // Fallback: if no cemetery coordinates, fit to plots/crematoriums
      const bounds = new window.google.maps.LatLngBounds();
      
      plots.forEach(plot => {
        let position = null;
        if (plot.location && plot.location.coordinates) {
          const [lng, lat] = plot.location.coordinates;
          position = { lat, lng };
        } else if (plot.gpsLatitude && plot.gpsLongitude) {
          position = { lat: plot.gpsLatitude, lng: plot.gpsLongitude };
        }
        if (position) bounds.extend(position);
      });
      
      crematoriums.forEach(crematorium => {
        let position = null;
        if (crematorium.location && crematorium.location.coordinates) {
          const [lng, lat] = crematorium.location.coordinates;
          position = { lat, lng };
        } else if (crematorium.gpsLatitude && crematorium.gpsLongitude) {
          position = { lat: crematorium.gpsLatitude, lng: crematorium.gpsLongitude };
        }
        if (position) bounds.extend(position);
      });
      
      if (!bounds.isEmpty()) {
        mapInstance.fitBounds(bounds, { padding: 50 });
      }
    }
  }, [cemeteries, plots, crematoriums]);

  const getMarkerColor = (status) => {
    switch (status) {
      case 'Available':
        return {
          url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
          scaledSize: { width: 30, height: 30 },
        };
      case 'Occupied':
        return {
          url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
          scaledSize: { width: 30, height: 30 },
        };
      case 'Reserved':
        return {
          url: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
          scaledSize: { width: 30, height: 30 },
        };
      default:
        return {
          url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          scaledSize: { width: 30, height: 30 },
        };
    }
  };

  const handleMarkerClick = (item, type) => {
    if (type === 'plot' && onPlotClick) {
      onPlotClick(item);
    }
    setActiveInfoWindow(item._id || item.id);
  };

  const handleInfoWindowClose = () => {
    setActiveInfoWindow(null);
  };

  if (!googleMapsApiKey) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">
          Google Maps API key not configured. Please set REACT_APP_GOOGLE_MAPS_API_KEY in your .env file.
        </p>
      </div>
    );
  }

  // Default center: if multiple cemeteries, use eThekwini center; otherwise use first cemetery or default
  const center = cemeteries.length > 1
    ? defaultCenter // eThekwini center for multiple cemeteries
    : (cemeteries.length > 0 && cemeteries[0].gpsLatitude && cemeteries[0].gpsLongitude
      ? { lat: cemeteries[0].gpsLatitude, lng: cemeteries[0].gpsLongitude }
      : defaultCenter);

  // Default zoom - will be adjusted in onLoad callback
  const zoom = cemeteries.length > 1
    ? defaultZoom // Show entire eThekwini area for multiple cemeteries
    : (cemeteries.length > 0 && cemeteries[0].gpsLatitude && cemeteries[0].gpsLongitude
      ? 16  // Good zoom level for single cemetery view
      : defaultZoom);

  return (
    <LoadScript googleMapsApiKey={googleMapsApiKey} loadingElement={<div>Loading map...</div>}>
      <GoogleMap
        mapContainerStyle={getMapContainerStyle(mapHeight)}
        center={center}
        zoom={zoom}
        options={mapOptions}
        onLoad={onLoad}
      >
        {/* Cemetery Markers */}
        {cemeteries.map((cemetery) => {
          if (cemetery.gpsLatitude && cemetery.gpsLongitude) {
            return (
              <Marker
                key={`cemetery-${cemetery._id || cemetery.id}`}
                position={{ lat: cemetery.gpsLatitude, lng: cemetery.gpsLongitude }}
                title={cemetery.name}
                icon={{
                  url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                  scaledSize: { width: 40, height: 40 },
                }}
                onClick={() => handleMarkerClick(cemetery, 'cemetery')}
              >
                {activeInfoWindow === (cemetery._id || cemetery.id) && (
                  <InfoWindow onCloseClick={handleInfoWindowClose}>
                    <div className="p-2">
                      <h3 className="font-semibold text-lg">{cemetery.name}</h3>
                      <p className="text-sm text-gray-600">{cemetery.code}</p>
                      <p className="text-sm text-gray-600">{cemetery.address}</p>
                      <p className="text-sm text-gray-600">Status: {cemetery.status}</p>
                    </div>
                  </InfoWindow>
                )}
              </Marker>
            );
          }
          return null;
        })}

        {/* Crematorium Markers */}
        {crematoriums.map((crematorium) => {
          let position = null;
          
          if (crematorium.location && crematorium.location.coordinates) {
            const [lng, lat] = crematorium.location.coordinates;
            position = { lat, lng };
          } else if (crematorium.gpsLatitude && crematorium.gpsLongitude) {
            position = { lat: crematorium.gpsLatitude, lng: crematorium.gpsLongitude };
          }

          if (!position) return null;

          return (
            <Marker
              key={`crematorium-${crematorium._id || crematorium.id}`}
              position={position}
              title={crematorium.name}
              icon={{
                url: 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png',
                scaledSize: { width: 35, height: 35 },
              }}
              onClick={() => handleMarkerClick(crematorium, 'crematorium')}
            >
              {activeInfoWindow === (crematorium._id || crematorium.id) && (
                <InfoWindow onCloseClick={handleInfoWindowClose}>
                  <div className="p-2">
                    <h3 className="font-semibold text-lg">{crematorium.name}</h3>
                    <p className="text-sm text-gray-600">{crematorium.code}</p>
                    <p className="text-sm text-gray-600">Capacity: {crematorium.capacity}</p>
                    <p className="text-sm text-gray-600">Status: {crematorium.status}</p>
                  </div>
                </InfoWindow>
              )}
            </Marker>
          );
        })}

        {/* Plot Markers */}
        {plots.map((plot) => {
          let position = null;
          
          if (plot.location && plot.location.coordinates) {
            const [lng, lat] = plot.location.coordinates;
            position = { lat, lng };
          } else if (plot.gpsLatitude && plot.gpsLongitude) {
            position = { lat: plot.gpsLatitude, lng: plot.gpsLongitude };
          }

          if (!position) return null;

          const markerIcon = getMarkerColor(plot.status);
          const isSelected = selectedPlot && (selectedPlot._id === plot._id || selectedPlot.id === plot.id);
          const isActive = activeInfoWindow === (plot._id || plot.id);
          
          return (
            <Marker
              key={`plot-${plot._id || plot.id}`}
              position={position}
              title={plot.uniqueIdentifier}
              icon={markerIcon}
              onClick={() => handleMarkerClick(plot, 'plot')}
              animation={isSelected ? window.google?.maps?.Animation?.BOUNCE : null}
            >
              {(isActive || isSelected) && (
                <InfoWindow onCloseClick={handleInfoWindowClose}>
                  <div className="p-2 min-w-[200px]">
                    <h3 className="font-semibold text-lg mb-2">{plot.uniqueIdentifier}</h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Status:</span> {plot.status}</p>
                      <p><span className="font-medium">Type:</span> {plot.graveType}</p>
                      {plot.section && <p><span className="font-medium">Section:</span> {plot.section.name}</p>}
                      <p><span className="font-medium">Burials:</span> {plot.currentBurials || 0} / {plot.allowedBurials || 1}</p>
                      {plot.cemetery && <p><span className="font-medium">Cemetery:</span> {plot.cemetery.name}</p>}
                    </div>
                  </div>
                </InfoWindow>
              )}
            </Marker>
          );
        })}
      </GoogleMap>
    </LoadScript>
  );
};

export default CemeteryMap;
