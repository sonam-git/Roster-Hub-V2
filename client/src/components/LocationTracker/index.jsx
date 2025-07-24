import React, { useState } from 'react';

const LocationTracker = ({ onLocationSelect, isDarkMode }) => {
  const [locations, setLocations] = useState({
    current: null,
    venue: null,
    manual: null
  });
  const [selectedMethod, setSelectedMethod] = useState('venue');
  const [loading, setLoading] = useState(false);
  const [manualInput, setManualInput] = useState('');

  // Method 1: Get user's current location using GPS
  const getCurrentLocation = async () => {
    setLoading(true);
    try {
      const position = await new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation not supported'));
          return;
        }

        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes cache
          }
        );
      });

      const location = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        accuracy: position.coords.accuracy,
        name: 'Current Location',
        method: 'gps'
      };

      setLocations(prev => ({ ...prev, current: location }));
      if (selectedMethod === 'current') {
        onLocationSelect(location);
      }
    } catch (error) {
      console.error('Current location error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Method 2: Geocode venue name
  const geocodeVenue = async (venueName) => {
    if (!venueName) return;
    
    setLoading(true);
    try {
      const API_KEY = import.meta.env.VITE_WEATHER_API_KEY || 'a6273b76b847075c6236ad30b6dafa08';
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(venueName)}&limit=5&appid=${API_KEY}`
      );
      
      if (response.ok) {
        const results = await response.json();
        if (results.length > 0) {
          const location = {
            lat: results[0].lat,
            lon: results[0].lon,
            name: `${results[0].name}, ${results[0].country}`,
            method: 'geocoding',
            alternatives: results.slice(1, 3) // Store alternatives
          };
          
          setLocations(prev => ({ ...prev, venue: location }));
          if (selectedMethod === 'venue') {
            onLocationSelect(location);
          }
        }
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Method 3: Manual coordinates input
  const handleManualInput = (input) => {
    setManualInput(input);
    
    // Try to parse coordinates (lat,lon format)
    const coordMatch = input.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
    if (coordMatch) {
      const location = {
        lat: parseFloat(coordMatch[1]),
        lon: parseFloat(coordMatch[2]),
        name: `Manual: ${input}`,
        method: 'manual'
      };
      
      setLocations(prev => ({ ...prev, manual: location }));
      if (selectedMethod === 'manual') {
        onLocationSelect(location);
      }
    }
  };

  // Method 4: IP-based location (fallback)
  const getIPLocation = async () => {
    setLoading(true);
    try {
      // Using a free IP geolocation service
      const response = await fetch('https://ipapi.co/json/');
      if (response.ok) {
        const data = await response.json();
        const location = {
          lat: data.latitude,
          lon: data.longitude,
          name: `${data.city}, ${data.country_name}`,
          method: 'ip',
          accuracy: 'city-level'
        };
        
        setLocations(prev => ({ ...prev, ip: location }));
        return location;
      }
    } catch (error) {
      console.error('IP location error:', error);
    } finally {
      setLoading(false);
    }
    return null;
  };

  const handleMethodChange = (method) => {
    setSelectedMethod(method);
    const location = locations[method];
    if (location) {
      onLocationSelect(location);
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}>
      <h3 className="font-bold mb-3">Location Tracking Methods</h3>
      
      {/* Location Method Selector */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={() => handleMethodChange('venue')}
          className={`p-2 rounded text-sm ${
            selectedMethod === 'venue'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700'
          }`}
        >
          📍 Venue Name
        </button>
        
        <button
          onClick={() => {
            handleMethodChange('current');
            getCurrentLocation();
          }}
          className={`p-2 rounded text-sm ${
            selectedMethod === 'current'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700'
          }`}
        >
          🎯 Current Location
        </button>
        
        <button
          onClick={() => handleMethodChange('manual')}
          className={`p-2 rounded text-sm ${
            selectedMethod === 'manual'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700'
          }`}
        >
          ✏️ Manual Coords
        </button>
        
        <button
          onClick={() => {
            handleMethodChange('ip');
            getIPLocation();
          }}
          className={`p-2 rounded text-sm ${
            selectedMethod === 'ip'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700'
          }`}
        >
          🌐 IP Location
        </button>
      </div>

      {/* Input Fields */}
      {selectedMethod === 'venue' && (
        <input
          type="text"
          placeholder="Enter venue name or address"
          className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          onChange={(e) => geocodeVenue(e.target.value)}
        />
      )}

      {selectedMethod === 'manual' && (
        <input
          type="text"
          placeholder="Enter coordinates (lat,lon) e.g. 40.7128,-74.0060"
          value={manualInput}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          onChange={(e) => handleManualInput(e.target.value)}
        />
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="flex items-center gap-2 mt-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          <span className="text-sm">Getting location...</span>
        </div>
      )}

      {/* Current Location Display */}
      {locations[selectedMethod] && (
        <div className="mt-3 p-2 bg-green-100 dark:bg-green-900 rounded text-sm">
          <strong>Selected:</strong> {locations[selectedMethod].name}<br/>
          <span className="text-xs opacity-75">
            {locations[selectedMethod].lat.toFixed(4)}, {locations[selectedMethod].lon.toFixed(4)}
            {locations[selectedMethod].accuracy && ` (±${locations[selectedMethod].accuracy}m)`}
          </span>
        </div>
      )}

      {/* Method Explanations */}
      <div className="mt-4 text-xs opacity-75">
        <p><strong>Venue Name:</strong> Uses OpenWeatherMap geocoding</p>
        <p><strong>Current Location:</strong> Uses device GPS (most accurate)</p>
        <p><strong>Manual Coords:</strong> Direct latitude,longitude input</p>
        <p><strong>IP Location:</strong> Estimates location from internet connection</p>
      </div>
    </div>
  );
};

export default LocationTracker;
