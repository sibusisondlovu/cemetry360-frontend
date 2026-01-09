import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { MagnifyingGlassIcon, PlusIcon, PencilIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [deceased, setDeceased] = useState([]);
  const [cemeteries, setCemeteries] = useState([]);
  const [plots, setPlots] = useState([]);
  const [crematoriums, setCrematoriums] = useState([]);
  const [formData, setFormData] = useState({
    deceasedId: '',
    cemeteryId: '',
    plotId: '',
    crematoriumId: '',
    requestedDate: new Date().toISOString().split('T')[0],
    requestedTime: '',
    serviceDuration: 60,
    bufferMinutes: 30,
    status: 'Pending',
    undertakerName: '',
    notes: '',
  });

  useEffect(() => {
    fetchBookings();
    fetchDeceased();
    fetchCemeteries();
  }, []);

  useEffect(() => {
    if (formData.cemeteryId) {
      fetchPlots(formData.cemeteryId);
    } else {
      setPlots([]);
    }
  }, [formData.cemeteryId]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredBookings(bookings);
    } else {
      const filtered = bookings.filter((booking) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          booking.deceased?.fullName?.toLowerCase().includes(searchLower) ||
          booking.confirmationNumber?.toLowerCase().includes(searchLower) ||
          booking.status?.toLowerCase().includes(searchLower) ||
          booking.cemeteryId?.name?.toLowerCase().includes(searchLower) ||
          booking.plotId?.uniqueIdentifier?.toLowerCase().includes(searchLower) ||
          booking.crematoriumId?.name?.toLowerCase().includes(searchLower) ||
          booking.undertakerName?.toLowerCase().includes(searchLower) ||
          booking.notes?.toLowerCase().includes(searchLower)
        );
      });
      setFilteredBookings(filtered);
    }
  }, [searchTerm, bookings]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/bookings');
      setBookings(response.data);
      setFilteredBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
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

  const fetchCemeteries = async () => {
    try {
      const response = await api.get('/cemeteries');
      setCemeteries(response.data);
    } catch (error) {
      console.error('Error fetching cemeteries:', error);
    }
  };

  const fetchPlots = async (cemeteryId) => {
    try {
      const response = await api.get(`/plots?cemeteryId=${cemeteryId}`);
      setPlots(response.data);
    } catch (error) {
      console.error('Error fetching plots:', error);
    }
  };

  const fetchCrematoriums = async (cemeteryId) => {
    try {
      const response = await api.get(`/crematoriums${cemeteryId ? `?cemeteryId=${cemeteryId}` : ''}`);
      setCrematoriums(response.data);
    } catch (error) {
      console.error('Error fetching crematoriums:', error);
    }
  };

  useEffect(() => {
    if (formData.cemeteryId) {
      fetchCrematoriums(formData.cemeteryId);
    } else {
      setCrematoriums([]);
    }
  }, [formData.cemeteryId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        deceasedId: formData.deceasedId || null,
        cemeteryId: formData.cemeteryId || null,
        plotId: formData.plotId || null,
        crematoriumId: formData.crematoriumId || null,
      };

      if (editingBooking) {
        await api.put(`/bookings/${editingBooking._id || editingBooking.id}`, payload);
        alert('Booking updated successfully');
      } else {
        await api.post('/bookings', payload);
        alert('Booking created successfully');
      }
      setShowForm(false);
      setEditingBooking(null);
      resetForm();
      fetchBookings();
    } catch (error) {
      console.error('Error saving booking:', error);
      alert(error.response?.data?.error || 'Failed to save booking');
    }
  };

  const handleEdit = (booking) => {
    setEditingBooking(booking);
    setFormData({
      deceasedId: booking.deceasedId?._id || booking.deceasedId || '',
      cemeteryId: booking.cemeteryId?._id || booking.cemeteryId || '',
      plotId: booking.plotId?._id || booking.plotId || '',
      crematoriumId: booking.crematoriumId?._id || booking.crematoriumId || '',
      requestedDate: booking.requestedDate ? new Date(booking.requestedDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      requestedTime: booking.requestedTime || '',
      serviceDuration: booking.serviceDuration || 60,
      bufferMinutes: booking.bufferMinutes || 30,
      status: booking.status || 'Pending',
      undertakerName: booking.undertakerName || '',
      notes: booking.notes || '',
    });
    setShowForm(true);
  };

  const handleConfirm = async (bookingId) => {
    if (!window.confirm('Confirm this booking?')) return;
    try {
      await api.post(`/bookings/${bookingId}/confirm`);
      alert('Booking confirmed successfully');
      fetchBookings();
    } catch (error) {
      console.error('Error confirming booking:', error);
      alert(error.response?.data?.error || 'Failed to confirm booking');
    }
  };

  const resetForm = () => {
    setFormData({
      deceasedId: '',
      cemeteryId: '',
      plotId: '',
      crematoriumId: '',
      requestedDate: new Date().toISOString().split('T')[0],
      requestedTime: '',
      serviceDuration: 60,
      bufferMinutes: 30,
      status: 'Pending',
      undertakerName: '',
      notes: '',
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingBooking(null);
    resetForm();
  };

  const handleNewBooking = () => {
    setEditingBooking(null);
    resetForm();
    setShowForm(true);
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
        <button
          onClick={handleNewBooking}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Booking
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
              placeholder="Search by deceased name, confirmation number, status, cemetery, plot, crematorium, undertaker, or notes..."
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
            Found {filteredBookings.length} booking(s) matching "{searchTerm}"
          </p>
        )}
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {editingBooking ? 'Edit Booking' : 'Create New Booking'}
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
                  Cemetery *
                </label>
                <select
                  required
                  value={formData.cemeteryId}
                  onChange={(e) => setFormData({ ...formData, cemeteryId: e.target.value, plotId: '', crematoriumId: '' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select Cemetery</option>
                  {cemeteries.map((cemetery) => (
                    <option key={cemetery._id || cemetery.id} value={cemetery._id || cemetery.id}>
                      {cemetery.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plot
                </label>
                <select
                  value={formData.plotId}
                  onChange={(e) => setFormData({ ...formData, plotId: e.target.value, crematoriumId: '' })}
                  disabled={!formData.cemeteryId}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Select Plot (Optional)</option>
                  {plots.map((plot) => (
                    <option key={plot._id || plot.id} value={plot._id || plot.id}>
                      {plot.uniqueIdentifier} - {plot.status}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Crematorium
                </label>
                <select
                  value={formData.crematoriumId}
                  onChange={(e) => setFormData({ ...formData, crematoriumId: e.target.value, plotId: '' })}
                  disabled={!formData.cemeteryId}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Select Crematorium (Optional)</option>
                  {crematoriums.map((crematorium) => (
                    <option key={crematorium._id || crematorium.id} value={crematorium._id || crematorium.id}>
                      {crematorium.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Requested Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.requestedDate}
                  onChange={(e) => setFormData({ ...formData, requestedDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Requested Time *
                </label>
                <input
                  type="time"
                  required
                  value={formData.requestedTime}
                  onChange={(e) => setFormData({ ...formData, requestedTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Duration (minutes)
                </label>
                <input
                  type="number"
                  value={formData.serviceDuration}
                  onChange={(e) => setFormData({ ...formData, serviceDuration: parseInt(e.target.value) || 60 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  min="30"
                  step="15"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buffer Minutes
                </label>
                <input
                  type="number"
                  value={formData.bufferMinutes}
                  onChange={(e) => setFormData({ ...formData, bufferMinutes: parseInt(e.target.value) || 30 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  min="0"
                  step="15"
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
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Undertaker Name
                </label>
                <input
                  type="text"
                  value={formData.undertakerName}
                  onChange={(e) => setFormData({ ...formData, undertakerName: e.target.value })}
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
                {editingBooking ? 'Update' : 'Create'} Booking
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredBookings.length === 0 ? (
            <li>
              <div className="px-4 py-8 text-center text-gray-500">
                {searchTerm ? 'No bookings found matching your search.' : 'No bookings found.'}
              </div>
            </li>
          ) : (
            filteredBookings.map((booking) => (
              <li key={booking._id || booking.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium text-gray-900">
                          {booking.deceased?.fullName || 'Unknown'}
                        </div>
                        {booking.confirmationNumber && (
                          <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            {booking.confirmationNumber}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        <span className="font-medium">{new Date(booking.requestedDate).toLocaleDateString()}</span> at <span className="font-medium">{booking.requestedTime}</span>
                        {booking.cemeteryId?.name && <span className="ml-3">• {booking.cemeteryId.name}</span>}
                        {booking.plotId?.uniqueIdentifier && <span className="ml-3">• Plot: {booking.plotId.uniqueIdentifier}</span>}
                        {booking.crematoriumId?.name && <span className="ml-3">• Crematorium: {booking.crematoriumId.name}</span>}
                        {booking.undertakerName && <span className="ml-3">• Undertaker: {booking.undertakerName}</span>}
                      </div>
                      {booking.notes && (
                        <div className="text-xs text-gray-400 mt-1 italic">
                          {booking.notes}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${booking.status === 'Confirmed'
                            ? 'bg-green-100 text-green-800'
                            : booking.status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : booking.status === 'Completed'
                                ? 'bg-blue-100 text-blue-800'
                                : booking.status === 'Cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                          }`}
                      >
                        {booking.status}
                      </span>
                      <button
                        onClick={() => handleEdit(booking)}
                        className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                      {booking.status === 'Pending' && (
                        <button
                          onClick={() => handleConfirm(booking._id || booking.id)}
                          className="inline-flex items-center px-2 py-1 border border-transparent shadow-sm text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          Confirm
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
