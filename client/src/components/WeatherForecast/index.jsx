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
      let forecast = weatherData.list.find(item => {
        const forecastDate = new Date(item.dt * 1000);
        return forecastDate.toDateString() === gameDateStr;
      });

      // If no exact match, find the closest forecast to the game date
      if (!forecast) {
        const gameTime = gameDate.getTime();
        forecast = weatherData.list.reduce((closest, current) => {
          const currentTime = new Date(current.dt * 1000).getTime();
          const closestTime = new Date(closest.dt * 1000).getTime();
          
          return Math.abs(currentTime - gameTime) < Math.abs(closestTime - gameTime) 
            ? current 
            : closest;
        });
      }

      // If still no forecast found, throw an error
      if (!forecast) {
        throw new Error('No weather forecast available for the game date');
      }
      
      setWeather({
        temp: Math.round(forecast.main.temp),
        description: forecast.weather[0].description,
        icon: forecast.weather[0].icon,
        humidity: forecast.main.humidity,
        windSpeed: forecast.wind.speed,
        city: locationName.split(',')[0] || 'Unknown',
        country: locationName.split(',')[1] || '',
        forecastDate: new Date(forecast.dt * 1000),
        isExactMatch: new Date(forecast.dt * 1000).toDateString() === gameDateStr
      });
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [city, date, API_KEY, useCurrentLocation, userLocation, getCurrentLocation]);

  useEffect(() => {
    // Check if we have required data to fetch weather
    if (!date) {
      setError('Game date not provided');
      return;
    }

    if (!city && !useCurrentLocation) {
      setError('Game location not specified');
      return;
    }

    const gameDate = new Date(parseInt(date));
    
    // Check if the game date is valid
    if (isNaN(gameDate.getTime())) {
      setError('Invalid game date');
      return;
    }

    // Only fetch weather for games (can be past or future for reference)
    fetchWeather();
  }, [date, city, useCurrentLocation, fetchWeather]);

  // Early return if no date is provided
  if (!date) {
    return (
      <div className={`p-4 rounded-xl text-center ${
        isDarkMode ? 'bg-gray-800 border border-gray-600' : 'bg-gray-50 border border-gray-200'
      }`}>
        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Weather forecast unavailable - no game date provided
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`p-6 rounded-2xl text-center transition-all duration-300 ${
        isDarkMode ? "bg-gray-800 border border-gray-600" : "bg-gray-50 border border-gray-200"
      }`}>
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 mx-auto flex items-center justify-center mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
        <h4 className={`text-lg font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-800"}`}>
          Loading Weather Forecast
        </h4>
        <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
          Fetching weather data for game day...
        </p>
      </div>
    );
  }

  if (error) {
    // Determine the appropriate error message and icon
    const getErrorDisplayInfo = () => {
      if (error.includes('API key')) {
        return {
          icon: '⚙️',
          title: 'Weather Service Unavailable',
          message: 'Weather forecast is currently not configured for this game.'
        };
      }
      if (error.includes('Location not found') || error.includes('location')) {
        return {
          icon: '📍',
          title: 'Location Not Found',
          message: `We couldn't find weather data for "${city || 'this location'}". Please check the game location.`
        };
      }
      if (error.includes('date')) {
        return {
          icon: '📅',
          title: 'Date Issue',
          message: 'There seems to be an issue with the game date for weather lookup.'
        };
      }
      if (error.includes('forecast') || error.includes('weather data')) {
        return {
          icon: '🌤️',
          title: 'Weather Forecast Unavailable',
          message: `Weather data is not available for this game date and location.`
        };
      }
      // Default error
      return {
        icon: '🌤️',
        title: 'Weather Not Available',
        message: 'Weather forecast is currently unavailable for this game.'
      };
    };

    const errorInfo = getErrorDisplayInfo();

    return (
      <div className={`p-6 rounded-2xl text-center transition-all duration-300 ${
        isDarkMode ? "bg-gray-800 border border-gray-600" : "bg-gray-50 border border-gray-200"
      }`}>
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 mx-auto flex items-center justify-center mb-4">
          <span className="text-2xl">{errorInfo.icon}</span>
        </div>
        <h4 className={`text-lg font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-800"}`}>
          {errorInfo.title}
        </h4>
        <p className={`text-sm mb-4 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
          {errorInfo.message}
        </p>
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
          isDarkMode ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-800"
        }`}>
          <span className="text-base">ℹ️</span>
          <span>Check weather conditions manually before the game</span>
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

  // Format the game date for display
  const formatGameDate = () => {
    const gameDate = new Date(parseInt(date));
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (gameDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (gameDate.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return gameDate.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  return (
    <div className={`p-4 rounded-xl shadow-md ${isDarkMode ? 'bg-gradient-to-r from-blue-900 to-blue-800' : 'bg-gradient-to-r from-blue-100 to-sky-100'}`}>
      {/* Location Toggle */}
      <div className="flex justify-between items-center mb-3">
        <div>
          <h4 className="font-bold text-lg dark:text-white font-oswald">Weather Forecast</h4>
          <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Game Day: {formatGameDate()}
          </p>
        </div>
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
            <p className="text-sm opacity-80 dark:text-white">
              {weather.city}{weather.country && `, ${weather.country}`}
            </p>
            {!weather.isExactMatch && (
              <p className={`text-xs ${isDarkMode ? 'text-yellow-300' : 'text-yellow-600'}`}>
                ⚠️ Approximate forecast
              </p>
            )}
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
