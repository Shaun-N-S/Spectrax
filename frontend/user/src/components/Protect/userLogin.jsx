import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axiosInstance from '../../axios/userAxios';

function ProtectHome({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        // Verify the token (cookies are automatically sent)
        await axiosInstance.post('/verifytoken',{withCredentials: true}); 
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Token verification failed:', error.message);
        setIsAuthenticated(false);
      }
    };

    verifyToken();
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>; // Show a loading state while verifying
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default ProtectHome;
