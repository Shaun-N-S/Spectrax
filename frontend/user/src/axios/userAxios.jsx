// import axios from 'axios';
// import { getAccessToken } from '../redux/getStore';
// import store from '../redux/store';
// import { updateAccessToken, logoutUser } from '../redux/userSlice';

// const axiosInstance = axios.create({
//   baseURL: 'http://localhost:3000/user',
//   withCredentials: true, // For sending cookies with requests
// });

// // Request interceptor to attach access token
// axiosInstance.interceptors.request.use(
//   (config)=>{
//     const token=store.getState().token.token
//     console.log(token)
//     if(token)
//     {
//       config.headers['Authorization']=`Bearer ${token}`
//     }
//     console.log('token interceptor done',config)
//     return config;
    
//   },
//   (error)=>{
//     return Promise.reject(error)
//   }
// )


// // Response interceptor to refresh access token on 401 errors
// axiosInstance.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     if (error.response.status === 401 && !error.config._retry) {
//       error.config._retry = true;
//       try {
//         const { data } = await axios.post('/refresh-token');
//         store.dispatch(updateAccessToken(data.accessToken));
//         error.config.headers.Authorization = `Bearer ${data.accessToken}`;
//         return axiosInstance(error.config);
//       } catch (refreshError) {
//         store.dispatch(logoutUser());
//         return Promise.reject(refreshError);
//       }
//     }
//     return Promise.reject(error);
//   }
// );


// // axiosInstance.interceptors.response.use(
// //   response=>response,
// //   async(error)=>{
// //     const originalRequest=error.config;

// //     if(error.response.status==401 && !originalRequest._retry)
// //     {        
// //       originalRequest._retry=true;

// //       try{
// //         const refreshResponse=await instance.post('/refreshToken',{},{withCredentials:true})
// //         const newAccessToken=refreshResponse.data.newAccessToken
// //         store.dispatch(updateAccessToken(newAccessToken))
// //         originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
// //         return instance(originalRequest);
// //       }catch(refreshError){
// //         console.log('refresh token failed',refreshError)
// //         store.dispatch(logoutUser());
// //         return Promise.reject(refreshError);
// //       }
// //     }
// //     console.log("response error " + error)
// //     return Promise.reject(error);
// //   }
// // )

// export default axiosInstance;






import axios from 'axios';
import store from '../redux/store';
import { updateAccessToken, logoutUser } from '../redux/userSlice';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000/user',
  withCredentials: true, // For sending cookies with requests
});

// Request interceptor to attach access token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = store.getState().user.token; // Adjusted path to match store structure
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to refresh access token on 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401 && !error.config._retry) {
      error.config._retry = true;
      try {
        const { data } = await axiosInstance.post('/refresh-token');
        store.dispatch(updateAccessToken(data.accessToken));
        error.config.headers.Authorization = `Bearer ${data.accessToken}`;
        return axiosInstance(error.config);
      } catch (refreshError) {
        store.dispatch(logoutUser());
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
