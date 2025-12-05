import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { MagnifyingGlassIcon, PlusIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Owners() {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOwners, setFilteredOwners] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingOwner, setEditingOwner] = useState(null);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    idNumber: '',
    contactAddress: '',
    phone: '',
    email: '',
    ownershipType: 'Individual',
    nextOfKin: '',
    nextOfKinContact: '',
    alternateContact: '',
    notes: '',
  });

  useEffect(() => {
    fetchOwners();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredOwners(owners);
    } else {
      const filtered = owners.filter((owner) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          owner.name?.toLowerCase().includes(searchLower) ||
          owner.idNumber?.toLowerCase().includes(searchLower) ||
          owner.phone?.toLowerCase().includes(searchLower) ||
          owner.email?.toLowerCase().includes(searchLower) ||
          owner.contactAddress?.toLowerCase().includes(searchLower)
        );
      });
      setFilteredOwners(filtered);
    }
  }, [searchTerm, owners]);

  const fetchOwners = async () => {
    try {
      setLoading(true);
      const response = await api.get('/owners');
      setOwners(response.data);
      setFilteredOwners(response.data);
    } catch (error) {
      console.error('Error fetching owners:', error);
      alert(error.response?.data?.error || 'Failed to fetch owners');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingOwner) {
        await api.put(`/owners/${editingOwner._id || editingOwner.id}`, formData);
        alert('Owner updated successfully');
      } else {
        await api.post('/owners', formData);
        alert('Owner created successfully');
      }
      setShowForm(false);
      setEditingOwner(null);
      resetForm();
      fetchOwners();
    } catch (error) {
      console.error('Error saving owner:', error);
      alert(error.response?.data?.error || 'Failed to save owner');
    }
  };

  const handleEdit = (owner) => {
    setEditingOwner(owner);
    setFormData({
      name: owner.name || '',
      idNumber: owner.idNumber || '',
      contactAddress: owner.contactAddress || '',
      phone: owner.phone || '',
      email: owner.email || '',
      ownershipType: owner.ownershipType || 'Individual',
      nextOfKin: owner.nextOfKin || '',
      nextOfKinContact: owner.nextOfKinContact || '',
      alternateContact: owner.alternateContact || '',
      notes: owner.notes || '',
    });
    setShowForm(true);
    setSelectedOwner(null);
  };

  const handleView = async (owner) => {
    try {
      const response = await api.get(`/owners/${owner._id || owner.id}`);
      setSelectedOwner(response.data);
      setShowForm(false);
    } catch (error) {
      console.error('Error fetching owner details:', error);
      alert(error.response?.data?.error || 'Failed to fetch owner details');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      idNumber: '',
      contactAddress: '',
      phone: '',
      email: '',
      ownershipType: 'Individual',
      nextOfKin: '',
      nextOfKinContact: '',
      alternateContact: '',
      notes: '',
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingOwner(null);
    resetForm();
  };

  const handleNewOwner = () => {
    setEditingOwner(null);
    resetForm();
    setShowForm(true);
    setSelectedOwner(null);
  };

  if (loading && owners.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading owners...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Owners</h1>
        <button
          onClick={handleNewOwner}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Owner
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
              placeholder="Search by name, ID number, phone, email, or address..."
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
            Found {filteredOwners.length} owner(s) matching "{searchTerm}"
          </p>
        )}
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {editingOwner ? 'Edit Owner' : 'Create New Owner'}
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
                  Ownership Type *
                </label>
                <select
                  required
                  value={formData.ownershipType}
                  onChange={(e) => setFormData({ ...formData, ownershipType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Individual">Individual</option>
                  <option value="Family">Family</option>
                  <option value="Organization">Organization</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="+27 XX XXX XXXX"
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alternate Contact
                </label>
                <input
                  type="text"
                  value={formData.alternateContact}
                  onChange={(e) => setFormData({ ...formData, alternateContact: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Address
                </label>
                <textarea
                  value={formData.contactAddress}
                  onChange={(e) => setFormData({ ...formData, contactAddress: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Next of Kin
                </label>
                <input
                  type="text"
                  value={formData.nextOfKin}
                  onChange={(e) => setFormData({ ...formData, nextOfKin: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Next of Kin Contact
                </label>
                <input
                  type="text"
                  value={formData.nextOfKinContact}
                  onChange={(e) => setFormData({ ...formData, nextOfKinContact: e.target.value })}
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
                {editingOwner ? 'Update' : 'Create'} Owner
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Owner Details View */}
      {selectedOwner && !showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Owner Details</h2>
            <button
              onClick={() => setSelectedOwner(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <p className="mt-1 text-sm text-gray-900">{selectedOwner.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Ownership Type</label>
              <p className="mt-1 text-sm text-gray-900">{selectedOwner.ownershipType}</p>
            </div>
            {selectedOwner.idNumber && (
              <div>
                <label className="block text-sm font-medium text-gray-700">ID Number</label>
                <p className="mt-1 text-sm text-gray-900">{selectedOwner.idNumber}</p>
              </div>
            )}
            {selectedOwner.phone && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <p className="mt-1 text-sm text-gray-900">{selectedOwner.phone}</p>
              </div>
            )}
            {selectedOwner.email && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{selectedOwner.email}</p>
              </div>
            )}
            {selectedOwner.contactAddress && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Contact Address</label>
                <p className="mt-1 text-sm text-gray-900">{selectedOwner.contactAddress}</p>
              </div>
            )}
            {selectedOwner.nextOfKin && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Next of Kin</label>
                <p className="mt-1 text-sm text-gray-900">{selectedOwner.nextOfKin}</p>
              </div>
            )}
            {selectedOwner.nextOfKinContact && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Next of Kin Contact</label>
                <p className="mt-1 text-sm text-gray-900">{selectedOwner.nextOfKinContact}</p>
              </div>
            )}
            {selectedOwner.notes && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{selectedOwner.notes}</p>
              </div>
            )}
          </div>
          {selectedOwner.ownerships && selectedOwner.ownerships.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Ownerships ({selectedOwner.ownerships.length})</h3>
              <div className="space-y-3">
                {selectedOwner.ownerships.map((ownership) => (
                  <div key={ownership._id || ownership.id} className="bg-gray-50 p-4 rounded-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Plot: {ownership.plotId?.uniqueIdentifier || ownership.plotId?.plotNumber || 'N/A'}
                        </p>
                        {ownership.plotId?.cemetery && (
                          <p className="text-xs text-gray-500 mt-1">
                            {ownership.plotId.cemetery.name || ownership.plotId.cemetery}
                          </p>
                        )}
                        <p className="text-xs text-gray-600 mt-2">
                          Issue Date: {ownership.rightIssueDate ? new Date(ownership.rightIssueDate).toLocaleDateString() : 'N/A'}
                        </p>
                        {ownership.expiryDate && (
                          <p className="text-xs text-gray-600">
                            Expiry Date: {new Date(ownership.expiryDate).toLocaleDateString()}
                          </p>
                        )}
                        {ownership.validityPeriod && (
                          <p className="text-xs text-gray-600">
                            Validity: {ownership.validityPeriod} {ownership.validityUnit || 'years'}
                          </p>
                        )}
                      </div>
                      <span className={`px-2 py-1 text-xs rounded ${
                        ownership.isActive === false ? 'bg-gray-200 text-gray-700' : 'bg-green-100 text-green-800'
                      }`}>
                        {ownership.isActive === false ? 'Inactive' : 'Active'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => handleEdit(selectedOwner)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit Owner
            </button>
          </div>
        </div>
      )}

      {/* Owners List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {filteredOwners.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">
            {searchTerm ? 'No owners found matching your search.' : 'No owners found. Create your first owner to get started.'}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredOwners.map((owner) => (
              <li key={owner._id || owner.id} className="hover:bg-gray-50 transition-colors">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <button
                          onClick={() => handleView(owner)}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
                        >
                          {owner.name}
                        </button>
                        <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {owner.ownershipType}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {owner.phone && <span>{owner.phone}</span>}
                        {owner.email && (
                          <span className={owner.phone ? ' • ' : ''}>{owner.email}</span>
                        )}
                        {owner.ownerships && owner.ownerships.length > 0 && (
                          <span className="ml-2 text-blue-600">
                            • {owner.ownerships.length} plot{owner.ownerships.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      {owner.contactAddress && (
                        <div className="text-xs text-gray-400 mt-1 truncate max-w-2xl">
                          {owner.contactAddress}
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(owner)}
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
