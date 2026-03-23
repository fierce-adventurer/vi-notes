import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

function App() {
  const { isAuthenticated } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Routes>
        {/* Auth Routes */}
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login /> : <Navigate to="/" />} 
        />
        <Route 
          path="/register" 
          element={!isAuthenticated ? <Register /> : <Navigate to="/" />} 
        />
        
        <Route 
          path="/" 
          element={<Dashboard isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />} 
        />
      </Routes>
    </div>
  );
}

export default App;