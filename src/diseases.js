// src/diseases.js

export function isGrayMoldRisk(day) {
  return day.wetHours >= 6 && day.wetTempAvg >= 15 && day.wetTempAvg <= 28;
}

export function isAlternariaRisk(day) {
  return day.wetHours >= 5 && day.allTempAvg >= 15 && day.allTempAvg <= 30;
}

export function isBacterialRisk(day, rainValue) {
  const hasRain = rainValue >= 1.5; // легкий дощ або зрошення
  const tempOK = day.allTempAvg >= 22 && day.allTempAvg <= 32;
  const nightTempOK = !day.minTemp || day.minTemp >= 17; // якщо є minTemp — нічна температура не повинна бути низькою
  const wetnessOK =
    (day.condHours ?? 0) >= 2 || (day.wetHours ?? 0) >= 4;

  return hasRain && tempOK && wetnessOK && nightTempOK;
}
