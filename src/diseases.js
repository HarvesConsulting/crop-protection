// src/diseases.js

export function isGrayMoldRisk(day) {
  return day.wetHours >= 6 && day.wetTempAvg >= 15 && day.wetTempAvg <= 28;
}

export function isAlternariaRisk(day) {
  return day.wetHours >= 5 && day.allTempAvg >= 15 && day.allTempAvg <= 30;
}

// models based on Kim et al. (2014)

export function isBacterialRisk(day, rainValue) {
  const WET_HOURS_THRESHOLD = 5;
  const TEMP_MIN = 22;
  const TEMP_MAX = 32;
  const RAIN_THRESHOLD_MM = 1.5;
  const NIGHT_TEMP_MIN = 17;

  const wetnessOK =
    (day.condHours ?? 0) >= WET_HOURS_THRESHOLD ||
    (day.wetHours ?? 0) >= WET_HOURS_THRESHOLD;

  const tempOK = day.allTempAvg >= TEMP_MIN && day.allTempAvg <= TEMP_MAX;

  const rainOK = rainValue >= RAIN_THRESHOLD_MM;

  const nightTempOK = !day.minTemp || day.minTemp >= NIGHT_TEMP_MIN;

  return rainOK && wetnessOK && tempOK && nightTempOK;
}
