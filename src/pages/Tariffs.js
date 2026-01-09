import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { authService } from '../services/authService';
import { hasPermission } from '../utils/rolePermissions';
import { PlusIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Tariffs() {
  const [tariffs, setTariffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTariff, setEditingTariff] = useState(null);
  const [formData, setFormData] = useState({
    serviceType: 'Grave Purchase',
    serviceName: '',
    amount: '',
    customerCategory: 'Resident',
    effectiveDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    isActive: true,
    description: '',
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTariff) {
        await api.put(`/tariffs/${editingTariff._id || editingTariff.id}`, formData);
        alert('Tariff updated successfully');
      } else {
        await api.post('/tariffs', formData);
        alert('Tariff created successfully');
      }
      setShowForm(false);
      setEditingTariff(null);
      resetForm();
      fetchTariffs();
    } catch (error) {
      console.error('Error saving tariff:', error);
      alert(error.response?.data?.error || 'Failed to save tariff');
    }
  };

  const handleEdit = (tariff) => {
    setEditingTariff(tariff);
    setFormData({
      serviceType: tariff.serviceType || 'Grave Purchase',
      serviceName: tariff.serviceName || '',
      amount: tariff.amount || '',
      customerCategory: tariff.customerCategory || 'Resident',
      effectiveDate: tariff.effectiveDate ? new Date(tariff.effectiveDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      expiryDate: tariff.expiryDate ? new Date(tariff.expiryDate).toISOString().split('T')[0] : '',
      isActive: tariff.isActive !== undefined ? tariff.isActive : true,
      description: tariff.description || '',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      serviceType: 'Grave Purchase',
      serviceName: '',
      amount: '',
      customerCategory: 'Resident',
      effectiveDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      isActive: true,
      description: '',
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTariff(null);
    resetForm();
  };

  const handleNewTariff = () => {
    setEditingTariff(null);
    resetForm();
    setShowForm(true);
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
        <button
          onClick={handleNewTariff}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Tariff
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {editingTariff ? 'Edit Tariff' : 'Create New Tariff'}
            </h2>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.serviceName}
                  onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Type *
                </label>
                <select
                  required
                  value={formData.serviceType}
                  onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Grave Purchase">Grave Purchase</option>
                  <option value="Burial Fee">Burial Fee</option>
                  <option value="Cremation Fee">Cremation Fee</option>
                  <option value="Exhumation">Exhumation</option>
                  <option value="Memorial Permit">Memorial Permit</option>
                  <option value="Re-interment">Re-interment</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (R) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Category *
                </label>
                <select
                  required
                  value={formData.customerCategory}
                  onChange={(e) => setFormData({ ...formData, customerCategory: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Resident">Resident</option>
                  <option value="Non-Resident">Non-Resident</option>
                  <option value="Indigent">Indigent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Effective Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.effectiveDate}
                  onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Active
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editingTariff ? 'Update' : 'Create'} Tariff
              </button>
            </div>
          </form>
        </div>
      )}

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
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">
                          R {tariff.amount?.toFixed(2) || '0.00'}
                        </div>
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tariff.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                            }`}
                        >
                          {tariff.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleEdit(tariff)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Edit"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
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
