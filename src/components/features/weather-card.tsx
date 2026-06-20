'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LoaderCircle, Sun, Droplets, Wind, Thermometer } from 'lucide-react';
import { getWeatherData, type WeatherData } from '@/services/weather-service';
import { useLanguage } from '@/context/LanguageContext';

interface WeatherCardProps {
  location: string;
}

// Named export so dashboard import { WeatherCard } works
export function WeatherCard({ location }: WeatherCardProps) {
  const { t } = useLanguage();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWeather() {
      if (!location) {
        setLoading(false);
        setError(t('WeatherCard.locationNotProvided'));
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const data = await getWeatherData(location);
        setWeather(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('WeatherCard.fetchFailed'));
        console.error('Error fetching weather:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, [location]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sun className="size-6 text-primary" />
          <span>{t('WeatherCard.title')} – {location}</span>
        </CardTitle>
        <CardDescription>{t('WeatherCard.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-24">
            <LoaderCircle className="size-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-24">
            <p className="text-destructive text-center">{error}</p>
          </div>
        ) : weather ? (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Thermometer className="size-5 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">{t('WeatherCard.temperature')}</p>
                <p className="font-bold text-lg">{weather.temperature.toFixed(1)}°C</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Droplets className="size-5 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">{t('WeatherCard.humidity')}</p>
                <p className="font-bold text-lg">{weather.humidity}%</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Wind className="size-5 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">{t('WeatherCard.windSpeed')}</p>
                <p className="font-bold text-lg">{weather.windSpeed.toFixed(1)} km/h</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Sun className="size-5 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">{t('WeatherCard.forecast')}</p>
                <p className="font-bold text-lg capitalize">
                  {weather.forecast ? (t(`weather.forecast.${weather.forecast.toLowerCase().replace(/ /g, '_')}`) || weather.forecast) : ''}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-24">
            <p className="text-muted-foreground">{t('WeatherCard.noData')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Keep default export so any old import still works
export default WeatherCard;
