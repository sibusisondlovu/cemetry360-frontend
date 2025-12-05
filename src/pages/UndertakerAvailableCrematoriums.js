import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function UndertakerAvailableCrematoriums() {
  const [crematoriums, setCrematoriums] = useState([]);
  const [cemeteries, setCemeteries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    cemeteryId: '',
    date: '',
    time: '',
  });

  useEffect(() => {
    fetchCemeteries();
  }, []);

  useEffect(() => {
    if (cemeteries.length > 0) {
      fetchCrematoriums();
    }
  }, [filters, cemeteries]);

  const fetchCrematoriums = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.cemeteryId) params.append('cemeteryId', filters.cemeteryId);
      if (filters.date) params.append('date', filters.date);
      if (filters.time) params.append('time', filters.time);

      const response = await api.get(`/undertaker/available-crematoriums?${params.toString()}`);
      setCrematoriums(response.data);
    } catch (error) {
      console.error('Error fetching crematoriums:', error);
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Available Crematoriums</h1>

      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Check Date</label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Check Time</label>
            <input
              type="time"
              value={filters.time}
              onChange={(e) => setFilters({ ...filters, time: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {crematoriums.length === 0 ? (
            <li>
              <div className="px-4 py-8 text-center text-gray-500">
                No crematoriums found.
              </div>
            </li>
          ) : (
            crematoriums.map((crem) => (
              <li key={crem._id || crem.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {crem.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {crem.cemeteryId?.name || 'Unknown Cemetery'} • Capacity: {crem.capacity}
                        {crem.operatingHours && ` • ${crem.operatingHours}`}
                      </div>
                      {crem.available !== undefined && (
                        <div className="text-xs text-gray-400 mt-1">
                          {crem.available ? 'Available' : `Booked (${crem.bookingsCount}/${crem.capacity})`}
                        </div>
                      )}
                    </div>
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        crem.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {crem.status}
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


