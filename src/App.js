import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services/authService';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import Cemeteries from './pages/Cemeteries';
import Plots from './pages/Plots';
import Deceased from './pages/Deceased';
import Bookings from './pages/Bookings';
import Burials from './pages/Burials';
import Owners from './pages/Owners';
import WorkOrders from './pages/WorkOrders';
import Enquiries from './pages/Enquiries';
import Reports from './pages/Reports';
import Tariffs from './pages/Tariffs';
import Crematoriums from './pages/Crematoriums';
import CemeteryMapView from './pages/CemeteryMapView';
import UndertakerDashboard from './pages/UndertakerDashboard';
import UndertakerBookings from './pages/UndertakerBookings';
import UndertakerProfile from './pages/UndertakerProfile';
import UndertakerAvailablePlots from './pages/UndertakerAvailablePlots';
import UndertakerAvailableCrematoriums from './pages/UndertakerAvailableCrematoriums';
import UndertakerTariffs from './pages/UndertakerTariffs';
import UndertakerBurials from './pages/UndertakerBurials';
import UndertakerCreateDeceased from './pages/UndertakerCreateDeceased';
import BurialCalendar from './pages/BurialCalendar';
import Exhumations from './pages/Exhumations';
import ServiceCharges from './pages/ServiceCharges';
import RoleBasedRoute from './components/RoleBasedRoute';
import { hasPermission } from './utils/rolePermissions';

const PrivateRoute = ({ children }) => {
  return authService.isAuthenticated() ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="cemeteries" element={<Cemeteries />} />
          <Route path="crematoriums" element={
            <RoleBasedRoute allowedRoles={['Administrator', 'Cemetery Manager', 'Cemetery Clerk', 'Read-only']}>
              <Crematoriums />
            </RoleBasedRoute>
          } />
          <Route path="plots" element={<Plots />} />
          <Route path="deceased" element={<Deceased />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="burial-calendar" element={<BurialCalendar />} />
          <Route path="burials" element={<Burials />} />
          <Route path="exhumations" element={
            <RoleBasedRoute allowedRoles={['Administrator', 'Cemetery Manager', 'Cemetery Clerk']}>
              <Exhumations />
            </RoleBasedRoute>
          } />
          <Route path="owners" element={<Owners />} />
          <Route path="work-orders" element={<WorkOrders />} />
          <Route path="enquiries" element={<Enquiries />} />
          <Route path="reports" element={<Reports />} />
          <Route path="tariffs" element={
            <RoleBasedRoute allowedRoles={['Administrator', 'Finance User']}>
              <Tariffs />
            </RoleBasedRoute>
          } />
          <Route path="service-charges" element={
            <RoleBasedRoute allowedRoles={['Administrator', 'Cemetery Manager', 'Finance User', 'Cemetery Clerk']}>
              <ServiceCharges />
            </RoleBasedRoute>
          } />
          <Route path="cemeteries/:id/map" element={<CemeteryMapView />} />
          
          {/* Undertaker Self-Service Routes */}
          <Route path="undertaker" element={
            <RoleBasedRoute allowedRoles={['Funeral Undertaker']}>
              <UndertakerDashboard />
            </RoleBasedRoute>
          } />
          <Route path="undertaker/bookings" element={
            <RoleBasedRoute allowedRoles={['Funeral Undertaker']}>
              <UndertakerBookings />
            </RoleBasedRoute>
          } />
          <Route path="undertaker/bookings/new" element={
            <RoleBasedRoute allowedRoles={['Funeral Undertaker']}>
              <UndertakerBookings />
            </RoleBasedRoute>
          } />
          <Route path="undertaker/profile" element={
            <RoleBasedRoute allowedRoles={['Funeral Undertaker']}>
              <UndertakerProfile />
            </RoleBasedRoute>
          } />
          <Route path="undertaker/available-plots" element={
            <RoleBasedRoute allowedRoles={['Funeral Undertaker']}>
              <UndertakerAvailablePlots />
            </RoleBasedRoute>
          } />
          <Route path="undertaker/available-crematoriums" element={
            <RoleBasedRoute allowedRoles={['Funeral Undertaker']}>
              <UndertakerAvailableCrematoriums />
            </RoleBasedRoute>
          } />
          <Route path="undertaker/tariffs" element={
            <RoleBasedRoute allowedRoles={['Funeral Undertaker']}>
              <UndertakerTariffs />
            </RoleBasedRoute>
          } />
          <Route path="undertaker/burials" element={
            <RoleBasedRoute allowedRoles={['Funeral Undertaker']}>
              <UndertakerBurials />
            </RoleBasedRoute>
          } />
          <Route path="undertaker/deceased/new" element={
            <RoleBasedRoute allowedRoles={['Funeral Undertaker']}>
              <UndertakerCreateDeceased />
            </RoleBasedRoute>
          } />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

