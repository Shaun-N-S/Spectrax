import React from 'react';
import { motion } from 'framer-motion';
import {
  FaHome,
  FaBox,
  FaShoppingCart,
  FaUsers,
  FaList,
  FaIndustry,
  FaSignOutAlt,
  FaTicketAlt,
  FaTags,
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button'; // Adjust the path if necessary
import { useDispatch } from 'react-redux';
import { logoutAdmin } from '../../redux/adminSlice';



 

const AdminSidebar = ({children}) => {
  const adminMenuItems = [
    { icon: FaHome, text: 'Dashboard', href: '/home' },
    { icon: FaBox, text: 'Products', href: '/products' },
    { icon: FaShoppingCart, text: 'Orders', href: '/orders' },
    { icon: FaUsers, text: 'Customers', href: '/customerlist' },
    { icon: FaList, text: 'Categories', href: '/categories' },
    { icon: FaIndustry, text: 'Brands', href: '/brands' },
    {icon: FaTicketAlt, text:'Coupon', href: '/coupons'},
    {icon: FaTags, text:'Offer', href:'/offers'}
  ];

  const navigate = useNavigate();

  // const handleLogout = () => {
  //   console.log('Admin logout clicked');
  //   localStorage.removeItem('adminId');
  //   navigate('/admin/login', { replace: true });
  // };


  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logoutAdmin());
  };

  return (
    <div>
      {/* Header */}
      <header className="bg-black text-white p-6 text-center">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-bold tracking-wider"
        >
          SPECTRAX
        </motion.h1>
        
      </header>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        className="fixed left-0 top-0 h-screen w-[280px] bg-black text-white p-6 z-50"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          {/* Logo can be placed here if you have one */}
          <h1 className="text-2xl font-bold">Admin Panel</h1>
        </motion.div>

        {/* Navigation Menu */}
        <nav className="flex flex-col justify-between h-[85%]">
          <motion.ul
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
            className="space-y-4"
          >
            {adminMenuItems.map((item, index) => (
              <motion.li
                key={index}
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0 },
                }}
              >
                <Link
                  to={item.href}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-white/10 text-gray-300 hover:text-white"
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-lg">{item.text}</span>
                </Link>
              </motion.li>
            ))}
          </motion.ul>

          {/* Logout Button */}
          <div className="mt-auto">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full flex items-center justify-center space-x-2 py-3 text-red-500 border-red-500 hover:bg-red-500 hover:text-white transition-all duration-200"
            >
              <FaSignOutAlt className="w-5 h-5 mt-4" />
              <span onClick={handleLogout}>LOGOUT</span>
            </Button>
          </div>
        </nav>
      </motion.div>
      <div>{children}</div>
    </div>
  );
};

export default AdminSidebar;
