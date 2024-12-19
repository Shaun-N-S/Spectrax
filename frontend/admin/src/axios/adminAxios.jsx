// axios/adminAxios.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000/admin', // Adjust this to match your backend URL
  withCredentials: true,  // To allow cookies
});

export default axiosInstance;
