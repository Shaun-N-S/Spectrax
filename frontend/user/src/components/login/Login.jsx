import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axiosInstance from '../../axios/userAxios'; // Axios instance for API requests
import { addUser } from '@/redux/userSlice'; // Import addUser action
import { GoogleLogin } from '@react-oauth/google';
import store from '@/redux/store';
import { updateAccessToken } from '@/redux/userSlice';


const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  console.log("shaun")
    if (validateForm()) {
      setLoading(true);
      try {
        const response = await axiosInstance.post('/login', formData);
        console.log(response)
        const { user, accessToken } = response.data; // Assuming the response returns both `user` and `accessToken`
  
        // Dispatch user data and access token to Redux store
        // dispatch(addUser(user));
        localStorage.setItem('accessToken',response.data.token)

        localStorage.setItem('id',user._id)
        console.log(user)
      
        dispatch(updateAccessToken(accessToken));
        
        navigate('/home'); // Redirect to home after successful login
        console.log('tijkahslijdfgkh')
      } catch (error) {
        console.error('Login error:', error.response?.data || error.message);
        setErrors({ general: 'Invalid credentials. Please try again.' });
      } finally {
        setLoading(false);
      }
    }
  };
  
  return (
    <div className="flex justify-center items-center min-h-screen bg-black">
      <div className="w-full max-w-md p-8 bg-gray-900 shadow-2xl rounded-lg">
        <h2 className="text-3xl font-extrabold text-center text-[#00cc00] mb-6">Login</h2>

        {/* General Error Message */}
        {errors.general && (
          <div className="text-red-500 text-sm mb-4">{errors.general}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className={`w-full p-3 bg-gray-800 text-white border rounded-md focus:ring-2 focus:ring-[#00cc00] ${errors.email ? 'border-red-500' : 'border-gray-700'}`}
            />
            {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
          </div>

          {/* Password Field */}
          <div>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className={`w-full p-3 bg-gray-800 text-white border rounded-md focus:ring-2 focus:ring-[#00cc00] ${errors.password ? 'border-red-500' : 'border-gray-700'}`}
            />
            {errors.password && <div className="text-red-500 text-sm mt-1">{errors.password}</div>}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full py-3 bg-[#00cc00] hover:bg-green-600 text-black font-bold rounded-md focus:outline-none disabled:bg-gray-700"
            disabled={loading}
          >
            {loading ? 'Logging In...' : 'Login'}
          </Button>
        </form>

        <p className="mt-6 text-center text-gray-400 text-sm">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#00cc00] hover:underline">
            Sign Up
          </Link>
        </p>
        <br />


        <GoogleLogin
  onSuccess={async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;

      // Send the token to the backend
      const response = await axiosInstance.post('/google-auth', { token: credential });

      // Extract user data and access token
      // const { user, accessToken } = response.data;
      

      console.log(response.data)
      // Dispatch to Redux store
      // dispatch(addUser(user));
      // dispatch(updateAccessToken(accessToken))
      localStorage.setItem('accessToken',response.data.token)
        navigate('/home'); // Redirect on successF
      

     
    } catch (error) {
      console.error('Google login error:', error.response?.data || error.message);
    }
  }}
  onError={() => {
    console.log('Login Failed');
  }}
/>


      </div>
    </div>
  );
};

export default Login;
