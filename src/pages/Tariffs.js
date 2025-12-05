import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { authService } from '../services/authService';
import { hasPermission } from '../utils/rolePermissions';

export default function Tariffs() {
  const [tariffs, setTariffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = authService.getUser();
  const canManageTariffs = hasPermission(user?.role, 'canManageTariffs');

  useEffect(() => {
    fetchTariffs();
  }, []);

  const fetchTariffs = async () => {
    try {
      const response = await api.get('/tariffs');
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

  if (!canManageTariffs) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">
          You do not have permission to view tariffs. This page is restricted to Finance Users and Administrators.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Tariffs</h1>
      </div>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {tariffs.length === 0 ? (
            <li>
              <div className="px-4 py-8 text-center text-gray-500">
                No tariffs found.
              </div>
            </li>
          ) : (
            tariffs.map((tariff) => (
              <li key={tariff._id || tariff.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {tariff.serviceName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {tariff.serviceType} • {tariff.customerCategory}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        R {tariff.amount?.toFixed(2) || '0.00'}
                      </div>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          tariff.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {tariff.isActive ? 'Active' : 'Inactive'}
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
