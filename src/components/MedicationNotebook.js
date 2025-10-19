// components/MedicationNotebook.js
import React from 'react';
import { useTranslation } from 'react-i18next';
import './MedicationNotebook.css';

export default function MedicationNotebook({ 
  isOpen, 
  onClose, 
  medications = [],
  onEditMedication 
}) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long'
    });
  };

  return (
    <div className="notebook-overlay" onClick={onClose}>
      <div className="notebook-content" onClick={e => e.stopPropagation()}>
        <div className="notebook-header">
          <h2>{t('notebook.title')}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="notebook-body">
          {medications.length === 0 ? (
            <div className="empty-notebook">
              <p>{t('notebook.empty')}</p>
            </div>
          ) : (
            <div className="medications-table">
              <table>
                <thead>
                  <tr>
                    <th>{t('notebook.date')}</th>
                    <th>{t('notebook.medication')}</th>
                    <th>{t('notebook.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {medications.map(medication => (
                    <tr key={medication.id}>
                      <td className="date-cell">
                        {formatDate(medication.date)}
                      </td>
                      <td className="medication-cell">
                        {medication.medication}
                      </td>
                      <td className="actions-cell">
                        <button 
                          className="edit-btn"
                          onClick={() => onEditMedication(medication)}
                        >
                          {t('common.edit')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}