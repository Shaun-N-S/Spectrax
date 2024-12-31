import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import { store, persistor } from './redux/store';
import { GoogleOAuthProvider } from '@react-oauth/google'
import { PersistGate } from 'redux-persist/integration/react'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="19192170186-otvt3km8vksl7vqij7610bq1n95l5igm.apps.googleusercontent.com">
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
         <App />
        </PersistGate>
      </Provider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
