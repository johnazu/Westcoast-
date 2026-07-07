import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Footer from './components/Footer';

import HomePage from './pages/HomePage';
import VehicleListPage from './pages/VehicleListPage';
import VehicleDetailPage from './pages/VehicleDetailPage';
import RentalBookingPage from './pages/RentalBookingPage';
import TestDrivePage from './pages/TestDrivePage';
import PurchaseInquiryPage from './pages/PurchaseInquiryPage';
import TrackBookingPage from './pages/TrackBookingPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminLayout from './components/admin/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import AdminVehicleListPage from './pages/admin/AdminVehicleListPage';
import AdminVehicleFormPage from './pages/admin/AdminVehicleFormPage';
import AdminVehicleMediaPage from './pages/admin/AdminVehicleMediaPage';
import AdminBookingsPage from './pages/admin/AdminBookingsPage';
import AdminHomepageEditorPage from './pages/admin/AdminHomepageEditorPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';

import './styles/global.css';

const PublicLayout = ({ children }) => (
  <>
    <Header />
    <main style={{ minHeight: '70vh' }}>{children}</main>
    <Footer />
  </>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer position="top-right" autoClose={4000} />
        <Routes>
          {/* Public site */}
          <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
          <Route path="/vehicles" element={<PublicLayout><VehicleListPage /></PublicLayout>} />
          <Route path="/vehicles/:id" element={<PublicLayout><VehicleDetailPage /></PublicLayout>} />
          <Route path="/book-rental/:id" element={<PublicLayout><RentalBookingPage /></PublicLayout>} />
          <Route path="/test-drive/:id" element={<PublicLayout><TestDrivePage /></PublicLayout>} />
          <Route path="/purchase-inquiry/:id" element={<PublicLayout><PurchaseInquiryPage /></PublicLayout>} />
          <Route path="/track-booking" element={<PublicLayout><TrackBookingPage /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
          <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />

          {/* Admin */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="vehicles" element={<AdminVehicleListPage />} />
            <Route path="vehicles/new" element={<AdminVehicleFormPage />} />
            <Route path="vehicles/:id/edit" element={<AdminVehicleFormPage />} />
            <Route path="vehicles/:id/media" element={<AdminVehicleMediaPage />} />
            <Route path="bookings" element={<AdminBookingsPage />} />
            <Route path="homepage" element={<AdminHomepageEditorPage />} />
            <Route
              path="users"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminUsersPage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
