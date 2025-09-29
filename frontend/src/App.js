import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import POSInterface from './pages/pos/POSInterface';
import Products from './pages/admin/Products';
import Users from './pages/admin/Users';
import Locations from './pages/admin/Locations';
import Sales from './pages/admin/Sales';
import Reports from './pages/admin/Reports';
import Companies from './pages/admin/Companies';
import Roles from './pages/admin/Roles';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/login" 
        element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
      />
      
      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        
        {/* Admin routes */}
        <Route path="/admin/*" element={<AdminDashboard />}>
          <Route path="products" element={<Products />} />
          <Route path="users" element={<Users />} />
          <Route path="locations" element={<Locations />} />
          <Route path="sales" element={<Sales />} />
          <Route path="reports" element={<Reports />} />
          <Route path="companies" element={<Companies />} />
          <Route path="roles" element={<Roles />} />
        </Route>
        
        {/* POS routes */}
        <Route path="/pos" element={<POSInterface />} />
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
