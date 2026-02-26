# Google Maps API Setup Guide

## Overview
This application uses Google Maps API with the Places library for location services, mapping, and address autocomplete functionality.

## API Key Setup

### 1. Get Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. Create credentials (API Key)
5. Restrict the API key to your domain for security

### 2. Configure Environment Variables
Copy the `.env.example` file to `.env` and update the values:

```bash
cp .env.example .env
```

Update your `.env` file:
```env
# Replace with your actual Google Maps API key
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here

# Optional: Configure region and language
VITE_GOOGLE_MAPS_REGION=IN
VITE_GOOGLE_MAPS_LANGUAGE=en
```

## Features Enabled

### 1. Interactive Maps
- **Location Screen**: Shows user location and nearby service providers
- **Tracking Screen**: Real-time tracking of service provider location
- **Custom Markers**: Color-coded markers for availability status

### 2. Places Autocomplete
- **Location Search**: Smart address search with autocomplete
- **Geocoding**: Convert addresses to coordinates
- **Country Restriction**: Limited to India (configurable)

### 3. Location Services
- **GPS Detection**: Automatic location detection
- **Manual Entry**: Fallback address search
- **Validation**: Coordinate and API key validation

## Basic Usage Example

### Simple Map Component
```tsx
import { useEffect, useRef } from "react";

export default function MapComponent() {
  const mapRef = useRef(null);

  useEffect(() => {
    if (window.google && mapRef.current) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 9.9252, lng: 78.1198 }, // Example: Madurai
        zoom: 13,
      });

      new window.google.maps.Marker({
        position: { lat: 9.9252, lng: 78.1198 },
        map,
        title: "You are here!",
      });
    }
  }, []);

  return <div ref={mapRef} style={{ width: "100%", height: "100vh" }} />;
}
```

### Access Map Demo
Visit `/map-demo` in your application to see an interactive demo with multiple Indian cities.

## Components

### GoogleMapComponent
Main map component with:
- Interactive map display
- Provider markers
- Info windows
- Zoom controls
- Recenter functionality

### PlacesAutocomplete
Address search component with:
- Google Places autocomplete
- Manual geocoding fallback
- India-specific results
- Error handling

### LocationPermissionModal
Location access modal with:
- GPS permission request
- Places autocomplete search
- Fallback options

## API Usage

### Libraries Loaded
- `places`: For address autocomplete and search
- `geometry`: For location calculations (future use)

### API Calls
- **Maps JavaScript API**: For map display and interaction
- **Places API**: For address autocomplete and place details
- **Geocoding API**: For address-to-coordinate conversion

## Security Notes

1. **API Key Restriction**: Always restrict your API key to specific domains
2. **Environment Variables**: Never commit actual API keys to version control
3. **Rate Limiting**: Be aware of API usage limits and quotas
4. **HTTPS**: Ensure your application is served over HTTPS in production

## Troubleshooting

### Common Issues

1. **"Google Maps API Error"**
   - Check if API key is valid
   - Ensure required APIs are enabled
   - Verify domain restrictions

2. **"Loading map..." stuck**
   - Check network connectivity
   - Verify API key permissions
   - Check browser console for errors

3. **Places autocomplete not working**
   - Ensure Places API is enabled
   - Check if `libraries=places` is loaded
   - Verify API key has Places API access

### Debug Mode
Set `VITE_DEBUG_MAPS=true` in your `.env` file to enable debug logging.

## Cost Optimization

1. **Restrict API Usage**: Use domain and API restrictions
2. **Cache Results**: Implement caching for repeated requests
3. **Optimize Calls**: Minimize unnecessary API calls
4. **Monitor Usage**: Set up billing alerts in Google Cloud Console

## Production Deployment

1. Update API key restrictions for production domain
2. Set up proper HTTPS
3. Configure CSP headers if needed
4. Monitor API usage and costs
5. Set up error tracking for API failures