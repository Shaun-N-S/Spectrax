import { configureStore } from '@reduxjs/toolkit';
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist'; 
import { combineReducers } from 'redux';
import userReducer from './userSlice'; 

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user'] 
};

const rootReducer = combineReducers({
  user: userReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer); 


const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

const persistor = persistStore(store);



export { store, persistor };
