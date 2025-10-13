// src/utils.js

/**
 * Повертає масив об'єктів з об'єднаними препаратами по датах
 * Формат: [{ Дата: "21.08.2025", Препарати: [ '...', '...' ] }, ...]
 */
export const getIntegratedSystem = (data = []) => {
  const mergedByDate = {};

  data.forEach((entry) => {
    const date = entry.Дата;
    if (!mergedByDate[date]) {
      mergedByDate[date] = [];
    }

    // Додаємо препарат (може бути рядок або масив)
    if (Array.isArray(entry.Препарат)) {
      mergedByDate[date].push(...entry.Препарат);
    } else if (entry.Препарат) {
      mergedByDate[date].push(entry.Препарат);
    }
  });

  const sortedDates = Object.keys(mergedByDate).sort((a, b) => {
    const [dA, mA, yA] = a.split(".");
    const [dB, mB, yB] = b.split(".");
    return new Date(yA, mA - 1, dA) - new Date(yB, mB - 1, dB);
  });

  return sortedDates.map((date) => ({
    Дата: date,
    Препарати: mergedByDate[date],
  }));
};
