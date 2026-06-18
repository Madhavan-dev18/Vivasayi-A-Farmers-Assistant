'use server';

// WeatherData type used by WeatherCard component
export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  forecast: string;
  location: string;
}

export async function getWeatherData(location: string): Promise<WeatherData> {
  const apiKey = process.env.WEATHER_API_KEY;

  if (!apiKey) {
    // Return safe fallback so the dashboard renders even without the key set
    console.warn('WEATHER_API_KEY is not set – returning mock weather data.');
    return {
      temperature: 28.5,
      humidity: 65,
      windSpeed: 12.3,
      forecast: 'partly cloudy',
      location,
    };
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric`;
    const res = await fetch(url, { next: { revalidate: 3600 } });

    if (!res.ok) {
      throw new Error(`OpenWeatherMap returned ${res.status}`);
    }

    const raw = await res.json();

    // Normalize the raw OWM response into the typed WeatherData shape
    return {
      temperature: raw.main?.temp ?? 0,
      humidity: raw.main?.humidity ?? 0,
      windSpeed: (raw.wind?.speed ?? 0) * 3.6, // m/s → km/h
      forecast: raw.weather?.[0]?.description ?? 'unknown',
      location: raw.name ?? location,
    };
  } catch (error) {
    console.error('Weather fetch failed:', error);
    // Graceful fallback – never crash the dashboard
    return {
      temperature: 28.5,
      humidity: 65,
      windSpeed: 12.3,
      forecast: 'data unavailable',
      location,
    };
  }
}
