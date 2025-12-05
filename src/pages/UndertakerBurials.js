import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function UndertakerBurials() {
  const [burials, setBurials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchBurials();
  }, [filter]);

  const fetchBurials = async () => {
    try {
      const response = await api.get(`/undertaker/burials${filter !== 'all' ? `?serviceType=${filter}` : ''}`);
      setBurials(response.data);
    } catch (error) {
      console.error('Error fetching burials:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Burials</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md"
        >
          <option value="all">All Services</option>
          <option value="Burial">Burials Only</option>
          <option value="Cremation">Cremations Only</option>
        </select>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {burials.length === 0 ? (
            <li>
              <div className="px-4 py-8 text-center text-gray-500">
                No burials found.
              </div>
            </li>
          ) : (
            burials.map((burial) => (
              <li key={burial._id || burial.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {burial.deceasedId?.fullName || 'Unknown'} - {burial.serviceType}
                      </div>
                      <div className="text-sm text-gray-500">
                        {burial.burialDate && new Date(burial.burialDate).toLocaleDateString()}
                        {burial.burialTime && ` at ${burial.burialTime}`}
                        {burial.plotId && ` • Plot: ${burial.plotId.uniqueIdentifier || 'N/A'}`}
                        {burial.crematorium && ` • Crematorium: ${burial.crematorium}`}
                      </div>
                    </div>
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        burial.confirmed
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {burial.confirmed ? 'Confirmed' : 'Pending'}
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


