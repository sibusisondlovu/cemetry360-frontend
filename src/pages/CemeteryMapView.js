import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import CemeteryMap from '../components/CemeteryMap';
import { ArrowLeftIcon, MapPinIcon } from '@heroicons/react/24/outline';

export default function CemeteryMapView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cemetery, setCemetery] = useState(null);
  const [plots, setPlots] = useState([]);
  const [crematoriums, setCrematoriums] = useState([]);
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCemeteryData();
  }, [id, filter]);

  const fetchCemeteryData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [cemeteryRes, plotsRes, crematoriumsRes] = await Promise.all([
        api.get(`/cemeteries/${id}`),
        api.get(`/plots?cemeteryId=${id}${filter !== 'all' ? `&status=${filter}` : ''}`),
        api.get(`/crematoriums?cemeteryId=${id}`),
      ]);

      setCemetery(cemeteryRes.data);
      setPlots(plotsRes.data);
      setCrematoriums(crematoriumsRes.data);
    } catch (error) {
      console.error('Error fetching cemetery data:', error);
      setError('Failed to load cemetery data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlotClick = (plot) => {
    setSelectedPlot(plot);
  };

  const plotStats = {
    total: plots.length,
    available: plots.filter(p => p.status === 'Available').length,
    occupied: plots.filter(p => p.status === 'Occupied').length,
    reserved: plots.filter(p => p.status === 'Reserved').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading map data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <button
          onClick={() => navigate('/cemeteries')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Cemeteries
        </button>
      </div>
    );
  }

  if (!cemetery) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">Cemetery not found.</p>
        <button
          onClick={() => navigate('/cemeteries')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Cemeteries
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/cemeteries')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
            title="Back to Cemeteries"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {cemetery.name} - Map View
            </h1>
            <p className="text-sm text-gray-600">{cemetery.code} • {cemetery.address}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Plots</option>
            <option value="Available">Available Only</option>
            <option value="Occupied">Occupied Only</option>
            <option value="Reserved">Reserved Only</option>
          </select>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total Plots</div>
          <div className="text-2xl font-bold text-gray-900">{plotStats.total}</div>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4">
          <div className="text-sm text-green-600">Available</div>
          <div className="text-2xl font-bold text-green-700">{plotStats.available}</div>
        </div>
        <div className="bg-red-50 rounded-lg shadow p-4">
          <div className="text-sm text-red-600">Occupied</div>
          <div className="text-2xl font-bold text-red-700">{plotStats.occupied}</div>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow p-4">
          <div className="text-sm text-yellow-600">Reserved</div>
          <div className="text-2xl font-bold text-yellow-700">{plotStats.reserved}</div>
        </div>
      </div>

      {/* Map */}
      <div className="bg-white rounded-lg shadow-lg p-4">
        <CemeteryMap
          cemeteries={cemetery ? [cemetery] : []}
          plots={plots}
          crematoriums={crematoriums}
          onPlotClick={handlePlotClick}
          selectedPlot={selectedPlot}
        />
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Map Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <img src="http://maps.google.com/mapfiles/ms/icons/blue-dot.png" alt="Cemetery" className="w-6 h-6" />
            <span>Cemetery</span>
          </div>
          <div className="flex items-center space-x-2">
            <img src="http://maps.google.com/mapfiles/ms/icons/purple-dot.png" alt="Crematorium" className="w-6 h-6" />
            <span>Crematorium</span>
          </div>
          <div className="flex items-center space-x-2">
            <img src="http://maps.google.com/mapfiles/ms/icons/green-dot.png" alt="Available" className="w-6 h-6" />
            <span>Available Plot</span>
          </div>
          <div className="flex items-center space-x-2">
            <img src="http://maps.google.com/mapfiles/ms/icons/red-dot.png" alt="Occupied" className="w-6 h-6" />
            <span>Occupied Plot</span>
          </div>
          <div className="flex items-center space-x-2">
            <img src="http://maps.google.com/mapfiles/ms/icons/yellow-dot.png" alt="Reserved" className="w-6 h-6" />
            <span>Reserved Plot</span>
          </div>
        </div>
      </div>

      {/* Crematoriums Info */}
      {crematoriums.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Crematoriums at this location:</h3>
          <ul className="space-y-1">
            {crematoriums.map((crem) => (
              <li key={crem._id || crem.id} className="text-sm text-blue-800">
                • {crem.name} ({crem.code}) - Capacity: {crem.capacity} - Status: {crem.status}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Selected Plot Details */}
      {selectedPlot && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Plot Details</h3>
            <button
              onClick={() => setSelectedPlot(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Identifier</p>
              <p className="font-medium">{selectedPlot.uniqueIdentifier}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="font-medium">
                <span className={`px-2 py-1 rounded text-xs ${
                  selectedPlot.status === 'Available' ? 'bg-green-100 text-green-800' :
                  selectedPlot.status === 'Occupied' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {selectedPlot.status}
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Type</p>
              <p className="font-medium">{selectedPlot.graveType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Burials</p>
              <p className="font-medium">
                {selectedPlot.currentBurials || 0} / {selectedPlot.allowedBurials || 1}
              </p>
            </div>
            {selectedPlot.section && (
              <div>
                <p className="text-sm text-gray-600">Section</p>
                <p className="font-medium">{selectedPlot.section.name}</p>
              </div>
            )}
            {selectedPlot.cemetery && (
              <div>
                <p className="text-sm text-gray-600">Cemetery</p>
                <p className="font-medium">{selectedPlot.cemetery.name}</p>
              </div>
            )}
            {selectedPlot.row && (
              <div>
                <p className="text-sm text-gray-600">Row</p>
                <p className="font-medium">{selectedPlot.row}</p>
              </div>
            )}
            {selectedPlot.plotNumber && (
              <div>
                <p className="text-sm text-gray-600">Plot Number</p>
                <p className="font-medium">{selectedPlot.plotNumber}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
