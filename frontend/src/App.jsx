import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Garage from './pages/Garage/Garage';
import Inventory from './pages/Inventory';
import Assets from './pages/Assets';
import Personnel from './pages/Personnel';
// import Transport from './pages/Transport'; // Temporarily disabled
import Users from './pages/Users';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout title="Dashboard">
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/garage" 
          element={
            <ProtectedRoute>
              <Layout title="Garage Management">
                <Garage />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/inventory" 
          element={
            <ProtectedRoute>
              <Layout title="Inventory Management">
                <Inventory />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/assets" 
          element={
            <ProtectedRoute>
              <Layout title="Asset Management">
                <Assets />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/personnel" 
          element={
            <ProtectedRoute>
              <Layout title="Personnel Management">
                <Personnel />
              </Layout>
            </ProtectedRoute>
          } 
        />
        {/* Transport Operations - Temporarily disabled for future updates */}
        {/* <Route 
          path="/transport" 
          element={
            <ProtectedRoute>
              <Layout title="Transport Operations">
                <Transport />
              </Layout>
            </ProtectedRoute>
          } 
        /> */}
        <Route 
          path="/users" 
          element={
            <ProtectedRoute>
              <Layout title="User Management">
                <Users />
              </Layout>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </div>
  );
}

export default App;