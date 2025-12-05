import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { PlusIcon, PencilIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function Enquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [cemeteries, setCemeteries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEnquiry, setEditingEnquiry] = useState(null);
  const [resolvingEnquiry, setResolvingEnquiry] = useState(null);
  const [filters, setFilters] = useState({ status: '', category: '', cemeteryId: '' });
  const [formData, setFormData] = useState({
    complainantName: '',
    complainantContact: '',
    complainantEmail: '',
    cemeteryId: '',
    plotId: '',
    category: '',
    description: '',
    status: 'Open',
  });
  const [resolutionNotes, setResolutionNotes] = useState('');

  useEffect(() => {
    fetchEnquiries();
    fetchCemeteries();
  }, [filters]);

  const fetchEnquiries = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      if (filters.cemeteryId) params.append('cemeteryId', filters.cemeteryId);

      const response = await api.get(`/enquiries?${params.toString()}`);
      setEnquiries(response.data);
    } catch (error) {
      console.error('Error fetching enquiries:', error);
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
      if (editingEnquiry) {
        await api.put(`/enquiries/${editingEnquiry._id || editingEnquiry.id}`, formData);
      } else {
        await api.post('/enquiries', formData);
      }
      setShowForm(false);
      setEditingEnquiry(null);
      resetForm();
      fetchEnquiries();
    } catch (error) {
      console.error('Error saving enquiry:', error);
      alert(error.response?.data?.error || 'Failed to save enquiry');
    }
  };

  const handleEdit = (enquiry) => {
    setEditingEnquiry(enquiry);
    setFormData({
      complainantName: enquiry.complainantName || '',
      complainantContact: enquiry.complainantContact || '',
      complainantEmail: enquiry.complainantEmail || '',
      cemeteryId: enquiry.cemeteryId?._id || enquiry.cemeteryId || '',
      plotId: enquiry.plotId?._id || enquiry.plotId || '',
      category: enquiry.category || '',
      description: enquiry.description || '',
      status: enquiry.status || 'Open',
    });
    setShowForm(true);
  };

  const handleResolve = async () => {
    if (!resolutionNotes.trim()) {
      alert('Please provide resolution notes');
      return;
    }
    try {
      await api.post(`/enquiries/${resolvingEnquiry._id || resolvingEnquiry.id}/resolve`, {
        resolutionNotes,
      });
      setResolvingEnquiry(null);
      setResolutionNotes('');
      fetchEnquiries();
    } catch (error) {
      console.error('Error resolving enquiry:', error);
      alert(error.response?.data?.error || 'Failed to resolve enquiry');
    }
  };

  const resetForm = () => {
    setFormData({
      complainantName: '',
      complainantContact: '',
      complainantEmail: '',
      cemeteryId: '',
      plotId: '',
      category: '',
      description: '',
      status: 'Open',
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingEnquiry(null);
    resetForm();
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Enquiries & Complaints</h1>
        <button
          onClick={() => {
            resetForm();
            setEditingEnquiry(null);
            setShowForm(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Enquiry
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Status</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Categories</option>
              <option value="Overgrown Grave">Overgrown Grave</option>
              <option value="Missing Headstone">Missing Headstone</option>
              <option value="Incorrect Details">Incorrect Details</option>
              <option value="Access Issues">Access Issues</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cemetery</label>
            <select
              value={filters.cemeteryId}
              onChange={(e) => setFilters({ ...filters, cemeteryId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Cemeteries</option>
              {cemeteries.map((cem) => (
                <option key={cem._id || cem.id} value={cem._id || cem.id}>
                  {cem.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingEnquiry ? 'Edit Enquiry' : 'Create New Enquiry'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Complainant Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.complainantName}
                  onChange={(e) => setFormData({ ...formData, complainantName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Number
                </label>
                <input
                  type="text"
                  value={formData.complainantContact}
                  onChange={(e) => setFormData({ ...formData, complainantContact: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.complainantEmail}
                  onChange={(e) => setFormData({ ...formData, complainantEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cemetery
                </label>
                <select
                  value={formData.cemeteryId}
                  onChange={(e) => setFormData({ ...formData, cemeteryId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Cemetery</option>
                  {cemeteries.map((cem) => (
                    <option key={cem._id || cem.id} value={cem._id || cem.id}>
                      {cem.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Category</option>
                  <option value="Overgrown Grave">Overgrown Grave</option>
                  <option value="Missing Headstone">Missing Headstone</option>
                  <option value="Incorrect Details">Incorrect Details</option>
                  <option value="Access Issues">Access Issues</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Describe the enquiry or complaint..."
              />
            </div>
            <div className="flex justify-end space-x-3">
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
                {editingEnquiry ? 'Update' : 'Create'} Enquiry
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Resolve Modal */}
      {resolvingEnquiry && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-semibold mb-4">Resolve Enquiry</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resolution Notes *
              </label>
              <textarea
                required
                rows={4}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Describe how the enquiry was resolved..."
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setResolvingEnquiry(null);
                  setResolutionNotes('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleResolve}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Resolve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enquiries List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {enquiries.length === 0 ? (
            <li>
              <div className="px-4 py-8 text-center text-gray-500">
                No enquiries found.
              </div>
            </li>
          ) : (
            enquiries.map((enquiry) => (
              <li key={enquiry._id || enquiry.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {enquiry.referenceNumber || 'N/A'} - {enquiry.category}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        <strong>{enquiry.complainantName}</strong>
                        {enquiry.complainantContact && ` • ${enquiry.complainantContact}`}
                        {enquiry.complainantEmail && ` • ${enquiry.complainantEmail}`}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {enquiry.description?.substring(0, 120)}
                        {enquiry.description?.length > 120 && '...'}
                      </div>
                      {enquiry.resolvedDate && (
                        <div className="text-xs text-gray-400 mt-1">
                          Resolved: {new Date(enquiry.resolvedDate).toLocaleDateString()}
                          {enquiry.resolutionNotes && ` • ${enquiry.resolutionNotes.substring(0, 50)}...`}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          enquiry.status === 'Resolved'
                            ? 'bg-green-100 text-green-800'
                            : enquiry.status === 'In Progress'
                            ? 'bg-blue-100 text-blue-800'
                            : enquiry.status === 'Closed'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {enquiry.status}
                      </span>
                      {enquiry.status !== 'Resolved' && (
                        <button
                          onClick={() => setResolvingEnquiry(enquiry)}
                          className="p-1 text-green-600 hover:text-green-800"
                          title="Resolve"
                        >
                          <CheckCircleIcon className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(enquiry)}
                        className="p-1 text-blue-600 hover:text-blue-800"
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
