import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import store from './redux/store'
import { GoogleOAuthProvider } from '@react-oauth/google'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="19192170186-otvt3km8vksl7vqij7610bq1n95l5igm.apps.googleusercontent.com">
    <Provider store={store}>
    <App />
    </Provider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
