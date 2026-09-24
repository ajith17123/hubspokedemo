import React, { useState, useMemo, useEffect } from 'react';
import '../../assets/style/Front_Desk.css';
import {
  FileCheck,
  Search,
  CheckCircle2,
  Edit2,
  Trash2,
  Printer,
  Calendar,
  Clock,
  X
} from 'lucide-react';
import PatientRegisterPdf from '../Downloadables/patientregister_pdf';
import {
  AVAILABLE_TESTS,
  getPatients,
  updatePatient,
  deletePatient,
  generateSmartBarcodes
} from '../../DataStorage/patientData';

function Patient_Tests() {
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Editing Patient Modal State
  const [editingPatient, setEditingPatient] = useState(null);
  const [editFormData, setEditFormData] = useState({
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
  const [editErrors, setEditErrors] = useState({});

  // PDF Modal State
  const [printingPatient, setPrintingPatient] = useState(null);

  // Load patients on mount
  useEffect(() => {
    const loadedData = getPatients();
    setPatients(loadedData);
  }, []);

  // Clear notification timer
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Handle Edit Input Change
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
    if (editErrors[name]) {
      setEditErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Toggle Tests in Edit Modal
  const handleEditTestToggle = (testId) => {
    setEditFormData(prev => {
      const current = prev.selectedTests;
      const updated = current.includes(testId)
        ? current.filter(id => id !== testId)
        : [...current, testId];
      return { ...prev, selectedTests: updated };
    });
    if (editErrors.selectedTests) {
      setEditErrors(prev => ({ ...prev, selectedTests: '' }));
    }
  };

  // Validate Edit Form
  const validateEditForm = (data) => {
    const newErrors = {};
    if (!data.fullName.trim()) newErrors.fullName = 'Full Name is required.';
    
    const cleanAadhaar = data.aadhaarId.replace(/\s|-/g, '');
    if (!data.aadhaarId.trim()) {
      newErrors.aadhaarId = 'Aadhaar / Gov ID is required.';
    } else if (!/^\d{12}$/.test(cleanAadhaar) && data.aadhaarId !== '[Aadhaar Redacted]') {
      newErrors.aadhaarId = 'Must be a valid 12-digit numeric ID.';
    }

    const ageNum = parseInt(data.age, 10);
    if (!data.age || isNaN(ageNum) || ageNum < 1 || ageNum > 110) {
      newErrors.age = 'Enter a valid age between 1 and 110.';
    }

    const cleanPhone = data.mobileNumber.trim();
    if (!cleanPhone) {
      newErrors.mobileNumber = 'Mobile number is required.';
    } else if (!/^\d{10}$/.test(cleanPhone)) {
      newErrors.mobileNumber = 'Must be a 10-digit mobile number.';
    }

    if (data.selectedTests.length === 0) {
      newErrors.selectedTests = 'Select at least one clinical diagnostic test.';
    }

    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Open Edit Modal
  const openEditModal = (patient) => {
    setEditingPatient(patient);
    setEditFormData({
      fullName: patient.fullName,
      aadhaarId: patient.aadhaarId,
      age: patient.age.toString(),
      gender: patient.gender,
      encounterType: patient.encounterType,
      mobileNumber: patient.mobileNumber,
      referringDoctor: patient.referringDoctor,
      address: patient.address || '',
      selectedTests: [...patient.tests]
    });
    setEditErrors({});
  };

  // Save Edit Changes
  const handleSaveEditPatient = (e) => {
    e.preventDefault();
    if (!validateEditForm(editFormData)) return;

    try {
      updatePatient(editingPatient.id, editFormData);
      setPatients(getPatients());
      setEditingPatient(null);
      setSuccessMessage(`Updated details & barcodes for patient ${editingPatient.id}.`);
    } catch (err) {
      alert('Failed to update patient record.');
    }
  };

  // Delete Patient Record
  const handleDeletePatient = (patientId, patientName) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete patient record ${patientId} (${patientName})? This action cannot be undone.`);
    if (!confirmDelete) return;

    try {
      deletePatient(patientId);
      setPatients(getPatients());
      setSuccessMessage(`Patient record ${patientId} deleted successfully.`);
    } catch (err) {
      alert('Failed to delete patient record.');
    }
  };

  // Helper to normalize any date into standard YYYY-MM-DD
  const normalizeToYMD = (dateInput) => {
    if (!dateInput) return '';
    let str = String(dateInput).trim().replace(/,/g, '');
    if (!str) return '';

    if (str.includes('T')) {
      str = str.split('T')[0];
    }

    const datePart = str.split(/\s+/)[0];

    // YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
      return datePart;
    }
    
    // DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
    if (/^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4}$/.test(datePart)) {
      const parts = datePart.split(/[\/\-\.]/);
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }

    // YYYY/MM/DD or YYYY.MM.DD
    if (/^\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}$/.test(datePart)) {
      const parts = datePart.split(/[\/\-\.]/);
      const year = parts[0];
      const month = parts[1].padStart(2, '0');
      const day = parts[2].padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    return '';
  };

  // Helper to safely format Date & Time
  const getPatientDateTime = (patient) => {
    let dateVal = '';
    let timeVal = patient.registrationTime || '';

    const ymd = normalizeToYMD(patient.registrationDate || patient.createdAt);
    if (ymd && ymd.length === 10) {
      const [y, m, d] = ymd.split('-');
      dateVal = `${d}/${m}/${y}`;
    } else if (patient.registrationDate && patient.registrationDate !== 'N/A') {
      dateVal = String(patient.registrationDate).split(' ')[0];
    } else if (patient.createdAt && /\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/.test(patient.createdAt)) {
      dateVal = String(patient.createdAt).split(' ')[0];
    } else {
      dateVal = new Date().toLocaleDateString('en-GB');
    }

    if (!timeVal || !timeVal.trim()) {
      if (patient.createdAt) {
        const str = String(patient.createdAt).trim();
        const match = str.match(/\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?/i);
        if (match) {
          timeVal = match[0];
        }
      }
      if (!timeVal) {
        timeVal = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
    }

    return { dateVal, timeVal };
  };

  // Filtered Patients
  const filteredPatients = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return patients;
    return patients.filter(p =>
      p.fullName.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.mobileNumber.includes(q) ||
      (p.aadhaarId && p.aadhaarId.toLowerCase().includes(q)) ||
      (p.address && p.address.toLowerCase().includes(q))
    );
  }, [patients, searchQuery]);

  return (
    <div className="fd-wrapper">
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

      {/* Patient Directory Card */}
      <div className="fd-card" id="patient-directory">
        <div className="fd-card-header">
          <h2 className="fd-card-title">
            <FileCheck size={20} />
            Patient Directory
          </h2>
          <span className="fd-subtext">{patients.length} Total Registered Patients</span>
        </div>

        {/* Search Bar */}
        <div className="fd-search-box">
          <Search className="fd-search-icon" size={16} />
          <input
            type="text"
            className="fd-input fd-search-input"
            placeholder="Search by patient details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Directory Table with Date & Time Column */}
        <div className="fd-table-wrapper">
          <table className="fd-table">
            <thead>
              <tr>
                <th>Patient ID & Name</th>
                <th>Date & Time</th>
                <th>Age / Gender</th>
                <th>Barcode</th>
                <th>Test Details</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                    {patients.length === 0
                      ? 'No patients registered yet. Use New Patient Registration to add records.'
                      : 'No matching patient records found.'}
                  </td>
                </tr>
              ) : (
                filteredPatients.map(patient => {
                  const { dateVal, timeVal } = getPatientDateTime(patient);

                  return (
                    <tr key={patient.id}>
                      {/* Patient ID & Name */}
                      <td>
                        <div className="fd-patient-id">{patient.id}</div>
                        <div className="fd-patient-name">{patient.fullName}</div>
                        <div className="fd-subtext">Phone: {patient.mobileNumber}</div>
                        <div className="fd-subtext">Ref: {patient.referringDoctor}</div>
                        {patient.address && (
                          <div className="fd-subtext" style={{ fontStyle: 'italic' }}>
                            Addr: {patient.address}
                          </div>
                        )}
                      </td>

                      {/* Auto-Generated Date & Time */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: '600', color: '#1e293b', fontSize: '13px' }}>
                          <Calendar size={13} style={{ color: '#0284c7' }} />
                          {dateVal}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748b', fontSize: '12px', marginTop: '0.2rem' }}>
                          <Clock size={12} />
                          {timeVal}
                        </div>
                      </td>

                      {/* Age & Gender */}
                      <td>
                        <div>{patient.age} Yrs / {patient.gender}</div>
                        <div className="fd-subtext">{patient.encounterType}</div>
                      </td>

                      {/* Barcodes */}
                      <td>
                        <div className="fd-barcodes-list">
                          {patient.barcodes && patient.barcodes.map(b => (
                            <span key={b.barcodeId} className={`fd-tube-tag fd-tube-${b.color}`}>
                              <span className={`fd-tube-dot ${b.color}`}></span>
                              {b.barcodeId}
                            </span>
                          ))}
                        </div>
                        <div className="fd-subtext" style={{ marginTop: '0.2rem' }}>
                          {patient.barcodes ? patient.barcodes.length : 0} Specimen Tube(s)
                        </div>
                      </td>

                      {/* Diagnostic Tests */}
                      <td>
                        <div className="fd-tests-list-display">
                          {patient.tests.map(testId => {
                            const testObj = AVAILABLE_TESTS.find(t => t.id === testId);
                            return (
                              <span key={testId} className="fd-test-chip">
                                {testObj ? testObj.name : testId}
                              </span>
                            );
                          })}
                        </div>
                        <div className="fd-subtext" style={{ marginTop: '0.2rem' }}>
                          {patient.tests.length} Test(s) Ordered
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'center' }}>
                        <div className="fd-actions-group" style={{ justifyContent: 'center' }}>
                          <button
                            className="fd-action-btn"
                            title="Update Full Patient Details"
                            onClick={() => openEditModal(patient)}
                          >
                            <Edit2 size={12} />
                            Update
                          </button>
                          <button
                            className="fd-print-btn"
                            title="Print or Download PDF Requisition"
                            onClick={() => setPrintingPatient(patient)}
                          >
                            <Printer size={12} />
                            Print / PDF
                          </button>
                          <button
                            className="fd-delete-btn"
                            title="Delete Patient Record"
                            onClick={() => handleDeletePatient(patient.id, patient.fullName)}
                          >
                            <Trash2 size={12} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* UPDATE MODAL */}
      {editingPatient && (
        <div className="fd-modal-overlay">
          <div className="fd-modal-content">
            <div className="fd-modal-header">
              <div>
                <h3 style={{ margin: 0, color: 'var(--color-title-blue)' }}>
                  Update Patient Details ({editingPatient.id})
                </h3>
                <span className="fd-subtext">Modify patient information and diagnostic test orders</span>
              </div>
              <button
                onClick={() => setEditingPatient(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEditPatient} className="fd-form">
              <div className="fd-form-group">
                <label className="fd-label">Patient Full Name <span className="fd-req">*</span></label>
                <input
                  type="text"
                  name="fullName"
                  className={`fd-input ${editErrors.fullName ? 'fd-input-error' : ''}`}
                  value={editFormData.fullName}
                  onChange={handleEditInputChange}
                />
                {editErrors.fullName && <span className="fd-error-msg">{editErrors.fullName}</span>}
              </div>

              <div className="fd-row-2col">
                <div className="fd-form-group">
                  <label className="fd-label">Aadhaar / Gov ID <span className="fd-req">*</span></label>
                  <input
                    type="text"
                    name="aadhaarId"
                    className={`fd-input ${editErrors.aadhaarId ? 'fd-input-error' : ''}`}
                    value={editFormData.aadhaarId}
                    onChange={handleEditInputChange}
                  />
                  {editErrors.aadhaarId && <span className="fd-error-msg">{editErrors.aadhaarId}</span>}
                </div>

                <div className="fd-form-group">
                  <label className="fd-label">Age (Years) <span className="fd-req">*</span></label>
                  <input
                    type="number"
                    name="age"
                    min="1"
                    max="110"
                    className={`fd-input ${editErrors.age ? 'fd-input-error' : ''}`}
                    value={editFormData.age}
                    onChange={handleEditInputChange}
                  />
                  {editErrors.age && <span className="fd-error-msg">{editErrors.age}</span>}
                </div>
              </div>

              <div className="fd-row-2col">
                <div className="fd-form-group">
                  <label className="fd-label">Gender</label>
                  <select
                    name="gender"
                    className="fd-select"
                    value={editFormData.gender}
                    onChange={handleEditInputChange}
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
                    value={editFormData.encounterType}
                    onChange={handleEditInputChange}
                  >
                    <option value="Out-Patient [OP]">Out-Patient [OP]</option>
                    <option value="In-Patient [IP]">In-Patient [IP]</option>
                  </select>
                </div>
              </div>

              <div className="fd-row-2col">
                <div className="fd-form-group">
                  <label className="fd-label">Mobile Number <span className="fd-req">*</span></label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    className={`fd-input ${editErrors.mobileNumber ? 'fd-input-error' : ''}`}
                    value={editFormData.mobileNumber}
                    onChange={handleEditInputChange}
                  />
                  {editErrors.mobileNumber && <span className="fd-error-msg">{editErrors.mobileNumber}</span>}
                </div>

                <div className="fd-form-group">
                  <label className="fd-label">Referring Doctor</label>
                  <input
                    type="text"
                    name="referringDoctor"
                    className="fd-input"
                    value={editFormData.referringDoctor}
                    onChange={handleEditInputChange}
                  />
                </div>
              </div>

              <div className="fd-form-group">
                <label className="fd-label">Patient Address</label>
                <textarea
                  name="address"
                  rows="2"
                  className="fd-input"
                  value={editFormData.address}
                  onChange={handleEditInputChange}
                ></textarea>
              </div>

              <div className="fd-tests-section">
                <div className="fd-tests-title">
                  <span>Diagnostic Tests</span>
                  <span className="fd-subtext">{editFormData.selectedTests.length} Selected</span>
                </div>
                {editErrors.selectedTests && (
                  <div className="fd-error-msg" style={{ marginBottom: '0.5rem' }}>
                    {editErrors.selectedTests}
                  </div>
                )}
                <div className="fd-tests-grid-3col">
                  {AVAILABLE_TESTS.map(test => {
                    const isChecked = editFormData.selectedTests.includes(test.id);
                    return (
                      <label key={test.id} className={`fd-test-card ${isChecked ? 'selected' : ''}`}>
                        <input
                          type="checkbox"
                          className="fd-checkbox"
                          checked={isChecked}
                          onChange={() => handleEditTestToggle(test.id)}
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

              <div style={{ background: '#f8fafc', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div className="fd-subtext" style={{ fontWeight: 'bold', marginBottom: '0.4rem', color: 'var(--color-title-blue)' }}>
                  Specimen Tube Barcodes Preview:
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {generateSmartBarcodes(editFormData.selectedTests, editingPatient.seqId).map(b => (
                    <span key={b.barcodeId} className={`fd-tube-tag fd-tube-${b.color}`}>
                      <span className={`fd-tube-dot ${b.color}`}></span>
                      {b.barcodeId}
                    </span>
                  ))}
                </div>
              </div>

              <div className="fd-modal-footer">
                <button
                  type="button"
                  className="fd-btn-secondary"
                  onClick={() => setEditingPatient(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="fd-btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF / Print Modal Component */}
      {printingPatient && (
        <PatientRegisterPdf
          patient={printingPatient}
          onClose={() => setPrintingPatient(null)}
        />
      )}
    </div>
  );
}

export default Patient_Tests;
