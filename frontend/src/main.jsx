import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Clear all mock dump data from previous sessions
Object.keys(localStorage).forEach(key => {
  if (key.startsWith('lodgify_') || key === 'dummy_data_initialized') {
    localStorage.removeItem(key);
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
