import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'animate.css'
import 'aos/dist/aos.css'
import AOS from 'aos'
import './index.css'
import './mobile.css'
import App from './App.jsx'

// App.jsx uses window.AOS; bundling it (instead of loading from unpkg) keeps the Android app working offline.
window.AOS = AOS
AOS.init({ once: true, offset: 80 })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
