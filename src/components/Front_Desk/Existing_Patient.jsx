import React, { useState, useEffect } from 'react';
import '../../assets/style/Front_Desk.css';
import { UserCheck, Search, Barcode, Phone, User, MapPin, CheckCircle2, X } from 'lucide-react';
import { AVAILABLE_TESTS, getPatients, savePatient } from '../../DataStorage/patientData';

function Existing_Patient({ onRegistrationSuccess }) {
  const [searchKey, setSearchKey] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searched, setSearched] = useState(false);

  // Selected Patient for Re-Registration Form
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Form State for Re-Registration
  const [formData, setFormData] = useState({
    fullName: '',
    aadhaarId: '',
    age: '',
    gender: 'Male',
    encounterType: 'Out-Patient [OP]',
    mobileNumber: '',
    referringDoctor: '',
    address: '',
    selectedTests: []
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Clear notification message timer
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Handle Search Patients
  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (!searchKey.trim()) return;

    const allPatients = getPatients();
    const q = searchKey.toLowerCase().trim();
    const results = allPatients.filter(
      (p) =>
        p.id.toLowerCase().includes(q) ||
        p.fullName.toLowerCase().includes(q) ||
        p.mobileNumber.includes(q) ||
        (p.aadhaarId && p.aadhaarId.toLowerCase().includes(q))
    );
    setSearchResults(results);
    setSearched(true);
    setSelectedPatient(null);
  };

  // Select Patient to Register For Test Now
  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setFormData({
      fullName: patient.fullName || '',
      aadhaarId: patient.aadhaarId || '',
      age: patient.age ? String(patient.age) : '',
      gender: patient.gender || 'Male',
      encounterType: patient.encounterType || 'Out-Patient [OP]',
      mobileNumber: patient.mobileNumber || '',
      referringDoctor: patient.referringDoctor || '',
      address: patient.address || '',
      selectedTests: []
    });
    setErrors({});
  };

  // Form Field Input Handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Test Selection Checkbox Toggle Handler
  const handleTestToggle = (testId) => {
    setFormData(prev => {
      const current = prev.selectedTests;
      const updated = current.includes(testId)
        ? current.filter(id => id !== testId)
        : [...current, testId];
      return { ...prev, selectedTests: updated };
    });
    if (errors.selectedTests) {
      setErrors(prev => ({ ...prev, selectedTests: '' }));
    }
  };

  // Validate Re-Registration Form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    }
    
    const cleanAadhaar = formData.aadhaarId.replace(/\s|-/g, '');
    if (!formData.aadhaarId.trim()) {
      newErrors.aadhaarId = 'Aadhaar / Gov ID is required.';
    } else if (!/^\d{12}$/.test(cleanAadhaar) && formData.aadhaarId !== '[Aadhaar Redacted]') {
      newErrors.aadhaarId = 'Must be a valid 12-digit numeric ID.';
    }

    const ageNum = parseInt(formData.age, 10);
    if (!formData.age || isNaN(ageNum) || ageNum < 1 || ageNum > 110) {
      newErrors.age = 'Enter a valid age between 1 and 110.';
    }

    const cleanPhone = formData.mobileNumber.trim();
    if (!cleanPhone) {
      newErrors.mobileNumber = 'Mobile number is required.';
    } else if (!/^\d{10}$/.test(cleanPhone)) {
      newErrors.mobileNumber = 'Must be a 10-digit mobile number.';
    }

    if (formData.selectedTests.length === 0) {
      newErrors.selectedTests = 'Please select at least one clinical diagnostic test.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Submit Re-Registration (Generate Barcode)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const newPatient = savePatient(formData, selectedPatient);

      setFormData({
        fullName: '',
        aadhaarId: '',
        age: '',
        gender: 'Male',
        encounterType: 'Out-Patient [OP]',
        mobileNumber: '',
        referringDoctor: '',
        address: '',
        selectedTests: []
      });
      setSelectedPatient(null);
      setErrors({});

      const successMsg = `New Visit Registered for ${newPatient.fullName} (${newPatient.id}) - Barcodes Generated Successfully!`;
      setSuccessMessage(successMsg);

      if (onRegistrationSuccess) {
        onRegistrationSuccess(newPatient);
      }
    } catch (err) {
      alert('Failed to save patient record.');
    }
  };

  return (
    <div className="fd-wrapper" style={{ paddingBottom: '3rem' }}>
      <div className="fd-card">
        {/* Success Alert */}
        {successMessage && (
          <div style={{
            backgroundColor: '#dcfce7',
            color: '#15803d',
            padding: '0.85rem 1.25rem',
            borderRadius: '8px',
            marginBottom: '1.25rem',
            border: '1px solid #bbf7d0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            <CheckCircle2 size={18} />
            {successMessage}
          </div>
        )}

        {/* Card Header Title */}
        <div className="fd-card-header" style={{ marginBottom: '1.25rem' }}>
          <h2 className="fd-card-title">
            <UserCheck size={20} />
            Existing Patient Registration
          </h2>
        </div>

        {/* Search Patient Details Form */}
        <form onSubmit={handleSearch} className="fd-form" style={{ marginBottom: '1.5rem' }}>
          <div className="fd-form-group" style={{ maxWidth: '450px' }}>
            <label className="fd-label">
              Search Patient Details
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="text"
                className="fd-input"
                placeholder="Enter Patient Info"
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value)}
              />
              <button
                type="submit"
                className="fd-btn-primary"
                style={{
                  height: '38px',
                  padding: '0 1rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '42px',
                  cursor: 'pointer'
                }}
              >
                <Search size={16} />
              </button>
            </div>
          </div>
        </form>

        {/* Search Results Table or No Records Found Alert */}
        {searched && (
          <div style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
            {searchResults.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '2.5rem',
                  color: '#dc2626',
                  background: '#fef2f2',
                  borderRadius: '8px',
                  border: '1px solid #fca5a5',
                  fontWeight: '600',
                  fontSize: '15px'
                }}
              >
                No Records Found
              </div>
            ) : (
              <div className="fd-table-wrapper">
                <table className="fd-table">
                  <thead>
                    <tr>
                      <th>Patient ID & Name</th>
                      <th>Age / Gender</th>
                      <th>Mobile</th>
                      <th>Aadhaar ID</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.map((patient) => (
                      <tr key={patient.id}>
                        <td>
                          <div className="fd-patient-id">{patient.id}</div>
                          <div className="fd-patient-name">{patient.fullName}</div>
                        </td>
                        <td>{patient.age} Yrs / {patient.gender}</td>
                        <td>{patient.mobileNumber}</td>
                        <td>{patient.aadhaarId}</td>
                        <td>
                          <button
                            type="button"
                            onClick={() => handleSelectPatient(patient)}
                            className="fd-btn-primary"
                            style={{
                              padding: '0.5rem 1rem',
                              fontSize: '13px',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            Register For Test Now
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Prefilled Re-Registration Form */}
        {selectedPatient && (
          <div
            style={{
              marginTop: '2rem',
              paddingTop: '1.5rem',
              borderTop: '2px dashed #e2e8f0'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem'
              }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#005a9e' }}>
                Re-Registration Form for {selectedPatient.fullName} ({selectedPatient.id})
              </h3>
              <button
                type="button"
                onClick={() => setSelectedPatient(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '13px'
                }}
              >
                <X size={16} /> Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit} className="fd-form">
              {/* ROW 1: Patient Full Name & Aadhaar Number */}
              <div className="fd-row-2col">
                <div className="fd-form-group">
                  <label className="fd-label">
                    <User size={14} /> Patient Full Name <span className="fd-req">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    className={`fd-input ${errors.fullName ? 'fd-input-error' : ''}`}
                    placeholder="Enter Patient Name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                  />
                  {errors.fullName && <span className="fd-error-msg">{errors.fullName}</span>}
                </div>

                <div className="fd-form-group">
                  <label className="fd-label">
                    Aadhaar / Gov ID <span className="fd-req">*</span>
                  </label>
                  <input
                    type="text"
                    name="aadhaarId"
                    className={`fd-input ${errors.aadhaarId ? 'fd-input-error' : ''}`}
                    placeholder="Enter 12 digits Aadhar Number"
                    value={formData.aadhaarId}
                    onChange={handleInputChange}
                  />
                  {errors.aadhaarId && <span className="fd-error-msg">{errors.aadhaarId}</span>}
                </div>
              </div>

              {/* ROW 2: Age, Gender & Encounter Type */}
              <div className="fd-row-3col">
                <div className="fd-form-group">
                  <label className="fd-label">
                    Age (Years) <span className="fd-req">*</span>
                  </label>
                  <input
                    type="number"
                    name="age"
                    min="1"
                    max="110"
                    className={`fd-input ${errors.age ? 'fd-input-error' : ''}`}
                    placeholder="Enter Age"
                    value={formData.age}
                    onChange={handleInputChange}
                  />
                  {errors.age && <span className="fd-error-msg">{errors.age}</span>}
                </div>

                <div className="fd-form-group">
                  <label className="fd-label">Gender</label>
                  <select
                    name="gender"
                    className="fd-select"
                    value={formData.gender}
                    onChange={handleInputChange}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="fd-form-group">
                  <label className="fd-label">Encounter Type</label>
                  <select
                    name="encounterType"
                    className="fd-select"
                    value={formData.encounterType}
                    onChange={handleInputChange}
                  >
                    <option value="Out-Patient [OP]">Out-Patient [OP]</option>
                    <option value="In-Patient [IP]">In-Patient [IP]</option>
                  </select>
                </div>
              </div>

              {/* ROW 3: Mobile Number & Referring Doctor */}
              <div className="fd-row-2col">
                <div className="fd-form-group">
                  <label className="fd-label">
                    <Phone size={14} /> Mobile Number <span className="fd-req">*</span>
                  </label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    className={`fd-input ${errors.mobileNumber ? 'fd-input-error' : ''}`}
                    placeholder="Enter Mobile Number"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                  />
                  {errors.mobileNumber && <span className="fd-error-msg">{errors.mobileNumber}</span>}
                </div>

                <div className="fd-form-group">
                  <label className="fd-label">Referring Doctor</label>
                  <input
                    type="text"
                    name="referringDoctor"
                    className="fd-input"
                    placeholder="Dr. Name"
                    value={formData.referringDoctor}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* ROW 4: Address Field */}
              <div className="fd-form-group">
                <label className="fd-label">
                  <MapPin size={14} /> Patient Address
                </label>
                <textarea
                  name="address"
                  rows="2"
                  className="fd-input"
                  placeholder="Enter Residential / Local Address (Optional)"
                  value={formData.address}
                  onChange={handleInputChange}
                ></textarea>
              </div>

              {/* Clinical Diagnostic Tests Selector */}
              <div className="fd-tests-section">
                <div className="fd-tests-title">
                  <span>Select Clinical Diagnostic Tests</span>
                  <span className="fd-subtext">{formData.selectedTests.length} Selected</span>
                </div>
                {errors.selectedTests && (
                  <div className="fd-error-msg" style={{ marginBottom: '0.5rem' }}>
                    {errors.selectedTests}
                  </div>
                )}
                <div className="fd-tests-grid-3col">
                  {AVAILABLE_TESTS.map(test => {
                    const isChecked = formData.selectedTests.includes(test.id);
                    return (
                      <label
                        key={test.id}
                        className={`fd-test-card ${isChecked ? 'selected' : ''}`}
                      >
                        <input
                          type="checkbox"
                          className="fd-checkbox"
                          checked={isChecked}
                          onChange={() => handleTestToggle(test.id)}
                        />
                        <div className="fd-test-info">
                          <span className="fd-test-name">{test.name}</span>
                          <span className={`fd-tube-tag fd-tube-${test.color}`}>
                            <span className={`fd-tube-dot ${test.color}`}></span>
                            {test.category}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Generate Barcode Button */}
              <button type="submit" className="fd-submit-btn">
                <Barcode size={20} />
                Generate Barcode
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Existing_Patient;
