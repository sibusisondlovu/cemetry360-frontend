import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { MagnifyingGlassIcon, PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Crematoriums() {
  const [crematoriums, setCrematoriums] = useState([]);
  const [cemeteries, setCemeteries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCrematoriums, setFilteredCrematoriums] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCrematorium, setEditingCrematorium] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    cemeteryId: '',
    address: '',
    gpsLatitude: '',
    gpsLongitude: '',
    capacity: 1,
    status: 'Active',
  });

  useEffect(() => {
    fetchCrematoriums();
    fetchCemeteries();
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

  const fetchCemeteries = async () => {
    try {
      const response = await api.get('/cemeteries');
      setCemeteries(response.data);
    } catch (error) {
      console.error('Error fetching cemeteries:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        cemeteryId: formData.cemeteryId || null,
      };

      if (editingCrematorium) {
        await api.put(`/crematoriums/${editingCrematorium._id || editingCrematorium.id}`, payload);
        alert('Crematorium updated successfully');
      } else {
        await api.post('/crematoriums', payload);
        alert('Crematorium created successfully');
      }
      setShowForm(false);
      setEditingCrematorium(null);
      resetForm();
      fetchCrematoriums();
    } catch (error) {
      console.error('Error saving crematorium:', error);
      alert(error.response?.data?.error || 'Failed to save crematorium');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this crematorium?')) return;
    try {
      await api.delete(`/crematoriums/${id}`);
      alert('Crematorium deleted successfully');
      fetchCrematoriums();
    } catch (error) {
      console.error('Error deleting crematorium:', error);
      alert(error.response?.data?.error || 'Failed to delete crematorium');
    }
  };

  const handleEdit = (crematorium) => {
    setEditingCrematorium(crematorium);
    setFormData({
      name: crematorium.name || '',
      code: crematorium.code || '',
      cemeteryId: crematorium.cemeteryId?._id || crematorium.cemeteryId || '',
      address: crematorium.address || '',
      gpsLatitude: crematorium.gpsLatitude || '',
      gpsLongitude: crematorium.gpsLongitude || '',
      capacity: crematorium.capacity || 1,
      status: crematorium.status || 'Active',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      cemeteryId: '',
      address: '',
      gpsLatitude: '',
      gpsLongitude: '',
      capacity: 1,
      status: 'Active',
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCrematorium(null);
    resetForm();
  };

  const handleNewCrematorium = () => {
    setEditingCrematorium(null);
    resetForm();
    setShowForm(true);
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
        <button
          onClick={handleNewCrematorium}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Crematorium
        </button>
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

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {editingCrematorium ? 'Edit Crematorium' : 'Create New Crematorium'}
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
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cemetery
                </label>
                <select
                  value={formData.cemeteryId}
                  onChange={(e) => setFormData({ ...formData, cemeteryId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select Cemetery (Optional)</option>
                  {cemeteries.map((cemetery) => (
                    <option key={cemetery._id || cemetery.id} value={cemetery._id || cemetery.id}>
                      {cemetery.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacity
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GPS Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.gpsLatitude}
                  onChange={(e) => setFormData({ ...formData, gpsLatitude: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GPS Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.gpsLongitude}
                  onChange={(e) => setFormData({ ...formData, gpsLongitude: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
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
                {editingCrematorium ? 'Update' : 'Create'} Crematorium
              </button>
            </div>
          </form>
        </div>
      )}

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
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${crematorium.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : crematorium.status === 'Inactive'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                      >
                        {crematorium.status}
                      </span>
                      <button
                        onClick={() => handleEdit(crematorium)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Edit"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(crematorium._id || crematorium.id)}
                        className="p-1 text-red-400 hover:text-red-600"
                        title="Delete"
                      >
                        <TrashIcon className="h-5 w-5" />
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

