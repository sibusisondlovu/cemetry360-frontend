import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import { BuildingOfficeIcon, MagnifyingGlassIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function Plots() {
  const [plots, setPlots] = useState([]);
  const [cemeteries, setCemeteries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    cemeteryId: '',
    graveType: '',
  });
  const [reuseEvaluation, setReuseEvaluation] = useState(null);
  const [showReuseModal, setShowReuseModal] = useState(false);
  const [selectedPlot, setSelectedPlot] = useState(null);

  useEffect(() => {
    fetchCemeteries();
  }, []);

  useEffect(() => {
    fetchPlots();
  }, [filters]);

  const fetchCemeteries = async () => {
    try {
      const response = await api.get('/cemeteries');
      setCemeteries(response.data);
    } catch (error) {
      console.error('Error fetching cemeteries:', error);
    }
  };

  const fetchPlots = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.cemeteryId) params.append('cemeteryId', filters.cemeteryId);
      if (filters.graveType) params.append('graveType', filters.graveType);

      const response = await api.get(`/plots?${params.toString()}`);
      setPlots(response.data);
    } catch (error) {
      console.error('Error fetching plots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluateReuse = async (plot) => {
    try {
      const response = await api.post('/plots/reuse/evaluate', {
        plotId: plot._id || plot.id,
        yearsSinceLastBurial: 20
      });
      setReuseEvaluation(response.data);
      setSelectedPlot(plot);
      setShowReuseModal(true);
    } catch (error) {
      console.error('Error evaluating plot re-use:', error);
      alert(error.response?.data?.error || 'Failed to evaluate plot for re-use');
    }
  };

  const handleApproveReuse = async () => {
    if (!selectedPlot) return;
    const inspectionNotes = window.prompt('Enter inspection notes (optional):');
    
    try {
      await api.post('/plots/reuse/approve', {
        plotId: selectedPlot._id || selectedPlot.id,
        inspectionNotes: inspectionNotes || ''
      });
      alert('Plot approved for re-use successfully');
      setShowReuseModal(false);
      setReuseEvaluation(null);
      setSelectedPlot(null);
      fetchPlots();
    } catch (error) {
      console.error('Error approving plot re-use:', error);
      alert(error.response?.data?.error || 'Failed to approve plot re-use');
    }
  };

  // Filter plots by search term
  const filteredPlots = useMemo(() => {
    if (searchTerm.trim() === '') {
      return plots;
    }
    const searchLower = searchTerm.toLowerCase();
    return plots.filter((plot) => {
      return (
        plot.uniqueIdentifier?.toLowerCase().includes(searchLower) ||
        plot.plotNumber?.toLowerCase().includes(searchLower) ||
        plot.graveType?.toLowerCase().includes(searchLower) ||
        plot.status?.toLowerCase().includes(searchLower) ||
        plot.cemetery?.name?.toLowerCase().includes(searchLower) ||
        plot.section?.name?.toLowerCase().includes(searchLower) ||
        plot.row?.toLowerCase().includes(searchLower)
      );
    });
  }, [plots, searchTerm]);

  // Group plots by cemetery
  const plotsByCemetery = useMemo(() => {
    const grouped = {};
    
    filteredPlots.forEach((plot) => {
      const cemeteryId = plot.cemetery?._id || plot.cemetery?.id || 'unknown';
      const cemeteryName = plot.cemetery?.name || 'Unknown Cemetery';
      
      if (!grouped[cemeteryId]) {
        grouped[cemeteryId] = {
          cemetery: plot.cemetery || { name: cemeteryName, _id: cemeteryId },
          plots: [],
        };
      }
      grouped[cemeteryId].plots.push(plot);
    });

    // Sort plots within each cemetery
    Object.keys(grouped).forEach((key) => {
      grouped[key].plots.sort((a, b) => 
        (a.uniqueIdentifier || '').localeCompare(b.uniqueIdentifier || '')
      );
    });

    return grouped;
  }, [filteredPlots]);

  const cemeteryStats = useMemo(() => {
    const stats = {};
    Object.keys(plotsByCemetery).forEach((cemeteryId) => {
      const cemeteryPlots = plotsByCemetery[cemeteryId].plots;
      stats[cemeteryId] = {
        total: cemeteryPlots.length,
        available: cemeteryPlots.filter(p => p.status === 'Available').length,
        occupied: cemeteryPlots.filter(p => p.status === 'Occupied').length,
        reserved: cemeteryPlots.filter(p => p.status === 'Reserved').length,
      };
    });
    return stats;
  }, [plotsByCemetery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading plots...</p>
        </div>
      </div>
    );
  }

  const cemeteryEntries = Object.entries(plotsByCemetery);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Plots</h1>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by plot identifier, number, type, status, cemetery, section, or row..."
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
          <p className="mb-4 text-sm text-gray-600">
            Found {filteredPlots.length} plot(s) matching "{searchTerm}"
          </p>
        )}

      {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cemetery
            </label>
            <select
              value={filters.cemeteryId}
              onChange={(e) => setFilters({ ...filters, cemeteryId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Cemeteries</option>
              {cemeteries.map((cemetery) => (
                <option key={cemetery._id || cemetery.id} value={cemetery._id || cemetery.id}>
                  {cemetery.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="Available">Available</option>
              <option value="Reserved">Reserved</option>
              <option value="Occupied">Occupied</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grave Type
            </label>
            <select
              value={filters.graveType}
              onChange={(e) => setFilters({ ...filters, graveType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="Single">Single</option>
              <option value="Double-Depth">Double-Depth</option>
              <option value="Family">Family</option>
              <option value="Niche">Niche</option>
              <option value="Mausoleum">Mausoleum</option>
            </select>
          </div>
        </div>
      </div>

      {/* Plots by Cemetery */}
      {cemeteryEntries.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <p className="text-gray-500">No plots found matching your filters.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {cemeteryEntries.map(([cemeteryId, { cemetery, plots: cemeteryPlots }]) => {
            const stats = cemeteryStats[cemeteryId] || {};
            return (
              <div key={cemeteryId} className="bg-white shadow rounded-lg overflow-hidden">
                {/* Cemetery Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BuildingOfficeIcon className="h-6 w-6 text-gray-600" />
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                          {cemetery.name}
                        </h2>
                        {cemetery.code && (
                          <p className="text-sm text-gray-500">Code: {cemetery.code}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">{stats.total}</div>
                        <div className="text-gray-500">Total</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-green-600">{stats.available}</div>
                        <div className="text-gray-500">Available</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-yellow-600">{stats.reserved}</div>
                        <div className="text-gray-500">Reserved</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-red-600">{stats.occupied}</div>
                        <div className="text-gray-500">Occupied</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Plots List */}
                <div className="divide-y divide-gray-200">
                  {cemeteryPlots.length === 0 ? (
                    <div className="px-6 py-8 text-center text-gray-500">
                      No plots found in this cemetery.
                    </div>
                  ) : (
                    cemeteryPlots.map((plot) => (
                      <div key={plot._id || plot.id} className="px-6 py-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-medium text-gray-900">
                                {plot.uniqueIdentifier}
                              </div>
                              {plot.section?.name && (
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                  {plot.section.name}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              <span className="font-medium">{plot.graveType}</span>
                              {plot.row && <span className="ml-2">• Row: {plot.row}</span>}
                              {plot.plotNumber && <span className="ml-2">• Plot: {plot.plotNumber}</span>}
                              {plot.currentBurials !== undefined && (
                                <span className="ml-2">
                                  • Burials: {plot.currentBurials} / {plot.allowedBurials || 1}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                plot.status === 'Available'
                                  ? 'bg-green-100 text-green-800'
                                  : plot.status === 'Occupied'
                                  ? 'bg-red-100 text-red-800'
                                  : plot.status === 'Reserved'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : plot.status === 'Re-usable'
                                  ? 'bg-blue-100 text-blue-800'
                                  : plot.status === 'Closed'
                                  ? 'bg-gray-100 text-gray-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {plot.status}
                            </span>
                            {(plot.status === 'Occupied' || plot.status === 'Re-usable') && (
                              <button
                                onClick={() => handleEvaluateReuse(plot)}
                                className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                title="Evaluate for re-use"
                              >
                                <CheckCircleIcon className="h-4 w-4 mr-1" />
                                Re-use
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Re-use Evaluation Modal */}
      {showReuseModal && reuseEvaluation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Plot Re-use Evaluation</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Plot:</strong> {reuseEvaluation.plotIdentifier}</p>
                <p><strong>Last Burial:</strong> {new Date(reuseEvaluation.lastBurialDate).toLocaleDateString()}</p>
                <p><strong>Years Elapsed:</strong> {reuseEvaluation.yearsElapsed}</p>
                <p><strong>Current Status:</strong> {reuseEvaluation.currentStatus}</p>
                <div className={`p-3 rounded ${reuseEvaluation.eligible ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'}`}>
                  <p><strong>Eligibility:</strong> {reuseEvaluation.eligible ? '✓ Eligible' : '✗ Not Eligible'}</p>
                  <p className="mt-1">{reuseEvaluation.recommendation}</p>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => {
                    setShowReuseModal(false);
                    setReuseEvaluation(null);
                    setSelectedPlot(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                {reuseEvaluation.eligible && (
                  <button
                    onClick={handleApproveReuse}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Approve Re-use
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
