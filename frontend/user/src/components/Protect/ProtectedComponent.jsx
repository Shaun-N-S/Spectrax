import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axiosInstance from '../../axios/userAxios'; // Ensure this points to your Axios setup

function ProtectedComponent({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        // Verify the token by making a request to your backend
        await axiosInstance.post('/verifytoken', { withCredentials: true });
        setIsAuthenticated(true);
      } catch (error) {
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

export default ProtectedComponent;
