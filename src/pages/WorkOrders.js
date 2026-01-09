import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { PlusIcon, PencilIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function WorkOrders() {
  const [workOrders, setWorkOrders] = useState([]);
  const [cemeteries, setCemeteries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [filters, setFilters] = useState({ status: '', priority: '', cemeteryId: '' });
  const [formData, setFormData] = useState({
    cemeteryId: '',
    plotId: '',
    taskType: '',
    description: '',
    priority: 'Medium',
    requestedDate: new Date().toISOString().split('T')[0],
    assignedTo: '',
    assignedTeam: '',
    status: 'New',
    notes: '',
  });

  useEffect(() => {
    fetchWorkOrders();
    fetchCemeteries();
  }, [filters]);

  const fetchWorkOrders = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.cemeteryId) params.append('cemeteryId', filters.cemeteryId);

      const response = await api.get(`/work-orders?${params.toString()}`);
      setWorkOrders(response.data);
    } catch (error) {
      console.error('Error fetching work orders:', error);
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
      const payload = {
        ...formData,
        cemeteryId: formData.cemeteryId || null,
        plotId: formData.plotId || null,
      };

      if (editingOrder) {
        await api.put(`/work-orders/${editingOrder._id || editingOrder.id}`, payload);
      } else {
        await api.post('/work-orders', payload);
      }
      setShowForm(false);
      setEditingOrder(null);
      resetForm();
      fetchWorkOrders();
    } catch (error) {
      console.error('Error saving work order:', error);
      alert(error.response?.data?.error || 'Failed to save work order');
    }
  };

  const handleEdit = (order) => {
    setEditingOrder(order);
    setFormData({
      cemeteryId: order.cemeteryId?._id || order.cemeteryId || '',
      plotId: order.plotId?._id || order.plotId || '',
      taskType: order.taskType || '',
      description: order.description || '',
      priority: order.priority || 'Medium',
      requestedDate: order.requestedDate ? new Date(order.requestedDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      assignedTo: order.assignedTo || '',
      assignedTeam: order.assignedTeam || '',
      status: order.status || 'New',
      notes: order.notes || '',
    });
    setShowForm(true);
  };

  const handleComplete = async (orderId) => {
    if (!window.confirm('Mark this work order as completed?')) return;
    try {
      await api.post(`/work-orders/${orderId}/complete`);
      fetchWorkOrders();
    } catch (error) {
      console.error('Error completing work order:', error);
      alert(error.response?.data?.error || 'Failed to complete work order');
    }
  };

  const resetForm = () => {
    setFormData({
      cemeteryId: '',
      plotId: '',
      taskType: '',
      description: '',
      priority: 'Medium',
      requestedDate: new Date().toISOString().split('T')[0],
      assignedTo: '',
      assignedTeam: '',
      status: 'New',
      notes: '',
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingOrder(null);
    resetForm();
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Work Orders</h1>
        <button
          onClick={() => {
            resetForm();
            setEditingOrder(null);
            setShowForm(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Work Order
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
              <option value="New">New</option>
              <option value="In Progress">In Progress</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
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
            {editingOrder ? 'Edit Work Order' : 'Create New Work Order'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Type *
                </label>
                <input
                  type="text"
                  required
                  value={formData.taskType}
                  onChange={(e) => setFormData({ ...formData, taskType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., Grave Maintenance, Headstone Repair"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority *
                </label>
                <select
                  required
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned To
                </label>
                <input
                  type="text"
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Staff member name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned Team
                </label>
                <input
                  type="text"
                  value={formData.assignedTeam}
                  onChange={(e) => setFormData({ ...formData, assignedTeam: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Team name"
                />
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
                  <option value="New">New</option>
                  <option value="In Progress">In Progress</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
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
                placeholder="Describe the work to be done..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Additional notes..."
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
                {editingOrder ? 'Update' : 'Create'} Work Order
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Work Orders List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {workOrders.length === 0 ? (
            <li>
              <div className="px-4 py-8 text-center text-gray-500">
                No work orders found.
              </div>
            </li>
          ) : (
            workOrders.map((wo) => (
              <li key={wo._id || wo.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {wo.taskType}
                        </div>
                        <span
                          className={`ml-3 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${wo.priority === 'Urgent'
                              ? 'bg-red-100 text-red-800'
                              : wo.priority === 'High'
                                ? 'bg-orange-100 text-orange-800'
                                : wo.priority === 'Medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                            }`}
                        >
                          {wo.priority}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {wo.cemeteryId?.name || 'Unknown Cemetery'} • {wo.description?.substring(0, 80)}...
                        {wo.requestedDate && ` • Requested: ${new Date(wo.requestedDate).toLocaleDateString()}`}
                        {wo.assignedTo && ` • Assigned to: ${wo.assignedTo}`}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${wo.status === 'Completed'
                            ? 'bg-green-100 text-green-800'
                            : wo.status === 'In Progress'
                              ? 'bg-blue-100 text-blue-800'
                              : wo.status === 'On Hold'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}
                      >
                        {wo.status}
                      </span>
                      {wo.status !== 'Completed' && (
                        <button
                          onClick={() => handleComplete(wo._id || wo.id)}
                          className="p-1 text-green-600 hover:text-green-800"
                          title="Mark as Completed"
                        >
                          <CheckCircleIcon className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(wo)}
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
