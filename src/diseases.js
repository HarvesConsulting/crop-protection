// src/diseases.js

export function isGrayMoldRisk(day) {
  return day.wetHours >= 6 && day.wetTempAvg >= 15 && day.wetTempAvg <= 28;
}

export function isAlternariaRisk(day) {
  return day.wetHours >= 5 && day.allTempAvg >= 15 && day.allTempAvg <= 30;
}

// models based on Kim et al. (2014)

export function isBacterialRisk(day, rainValue) {
  const wet = Number(day.wetHours) || 0;
  const temp = Number(day.allTempAvg) || 0;

  const strongRain = rainValue >= 3;       // трохи слабший поріг
  const heavyDew = wet >= 5;                // 5 годин вологості листя

  const tempOK = temp >= 20 && temp <= 32;  // температура нижча межа

  return tempOK && (strongRain || heavyDew);
}
