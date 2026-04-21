import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Betslip from './components/Betslip';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Casino from './pages/Casino';
import Sports from './pages/Sports';
import AIAnalysis from './pages/AIAnalysis';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return null;
  return user && isAdmin ? children : <Navigate to="/login" />;
};

const AppContent = () => {
  const [ticket, setTicket] = useState([]);

  return (
    <div className="app-container">
      <Header />
      <div className="layout-wrapper">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home ticket={ticket} setTicket={setTicket} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/casino" element={<Casino />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/sports" element={<Sports ticket={ticket} setTicket={setTicket} />} />
            <Route path="/ai" element={<AIAnalysis />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Betslip ticket={ticket} setTicket={setTicket} />
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
