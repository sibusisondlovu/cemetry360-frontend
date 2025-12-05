import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  CalendarIcon,
  MapIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

export default function UndertakerDashboard() {
  const [stats, setStats] = useState({
    bookings: 0,
    pendingBookings: 0,
    burials: 0,
    upcomingBookings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [bookingsRes, burialsRes] = await Promise.all([
        api.get('/undertaker/bookings'),
        api.get('/undertaker/burials'),
      ]);

      const bookings = bookingsRes.data;
      const burials = burialsRes.data;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      setStats({
        bookings: bookings.length,
        pendingBookings: bookings.filter(b => b.status === 'Pending').length,
        burials: burials.length,
        upcomingBookings: bookings.filter(b => {
          const bookingDate = new Date(b.requestedDate);
          return bookingDate >= today && (b.status === 'Pending' || b.status === 'Confirmed');
        }).length,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const statCards = [
    {
      name: 'My Bookings',
      value: stats.bookings,
      icon: CalendarIcon,
      color: 'bg-blue-500',
      href: '/undertaker/bookings',
    },
    {
      name: 'Pending Bookings',
      value: stats.pendingBookings,
      icon: CalendarIcon,
      color: 'bg-yellow-500',
      href: '/undertaker/bookings?status=Pending',
    },
    {
      name: 'Upcoming Bookings',
      value: stats.upcomingBookings,
      icon: CalendarIcon,
      color: 'bg-green-500',
      href: '/undertaker/bookings?status=Confirmed',
    },
    {
      name: 'My Burials',
      value: stats.burials,
      icon: DocumentTextIcon,
      color: 'bg-purple-500',
      href: '/undertaker/burials',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Undertaker Self-Service Portal</h1>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((card) => (
          <Link
            key={card.name}
            to={card.href}
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow"
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
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/undertaker/bookings/new"
              className="block w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-center"
            >
              Create New Booking
            </Link>
            <Link
              to="/undertaker/available-plots"
              className="block w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-center"
            >
              View Available Plots
            </Link>
            <Link
              to="/undertaker/available-crematoriums"
              className="block w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-center"
            >
              View Available Crematoriums
            </Link>
            <Link
              to="/undertaker/tariffs"
              className="block w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-center"
            >
              View Tariffs
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">My Profile</h2>
          <Link
            to="/undertaker/profile"
            className="block w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-center"
          >
            Update Profile
          </Link>
        </div>
      </div>
    </div>
  );
}


