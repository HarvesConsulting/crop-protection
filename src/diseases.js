// src/diseases.js

export function isGrayMoldRisk(day) {
  return day.wetHours >= 15 && day.wetTempAvg >= 17 && day.wetTempAvg <= 25;
}

export function isAlternariaRisk(day) {
  return day.wetHours >= 8 && day.allTempAvg >= 20 && day.allTempAvg <= 30;
}

export function isBacterialRisk(day, rainValue) {
  return rainValue >= 5 && day.allTempAvg >= 25 && day.allTempAvg <= 32;
}
