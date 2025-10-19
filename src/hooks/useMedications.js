// hooks/useMedications.js
import { useState, useEffect } from 'react';

export const useMedications = () => {
  const [medications, setMedications] = useState(() => {
    const saved = localStorage.getItem('medications');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('medications', JSON.stringify(medications));
  }, [medications]);

  const addMedication = (date, medication) => {
    const newMedication = {
      id: Date.now(),
      date: date.toISOString(),
      medication: medication,
      createdAt: new Date().toISOString()
    };
    
    setMedications(prev => [...prev, newMedication]);
  };

  const updateMedication = (id, updatedMedication) => {
    setMedications(prev => 
      prev.map(med => 
        med.id === id ? { ...med, medication: updatedMedication } : med
      )
    );
  };

  const deleteMedication = (id) => {
    setMedications(prev => prev.filter(med => med.id !== id));
  };

  const getMedicationsByDate = (date) => {
    return medications.filter(med => 
      new Date(med.date).toDateString() === date.toDateString()
    );
  };

  const getAllMedications = () => {
    return medications.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  return {
    medications,
    addMedication,
    updateMedication,
    deleteMedication,
    getMedicationsByDate,
    getAllMedications
  };
};