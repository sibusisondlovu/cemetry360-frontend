import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { authService } from '../services/authService';
import {
  BuildingOfficeIcon,
  MapIcon,
  UserGroupIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = authService.getUser();

  // Redirect undertakers to their dashboard
  useEffect(() => {
    if (user?.role === 'Funeral Undertaker') {
      navigate('/undertaker');
    }
  }, [user, navigate]);
  const [stats, setStats] = useState({
    cemeteries: 0,
    plots: 0,
    availablePlots: 0,
    deceased: 0,
    bookings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [cemeteries, setCemeteries] = useState([]);
  const [mapImageError, setMapImageError] = useState(false);
  const [mapImageLoading, setMapImageLoading] = useState(true);

  // Timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (mapImageLoading) {
        setMapImageLoading(false);
        setMapImageError(true);
      }
    }, 3000); // 3 second timeout

    return () => clearTimeout(timeout);
  }, [mapImageLoading]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [cemeteriesRes, plotsRes, deceasedRes, bookingsRes] = await Promise.all([
          api.get('/cemeteries'),
          api.get('/plots'),
          api.get('/deceased'),
          api.get('/bookings'),
        ]);

        const plots = plotsRes.data;
        const availablePlots = plots.filter(p => p.status === 'Available').length;

        setCemeteries(cemeteriesRes.data);
        setStats({
          cemeteries: cemeteriesRes.data.length,
          plots: plots.length,
          availablePlots,
          deceased: deceasedRes.data.length,
          bookings: bookingsRes.data.filter(b => b.status === 'Pending' || b.status === 'Confirmed').length,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      name: 'Cemeteries',
      value: stats.cemeteries,
      icon: BuildingOfficeIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Total Plots',
      value: stats.plots,
      icon: MapIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Available Plots',
      value: stats.availablePlots,
      icon: MapIcon,
      color: 'bg-yellow-500',
    },
    {
      name: 'Deceased Records',
      value: stats.deceased,
      icon: UserGroupIcon,
      color: 'bg-purple-500',
    },
    {
      name: 'Active Bookings',
      value: stats.bookings,
      icon: CalendarIcon,
      color: 'bg-red-500',
    },
  ];


  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((card) => (
          <div
            key={card.name}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className={`${card.color} rounded-md p-3`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {card.name}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {card.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* KwaZulu-Natal Map */}
      <div className="mt-8 relative">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="relative" style={{ minHeight: '400px' }}>
            {mapImageLoading && !mapImageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Loading map...</p>
                </div>
              </div>
            )}
            <>
              <div 
                className="absolute inset-0 z-10 pointer-events-none"
                style={{
                  background: 'linear-gradient(to bottom, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.2) 15%, rgba(255,255,255,0.2) 85%, rgba(255,255,255,0.5) 100%)',
                }}
              />
              {mapImageError ? (
                <img
                  src="/kzn-map-placeholder.svg"
                  alt="KwaZulu-Natal Map Placeholder"
                  className="w-full h-auto"
                  style={{ opacity: 0.5 }}
                  onLoad={() => {
                    setMapImageLoading(false);
                  }}
                />
              ) : (
                <img
                  src="/kzn-map.png"
                  alt="KwaZulu-Natal Map"
                  className="w-full h-auto"
                  style={{ opacity: 0.5, display: mapImageLoading ? 'none' : 'block' }}
                  onLoad={() => {
                    setMapImageLoading(false);
                    setMapImageError(false);
                  }}
                  onError={(e) => {
                    setMapImageLoading(false);
                    // Try fallback images
                    const currentSrc = e.target.src;
                    if (currentSrc.includes('kzn-map.png')) {
                      e.target.src = '/map.png';
                      setMapImageLoading(true);
                    } else if (currentSrc.includes('map.png')) {
                      e.target.src = '/ethekwini-map.png';
                      setMapImageLoading(true);
                    } else {
                      // All fallbacks failed - use placeholder
                      setMapImageError(true);
                      setMapImageLoading(true);
                    }
                  }}
                />
              )}
            </>
          </div>
        </div>
      </div>
    </div>
  );
}

