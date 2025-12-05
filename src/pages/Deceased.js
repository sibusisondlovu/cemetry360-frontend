import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { MagnifyingGlassIcon, PlusIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Deceased() {
  const [deceased, setDeceased] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDeceased, setFilteredDeceased] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingDeceased, setEditingDeceased] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    alias: '',
    sex: 'Male',
    dateOfBirth: '',
    dateOfDeath: new Date().toISOString().split('T')[0],
    idNumber: '',
    passportNumber: '',
    nationality: 'South African',
    maritalStatus: 'Unknown',
    causeOfDeath: '',
    notes: '',
  });

  useEffect(() => {
    fetchDeceased();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredDeceased(deceased);
    } else {
      const filtered = deceased.filter((person) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          person.fullName?.toLowerCase().includes(searchLower) ||
          person.idNumber?.toLowerCase().includes(searchLower) ||
          person.alias?.toLowerCase().includes(searchLower) ||
          person.passportNumber?.toLowerCase().includes(searchLower)
        );
      });
      setFilteredDeceased(filtered);
    }
  }, [searchTerm, deceased]);

  const fetchDeceased = async () => {
    try {
      setLoading(true);
      const params = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
      const response = await api.get(`/deceased${params}`);
      setDeceased(response.data);
      setFilteredDeceased(response.data);
    } catch (error) {
      console.error('Error fetching deceased:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDeceased();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDeceased) {
        await api.put(`/deceased/${editingDeceased._id || editingDeceased.id}`, formData);
        alert('Deceased record updated successfully');
      } else {
        await api.post('/deceased', formData);
        alert('Deceased record created successfully');
      }
      setShowForm(false);
      setEditingDeceased(null);
      resetForm();
      fetchDeceased();
    } catch (error) {
      console.error('Error saving deceased record:', error);
      alert(error.response?.data?.error || 'Failed to save deceased record');
    }
  };

  const handleEdit = (person) => {
    setEditingDeceased(person);
    setFormData({
      fullName: person.fullName || '',
      alias: person.alias || '',
      sex: person.sex || 'Male',
      dateOfBirth: person.dateOfBirth ? new Date(person.dateOfBirth).toISOString().split('T')[0] : '',
      dateOfDeath: person.dateOfDeath ? new Date(person.dateOfDeath).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      idNumber: person.idNumber || '',
      passportNumber: person.passportNumber || '',
      nationality: person.nationality || 'South African',
      maritalStatus: person.maritalStatus || 'Unknown',
      causeOfDeath: person.causeOfDeath || '',
      notes: person.notes || '',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      alias: '',
      sex: 'Male',
      dateOfBirth: '',
      dateOfDeath: new Date().toISOString().split('T')[0],
      idNumber: '',
      passportNumber: '',
      nationality: 'South African',
      maritalStatus: 'Unknown',
      causeOfDeath: '',
      notes: '',
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingDeceased(null);
    resetForm();
  };

  const handleNewDeceased = () => {
    setEditingDeceased(null);
    resetForm();
    setShowForm(true);
  };

  if (loading && deceased.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading deceased records...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Deceased Records</h1>
        <button
          onClick={handleNewDeceased}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Deceased Record
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, ID number, alias, or passport number..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Search
          </button>
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                fetchDeceased();
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Clear
            </button>
          )}
        </form>
        {searchTerm && (
          <p className="mt-2 text-sm text-gray-600">
            Found {filteredDeceased.length} record(s) matching "{searchTerm}"
          </p>
        )}
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {editingDeceased ? 'Edit Deceased Record' : 'Create New Deceased Record'}
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
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alias
                </label>
                <input
                  type="text"
                  value={formData.alias}
                  onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sex
                </label>
                <select
                  value={formData.sex}
                  onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Death *
                </label>
                <input
                  type="date"
                  required
                  value={formData.dateOfDeath}
                  onChange={(e) => setFormData({ ...formData, dateOfDeath: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID Number
                </label>
                <input
                  type="text"
                  value={formData.idNumber}
                  onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="13-digit ID number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Passport Number
                </label>
                <input
                  type="text"
                  value={formData.passportNumber}
                  onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nationality
                </label>
                <input
                  type="text"
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marital Status
                </label>
                <select
                  value={formData.maritalStatus}
                  onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cause of Death
                </label>
                <input
                  type="text"
                  value={formData.causeOfDeath}
                  onChange={(e) => setFormData({ ...formData, causeOfDeath: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                {editingDeceased ? 'Update' : 'Create'} Record
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Results */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {filteredDeceased.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">
            {searchTerm ? 'No records found matching your search.' : 'No deceased records found.'}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredDeceased.map((person) => (
              <li key={person._id || person.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {person.fullName}
                        {person.alias && (
                          <span className="text-gray-500 ml-2">({person.alias})</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        <span>Date of Death: {new Date(person.dateOfDeath).toLocaleDateString()}</span>
                        {person.idNumber && <span className="ml-3">ID: {person.idNumber}</span>}
                        {person.passportNumber && <span className="ml-3">Passport: {person.passportNumber}</span>}
                        {person.nationality && <span className="ml-3">Nationality: {person.nationality}</span>}
                      </div>
                      {person.burials && person.burials.length > 0 && (
                        <div className="text-xs text-blue-600 mt-1">
                          {person.burials.length} burial record(s)
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(person)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

