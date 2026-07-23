import { TrendingUp, BrainCircuit } from "lucide-react";

function ForecastPanel({
  mostUrgentItem,
  forecast,
  forecastError,
  lstmForecast,
  lstmForecastError,
}) {
  if (!mostUrgentItem) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">

      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="text-green-600" size={28} />

        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Sales Forecast
          </h2>

          <p className="text-gray-500">
            {mostUrgentItem.name}
          </p>
        </div>
      </div>

      {/* Linear Regression */}

      <div className="mb-8">

        <h3 className="font-semibold text-lg text-gray-700 mb-3">
          Linear Regression
        </h3>

        {forecastError ? (
          <p className="text-red-500">{forecastError}</p>
        ) : forecast ? (
          <>
            <div className="bg-green-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-500">
                Tomorrow
              </p>

              <p className="text-3xl font-bold text-green-600">
                {Math.round(forecast[0].predicted_quantity)} units
              </p>
            </div>

            <div className="space-y-2">
              {forecast.map((day) => (
                <div
                  key={day.day_offset}
                  className="flex justify-between border-b pb-2"
                >
                  <span>Day {day.day_offset}</span>

                  <span className="font-medium">
                    {Math.round(day.predicted_quantity)}
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-gray-500">
            Loading...
          </p>
        )}

      </div>

      {/* LSTM */}

      <div>

        <div className="flex items-center gap-2 mb-3">
          <BrainCircuit className="text-blue-600" size={22} />

          <h3 className="font-semibold text-lg text-gray-700">
            LSTM Forecast
          </h3>
        </div>

        {lstmForecastError ? (
          <p className="text-red-500">{lstmForecastError}</p>
        ) : lstmForecast ? (
          <>
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-500">
                Tomorrow
              </p>

              <p className="text-3xl font-bold text-blue-600">
                {Math.round(lstmForecast[0].predicted_quantity)} units
              </p>
            </div>

            <div className="space-y-2">
              {lstmForecast.map((day) => (
                <div
                  key={day.day_offset}
                  className="flex justify-between border-b pb-2"
                >
                  <span>Day {day.day_offset}</span>

                  <span className="font-medium">
                    {Math.round(day.predicted_quantity)}
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-gray-500">
            Training LSTM model...
          </p>
        )}

      </div>

    </div>
  );
}

export default ForecastPanel;