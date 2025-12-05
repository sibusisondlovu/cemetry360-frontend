import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { MagnifyingGlassIcon, PlusIcon, PencilIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function Burials() {
  const [burials, setBurials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBurials, setFilteredBurials] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBurial, setEditingBurial] = useState(null);
  const [deceased, setDeceased] = useState([]);
  const [cemeteries, setCemeteries] = useState([]);
  const [plots, setPlots] = useState([]);
  const [crematoriums, setCrematoriums] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [formData, setFormData] = useState({
    deceasedId: '',
    bookingId: '',
    cemeteryId: '',
    plotId: '',
    crematoriumId: '',
    burialDate: new Date().toISOString().split('T')[0],
    burialTime: '',
    serviceType: 'Burial',
    funeralType: 'Private',
    officiatingOfficer: '',
    undertakerName: '',
    urnStorageLocation: '',
    scatteringLocation: '',
    notes: '',
  });

  useEffect(() => {
    fetchBurials();
    fetchDeceased();
    fetchCemeteries();
  }, []);

  useEffect(() => {
    if (formData.cemeteryId) {
      fetchPlots(formData.cemeteryId);
      fetchCrematoriums(formData.cemeteryId);
    } else {
      setPlots([]);
      setCrematoriums([]);
    }
  }, [formData.cemeteryId]);

  useEffect(() => {
    if (formData.deceasedId) {
      fetchBookingsForDeceased(formData.deceasedId);
    } else {
      setBookings([]);
    }
  }, [formData.deceasedId]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredBurials(burials);
    } else {
      const filtered = burials.filter((burial) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          burial.deceased?.fullName?.toLowerCase().includes(searchLower) ||
          burial.burialNumber?.toLowerCase().includes(searchLower) ||
          burial.confirmationNumber?.toLowerCase().includes(searchLower) ||
          burial.serviceType?.toLowerCase().includes(searchLower) ||
          burial.cemeteryId?.name?.toLowerCase().includes(searchLower) ||
          burial.plotId?.uniqueIdentifier?.toLowerCase().includes(searchLower) ||
          burial.crematoriumId?.name?.toLowerCase().includes(searchLower) ||
          burial.undertakerName?.toLowerCase().includes(searchLower) ||
          burial.notes?.toLowerCase().includes(searchLower)
        );
      });
      setFilteredBurials(filtered);
    }
  }, [searchTerm, burials]);

  const fetchBurials = async () => {
    try {
      setLoading(true);
      const response = await api.get('/burials');
      setBurials(response.data);
      setFilteredBurials(response.data);
    } catch (error) {
      console.error('Error fetching burials:', error);
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

  const fetchBookingsForDeceased = async (deceasedId) => {
    try {
      const response = await api.get(`/bookings?deceasedId=${deceasedId}`);
      const activeBookings = response.data.filter(b => 
        b.status === 'Pending' || b.status === 'Confirmed'
      );
      setBookings(activeBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    }
  };

  const handleBookingSelect = (bookingId) => {
    if (!bookingId) {
      return;
    }
    const booking = bookings.find(b => (b._id || b.id) === bookingId);
    if (booking) {
      setFormData(prev => ({
        ...prev,
        bookingId: bookingId,
        cemeteryId: booking.cemeteryId?._id || booking.cemeteryId || prev.cemeteryId,
        plotId: booking.plotId?._id || booking.plotId || prev.plotId,
        crematoriumId: booking.crematoriumId?._id || booking.crematoriumId || prev.crematoriumId,
        burialDate: booking.requestedDate ? new Date(booking.requestedDate).toISOString().split('T')[0] : prev.burialDate,
        burialTime: booking.requestedTime || prev.burialTime,
        undertakerName: booking.undertakerName || prev.undertakerName,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBurial) {
        await api.put(`/burials/${editingBurial._id || editingBurial.id}`, formData);
        alert('Burial event updated successfully');
      } else {
        await api.post('/burials', formData);
        alert('Burial event created successfully');
      }
      setShowForm(false);
      setEditingBurial(null);
      resetForm();
      fetchBurials();
    } catch (error) {
      console.error('Error saving burial event:', error);
      alert(error.response?.data?.error || 'Failed to save burial event');
    }
  };

  const handleEdit = (burial) => {
    setEditingBurial(burial);
    setFormData({
      deceasedId: burial.deceasedId?._id || burial.deceasedId || '',
      bookingId: burial.bookingId?._id || burial.bookingId || '',
      cemeteryId: burial.cemeteryId?._id || burial.cemeteryId || '',
      plotId: burial.plotId?._id || burial.plotId || '',
      crematoriumId: burial.crematoriumId?._id || burial.crematoriumId || '',
      burialDate: burial.burialDate ? new Date(burial.burialDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      burialTime: burial.burialTime || '',
      serviceType: burial.serviceType || 'Burial',
      funeralType: burial.funeralType || 'Private',
      officiatingOfficer: burial.officiatingOfficer || '',
      undertakerName: burial.undertakerName || '',
      urnStorageLocation: burial.urnStorageLocation || '',
      scatteringLocation: burial.scatteringLocation || '',
      notes: burial.notes || '',
    });
    setShowForm(true);
  };

  const handleConfirm = async (burialId) => {
    if (!window.confirm('Confirm this burial event?')) return;
    try {
      await api.post(`/burials/${burialId}/confirm`);
      alert('Burial event confirmed successfully');
      fetchBurials();
    } catch (error) {
      console.error('Error confirming burial event:', error);
      alert(error.response?.data?.error || 'Failed to confirm burial event');
    }
  };

  const resetForm = () => {
    setFormData({
      deceasedId: '',
      bookingId: '',
      cemeteryId: '',
      plotId: '',
      crematoriumId: '',
      burialDate: new Date().toISOString().split('T')[0],
      burialTime: '',
      serviceType: 'Burial',
      funeralType: 'Private',
      officiatingOfficer: '',
      undertakerName: '',
      urnStorageLocation: '',
      scatteringLocation: '',
      notes: '',
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingBurial(null);
    resetForm();
  };

  const handleNewBurial = () => {
    setEditingBurial(null);
    resetForm();
    setShowForm(true);
  };

  if (loading && burials.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading burials...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Burial Events</h1>
        <button
          onClick={handleNewBurial}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Burial Event
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
              placeholder="Search by deceased name, burial number, confirmation number, service type, cemetery, plot, crematorium, undertaker, or notes..."
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
            Found {filteredBurials.length} burial(s) matching "{searchTerm}"
          </p>
        )}
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {editingBurial ? 'Edit Burial Event' : 'Create New Burial Event'}
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
                  onChange={(e) => setFormData({ ...formData, deceasedId: e.target.value, bookingId: '' })}
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
              {formData.deceasedId && bookings.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Link to Booking (Optional)
                  </label>
                  <select
                    value={formData.bookingId}
                    onChange={(e) => handleBookingSelect(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">No booking link</option>
                    {bookings.map((booking) => (
                      <option key={booking._id || booking.id} value={booking._id || booking.id}>
                        {booking.confirmationNumber || 'Booking'} - {new Date(booking.requestedDate).toLocaleDateString()} ({booking.status})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Selecting a booking will auto-fill cemetery, plot, date, and time</p>
                </div>
              )}
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
                  <option value="Burial">Burial</option>
                  <option value="Cremation">Cremation</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cemetery
                </label>
                <select
                  value={formData.cemeteryId}
                  onChange={(e) => setFormData({ ...formData, cemeteryId: e.target.value, plotId: '', crematoriumId: '' })}
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
                  Funeral Type *
                </label>
                <select
                  required
                  value={formData.funeralType}
                  onChange={(e) => setFormData({ ...formData, funeralType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Pauper">Pauper</option>
                  <option value="Private">Private</option>
                  <option value="Municipal">Municipal</option>
                </select>
              </div>
              {formData.serviceType === 'Burial' && (
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
              )}
              {formData.serviceType === 'Cremation' && (
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
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Burial Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.burialDate}
                  onChange={(e) => setFormData({ ...formData, burialDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Burial Time
                </label>
                <input
                  type="time"
                  value={formData.burialTime}
                  onChange={(e) => setFormData({ ...formData, burialTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Officiating Officer
                </label>
                <input
                  type="text"
                  value={formData.officiatingOfficer}
                  onChange={(e) => setFormData({ ...formData, officiatingOfficer: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
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
              {formData.serviceType === 'Cremation' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Urn Storage Location
                    </label>
                    <input
                      type="text"
                      value={formData.urnStorageLocation}
                      onChange={(e) => setFormData({ ...formData, urnStorageLocation: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Scattering Location
                    </label>
                    <input
                      type="text"
                      value={formData.scatteringLocation}
                      onChange={(e) => setFormData({ ...formData, scatteringLocation: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}
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
                {editingBurial ? 'Update' : 'Create'} Burial Event
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredBurials.length === 0 ? (
            <li>
              <div className="px-4 py-8 text-center text-gray-500">
                {searchTerm ? 'No burials found matching your search.' : 'No burials found.'}
              </div>
            </li>
          ) : (
            filteredBurials.map((burial) => (
              <li key={burial._id || burial.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium text-gray-900">
                          {burial.deceased?.fullName || 'Unknown'}
                        </div>
                        {burial.burialNumber && (
                          <span className="text-xs font-mono text-purple-600 bg-purple-50 px-2 py-1 rounded">
                            {burial.burialNumber}
                          </span>
                        )}
                        {burial.confirmationNumber && (
                          <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            {burial.confirmationNumber}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        <span className="font-medium">{new Date(burial.burialDate).toLocaleDateString()}</span>
                        {burial.burialTime && <span className="ml-2">at {burial.burialTime}</span>}
                        {burial.cemeteryId?.name && <span className="ml-3">• {burial.cemeteryId.name}</span>}
                        {burial.plotId?.uniqueIdentifier && <span className="ml-3">• Plot: {burial.plotId.uniqueIdentifier}</span>}
                        {burial.crematoriumId?.name && <span className="ml-3">• Crematorium: {burial.crematoriumId.name}</span>}
                        {burial.serviceType && <span className="ml-3">• Type: {burial.serviceType}</span>}
                        {burial.undertakerName && <span className="ml-3">• Undertaker: {burial.undertakerName}</span>}
                      </div>
                      {burial.notes && (
                        <div className="text-xs text-gray-400 mt-1 italic">
                          {burial.notes}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {burial.confirmed ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Confirmed
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                      <button
                        onClick={() => handleEdit(burial)}
                        className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                      {!burial.confirmed && (
                        <button
                          onClick={() => handleConfirm(burial._id || burial.id)}
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
