import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource/archivo/500.css'
import '@fontsource/archivo/700.css'
import '@fontsource/archivo/900.css'
import '@fontsource/noto-sans-sc/500.css'
import '@fontsource/noto-sans-sc/700.css'
import '@fontsource/noto-sans-sc/900.css'
import '@fontsource/spectral/400.css'
import '@fontsource/spectral/400-italic.css'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)
