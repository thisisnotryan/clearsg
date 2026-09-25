import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/arimo/700.css'
import 'leaflet/dist/leaflet.css'
import './index.css'
import App from './App.tsx'
import { registerServiceWorker } from './lib/push.ts'
import { AirQualityProvider } from './lib/useAirQuality.tsx'

// Needed for notifications; it caches nothing.
void registerServiceWorker()?.catch(() => {
  // Without it the app still works, just with no notifications.
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AirQualityProvider>
      <App />
    </AirQualityProvider>
  </StrictMode>,
)
