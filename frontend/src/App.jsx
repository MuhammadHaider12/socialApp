import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import Explore from './pages/Explore';
import MessagesPage from './pages/MessagesPage';
import NotificationPage from './pages/NotificationPage';
import Navbar from './components/Navbar';
import './App.css';

const PrivateRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main className="container">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<PrivateRoute><Feed /></PrivateRoute>} />
              <Route path="/explore" element={<PrivateRoute><Explore /></PrivateRoute>} />
              <Route path="/profile/:id" element={<PrivateRoute><Profile /></PrivateRoute>} />
                <Route path="/notifications" element={<PrivateRoute><NotificationPage /></PrivateRoute>} />
                <Route path="/messages" element={<PrivateRoute><MessagesPage /></PrivateRoute>} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;