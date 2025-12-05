import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { MapPinIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function Crematoriums() {
  const [crematoriums, setCrematoriums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCrematoriums, setFilteredCrematoriums] = useState([]);

  useEffect(() => {
    fetchCrematoriums();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCrematoriums(crematoriums);
    } else {
      const filtered = crematoriums.filter((crematorium) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          crematorium.name?.toLowerCase().includes(searchLower) ||
          crematorium.code?.toLowerCase().includes(searchLower) ||
          crematorium.address?.toLowerCase().includes(searchLower) ||
          crematorium.status?.toLowerCase().includes(searchLower) ||
          crematorium.cemeteryId?.name?.toLowerCase().includes(searchLower)
        );
      });
      setFilteredCrematoriums(filtered);
    }
  }, [searchTerm, crematoriums]);

  const fetchCrematoriums = async () => {
    try {
      setLoading(true);
      const response = await api.get('/crematoriums');
      setCrematoriums(response.data);
      setFilteredCrematoriums(response.data);
    } catch (error) {
      console.error('Error fetching crematoriums:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && crematoriums.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading crematoriums...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Crematoriums</h1>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, code, address, cemetery, or status..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Clear
            </button>
          )}
        </div>
        {searchTerm && (
          <p className="mt-2 text-sm text-gray-600">
            Found {filteredCrematoriums.length} crematorium(s) matching "{searchTerm}"
          </p>
        )}
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredCrematoriums.length === 0 ? (
            <li>
              <div className="px-4 py-8 text-center text-gray-500">
                {searchTerm ? 'No crematoriums found matching your search.' : 'No crematoriums found.'}
              </div>
            </li>
          ) : (
            filteredCrematoriums.map((crematorium) => (
              <li key={crematorium._id || crematorium.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {crematorium.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {crematorium.code} • {crematorium.address}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {crematorium.cemeteryId?.name || 'Unknown Cemetery'} • Capacity: {crematorium.capacity}
                        </div>
                        {crematorium.gpsLatitude && crematorium.gpsLongitude && (
                          <div className="text-xs text-gray-400 mt-1">
                            📍 {crematorium.gpsLatitude.toFixed(6)}, {crematorium.gpsLongitude.toFixed(6)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 flex items-center space-x-2">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          crematorium.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : crematorium.status === 'Inactive'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {crematorium.status}
                      </span>
                    </div>
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

