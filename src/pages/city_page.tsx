import { useParams, useSearchParams } from "react-router-dom";
import { useWeatherQuery, useForecastQuery } from "@/hooks/Use_weather";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { AlertTriangle } from "lucide-react";
import { CurrentWeather } from "../components/Current_Weather";
import { HourlyTemperature } from "../components/Hourly_Temprature";
import { WeatherDetails } from "../components/Weather_Details";
import { WeatherForecast } from "../components/Weather_Forecast";
import WeatherSkeleton from "../components/Loading_Skeleton";
import { FavoriteButton } from "@/components/Favorite_Button";

export function CityPage() {
  const [searchParams] = useSearchParams();
  const params = useParams();
  const lat = parseFloat(searchParams.get("lat") || "0");
  const lon = parseFloat(searchParams.get("lon") || "0");

  const coordinates = { lat, lon };

  const weatherQuery = useWeatherQuery(coordinates);
  const forecastQuery = useForecastQuery(coordinates);

  if (weatherQuery.error || forecastQuery.error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load weather data. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  if (!weatherQuery.data || !forecastQuery.data || !params.cityName) {
    return <WeatherSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          {params.cityName}, {weatherQuery.data.sys.country}
        </h1>
        <div className="flex gap-2">
          <FavoriteButton
            data={{ ...weatherQuery.data, name: params.cityName }}
          />
        </div>
      </div>

      <div className="grid gap-6">
        <CurrentWeather data={weatherQuery.data} />
        <HourlyTemperature data={forecastQuery.data} />
        <div className="grid gap-6 md:grid-cols-2 items-start">
          <WeatherDetails data={weatherQuery.data} />
          <WeatherForecast data={forecastQuery.data} />
        </div>
      </div>
    </div>
  );
}