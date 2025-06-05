import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useWeatherQuery, useForecastQuery } from "@/hooks/Use_weather";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { AlertTriangle,ArrowLeft } from "lucide-react";
import { CurrentWeather } from "../components/Current_Weather";
import { HourlyTemperature } from "../components/Hourly_Temprature";
import { WeatherDetails } from "../components/Weather_Details";
import { WeatherForecast } from "../components/Weather_Forecast";
import WeatherSkeleton from "../components/Loading_Skeleton";
import { FavoriteButton } from "@/components/Favorite_Button";
import { useState, useEffect } from "react";

async function getCoordinatesFromCity(cityName: string) {
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;

  const response = await fetch(
    `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${apiKey}`
  );
  const data = await response.json();

  if (!data || data.length === 0) {
    throw new Error("City not found");
  }

  return {
    lat: data[0].lat,
    lon: data[0].lon,
  };
}


export function CityPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const params = useParams();

  const [lat, setLat] = useState<number>(parseFloat(searchParams.get("lat") || "0"));
  const [lon, setLon] = useState<number>(parseFloat(searchParams.get("lon") || "0"));

  const [searchCity, setSearchCity] = useState("");

  const coordinates = { lat, lon };
  const weatherQuery = useWeatherQuery(coordinates);
  const forecastQuery = useForecastQuery(coordinates);

  
  useEffect(() => {
    const newLat = parseFloat(searchParams.get("lat") || "0");
    const newLon = parseFloat(searchParams.get("lon") || "0");
    setLat(newLat);
    setLon(newLon);
  }, [searchParams]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const coords = await getCoordinatesFromCity(searchCity);
      navigate(`/city/${searchCity}?lat=${coords.lat}&lon=${coords.lon}`);
      setSearchCity("");
    } catch (err) {
      alert("City not found");
    }
  };

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
   <button
      onClick={() => navigate(-1)}
      className="flex items-center gap-2 border px-4 py-2 rounded transition-colors
                 text-black border-gray-300 hover:bg-gray-100 hover:text-black
                 dark:text-white dark:border-white dark:hover:bg-white dark:hover:text-black"
    >
      <ArrowLeft className="w-4 h-4" />
      Back to Dashboard
    </button>
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={searchCity}
          onChange={(e) => setSearchCity(e.target.value)}
          placeholder="Enter city name..."
          className="border border-gray-300 rounded px-4 py-2 w-full"
        />
        <button
          type="submit"
          className="border px-4 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed 
             text-black border-gray-300 hover:bg-black hover:text-white 
             dark:text-white dark:border-white dark:hover:bg-white dark:hover:text-black"
        >
          Search
        </button>
      </form>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          {params.cityName}, {weatherQuery.data.sys.country}
        </h1>
        <FavoriteButton data={{ ...weatherQuery.data, name: params.cityName }} />
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
