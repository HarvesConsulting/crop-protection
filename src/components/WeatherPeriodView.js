import { format } from "date-fns";

export default function WeatherPeriodView({ hourlyData, startDate, endDate, humidThreshold = 90 }) {
  if (!hourlyData?.length) return <p>Немає погодних даних</p>;

  const filtered = hourlyData.filter((entry) => {
    return (
      entry.date >= new Date(startDate) &&
      entry.date <= new Date(endDate)
    );
  });

  const grouped = {};
  for (const entry of filtered) {
    const dayStr = format(entry.date, "yyyy-MM-dd");
    if (!grouped[dayStr]) grouped[dayStr] = [];
    grouped[dayStr].push(entry);
  }

  return (
    <div style={{ marginTop: "16px" }}>
      <h4>Погодні умови за період</h4>
      <table border="1" cellPadding="6" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th>Дата</th>
            <th>Середня температура (°C)</th>
            <th>Середня вологість (%)</th>
            <th>Сприятливі години (RH ≥ {humidThreshold}%)</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(grouped).map(([dateStr, entries]) => {
            const avgTemp = (
              entries.reduce((sum, e) => sum + (e.temperature || 0), 0) / entries.length
            ).toFixed(1);
            const avgRH = (
              entries.reduce((sum, e) => sum + (e.humidity || 0), 0) / entries.length
            ).toFixed(0);
            const suitableHours = entries.filter((e) => e.humidity >= humidThreshold).length;

            return (
              <tr key={dateStr}>
                <td>{dateStr}</td>
                <td>{avgTemp}</td>
                <td>{avgRH}</td>
                <td>{suitableHours}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
