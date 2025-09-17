// src/diseases.js

export function isGrayMoldRisk(day) {
  return day.wetHours >= 6 && day.wetTempAvg >= 15 && day.wetTempAvg <= 28;
}

export function isAlternariaRisk(day) {
  return day.wetHours >= 5 && day.allTempAvg >= 15 && day.allTempAvg <= 30;
}

export function isBacterialRisk(day, rainValue) {
  return (
    rainValue >= 3 &&
    day.allTempAvg >= 22 && day.allTempAvg <= 32 &&
    day.wetHours >= 4
  );
}
