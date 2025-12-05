import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function UndertakerProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    registrationNumber: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    certificateOfCompetence: '',
    certificateExpiryDate: '',
    dhaDesignationNumber: '',
    businessLicense: '',
    businessLicenseExpiryDate: '',
    taxRegistrationNumber: '',
    taxRegistrationExpiryDate: '',
    associationMembershipProof: '',
    associationMembershipExpiryDate: '',
    notes: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/undertaker/profile');
      setProfile(response.data);
      const data = response.data;
      setFormData({
        businessName: data.businessName || '',
        registrationNumber: data.registrationNumber || '',
        contactPerson: data.contactPerson || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        certificateOfCompetence: data.certificateOfCompetence || '',
        certificateExpiryDate: data.certificateExpiryDate ? new Date(data.certificateExpiryDate).toISOString().split('T')[0] : '',
        dhaDesignationNumber: data.dhaDesignationNumber || '',
        businessLicense: data.businessLicense || '',
        businessLicenseExpiryDate: data.businessLicenseExpiryDate ? new Date(data.businessLicenseExpiryDate).toISOString().split('T')[0] : '',
        taxRegistrationNumber: data.taxRegistrationNumber || '',
        taxRegistrationExpiryDate: data.taxRegistrationExpiryDate ? new Date(data.taxRegistrationExpiryDate).toISOString().split('T')[0] : '',
        associationMembershipProof: data.associationMembershipProof || '',
        associationMembershipExpiryDate: data.associationMembershipExpiryDate ? new Date(data.associationMembershipExpiryDate).toISOString().split('T')[0] : '',
        notes: data.notes || '',
      });
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/undertaker/profile', formData);
      alert('Profile updated successfully');
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading profile...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Profile</h1>
      
      {/* Document Validation Status */}
      {profile?.documentValidation && (
        <div className={`mb-6 p-4 rounded-lg ${
          profile.documentValidation.isValid 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <h3 className={`font-semibold mb-2 ${
            profile.documentValidation.isValid ? 'text-green-800' : 'text-red-800'
          }`}>
            {profile.documentValidation.isValid 
              ? '✓ All Required Documents Valid' 
              : '⚠️ Document Validation Issues'}
          </h3>
          {!profile.documentValidation.isValid && (
            <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
              {profile.documentValidation.errors.map((error, idx) => (
                <li key={idx}>{error}</li>
              ))}
            </ul>
          )}
          <p className="text-sm mt-2 text-gray-600">
            All documents must be valid and not expired to create bookings.
          </p>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Business Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Registration Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Person *
                </label>
                <input
                  type="text"
                  required
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Required Documents for Booking</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Certificate of Competence (CoC) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.certificateOfCompetence}
                  onChange={(e) => setFormData({ ...formData, certificateOfCompetence: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="CoC Number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CoC Expiry Date
                </label>
                <input
                  type="date"
                  value={formData.certificateExpiryDate}
                  onChange={(e) => setFormData({ ...formData, certificateExpiryDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  DHA Designation Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.dhaDesignationNumber}
                  onChange={(e) => setFormData({ ...formData, dhaDesignationNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="DHA Designation Number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business License *
                </label>
                <input
                  type="text"
                  required
                  value={formData.businessLicense}
                  onChange={(e) => setFormData({ ...formData, businessLicense: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Business License Number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business License Expiry Date
                </label>
                <input
                  type="date"
                  value={formData.businessLicenseExpiryDate}
                  onChange={(e) => setFormData({ ...formData, businessLicenseExpiryDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tax Registration Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.taxRegistrationNumber}
                  onChange={(e) => setFormData({ ...formData, taxRegistrationNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Tax Registration Number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tax Registration Expiry Date
                </label>
                <input
                  type="date"
                  value={formData.taxRegistrationExpiryDate}
                  onChange={(e) => setFormData({ ...formData, taxRegistrationExpiryDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Association Membership Proof *
                </label>
                <input
                  type="text"
                  required
                  value={formData.associationMembershipProof}
                  onChange={(e) => setFormData({ ...formData, associationMembershipProof: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Membership Number or Document Reference"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Association Membership Expiry Date
                </label>
                <input
                  type="date"
                  value={formData.associationMembershipExpiryDate}
                  onChange={(e) => setFormData({ ...formData, associationMembershipExpiryDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Additional notes..."
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


