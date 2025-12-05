import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { MapIcon } from '@heroicons/react/24/outline';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mapImageError, setMapImageError] = useState(false);
  const [mapImageLoading, setMapImageLoading] = useState(true);
  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (userEmail, userPassword) => {
    setEmail(userEmail);
    setPassword(userPassword);
    setError('');
  };

  const demoCredentials = [
    {
      role: 'Administrator',
      email: 'admin@mcms.local',
      password: 'admin123',
      description: 'Full system access',
      color: 'bg-purple-50 border-purple-200',
      textColor: 'text-purple-800',
    },
    {
      role: 'Cemetery Manager',
      email: 'manager@mcms.local',
      password: 'manager123',
      description: 'Cemetery management access',
      color: 'bg-blue-50 border-blue-200',
      textColor: 'text-blue-800',
    },
    {
      role: 'Cemetery Clerk',
      email: 'clerk@mcms.local',
      password: 'clerk123',
      description: 'Front office and booking access',
      color: 'bg-green-50 border-green-200',
      textColor: 'text-green-800',
    },
    {
      role: 'Funeral Undertaker',
      email: 'undertaker1@example.com',
      password: 'undertaker123',
      description: 'Self-service portal access',
      color: 'bg-orange-50 border-orange-200',
      textColor: 'text-orange-800',
    },
  ];

  // Ensure all credentials are displayed
  const allCredentials = demoCredentials;

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Map */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/kzn-map.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.15,
          filter: 'blur(2px)',
        }}
      />
      {/* Overlay for better readability */}
      <div className="absolute inset-0 z-0 bg-white opacity-60" />
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div>
          <div className="flex justify-center mb-6">
            <img 
              src="/logo.png" 
              alt="Cemetery Management System" 
              className="h-auto w-auto max-h-20 max-w-xs object-contain"
              style={{ 
                maxHeight: '80px',
                filter: 'contrast(1.5) brightness(0.9) drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
              }}
              onError={(e) => {
                // Fallback to SVG if PNG doesn't exist
                if (e.target.src.endsWith('.png')) {
                  e.target.src = '/logo.svg';
                }
              }}
            />
          </div>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        {/* Demo Credentials Section */}
        <div className="mt-8">
          <div className="text-center mb-4">
            <p className="text-sm font-medium text-gray-700">Demo Credentials</p>
            <p className="text-xs text-gray-500 mt-1">Click to auto-fill credentials</p>
          </div>
          <div className="space-y-3">
            {demoCredentials.map((cred, index) => (
              <div
                key={index}
                className={`${cred.color} border rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow`}
                onClick={() => fillCredentials(cred.email, cred.password)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className={`text-sm font-semibold ${cred.textColor}`}>
                      {cred.role}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {cred.description}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 font-mono">
                      {cred.email}
                    </div>
                  </div>
                  <div className="ml-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fillCredentials(cred.email, cred.password);
                      }}
                      className={`text-xs px-3 py-1 rounded ${cred.textColor} border ${cred.textColor.replace('text-', 'border-')} hover:bg-white transition-colors`}
                    >
                      Use
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* KwaZulu-Natal Map Preview */}
        <div className="mt-8 relative">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden backdrop-blur-sm bg-opacity-90">
            <div className="relative" style={{ minHeight: '200px' }}>
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
    </div>
  );
}
