import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { PlusIcon, PencilIcon } from '@heroicons/react/24/outline';

export default function UndertakerBookings() {
  const [bookings, setBookings] = useState([]);
  const [cemeteries, setCemeteries] = useState([]);
  const [deceased, setDeceased] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    cemeteryId: '',
    plotId: '',
    crematoriumId: '',
    deceasedId: '',
    requestedDate: new Date().toISOString().split('T')[0],
    requestedTime: '10:00',
    serviceDuration: 60,
    serviceType: 'Burial',
  });

  useEffect(() => {
    fetchBookings();
    fetchCemeteries();
    fetchDeceased();
  }, [searchParams]);

  const fetchBookings = async () => {
    try {
      const status = searchParams.get('status');
      const response = await api.get(`/undertaker/bookings${status ? `?status=${status}` : ''}`);
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
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

  const fetchDeceased = async () => {
    try {
      // Undertakers can view all deceased records to create bookings
      const response = await api.get('/deceased');
      setDeceased(response.data);
    } catch (error) {
      console.error('Error fetching deceased:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBooking) {
        await api.put(`/undertaker/bookings/${editingBooking._id || editingBooking.id}`, formData);
      } else {
        await api.post('/undertaker/bookings', formData);
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
      cemeteryId: booking.cemeteryId?._id || booking.cemeteryId || '',
      plotId: booking.plotId?._id || booking.plotId || '',
      crematoriumId: booking.crematoriumId?._id || booking.crematoriumId || '',
      deceasedId: booking.deceasedId?._id || booking.deceasedId || '',
      requestedDate: booking.requestedDate ? new Date(booking.requestedDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      requestedTime: booking.requestedTime || '10:00',
      serviceDuration: booking.serviceDuration || 60,
      serviceType: booking.serviceType || 'Burial',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      cemeteryId: '',
      plotId: '',
      crematoriumId: '',
      deceasedId: '',
      requestedDate: new Date().toISOString().split('T')[0],
      requestedTime: '10:00',
      serviceDuration: 60,
      serviceType: 'Burial',
    });
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
        <button
          onClick={() => {
            resetForm();
            setEditingBooking(null);
            setShowForm(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Booking
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingBooking ? 'Edit Booking' : 'Create New Booking'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Type *
                </label>
                <select
                  required
                  value={formData.serviceType}
                  onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="Burial">Burial</option>
                  <option value="Cremation">Cremation</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cemetery *
                </label>
                <select
                  required
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
              {formData.serviceType === 'Burial' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plot ID (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.plotId}
                    onChange={(e) => setFormData({ ...formData, plotId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Plot ID if known"
                  />
                </div>
              )}
              {formData.serviceType === 'Cremation' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Crematorium ID (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.crematoriumId}
                    onChange={(e) => setFormData({ ...formData, crematoriumId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Crematorium ID if known"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deceased *
                </label>
                <div className="flex space-x-2">
                  <select
                    required
                    value={formData.deceasedId}
                    onChange={(e) => setFormData({ ...formData, deceasedId: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select Deceased</option>
                    {deceased.map((dec) => (
                      <option key={dec._id || dec.id} value={dec._id || dec.id}>
                        {dec.fullName} - {dec.idNumber}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => window.open('/undertaker/deceased/new', '_blank')}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
                  >
                    + New
                  </button>
                </div>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Duration (minutes)
                </label>
                <input
                  type="number"
                  value={formData.serviceDuration}
                  onChange={(e) => setFormData({ ...formData, serviceDuration: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  min="30"
                  step="15"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingBooking(null);
                  resetForm();
                }}
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

      {/* Bookings List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {bookings.length === 0 ? (
            <li>
              <div className="px-4 py-8 text-center text-gray-500">
                No bookings found.
              </div>
            </li>
          ) : (
            bookings.map((booking) => (
              <li key={booking._id || booking.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.confirmationNumber || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {booking.cemeteryId?.name || 'Unknown Cemetery'} • {booking.deceasedId?.fullName || 'Unknown'}
                        {booking.requestedDate && ` • ${new Date(booking.requestedDate).toLocaleDateString()} at ${booking.requestedTime}`}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          booking.status === 'Confirmed'
                            ? 'bg-green-100 text-green-800'
                            : booking.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : booking.status === 'Completed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {booking.status}
                      </span>
                      {booking.status !== 'Completed' && (
                        <button
                          onClick={() => handleEdit(booking)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <PencilIcon className="h-5 w-5" />
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

