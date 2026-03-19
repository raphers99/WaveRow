import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: '999px',
            fontFamily: 'DM Sans, system-ui, sans-serif',
            fontSize: '14px',
            fontWeight: 500,
          },
        }}
      />
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
