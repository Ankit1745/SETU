import { Platform } from 'react-native';
import { ApiService } from '../services/api';

export interface LiveLocationResult {
  ok: boolean;
  formattedLocation?: string;
  area?: string;
  city?: string;
  pincode?: string;
  lat?: number;
  lng?: number;
  error?: string;
}

/**
 * Acquires live device GPS coordinates (Web Geolocation API) and resolves human-readable
 * locality, city, and pincode via backend Nominatim proxy (CORS-safe), with direct fallback.
 */
export async function detectLiveGpsLocation(): Promise<LiveLocationResult> {
  if (Platform.OS !== 'web' || typeof navigator === 'undefined' || !navigator.geolocation) {
    return {
      ok: false,
      error: 'इस डिवाइस/ब्राउज़र पर लाइव GPS उपलब्ध नहीं है। कृपया शहर या क्षेत्र मैन्युअल चुनें।',
    };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const proxyRes = await ApiService.reverseGeocode(latitude, longitude);
          if (proxyRes && proxyRes.success && proxyRes.formattedLocation) {
            resolve({
              ok: true,
              formattedLocation: proxyRes.formattedLocation,
              area: proxyRes.area,
              city: proxyRes.city,
              pincode: proxyRes.pincode,
              lat: latitude,
              lng: longitude,
            });
            return;
          }
        } catch {
          // Fall through to direct lookup or raw coordinates
        }

        try {
          const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`;
          const res = await fetch(url);
          if (res.ok) {
            const geoData = await res.json();
            const addr = geoData.address || {};
            const area =
              addr.suburb ||
              addr.neighbourhood ||
              addr.road ||
              addr.residential ||
              addr.village ||
              '';
            const city = addr.city || addr.town || addr.state_district || addr.state || '';
            const pincode = addr.postcode || '';
            const parts = [area, city].filter(Boolean).join(', ');
            const formatted = parts
              ? `${parts}${pincode ? ` • ${pincode}` : ''}`
              : `GPS (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
            resolve({
              ok: true,
              formattedLocation: formatted,
              area,
              city,
              pincode,
              lat: latitude,
              lng: longitude,
            });
            return;
          }
        } catch {
          // Non-fatal
        }

        resolve({
          ok: true,
          formattedLocation: `लाइव GPS (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
          city: '',
          area: '',
          lat: latitude,
          lng: longitude,
        });
      },
      (err) => {
        let msg = 'GPS लोकेशन की अनुमति अस्वीकृत हुई है। कृपया ब्राउज़र में Location Permission Allow करें या नीचे शहर चुनें।';
        if (err && err.code === 3) {
          msg = 'GPS सिग्नल टाइमआउट हुआ। कृपया खुली जगह या Wi-Fi के साथ पुनः प्रयास करें।';
        }
        resolve({ ok: false, error: msg });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });
}
