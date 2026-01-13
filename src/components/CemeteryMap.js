
import React, { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const defaultCenter = {
  lat: -29.8587, // Durban/eThekwini center
  lng: 31.0218,
};

const defaultZoom = 11;

// Custom icons
const getIcon = (type, status) => {
  let color = 'blue'; // blue for cemetery

  if (type === 'crematorium') color = 'purple'; // purple for crematorium (custom filter/hue rotation needed or different image)
  if (type === 'plot') {
    if (status === 'Available') color = 'green';
    else if (status === 'Occupied') color = 'red';
    else if (status === 'Reserved') color = 'yellow';
    else color = 'blue'; // default
  }

  // Using Google Maps marker images for consistency and simplicity as they are already used in the project logic, 
  // but verified they work as URLs. Leaflet Icon expects a URL.
  // Note: Google Maps icons are small. We might need to adjust size or anchor.
  const iconUrl = `http://maps.google.com/mapfiles/ms/icons/${color}-dot.png`;

  return new L.Icon({
    iconUrl: iconUrl,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

function MapBounds({ cemeteries, plots, crematoriums }) {
  const map = useMap();

  useEffect(() => {
    if ((cemeteries.length === 0 && plots.length === 0 && crematoriums.length === 0)) return;

    const bounds = L.latLngBounds([]);

    cemeteries.forEach(c => {
      if (c.gpsLatitude && c.gpsLongitude) {
        bounds.extend([c.gpsLatitude, c.gpsLongitude]);
      }
    });

    plots.forEach(p => {
      let lat, lng;
      if (p.location && p.location.coordinates) {
        [lng, lat] = p.location.coordinates;
      } else if (p.gpsLatitude && p.gpsLongitude) {
        lat = p.gpsLatitude;
        lng = p.gpsLongitude;
      }
      if (lat && lng) bounds.extend([lat, lng]);
    });

    crematoriums.forEach(c => {
      let lat, lng;
      if (c.location && c.location.coordinates) {
        [lng, lat] = c.location.coordinates;
      } else if (c.gpsLatitude && c.gpsLongitude) {
        lat = c.gpsLatitude;
        lng = c.gpsLongitude;
      }
      if (lat && lng) bounds.extend([lat, lng]);
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      // If no valid bounds (e.g. no data with coords), fallback to default center
      map.setView([defaultCenter.lat, defaultCenter.lng], defaultZoom);
    }

  }, [cemeteries, plots, crematoriums, map]);

  return null;
}

const CemeteryMap = ({ cemeteries = [], plots = [], crematoriums = [], onPlotClick, selectedPlot, mapHeight = '600px' }) => {

  const center = useMemo(() => {
    if (cemeteries.length === 1 && cemeteries[0].gpsLatitude && cemeteries[0].gpsLongitude) {
      return [cemeteries[0].gpsLatitude, cemeteries[0].gpsLongitude];
    }
    return [defaultCenter.lat, defaultCenter.lng];
  }, [cemeteries]);

  return (
    <MapContainer
      center={center}
      zoom={defaultZoom}
      style={{ height: mapHeight, width: '100%', borderRadius: '0.5rem' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapBounds cemeteries={cemeteries} plots={plots} crematoriums={crematoriums} />

      {/* Cemeteries */}
      {cemeteries.map(cemetery => (
        cemetery.gpsLatitude && cemetery.gpsLongitude && (
          <Marker
            key={`cemetery-${cemetery._id || cemetery.id}`}
            position={[cemetery.gpsLatitude, cemetery.gpsLongitude]}
            icon={getIcon('cemetery')}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-lg">{cemetery.name}</h3>
                <p className="text-sm text-gray-600">{cemetery.code}</p>
                <p className="text-sm text-gray-600">{cemetery.address}</p>
                <p className="text-sm text-gray-600">Status: {cemetery.status}</p>
              </div>
            </Popup>
          </Marker>
        )
      ))}

      {/* Crematoriums */}
      {crematoriums.map(crematorium => {
        let lat, lng;
        if (crematorium.location && crematorium.location.coordinates) {
          [lng, lat] = crematorium.location.coordinates;
        } else if (crematorium.gpsLatitude && crematorium.gpsLongitude) {
          lat = crematorium.gpsLatitude;
          lng = crematorium.gpsLongitude;
        }

        if (!lat || !lng) return null;

        return (
          <Marker
            key={`crem-${crematorium._id || crematorium.id}`}
            position={[lat, lng]}
            icon={getIcon('crematorium')}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-lg">{crematorium.name}</h3>
                <p className="text-sm text-gray-600">{crematorium.code}</p>
                <p className="text-sm text-gray-600">Capacity: {crematorium.capacity}</p>
                <p className="text-sm text-gray-600">Status: {crematorium.status}</p>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* Plots */}
      {plots.map(plot => {
        let lat, lng;
        if (plot.location && plot.location.coordinates) {
          [lng, lat] = plot.location.coordinates;
        } else if (plot.gpsLatitude && plot.gpsLongitude) {
          lat = plot.gpsLatitude;
          lng = plot.gpsLongitude;
        }

        if (!lat || !lng) return null;

        return (
          <Marker
            key={`plot-${plot._id || plot.id}`}
            position={[lat, lng]}
            icon={getIcon('plot', plot.status)}
            eventHandlers={{
              click: () => onPlotClick && onPlotClick(plot),
            }}
          >
            <Popup>
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
            </Popup>
          </Marker>
        );
      })}

    </MapContainer>
  );
};

export default CemeteryMap;
