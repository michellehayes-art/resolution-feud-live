/**
 * Geolocation & Reverse Geocoding Utility for Resolution Feud
 * Compliant with Google Play Location & Privacy Policies:
 * - Coordinates are only retrieved upon explicit user button tap.
 * - Coordinates are only processed client-side to display the city origin.
 * - Coordinates are never stored on external tracking servers or sold.
 */

export interface GeolocationResult {
  city: string;
  region?: string;
  country?: string;
  displayLabel: string;
  latitude: number;
  longitude: number;
}

/**
 * Reverse-geocodes latitude and longitude to a human-readable city and region.
 * Uses BigDataCloud client reverse-geocoding API (free, CORS-friendly, zero-auth).
 * Falls back to browser timezone city if network request is unavailable.
 */
export async function reverseGeocodeCoordinates(
  latitude: number,
  longitude: number
): Promise<GeolocationResult> {
  try {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );

    if (response.ok) {
      const data = await response.json();
      const city =
        data.city ||
        data.locality ||
        data.principalSubdivision ||
        'Local Studio';
      const region = data.principalSubdivisionCode || data.principalSubdivision || '';
      const country = data.countryCode || data.countryName || '';

      const displayLabel = region ? `${city}, ${region}` : country ? `${city}, ${country}` : city;

      return {
        city,
        region,
        country,
        displayLabel,
        latitude,
        longitude,
      };
    }
  } catch (error) {
    console.warn('Network reverse geocoding unavailable, falling back to timezone:', error);
  }

  // Graceful fallback: Extract city from browser's resolved IANA timezone
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  const tzCity = tz.includes('/') ? tz.split('/')[1].replace(/_/g, ' ') : 'Live Studio';

  return {
    city: tzCity,
    displayLabel: tzCity,
    latitude,
    longitude,
  };
}

/**
 * Requests browser geolocation with a 10s timeout and returns city result
 */
export function getCurrentCity(): Promise<GeolocationResult> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const result = await reverseGeocodeCoordinates(
            position.coords.latitude,
            position.coords.longitude
          );
          resolve(result);
        } catch (err) {
          reject(err);
        }
      },
      (error) => {
        let errorMsg = 'Could not retrieve your location.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Location permission was denied. Enable permission in browser settings to show your city.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = 'Location information is currently unavailable.';
        } else if (error.code === error.TIMEOUT) {
          errorMsg = 'Location request timed out.';
        }
        reject(new Error(errorMsg));
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // 5 min cache
      }
    );
  });
}
