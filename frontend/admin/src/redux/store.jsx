import { configureStore } from '@reduxjs/toolkit';
import AdminSlice from './adminSlice'

const store=configureStore({
    reducer:{
        admin:AdminSlice,
    },
});

export default store;