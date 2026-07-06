import api from './api.js';

let loadPromise = null;

/**
 * Dynamically loads the Google Maps JavaScript API with the 'places' library.
 *
 * Fetches the API key from the backend configuration endpoint to avoid
 * hardcoding secret keys on the frontend client assets.
 *
 * Returns a Promise that resolves when the google maps script is fully loaded.
 */
export const loadGoogleMaps = () => {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise(async (resolve, reject) => {
    // Check if already loaded globally
    if (window.google?.maps) {
      resolve(window.google.maps);
      return;
    }

    try {
      // 1. Fetch public Google Maps API key from backend
      const { data } = await api.get('/config');
      const apiKey = data.googleMapsApiKey;

      if (!apiKey) {
        console.warn('⚠️ Google Maps API Key is missing in configurations.');
        // Don't reject, allow rendering without autocomplete
        resolve(null);
        return;
      }

      // 2. Create script tag dynamically
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;

      script.addEventListener('load', () => {
        if (window.google?.maps) {
          resolve(window.google.maps);
        } else {
          reject(new Error('Google Maps script loaded but namespace is missing.'));
        }
      });

      script.addEventListener('error', (err) => {
        reject(new Error('Failed to load Google Maps SDK script.'));
      });

      document.head.appendChild(script);
    } catch (error) {
      console.error('Google Maps loader error:', error);
      reject(error);
    }
  });

  return loadPromise;
};
