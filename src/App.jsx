import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import AdminLayout from './components/AdminLayout';
import ClientLayout from './components/ClientLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Client Routes */}
        <Route path="/client/*" element={<ClientLayout />} />

        {/* Admin Routes */}
        <Route path="/admin/*" element={<AdminLayout />} />

        {/* Default Route */}
        <Route path="/" element={<div>Welcome to Hosting Platform!</div>} />
      </Routes>
    </Router>
  );
}

export default App;
