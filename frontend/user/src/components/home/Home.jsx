import React from 'react';
import './Home.css';
import Header from '../Header/Header';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '@/redux/userSlice';
import { Link } from 'react-router-dom'; // Import Link
import HomePage from '../HomePage/HomePage'; // Import the new HomePage component

const Home = () => {
  const dispatch = useDispatch();

  

  // const user = useSelector((state) => state.user.users);

  return (
    <div className="bg-black text-white min-h-screen">
      
      <HomePage />
    </div>
  );
};

export default Home;
