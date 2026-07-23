import { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import { X, TrendingUp, BrainCircuit } from "lucide-react";

function ForecastModal({ item, onClose }) {
  const [linearForecast, setLinearForecast] = useState([]);
  const [lstmForecast, setLstmForecast] = useState([]);

  const [linearSummary, setLinearSummary] = useState(null);
  const [lstmSummary, setLstmSummary] = useState(null);

  const [loadingLinear, setLoadingLinear] = useState(true);
  const [loadingLstm, setLoadingLstm] = useState(true);

  const [linearError, setLinearError] = useState("");
  const [lstmError, setLstmError] = useState("");

  useEffect(() => {
    if (!item) return;

    const fetchLinear = async () => {
      try {
        setLoadingLinear(true);
        const res = await api.get(`/inventory/${item.id}/forecast`);
        setLinearForecast(res.data.forecast);
        setLinearSummary({
          currentStock: res.data.current_stock,
          reorderLevel: res.data.reorder_level,
          daysUntilStockout: res.data.days_until_stockout,
          status: res.data.status,
        });
      } catch (err) {
        setLinearError(
          err.response?.data?.error || "Unable to load forecast."
        );
      } finally {
        setLoadingLinear(false);
      }
    };

    const fetchLSTM = async () => {
      try {
        setLoadingLstm(true);
        const res = await api.get(`/inventory/${item.id}/forecast/lstm`);
        setLstmForecast(res.data.forecast);
        setLstmSummary({
          currentStock: res.data.current_stock,
          reorderLevel: res.data.reorder_level,
          daysUntilStockout: res.data.days_until_stockout,
          status: res.data.status,
        });
      } catch (err) {
        setLstmError(
          err.response?.data?.error || "Unable to load LSTM forecast."
        );
      } finally {
        setLoadingLstm(false);
      }
    };

    fetchLinear();
    fetchLSTM();
  }, [item]);

  if (!item) return null;

  const statusColor = {
    "Out of Stock": "text-red-600 bg-red-50",
    "Low Stock": "text-yellow-700 bg-yellow-50",
    "Healthy": "text-green-700 bg-green-50",
  };

  const renderSummary = (summary) => {
    if (!summary) return null;
    return (
      <div className="grid grid-cols-2 gap-3 mb-5 text-sm">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-gray-500">Current Stock</p>
          <p className="font-semibold text-lg">{summary.currentStock}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-gray-500">Reorder Level</p>
          <p className="font-semibold text-lg">{summary.reorderLevel}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-gray-500">Est. Stockout</p>
          <p className="font-semibold text-lg">
            {summary.daysUntilStockout ?? "N/A"}{" "}
            {summary.daysUntilStockout != null ? "days" : ""}
          </p>
        </div>
        <div className={`rounded-lg p-3 ${statusColor[summary.status] || "bg-gray-50"}`}>
          <p className="text-gray-500">Status</p>
          <p className="font-semibold text-lg">{summary.status}</p>
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-8 py-5 border-b">
          <div>
            <h2 className="text-2xl font-bold">Forecast Analysis</h2>
            <p className="text-gray-500">{item.name}</p>
          </div>
          <button onClick={onClose} className="rounded-full hover:bg-gray-100 p-2">
            <X />
          </button>
        </div>

        <div className="p-8 space-y-8">
          <section className="border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <TrendingUp className="text-green-600" />
              <h3 className="font-bold text-lg">Linear Regression</h3>
            </div>

            {loadingLinear ? (
              <p>Loading...</p>
            ) : linearError ? (
              <p className="text-red-500">{linearError}</p>
            ) : (
              <>
                {renderSummary(linearSummary)}
                <div className="bg-green-50 rounded-xl p-4 mb-5">
                  <p className="text-gray-500 text-sm">Tomorrow</p>
                  <h2 className="text-4xl font-bold text-green-700">
                    {Math.round(linearForecast[0]?.predicted_quantity ?? 0)} units
                  </h2>
                </div>
                {linearForecast.map((day) => (
                  <div key={day.day_offset} className="flex justify-between py-2 border-b">
                    <span>Day {day.day_offset}</span>
                    <span className="font-semibold">{Math.round(day.predicted_quantity)} units</span>
                  </div>
                ))}
              </>
            )}
          </section>

          <section className="border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <BrainCircuit className="text-blue-600" />
              <h3 className="font-bold text-lg">LSTM Neural Network</h3>
            </div>

            {loadingLstm ? (
              <p>Training model...</p>
            ) : lstmError ? (
              <p className="text-red-500">{lstmError}</p>
            ) : (
              <>
                {renderSummary(lstmSummary)}
                <div className="bg-blue-50 rounded-xl p-4 mb-5">
                  <p className="text-gray-500 text-sm">Tomorrow</p>
                  <h2 className="text-4xl font-bold text-blue-700">
                    {Math.round(lstmForecast[0]?.predicted_quantity ?? 0)} units
                  </h2>
                </div>
                {lstmForecast.map((day) => (
                  <div key={day.day_offset} className="flex justify-between py-2 border-b">
                    <span>Day {day.day_offset}</span>
                    <span className="font-semibold">{Math.round(day.predicted_quantity)} units</span>
                  </div>
                ))}
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default ForecastModal;