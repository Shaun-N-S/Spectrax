import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutAdmin } from '../../redux/adminSlice';
import AdminSidebar from '../SideBar/AdminSidebar';
import AdminDashboard from './AdminDashboard';

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logoutAdmin());
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Dashboard */}
      <div className="flex-1 p-6 overflow-auto">
        {/* <div className="absolute top-10 right-4 z-10">
         
        </div> */}
        <AdminDashboard />
      </div>
    </div>
  );
};

export default Home;
