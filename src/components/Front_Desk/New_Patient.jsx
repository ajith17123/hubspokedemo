import React, { useState, useEffect } from 'react';
import '../../assets/style/Front_Desk.css';
import { UserPlus, Barcode, Phone, User, MapPin, CheckCircle2, FileText } from 'lucide-react';
import { AVAILABLE_TESTS } from '../../DataStorage/patientData';
import { registerNewPatient } from '../../services/patientService';

function New_Patient({ onRegistrationSuccess }) {
  const [formData, setFormData] = useState({
    fullName: '',
    aadhaarId: '',
    age: '',
    gender: 'Male',
    encounterType: 'Out-Patient [OP]',
    opIpId: '',
    programType: 'General',
    mobileNumber: '',
    referringDoctor: '',
    address: '',
    patientCondition: '',
    selectedTests: []
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Clear notification message after 4 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

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

  // Validate Registration Form
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
      newErrors.mobileNumber = 'Mobile number is required for SMS delivery.';
    } else if (!/^\d{10}$/.test(cleanPhone)) {
      newErrors.mobileNumber = 'Must be a 10-digit mobile number.';
    }

    if (formData.selectedTests.length === 0) {
      newErrors.selectedTests = 'Please select at least one clinical diagnostic test.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Submit New Patient
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const newPatient = registerNewPatient(formData);

      // Reset Form
      setFormData({
        fullName: '',
        aadhaarId: '',
        age: '',
        gender: 'Male',
        encounterType: 'Out-Patient [OP]',
        opIpId: '',
        programType: 'General',
        mobileNumber: '',
        referringDoctor: '',
        address: '',
        patientCondition: '',
        selectedTests: []
      });
      setErrors({});
      const successMsg = `Patient ${newPatient.id} (${newPatient.fullName}) registered successfully! Order ID: LO-2026-${newPatient.seqId}`;
      setSuccessMessage(successMsg);

      if (onRegistrationSuccess) {
        onRegistrationSuccess(newPatient);
      }
    } catch (err) {
      alert('Failed to save patient record.');
    }
  };

  return (
    <div className="fd-card" id="patient-registration-form">
      {/* Success Notification Alert */}
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

      <div className="fd-card-header">
        <h2 className="fd-card-title">
          <UserPlus size={20} />
          New Patient Registration Form
        </h2>
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
              placeholder="Enter Patient Full Name"
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
              placeholder="Enter 12-digit Aadhaar / Gov ID"
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
            <label className="fd-label">Gender <span className="fd-req">*</span></label>
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
            <label className="fd-label">OP / IP Type <span className="fd-req">*</span></label>
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

        {/* ROW 3: OP/IP ID, Program Type & Mobile Number */}
        <div className="fd-row-3col">
          <div className="fd-form-group">
            <label className="fd-label">OP / IP ID</label>
            <input
              type="text"
              name="opIpId"
              className="fd-input"
              placeholder="Enter OP / IP Hospital Record ID"
              value={formData.opIpId}
              onChange={handleInputChange}
            />
          </div>

          <div className="fd-form-group">
            <label className="fd-label">Program Type <span className="fd-req">*</span></label>
            <select
              name="programType"
              className="fd-select"
              value={formData.programType}
              onChange={handleInputChange}
            >
              <option value="General">General</option>
              <option value="Government Health Program">Government Health Program</option>
              <option value="Screening Program">Screening Program</option>
              <option value="NCD Program">NCD Program</option>
              <option value="Maternal & Child Health">Maternal & Child Health</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="fd-form-group">
            <label className="fd-label">
              <Phone size={14} /> Mobile Number <span className="fd-req">*</span>
            </label>
            <input
              type="tel"
              name="mobileNumber"
              className={`fd-input ${errors.mobileNumber ? 'fd-input-error' : ''}`}
              placeholder="Enter 10-digit mobile number"
              value={formData.mobileNumber}
              onChange={handleInputChange}
            />
            {errors.mobileNumber && <span className="fd-error-msg">{errors.mobileNumber}</span>}
          </div>
        </div>

        {/* ROW 4: Referring Doctor & Address */}
        <div className="fd-row-2col">
          <div className="fd-form-group">
            <label className="fd-label">Referring Doctor</label>
            <input
              type="text"
              name="referringDoctor"
              className="fd-input"
              placeholder="Enter Referring Doctor (Default: Self / Direct)"
              value={formData.referringDoctor}
              onChange={handleInputChange}
            />
          </div>

          <div className="fd-form-group">
            <label className="fd-label">
              <MapPin size={14} /> Patient Address
            </label>
            <input
              type="text"
              name="address"
              className="fd-input"
              placeholder="Enter Local Address / Village / Ward"
              value={formData.address}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* ROW 5: Patient Condition / Health Details */}
        <div className="fd-form-group">
          <label className="fd-label">
            <FileText size={14} /> Patient Previous Health Details / Current Patient Condition
          </label>
          <textarea
            name="patientCondition"
            rows="2"
            className="fd-input"
            placeholder="Enter relevant previous health details or current clinical condition"
            value={formData.patientCondition}
            onChange={handleInputChange}
          ></textarea>
        </div>

        {/* Clinical Diagnostic Tests Selector */}
        <div className="fd-tests-section">
          <div className="fd-tests-title">
            <span>Clinical Diagnostic Tests <span className="fd-req">*</span></span>
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

        {/* Register & Save Button */}
        <button type="submit" className="fd-submit-btn">
          <Barcode size={20} />
          Register Patient & Generate Barcodes
        </button>
      </form>
    </div>
  );
}

export default New_Patient;
