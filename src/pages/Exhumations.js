import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { MagnifyingGlassIcon, PlusIcon, PencilIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function Exhumations() {
  const [exhumations, setExhumations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredExhumations, setFilteredExhumations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingExhumation, setEditingExhumation] = useState(null);
  const [deceased, setDeceased] = useState([]);
  const [plots, setPlots] = useState([]);
  const [newPlots, setNewPlots] = useState([]);
  const [formData, setFormData] = useState({
    plotId: '',
    deceasedId: '',
    applicationDate: new Date().toISOString().split('T')[0],
    reason: '',
    exhumationDate: '',
    exhumationTime: '',
    witnesses: '',
    officials: '',
    newBurialLocation: '',
    newPlotId: '',
    notes: '',
  });

  useEffect(() => {
    fetchExhumations();
    fetchDeceased();
  }, []);

  useEffect(() => {
    if (formData.plotId) {
      fetchPlotsForCemetery();
    }
  }, [formData.plotId]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredExhumations(exhumations);
    } else {
      const filtered = exhumations.filter((exhumation) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          exhumation.deceasedId?.fullName?.toLowerCase().includes(searchLower) ||
          exhumation.plotId?.uniqueIdentifier?.toLowerCase().includes(searchLower) ||
          exhumation.status?.toLowerCase().includes(searchLower) ||
          exhumation.reason?.toLowerCase().includes(searchLower) ||
          exhumation.newBurialLocation?.toLowerCase().includes(searchLower)
        );
      });
      setFilteredExhumations(filtered);
    }
  }, [searchTerm, exhumations]);

  const fetchExhumations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/exhumations');
      setExhumations(response.data);
      setFilteredExhumations(response.data);
    } catch (error) {
      console.error('Error fetching exhumations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeceased = async () => {
    try {
      const response = await api.get('/deceased');
      setDeceased(response.data);
    } catch (error) {
      console.error('Error fetching deceased:', error);
    }
  };

  const fetchPlotsForCemetery = async () => {
    try {
      // Fetch all plots for selection
      const response = await api.get('/plots');
      setPlots(response.data);
      setNewPlots(response.data);
    } catch (error) {
      console.error('Error fetching plots:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingExhumation) {
        await api.put(`/exhumations/${editingExhumation._id || editingExhumation.id}`, formData);
        alert('Exhumation application updated successfully');
      } else {
        await api.post('/exhumations', formData);
        alert('Exhumation application created successfully');
      }
      setShowForm(false);
      setEditingExhumation(null);
      resetForm();
      fetchExhumations();
    } catch (error) {
      console.error('Error saving exhumation:', error);
      alert(error.response?.data?.error || 'Failed to save exhumation application');
    }
  };

  const handleEdit = (exhumation) => {
    setEditingExhumation(exhumation);
    setFormData({
      plotId: exhumation.plotId?._id || exhumation.plotId || '',
      deceasedId: exhumation.deceasedId?._id || exhumation.deceasedId || '',
      applicationDate: exhumation.applicationDate ? new Date(exhumation.applicationDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      reason: exhumation.reason || '',
      exhumationDate: exhumation.exhumationDate ? new Date(exhumation.exhumationDate).toISOString().split('T')[0] : '',
      exhumationTime: exhumation.exhumationTime || '',
      witnesses: exhumation.witnesses || '',
      officials: exhumation.officials || '',
      newBurialLocation: exhumation.newBurialLocation || '',
      newPlotId: exhumation.newPlotId?._id || exhumation.newPlotId || '',
      notes: exhumation.notes || '',
    });
    setShowForm(true);
  };

  const handleApprove = async (exhumationId, approvalType) => {
    if (!window.confirm(`Approve ${approvalType} for this exhumation?`)) return;
    try {
      const approvalData = {};
      if (approvalType === 'Health Officer') {
        approvalData.healthOfficerApproval = true;
      } else if (approvalType === 'Cemetery Manager') {
        approvalData.cemeteryManagerApproval = true;
      } else if (approvalType === 'Legal') {
        approvalData.legalApproval = true;
      }

      await api.post(`/exhumations/${exhumationId}/approve`, approvalData);
      alert('Approval recorded successfully');
      fetchExhumations();
    } catch (error) {
      console.error('Error approving exhumation:', error);
      alert(error.response?.data?.error || 'Failed to record approval');
    }
  };

  const handleComplete = async (exhumationId) => {
    if (!window.confirm('Mark this exhumation as completed? This will update the plot status.')) return;
    try {
      await api.put(`/exhumations/${exhumationId}`, { status: 'Completed' });
      
      // Fetch the exhumation to get plot ID
      const exhumation = exhumations.find(e => (e._id || e.id) === exhumationId);
      if (exhumation && exhumation.plotId) {
        // Update plot status to Re-usable after exhumation
        await api.put(`/plots/${exhumation.plotId._id || exhumation.plotId}`, {
          status: 'Re-usable',
          currentBurials: 0
        });
      }
      
      alert('Exhumation marked as completed and plot status updated');
      fetchExhumations();
    } catch (error) {
      console.error('Error completing exhumation:', error);
      alert(error.response?.data?.error || 'Failed to complete exhumation');
    }
  };

  const resetForm = () => {
    setFormData({
      plotId: '',
      deceasedId: '',
      applicationDate: new Date().toISOString().split('T')[0],
      reason: '',
      exhumationDate: '',
      exhumationTime: '',
      witnesses: '',
      officials: '',
      newBurialLocation: '',
      newPlotId: '',
      notes: '',
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingExhumation(null);
    resetForm();
  };

  const handleNewExhumation = () => {
    setEditingExhumation(null);
    resetForm();
    setShowForm(true);
  };

  if (loading && exhumations.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading exhumations...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Exhumation Applications</h1>
        <button
          onClick={handleNewExhumation}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Exhumation Application
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
              placeholder="Search by deceased name, plot identifier, status, reason, or new burial location..."
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
            Found {filteredExhumations.length} exhumation(s) matching "{searchTerm}"
          </p>
        )}
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {editingExhumation ? 'Edit Exhumation Application' : 'Create New Exhumation Application'}
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
                  Deceased *
                </label>
                <select
                  required
                  value={formData.deceasedId}
                  onChange={(e) => setFormData({ ...formData, deceasedId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select Deceased</option>
                  {deceased.map((person) => (
                    <option key={person._id || person.id} value={person._id || person.id}>
                      {person.fullName} {person.idNumber ? `(${person.idNumber})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Plot *
                </label>
                <select
                  required
                  value={formData.plotId}
                  onChange={(e) => setFormData({ ...formData, plotId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select Plot</option>
                  {plots.map((plot) => (
                    <option key={plot._id || plot.id} value={plot._id || plot.id}>
                      {plot.uniqueIdentifier} - {plot.cemetery?.name || 'Unknown Cemetery'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Application Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.applicationDate}
                  onChange={(e) => setFormData({ ...formData, applicationDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason *
                </label>
                <input
                  type="text"
                  required
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Reason for exhumation"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exhumation Date
                </label>
                <input
                  type="date"
                  value={formData.exhumationDate}
                  onChange={(e) => setFormData({ ...formData, exhumationDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exhumation Time
                </label>
                <input
                  type="time"
                  value={formData.exhumationTime}
                  onChange={(e) => setFormData({ ...formData, exhumationTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Burial Location
                </label>
                <input
                  type="text"
                  value={formData.newBurialLocation}
                  onChange={(e) => setFormData({ ...formData, newBurialLocation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Location for re-interment"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Plot (if re-interring)
                </label>
                <select
                  value={formData.newPlotId}
                  onChange={(e) => setFormData({ ...formData, newPlotId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select New Plot (Optional)</option>
                  {newPlots.map((plot) => (
                    <option key={plot._id || plot.id} value={plot._id || plot.id}>
                      {plot.uniqueIdentifier} - {plot.cemetery?.name || 'Unknown Cemetery'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Witnesses
                </label>
                <input
                  type="text"
                  value={formData.witnesses}
                  onChange={(e) => setFormData({ ...formData, witnesses: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Names of witnesses"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Officials
                </label>
                <input
                  type="text"
                  value={formData.officials}
                  onChange={(e) => setFormData({ ...formData, officials: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Names of officials present"
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
                {editingExhumation ? 'Update' : 'Create'} Application
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredExhumations.length === 0 ? (
            <li>
              <div className="px-4 py-8 text-center text-gray-500">
                {searchTerm ? 'No exhumations found matching your search.' : 'No exhumation applications found.'}
              </div>
            </li>
          ) : (
            filteredExhumations.map((exhumation) => (
              <li key={exhumation._id || exhumation.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium text-gray-900">
                          {exhumation.deceasedId?.fullName || 'Unknown'}
                        </div>
                        <span className="text-xs font-mono text-purple-600 bg-purple-50 px-2 py-1 rounded">
                          Plot: {exhumation.plotId?.uniqueIdentifier || 'N/A'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        <span>Application Date: {new Date(exhumation.applicationDate).toLocaleDateString()}</span>
                        {exhumation.exhumationDate && (
                          <span className="ml-3">• Exhumation: {new Date(exhumation.exhumationDate).toLocaleDateString()}</span>
                        )}
                        {exhumation.reason && <span className="ml-3">• Reason: {exhumation.reason}</span>}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                        <span className={exhumation.healthOfficerApproval ? 'text-green-600' : 'text-gray-400'}>
                          Health: {exhumation.healthOfficerApproval ? '✓' : '✗'}
                        </span>
                        <span className={exhumation.cemeteryManagerApproval ? 'text-green-600' : 'text-gray-400'}>
                          Manager: {exhumation.cemeteryManagerApproval ? '✓' : '✗'}
                        </span>
                        <span className={exhumation.legalApproval ? 'text-green-600' : 'text-gray-400'}>
                          Legal: {exhumation.legalApproval ? '✓' : '✗'}
                        </span>
                      </div>
                      {exhumation.notes && (
                        <div className="text-xs text-gray-400 mt-1 italic">
                          {exhumation.notes}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          exhumation.status === 'Approved'
                            ? 'bg-green-100 text-green-800'
                            : exhumation.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : exhumation.status === 'Rejected'
                            ? 'bg-red-100 text-red-800'
                            : exhumation.status === 'Completed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {exhumation.status}
                      </span>
                      <button
                        onClick={() => handleEdit(exhumation)}
                        className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                      {exhumation.status === 'Pending' && (
                        <>
                          {!exhumation.healthOfficerApproval && (
                            <button
                              onClick={() => handleApprove(exhumation._id || exhumation.id, 'Health Officer')}
                              className="inline-flex items-center px-2 py-1 border border-transparent shadow-sm text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircleIcon className="h-4 w-4 mr-1" />
                              Health
                            </button>
                          )}
                          {!exhumation.cemeteryManagerApproval && (
                            <button
                              onClick={() => handleApprove(exhumation._id || exhumation.id, 'Cemetery Manager')}
                              className="inline-flex items-center px-2 py-1 border border-transparent shadow-sm text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircleIcon className="h-4 w-4 mr-1" />
                              Manager
                            </button>
                          )}
                          {!exhumation.legalApproval && (
                            <button
                              onClick={() => handleApprove(exhumation._id || exhumation.id, 'Legal')}
                              className="inline-flex items-center px-2 py-1 border border-transparent shadow-sm text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircleIcon className="h-4 w-4 mr-1" />
                              Legal
                            </button>
                          )}
                        </>
                      )}
                      {exhumation.status === 'Approved' && (
                        <button
                          onClick={() => handleComplete(exhumation._id || exhumation.id)}
                          className="inline-flex items-center px-2 py-1 border border-transparent shadow-sm text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          Complete
                        </button>
                      )}
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

