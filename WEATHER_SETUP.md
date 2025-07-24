# Weather Forecast Setup

This feature displays weather forecast for upcoming games using the OpenWeatherMap API.

## Setup Instructions

1. **Get a free API key from OpenWeatherMap:**
   - Go to https://openweathermap.org/api
   - Sign up for a free account
   - Generate an API key (it may take a few minutes to activate)

2. **Configure the environment variable:**
   - Copy the `.env.example` file to `.env` in the client directory
   - Replace `your_openweathermap_api_key_here` with your actual API key

3. **Example .env file:**
   ```
   VITE_WEATHER_API_KEY=your_actual_api_key_here
   ```

## Features

- Displays weather forecast for the game day
- Shows temperature, weather description, humidity, and wind speed
- Only shows for future games (not past games)
- Responsive design that matches your app's theme
- Graceful error handling if API is unavailable

## How it works

- Uses the game venue to get geographical coordinates
- Fetches 5-day weather forecast from OpenWeatherMap
- Finds the forecast closest to the game date
- Displays weather information in a beautiful card format

## Troubleshooting

- If weather doesn't show, check that your API key is correct and active
- Make sure the `.env` file is in the client directory (not the root)
- Weather only shows for future games, not past ones
- The venue name should be recognizable (city name works best)
