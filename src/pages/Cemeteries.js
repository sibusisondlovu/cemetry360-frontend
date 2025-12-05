import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { MapPinIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function Cemeteries() {
  const [cemeteries, setCemeteries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCemeteries, setFilteredCemeteries] = useState([]);

  useEffect(() => {
    fetchCemeteries();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCemeteries(cemeteries);
    } else {
      const filtered = cemeteries.filter((cemetery) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          cemetery.name?.toLowerCase().includes(searchLower) ||
          cemetery.code?.toLowerCase().includes(searchLower) ||
          cemetery.address?.toLowerCase().includes(searchLower) ||
          cemetery.status?.toLowerCase().includes(searchLower)
        );
      });
      setFilteredCemeteries(filtered);
    }
  }, [searchTerm, cemeteries]);

  const fetchCemeteries = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cemeteries');
      setCemeteries(response.data);
      setFilteredCemeteries(response.data);
    } catch (error) {
      console.error('Error fetching cemeteries:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && cemeteries.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading cemeteries...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Cemeteries</h1>
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
              placeholder="Search by name, code, address, or status..."
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
            Found {filteredCemeteries.length} cemetery(ies) matching "{searchTerm}"
          </p>
        )}
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredCemeteries.length === 0 ? (
            <li>
              <div className="px-4 py-8 text-center text-gray-500">
                {searchTerm ? 'No cemeteries found matching your search.' : 'No cemeteries found. Run the seed script to add demo data.'}
              </div>
            </li>
          ) : (
            filteredCemeteries.map((cemetery) => (
              <li key={cemetery._id || cemetery.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {cemetery.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {cemetery.code} • {cemetery.address}
                        </div>
                        {cemetery.gpsLatitude && cemetery.gpsLongitude && (
                          <div className="text-xs text-gray-400 mt-1">
                            📍 {cemetery.gpsLatitude.toFixed(6)}, {cemetery.gpsLongitude.toFixed(6)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 flex items-center space-x-2">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          cemetery.status === 'Open'
                            ? 'bg-green-100 text-green-800'
                            : cemetery.status === 'Full'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {cemetery.status}
                      </span>
                      <Link
                        to={`/cemeteries/${cemetery._id || cemetery.id}/map`}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        View Map
                      </Link>
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

