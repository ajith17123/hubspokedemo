import React, { useState } from 'react';
import '../../assets/style/Front_Desk.css';
import { UserCheck, Search, Save, CheckCircle2 } from 'lucide-react';
import { fetchAllPatients, updatePatientDetails, getAvailableDiagnosticTests } from '../../services/patientService';

export default function Update_Patient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [formData, setFormData] = useState(null);
  const [message, setMessage] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    setMessage('');
    const patients = fetchAllPatients();
    const found = patients.find(
      (p) =>
        p.id.toLowerCase() === searchQuery.trim().toLowerCase() ||
        p.mobileNumber.includes(searchQuery.trim()) ||
        p.fullName.toLowerCase().includes(searchQuery.trim().toLowerCase())
    );

    if (found) {
      setSelectedPatient(found);
      setFormData({ ...found, selectedTests: found.tests || [] });
    } else {
      setSelectedPatient(null);
      setFormData(null);
      setMessage('No matching patient record found.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTestToggle = (testId) => {
    setFormData((prev) => {
      const current = prev.selectedTests || [];
      const updated = current.includes(testId)
        ? current.filter((id) => id !== testId)
        : [...current, testId];
      return { ...prev, selectedTests: updated };
    });
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName.trim()) return;

    try {
      const updated = updatePatientDetails(selectedPatient.id, formData);
      setSelectedPatient(updated);
      setMessage(`Patient ${updated.id} details updated successfully!`);
    } catch (err) {
      setMessage('Failed to update patient record.');
    }
  };

  return (
    <div className="fd-card">
      <div className="fd-card-header">
        <h2 className="fd-card-title">
          <UserCheck size={20} />
          Update Patient Details
        </h2>
      </div>

      {/* Search Patient Bar */}
      <form onSubmit={handleSearch} className="fd-form" style={{ marginBottom: '1.5rem' }}>
        <div className="fd-form-group">
          <label className="fd-label">Search Patient by ID, Mobile, or Name</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              className="fd-input"
              placeholder="e.g. Search by Patient ID, Mobile Number or Name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="fd-submit-btn" style={{ width: 'auto', padding: '0.65rem 1.25rem' }}>
              <Search size={16} /> Search
            </button>
          </div>
        </div>
      </form>

      {message && (
        <div style={{
          backgroundColor: message.includes('successfully') ? '#dcfce7' : '#fef2f2',
          color: message.includes('successfully') ? '#15803d' : '#991b1b',
          padding: '0.75rem 1rem',
          borderRadius: '6px',
          marginBottom: '1rem',
          fontSize: '13px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          {message.includes('successfully') && <CheckCircle2 size={16} />} {message}
        </div>
      )}

      {formData && (
        <form onSubmit={handleUpdateSubmit} className="fd-form">
          <div className="fd-row-2col">
            <div className="fd-form-group">
              <label className="fd-label">Patient ID (Read-only)</label>
              <input type="text" className="fd-input" value={formData.id} disabled readOnly style={{ backgroundColor: '#f1f5f9' }} />
            </div>

            <div className="fd-form-group">
              <label className="fd-label">Patient Full Name *</label>
              <input type="text" name="fullName" className="fd-input" value={formData.fullName} onChange={handleInputChange} required />
            </div>
          </div>

          <div className="fd-row-3col">
            <div className="fd-form-group">
              <label className="fd-label">Age *</label>
              <input type="number" name="age" className="fd-input" value={formData.age} onChange={handleInputChange} required />
            </div>

            <div className="fd-form-group">
              <label className="fd-label">Gender</label>
              <select name="gender" className="fd-select" value={formData.gender} onChange={handleInputChange}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="fd-form-group">
              <label className="fd-label">Mobile Number *</label>
              <input type="tel" name="mobileNumber" className="fd-input" value={formData.mobileNumber} onChange={handleInputChange} required />
            </div>
          </div>

          <div className="fd-row-2col">
            <div className="fd-form-group">
              <label className="fd-label">Referring Doctor</label>
              <input type="text" name="referringDoctor" className="fd-input" value={formData.referringDoctor || ''} onChange={handleInputChange} />
            </div>

            <div className="fd-form-group">
              <label className="fd-label">Address</label>
              <input type="text" name="address" className="fd-input" value={formData.address || ''} onChange={handleInputChange} />
            </div>
          </div>

          {/* Test selection */}
          <div className="fd-tests-section">
            <div className="fd-tests-title">
              <span>Diagnostic Tests</span>
            </div>
            <div className="fd-tests-grid-3col">
              {getAvailableDiagnosticTests().map((test) => {
                const isChecked = (formData.selectedTests || []).includes(test.id);
                return (
                  <label key={test.id} className={`fd-test-card ${isChecked ? 'selected' : ''}`}>
                    <input type="checkbox" className="fd-checkbox" checked={isChecked} onChange={() => handleTestToggle(test.id)} />
                    <div className="fd-test-info">
                      <span className="fd-test-name">{test.name}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <button type="submit" className="fd-submit-btn">
            <Save size={18} /> Update Patient Record
          </button>
        </form>
      )}
    </div>
  );
}
