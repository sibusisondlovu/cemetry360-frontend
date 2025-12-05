import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function UndertakerAvailablePlots() {
  const [plots, setPlots] = useState([]);
  const [cemeteries, setCemeteries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    cemeteryId: '',
    graveType: '',
  });

  useEffect(() => {
    fetchCemeteries();
  }, []);

  useEffect(() => {
    if (cemeteries.length > 0) {
      fetchPlots();
    }
  }, [filters, cemeteries]);

  const fetchPlots = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.cemeteryId) params.append('cemeteryId', filters.cemeteryId);
      if (filters.graveType) params.append('graveType', filters.graveType);

      const response = await api.get(`/undertaker/available-plots?${params.toString()}`);
      setPlots(response.data);
    } catch (error) {
      console.error('Error fetching plots:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCemeteries = async () => {
    try {
      const response = await api.get('/cemeteries');
      setCemeteries(response.data);
    } catch (error) {
      console.error('Error fetching cemeteries:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Available Plots</h1>

      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cemetery</label>
            <select
              value={filters.cemeteryId}
              onChange={(e) => setFilters({ ...filters, cemeteryId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Cemeteries</option>
              {cemeteries.map((cem) => (
                <option key={cem._id || cem.id} value={cem._id || cem.id}>
                  {cem.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grave Type</label>
            <select
              value={filters.graveType}
              onChange={(e) => setFilters({ ...filters, graveType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Types</option>
              <option value="Single">Single</option>
              <option value="Double-Depth">Double-Depth</option>
              <option value="Family">Family</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {plots.length === 0 ? (
            <li>
              <div className="px-4 py-8 text-center text-gray-500">
                No available plots found.
              </div>
            </li>
          ) : (
            plots.map((plot) => (
              <li key={plot._id || plot.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {plot.uniqueIdentifier}
                      </div>
                      <div className="text-sm text-gray-500">
                        {plot.sectionId?.name || 'Unknown Section'} • {plot.graveType}
                        {plot.graveSize && ` • ${plot.graveSize}`}
                      </div>
                    </div>
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Available
                    </span>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}


