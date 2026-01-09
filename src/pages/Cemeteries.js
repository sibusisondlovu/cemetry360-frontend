import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { MapPinIcon, MagnifyingGlassIcon, PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Cemeteries() {
  const [cemeteries, setCemeteries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCemeteries, setFilteredCemeteries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCemetery, setEditingCemetery] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    gpsLatitude: '',
    gpsLongitude: '',
    status: 'Open',
    totalPlots: 0,
    contactNumber: '',
    email: '',
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCemetery) {
        await api.put(`/cemeteries/${editingCemetery._id || editingCemetery.id}`, formData);
        alert('Cemetery updated successfully');
      } else {
        await api.post('/cemeteries', formData);
        alert('Cemetery created successfully');
      }
      setShowForm(false);
      setEditingCemetery(null);
      resetForm();
      fetchCemeteries();
    } catch (error) {
      console.error('Error saving cemetery:', error);
      alert(error.response?.data?.error || 'Failed to save cemetery');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this cemetery?')) return;
    try {
      await api.delete(`/cemeteries/${id}`);
      alert('Cemetery deleted successfully');
      fetchCemeteries();
    } catch (error) {
      console.error('Error deleting cemetery:', error);
      alert(error.response?.data?.error || 'Failed to delete cemetery');
    }
  };

  const handleEdit = (cemetery) => {
    setEditingCemetery(cemetery);
    setFormData({
      name: cemetery.name || '',
      code: cemetery.code || '',
      address: cemetery.address || '',
      gpsLatitude: cemetery.gpsLatitude || '',
      gpsLongitude: cemetery.gpsLongitude || '',
      status: cemetery.status || 'Open',
      totalPlots: cemetery.totalPlots || 0,
      contactNumber: cemetery.contactNumber || '',
      email: cemetery.email || '',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      address: '',
      gpsLatitude: '',
      gpsLongitude: '',
      status: 'Open',
      totalPlots: 0,
      contactNumber: '',
      email: '',
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCemetery(null);
    resetForm();
  };

  const handleNewCemetery = () => {
    setEditingCemetery(null);
    resetForm();
    setShowForm(true);
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
        <button
          onClick={handleNewCemetery}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Cemetery
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

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {editingCemetery ? 'Edit Cemetery' : 'Create New Cemetery'}
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
                  <option value="Open">Open</option>
                  <option value="Full">Full</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Number
                </label>
                <input
                  type="text"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                {editingCemetery ? 'Update' : 'Create'} Cemetery
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredCemeteries.length === 0 ? (
            <li>
              <div className="px-4 py-8 text-center text-gray-500">
                {searchTerm ? 'No cemeteries found matching your search.' : 'No cemeteries found.'}
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
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${cemetery.status === 'Open'
                            ? 'bg-green-100 text-green-800'
                            : cemetery.status === 'Full'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                      >
                        {cemetery.status}
                      </span>
                      {/* Fixed View Map button */}
                      {(cemetery._id || cemetery.id) && (
                        <Link
                          to={`/cemeteries/${cemetery._id || cemetery.id}/map`}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <MapPinIcon className="h-4 w-4 mr-1" />
                          View Map
                        </Link>
                      )}
                      <button
                        onClick={() => handleEdit(cemetery)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Edit"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cemetery._id || cemetery.id)}
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

