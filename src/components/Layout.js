import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { getNavigationForRole } from '../utils/rolePermissions';
import {
  HomeIcon,
  MapIcon,
  UserGroupIcon,
  CalendarIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  BuildingOfficeIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import NotificationInbox from './NotificationInbox';

const navigationMap = {
  Dashboard: { name: 'Dashboard', href: '/', icon: HomeIcon },
  Cemeteries: { name: 'Cemeteries', href: '/cemeteries', icon: BuildingOfficeIcon },
  Crematoriums: { name: 'Crematoriums', href: '/crematoriums', icon: BuildingOfficeIcon },
  Plots: { name: 'Plots', href: '/plots', icon: MapIcon },
  Deceased: { name: 'Deceased', href: '/deceased', icon: UserGroupIcon },
  Bookings: { name: 'Bookings', href: '/bookings', icon: CalendarIcon },
  'Burial Calendar': { name: 'Burial Calendar', href: '/burial-calendar', icon: CalendarIcon },
  Burials: { name: 'Burials', href: '/burials', icon: DocumentTextIcon },
  Exhumations: { name: 'Exhumations', href: '/exhumations', icon: DocumentTextIcon },
  Owners: { name: 'Owners', href: '/owners', icon: UserIcon },
  'Work Orders': { name: 'Work Orders', href: '/work-orders', icon: ClipboardDocumentListIcon },
  Enquiries: { name: 'Enquiries', href: '/enquiries', icon: DocumentTextIcon },
  Reports: { name: 'Reports', href: '/reports', icon: ChartBarIcon },
  Tariffs: { name: 'Tariffs', href: '/tariffs', icon: Cog6ToothIcon },
  'Service Charges': { name: 'Service Charges', href: '/service-charges', icon: Cog6ToothIcon },
};

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const user = authService.getUser();
  
  // Special handling for Undertaker role - show undertaker-specific navigation
  const isUndertaker = user?.role === 'Funeral Undertaker';
  const allowedNavigation = isUndertaker 
    ? getNavigationForRole('Funeral Undertaker').map(key => {
        // Map undertaker navigation keys
        const undertakerMap = {
          'Dashboard': { name: 'Dashboard', href: '/undertaker', icon: HomeIcon },
          'My Bookings': { name: 'My Bookings', href: '/undertaker/bookings', icon: CalendarIcon },
          'My Burials': { name: 'My Burials', href: '/undertaker/burials', icon: DocumentTextIcon },
          'Available Plots': { name: 'Available Plots', href: '/undertaker/available-plots', icon: MapIcon },
          'Available Crematoriums': { name: 'Available Crematoriums', href: '/undertaker/available-crematoriums', icon: BuildingOfficeIcon },
          'Tariffs': { name: 'Tariffs', href: '/undertaker/tariffs', icon: Cog6ToothIcon },
          'Profile': { name: 'My Profile', href: '/undertaker/profile', icon: UserIcon },
        };
        return undertakerMap[key];
      }).filter(Boolean)
    : getNavigationForRole(user?.role || 'Read-only').map(key => navigationMap[key]).filter(Boolean);
  
  const navigation = allowedNavigation;

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64">
            <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-white border-r border-gray-200">
              <div className="flex items-center flex-shrink-0 px-4">
                <img 
                  src="/logo.png" 
                  alt="Cemetery Management System" 
                  className="h-auto w-auto max-h-12 max-w-full object-contain"
                  style={{ 
                    maxHeight: '48px',
                    filter: 'contrast(1.2) brightness(0.95)',
                    fontWeight: 'bold'
                  }}
                  onError={(e) => {
                    // Fallback to SVG if PNG doesn't exist
                    if (e.target.src.endsWith('.png')) {
                      e.target.src = '/logo.svg';
                    }
                  }}
                />
              </div>
              <div className="mt-5 flex-grow flex flex-col">
                <nav className="flex-1 px-2 space-y-1">
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`${
                          isActive
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                      >
                        <item.icon
                          className={`${
                            isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                          } mr-3 flex-shrink-0 h-6 w-6`}
                        />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>
              {/* Copyright Notice */}
              <div className="px-4 py-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  © 2025 Idol Consulting (Pty) Ltd. All Rights Reserved
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Header with Notifications */}
          <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="md:hidden">
                <button
                  type="button"
                  className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                  onClick={() => setSidebarOpen(true)}
                >
                  <span className="sr-only">Open sidebar</span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-4 ml-auto">
                <NotificationInbox />
                <div className="hidden md:flex items-center gap-3 border-l border-gray-200 pl-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{user?.fullName || 'User'}</p>
                    <p className="text-xs text-gray-500">{user?.role || 'Unknown Role'}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
                    title="Logout"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
