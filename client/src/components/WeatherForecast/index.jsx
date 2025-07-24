import React, { useState, useEffect } from 'react';

const WeatherForecast = ({ date, city, isDarkMode }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  // You'll need to get an API key from OpenWeatherMap (free)
  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY || 'your-api-key-here';
  
  // Get user's current location
  const getCurrentLocation = React.useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          setUserLocation(location);
          resolve(location);
        },
        (error) => {
          let errorMessage = 'Unable to get location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 600000 // 10 minutes cache
        }
      );
    });
  }, []);
  
  const fetchWeather = React.useCallback(async () => {
    if (!API_KEY || API_KEY === 'your-api-key-here') {
      setError('Weather API key not configured');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let lat, lon, locationName = city;

      // Try to get user's current location first if they allow it
      if (useCurrentLocation && userLocation) {
        lat = userLocation.lat;
        lon = userLocation.lon;
        locationName = 'Current Location';
      } else if (useCurrentLocation) {
        try {
          const currentLoc = await getCurrentLocation();
          lat = currentLoc.lat;
          lon = currentLoc.lon;
          locationName = 'Current Location';
        } catch (geoError) {
          console.warn('Geolocation failed, falling back to city geocoding:', geoError.message);
          // Fall back to city-based geocoding
        }
      }

      // If we don't have coordinates yet, use city geocoding
      if (!lat || !lon) {
        if (!city) {
          setError('No location information available');
          return;
        }

        // Geocode the city name
        const geocodeResponse = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
            city
          )}&limit=1&appid=${API_KEY}`
        );
        
        if (!geocodeResponse.ok) {
          throw new Error('Failed to get location coordinates');
        }
        
        const locations = await geocodeResponse.json();
        
        if (locations.length === 0) {
          throw new Error('Location not found');
        }

        lat = locations[0].lat;
        lon = locations[0].lon;
        locationName = `${locations[0].name}, ${locations[0].country}`;
      }
      
      // Get weather forecast
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      
      if (!weatherResponse.ok) {
        throw new Error('Failed to get weather data');
      }
      
      const weatherData = await weatherResponse.json();
      
      // Find forecast for the game date
      const gameDate = new Date(parseInt(date));
      const gameDateStr = gameDate.toDateString();
      
      // Find the forecast closest to the game date
      const forecast = weatherData.list.find(item => {
        const forecastDate = new Date(item.dt * 1000);
        return forecastDate.toDateString() === gameDateStr;
      }) || weatherData.list[0]; // Fallback to first forecast if exact date not found
      
      setWeather({
        temp: Math.round(forecast.main.temp),
        description: forecast.weather[0].description,
        icon: forecast.weather[0].icon,
        humidity: forecast.main.humidity,
        windSpeed: forecast.wind.speed,
        city: locationName.split(',')[0] || 'Unknown',
        country: locationName.split(',')[1] || ''
      });
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [city, date, API_KEY, useCurrentLocation, userLocation, getCurrentLocation]);

  useEffect(() => {
    // Only fetch weather for future games
    const gameDate = new Date(parseInt(date));
    const today = new Date();
    
    if (gameDate >= today) {
      fetchWeather();
    }
  }, [date, city, fetchWeather]);

  if (loading) {
    return (
      <div className={`p-4 rounded-xl shadow ${isDarkMode ? 'bg-gray-700' : 'bg-white/80'} mb-6`}>
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          <span className="text-sm">Loading weather forecast...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 rounded-xl shadow ${isDarkMode ? 'bg-gray-700' : 'bg-white/80'} mb-6`}>
        <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
          <span className="text-lg">⚠️</span>
          <span className="text-sm">Weather forecast unavailable</span>
        </div>
      </div>
    );
  }

  if (!weather) return null;

  const getWeatherIcon = (iconCode) => {
    const iconMap = {
      '01d': '☀️', '01n': '🌙',
      '02d': '⛅', '02n': '☁️',
      '03d': '☁️', '03n': '☁️',
      '04d': '☁️', '04n': '☁️',
      '09d': '🌧️', '09n': '🌧️',
      '10d': '🌦️', '10n': '🌧️',
      '11d': '⛈️', '11n': '⛈️',
      '13d': '❄️', '13n': '❄️',
      '50d': '🌫️', '50n': '🌫️'
    };
    return iconMap[iconCode] || '🌤️';
  };

  return (
    <div className={`p-4 rounded-xl shadow-md mb-6 ${isDarkMode ? 'bg-gradient-to-r from-blue-900 to-blue-800' : 'bg-gradient-to-r from-blue-100 to-sky-100'}`}>
      {/* Location Toggle */}
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-bold text-lg dark:text-white">Weather Forecast</h4>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setUseCurrentLocation(!useCurrentLocation)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              useCurrentLocation 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-100'
            }`}
          >
            {useCurrentLocation ? '📍 Current Location' : '🏙️ City Location'}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{getWeatherIcon(weather.icon)}</span>
          <div>
            <p className="text-sm opacity-80 dark:text-white">{weather.city}{weather.country && `, ${weather.country}`}</p>
          </div>
        </div>
        
        <div className="text-right dark:text-white">
          <div className="text-2xl font-bold">{weather.temp}°C</div>
          <div className="text-sm opacity-80 capitalize">{weather.description}</div>
        </div>
      </div>
      
      <div className="flex justify-between mt-3 pt-3 border-t border-white/20 dark:border-gray-600">
        <div className="text-center dark:text-white">
          <div className="text-xs opacity-80 ">Humidity</div>
          <div className="font-semibold">{weather.humidity}%</div>
        </div>
        <div className="text-center dark:text-white">
          <div className="text-xs opacity-80">Wind</div>
          <div className="font-semibold">{weather.windSpeed} m/s</div>
        </div>
      </div>
    </div>
  );
};

export default WeatherForecast;
