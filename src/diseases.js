// src/diseases.js

export function isGrayMoldRisk(day) {
  return day.wetHours >= 6 && day.wetTempAvg >= 15 && day.wetTempAvg <= 28;
}

export function isAlternariaRisk(day) {
  return day.wetHours >= 5 && day.allTempAvg >= 15 && day.allTempAvg <= 30;
}

// models based on Kim et al. (2014)

export function isBacterialRisk(day, rainValue) {
  const strongRain = rainValue >= 5;
  const heavyDew = day.wetHours >= 8;
  const tempOK = day.allTempAvg >= 24 && day.allTempAvg <= 32;

  return tempOK && (strongRain || heavyDew);
}
