import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { MagnifyingGlassIcon, PlusIcon, PencilIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function ServiceCharges() {
  const [charges, setCharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCharges, setFilteredCharges] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCharge, setEditingCharge] = useState(null);
  const [tariffs, setTariffs] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [burials, setBurials] = useState([]);
  const [formData, setFormData] = useState({
    tariffId: '',
    bookingId: '',
    burialEventId: '',
    customerCategory: 'Resident',
    isExempt: false,
    exemptionReason: '',
  });

  useEffect(() => {
    fetchCharges();
    fetchTariffs();
    fetchBookings();
    fetchBurials();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCharges(charges);
    } else {
      const filtered = charges.filter((charge) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          charge.tariffId?.serviceName?.toLowerCase().includes(searchLower) ||
          charge.bookingId?.confirmationNumber?.toLowerCase().includes(searchLower) ||
          charge.customerCategory?.toLowerCase().includes(searchLower) ||
          charge.status?.toLowerCase().includes(searchLower) ||
          charge.paymentReference?.toLowerCase().includes(searchLower)
        );
      });
      setFilteredCharges(filtered);
    }
  }, [searchTerm, charges]);

  const fetchCharges = async () => {
    try {
      setLoading(true);
      const response = await api.get('/service-charges');
      setCharges(response.data);
      setFilteredCharges(response.data);
    } catch (error) {
      console.error('Error fetching service charges:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTariffs = async () => {
    try {
      const response = await api.get('/tariffs?active=true');
      setTariffs(response.data);
    } catch (error) {
      console.error('Error fetching tariffs:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings');
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchBurials = async () => {
    try {
      const response = await api.get('/burials');
      setBurials(response.data);
    } catch (error) {
      console.error('Error fetching burials:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCharge) {
        await api.put(`/service-charges/${editingCharge._id || editingCharge.id}`, formData);
        alert('Service charge updated successfully');
      } else {
        await api.post('/service-charges', formData);
        alert('Service charge created successfully');
      }
      setShowForm(false);
      setEditingCharge(null);
      resetForm();
      fetchCharges();
    } catch (error) {
      console.error('Error saving service charge:', error);
      alert(error.response?.data?.error || 'Failed to save service charge');
    }
  };

  const handleEdit = (charge) => {
    setEditingCharge(charge);
    setFormData({
      tariffId: charge.tariffId?._id || charge.tariffId || '',
      bookingId: charge.bookingId?._id || charge.bookingId || '',
      burialEventId: charge.burialEventId?._id || charge.burialEventId || '',
      customerCategory: charge.customerCategory || 'Resident',
      isExempt: charge.isExempt || false,
      exemptionReason: charge.exemptionReason || '',
    });
    setShowForm(true);
  };

  const handleRecordPayment = async (chargeId) => {
    const paymentRef = window.prompt('Enter payment reference number:');
    if (!paymentRef) return;

    try {
      await api.post(`/service-charges/${chargeId}/payment`, {
        paymentReference: paymentRef,
        paymentDate: new Date().toISOString().split('T')[0],
      });
      alert('Payment recorded successfully');
      fetchCharges();
    } catch (error) {
      console.error('Error recording payment:', error);
      alert(error.response?.data?.error || 'Failed to record payment');
    }
  };

  const resetForm = () => {
    setFormData({
      tariffId: '',
      bookingId: '',
      burialEventId: '',
      customerCategory: 'Resident',
      isExempt: false,
      exemptionReason: '',
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCharge(null);
    resetForm();
  };

  const handleNewCharge = () => {
    setEditingCharge(null);
    resetForm();
    setShowForm(true);
  };

  if (loading && charges.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading service charges...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Service Charges</h1>
        <button
          onClick={handleNewCharge}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Service Charge
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
              placeholder="Search by service name, booking number, customer category, status, or payment reference..."
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
            Found {filteredCharges.length} charge(s) matching "{searchTerm}"
          </p>
        )}
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {editingCharge ? 'Edit Service Charge' : 'Create New Service Charge'}
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
                  Tariff/Service *
                </label>
                <select
                  required
                  value={formData.tariffId}
                  onChange={(e) => setFormData({ ...formData, tariffId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select Tariff</option>
                  {tariffs.map((tariff) => (
                    <option key={tariff._id || tariff.id} value={tariff._id || tariff.id}>
                      {tariff.serviceName} - R{tariff.amount?.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Booking (Optional)
                </label>
                <select
                  value={formData.bookingId}
                  onChange={(e) => setFormData({ ...formData, bookingId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">No booking</option>
                  {bookings.map((booking) => (
                    <option key={booking._id || booking.id} value={booking._id || booking.id}>
                      {booking.confirmationNumber || 'Booking'} - {new Date(booking.requestedDate).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Burial Event (Optional)
                </label>
                <select
                  value={formData.burialEventId}
                  onChange={(e) => setFormData({ ...formData, burialEventId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">No burial event</option>
                  {burials.map((burial) => (
                    <option key={burial._id || burial.id} value={burial._id || burial.id}>
                      {burial.deceasedId?.fullName || 'Burial'} - {new Date(burial.burialDate).toLocaleDateString()}
                    </option>
                  ))}
                </select>
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
              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isExempt}
                    onChange={(e) => setFormData({ ...formData, isExempt: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Exempt from charges</span>
                </label>
              </div>
              {formData.isExempt && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exemption Reason *
                  </label>
                  <textarea
                    required={formData.isExempt}
                    value={formData.exemptionReason}
                    onChange={(e) => setFormData({ ...formData, exemptionReason: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Reason for exemption"
                  />
                </div>
              )}
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
                {editingCharge ? 'Update' : 'Create'} Charge
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredCharges.length === 0 ? (
            <li>
              <div className="px-4 py-8 text-center text-gray-500">
                {searchTerm ? 'No service charges found matching your search.' : 'No service charges found.'}
              </div>
            </li>
          ) : (
            filteredCharges.map((charge) => (
              <li key={charge._id || charge.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium text-gray-900">
                          {charge.tariffId?.serviceName || 'Unknown Service'}
                        </div>
                        <span className="text-xs font-mono text-purple-600 bg-purple-50 px-2 py-1 rounded">
                          R{charge.amount?.toFixed(2) || '0.00'}
                        </span>
                        {charge.isExempt && (
                          <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                            EXEMPT
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        <span>Category: {charge.customerCategory}</span>
                        {charge.bookingId && (
                          <span className="ml-3">• Booking: {charge.bookingId?.confirmationNumber || 'N/A'}</span>
                        )}
                        {charge.burialEventId && (
                          <span className="ml-3">• Burial Event: {charge.burialEventId?.burialNumber || 'N/A'}</span>
                        )}
                        {charge.paymentReference && (
                          <span className="ml-3">• Payment Ref: {charge.paymentReference}</span>
                        )}
                      </div>
                      {charge.exemptionReason && (
                        <div className="text-xs text-gray-400 mt-1 italic">
                          Exemption: {charge.exemptionReason}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          charge.status === 'Paid'
                            ? 'bg-green-100 text-green-800'
                            : charge.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {charge.status}
                      </span>
                      <button
                        onClick={() => handleEdit(charge)}
                        className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                      {charge.status === 'Pending' && (
                        <button
                          onClick={() => handleRecordPayment(charge._id || charge.id)}
                          className="inline-flex items-center px-2 py-1 border border-transparent shadow-sm text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          Record Payment
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

