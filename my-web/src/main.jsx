import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

// This is where the React app is booted up and wrapped with the router so pages can change smoothly.

createRoot(document.getElementById('root')).render(
  <StrictMode>
    
    {/* BrowserRouter makes the URL feel like a real navigation experience instead of a static page. */}

    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
