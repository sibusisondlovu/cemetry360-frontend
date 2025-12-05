import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function UndertakerTariffs() {
  const [tariffs, setTariffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchTariffs();
  }, []);

  const fetchTariffs = async () => {
    try {
      const response = await api.get('/undertaker/tariffs');
      setTariffs(response.data);
    } catch (error) {
      console.error('Error fetching tariffs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const filteredTariffs = filter
    ? tariffs.filter(t => t.serviceType.toLowerCase().includes(filter.toLowerCase()))
    : tariffs;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Service Tariffs</h1>
        <input
          type="text"
          placeholder="Filter by service type..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredTariffs.length === 0 ? (
            <li>
              <div className="px-4 py-8 text-center text-gray-500">
                No tariffs found.
              </div>
            </li>
          ) : (
            filteredTariffs.map((tariff) => (
              <li key={tariff._id || tariff.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {tariff.serviceName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {tariff.serviceType} • {tariff.customerCategory}
                        {tariff.effectiveDate && ` • Effective: ${new Date(tariff.effectiveDate).toLocaleDateString()}`}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        R {tariff.amount?.toFixed(2) || '0.00'}
                      </div>
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


