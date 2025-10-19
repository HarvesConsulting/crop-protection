// components/MedicationModal.js
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './MedicationModal.css';

export default function MedicationModal({ 
  isOpen, 
  onClose, 
  selectedDate, 
  onAddMedication, 
  medications = [] 
}) {
  const { t } = useTranslation();
  const [newMedication, setNewMedication] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  if (!isOpen) return null;

  const handleAddMedication = () => {
    if (newMedication.trim()) {
      onAddMedication(selectedDate, newMedication.trim());
      setNewMedication('');
    }
  };

  const handleStartEdit = (medication) => {
    setEditingId(medication.id);
    setEditText(medication.medication);
  };

  const handleSaveEdit = (id) => {
    if (editText.trim()) {
      onAddMedication(selectedDate, editText.trim(), id);
      setEditingId(null);
      setEditText('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{t('medication.modalTitle')}</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="selected-date">
          {t('medication.selectedDate')}: <strong>{formatDate(selectedDate)}</strong>
        </div>

        <div className="add-medication-section">
          <div className="input-group">
            <input
              type="text"
              value={newMedication}
              onChange={(e) => setNewMedication(e.target.value)}
              placeholder={t('medication.placeholder')}
              onKeyPress={(e) => e.key === 'Enter' && handleAddMedication()}
            />
            <button 
              className="add-button"
              onClick={handleAddMedication}
              disabled={!newMedication.trim()}
            >
              {t('medication.addButton')}
            </button>
          </div>
        </div>

        <div className="medications-list">
          <h4>{t('medication.existingMeds')}:</h4>
          {medications.length === 0 ? (
            <p className="no-medications">{t('medication.noMeds')}</p>
          ) : (
            medications.map(medication => (
              <div key={medication.id} className="medication-item">
                {editingId === medication.id ? (
                  <div className="edit-group">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit(medication.id)}
                    />
                    <div className="edit-actions">
                      <button 
                        className="save-btn"
                        onClick={() => handleSaveEdit(medication.id)}
                      >
                        {t('common.save')}
                      </button>
                      <button 
                        className="cancel-btn"
                        onClick={handleCancelEdit}
                      >
                        {t('common.cancel')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="medication-display">
                    <span className="medication-text">{medication.medication}</span>
                    <div className="medication-actions">
                      <button 
                        className="edit-btn"
                        onClick={() => handleStartEdit(medication)}
                      >
                        {t('common.edit')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}