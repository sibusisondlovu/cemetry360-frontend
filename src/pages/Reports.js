import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { authService } from '../services/authService';
import { hasPermission } from '../utils/rolePermissions';

export default function Reports() {
  const [reports, setReports] = useState({});
  const [loading, setLoading] = useState(true);
  const user = authService.getUser();
  const canViewRevenue = hasPermission(user?.role, 'canViewRevenue');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const [burialsRes, capacityRes, enquiriesRes, workOrdersRes] = await Promise.all([
        api.get('/reports/burials'),
        api.get('/reports/capacity'),
        api.get('/reports/enquiries'),
        api.get('/reports/work-orders'),
      ]);

      setReports({
        burials: burialsRes.data,
        capacity: capacityRes.data,
        enquiries: enquiriesRes.data,
        workOrders: workOrdersRes.data,
      });

      if (canViewRevenue) {
        try {
          const revenueRes = await api.get('/reports/revenue');
          setReports(prev => ({ ...prev, revenue: revenueRes.data }));
        } catch (error) {
          console.error('Error fetching revenue report:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading reports...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Reports & Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Burial Statistics */}
        {reports.burials && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Burial Statistics</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Burials:</span>
                <span className="font-semibold">{reports.burials.total || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>This Month:</span>
                <span className="font-semibold">{reports.burials.thisMonth || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>This Year:</span>
                <span className="font-semibold">{reports.burials.thisYear || 0}</span>
              </div>
            </div>
          </div>
        )}

        {/* Capacity Report */}
        {reports.capacity && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Capacity Report</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Plots:</span>
                <span className="font-semibold">{reports.capacity.total || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Available:</span>
                <span className="font-semibold text-green-600">{reports.capacity.available || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Occupied:</span>
                <span className="font-semibold text-red-600">{reports.capacity.occupied || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Utilization:</span>
                <span className="font-semibold">{reports.capacity.utilizationRate || '0%'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Enquiry Statistics */}
        {reports.enquiries && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Enquiry Statistics</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Enquiries:</span>
                <span className="font-semibold">{reports.enquiries.total || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Open:</span>
                <span className="font-semibold text-yellow-600">{reports.enquiries.open || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>In Progress:</span>
                <span className="font-semibold text-blue-600">{reports.enquiries.inProgress || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Resolved:</span>
                <span className="font-semibold text-green-600">{reports.enquiries.resolved || 0}</span>
              </div>
            </div>
          </div>
        )}

        {/* Work Order Statistics */}
        {reports.workOrders && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Work Order Statistics</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Work Orders:</span>
                <span className="font-semibold">{reports.workOrders.total || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>New:</span>
                <span className="font-semibold text-yellow-600">{reports.workOrders.new || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>In Progress:</span>
                <span className="font-semibold text-blue-600">{reports.workOrders.inProgress || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Completed:</span>
                <span className="font-semibold text-green-600">{reports.workOrders.completed || 0}</span>
              </div>
            </div>
          </div>
        )}

        {/* Revenue Report - Only for Finance/Admin */}
        {canViewRevenue && reports.revenue && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Revenue Report</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Revenue:</span>
                <span className="font-semibold">R {reports.revenue.total || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>This Month:</span>
                <span className="font-semibold">R {reports.revenue.thisMonth || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>This Year:</span>
                <span className="font-semibold">R {reports.revenue.thisYear || 0}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
