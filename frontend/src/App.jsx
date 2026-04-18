import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import TermsPage from './pages/TermsPage';
import AdminDashboard from './pages/AdminDashboard';
import SubAdminDashboard from './pages/SubAdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import ReceptionistDashboard from './pages/ReceptionistDashboard';

import RoomDetails from './pages/RoomDetails';

import { ToastProvider } from './context/ToastContext';

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/room/:id" element={<RoomDetails />} />
        <Route path="/terms" element={<TermsPage />} />

        {/* --- Protected Dashboard Routes --- */}
        <Route element={<ProtectedRoute allowedRole="admin" />}>
          <Route path="/admin/dashboard/*" element={<AdminDashboard />} />
        </Route>
        
        <Route element={<ProtectedRoute allowedRole="manager" />}>
          <Route path="/manager/dashboard/*" element={<ManagerDashboard />} />
        </Route>
        
        <Route element={<ProtectedRoute allowedRole="receptionist" />}>
          <Route path="/reception/dashboard/*" element={<ReceptionistDashboard />} />
        </Route>
        
        <Route element={<ProtectedRoute allowedRole="subadmin" />}>
          <Route path="/subadmin/*" element={<SubAdminDashboard />} />
        </Route>
        


        {/* Catch-all: Redirect to landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
