import React, { useState, useMemo, useEffect } from 'react';
import '../../assets/style/Front_Desk.css';
import {
  Search,
  Calendar,
  Clock,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  User
} from 'lucide-react';
import PatientRegisterPdf from '../Downloadables/patientregister_pdf';
import { AVAILABLE_TESTS, getPatients } from '../../DataStorage/patientData';
import { exportPatientHistoryToExcel, exportDateRangePatientsToExcel } from '../Downloadables/excelExport';

function Patient_Details() {
  // View Mode: 'patient' or 'date'
  const [viewMode, setViewMode] = useState('patient');

  // Loaded patients list
  const [patients, setPatients] = useState([]);

  // Option 1: Search by Patient Details State
  const [searchQuery, setSearchQuery] = useState('');
  const [option1Page, setOption1Page] = useState(1);

  // Option 2: Search Date Wise State
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [appliedFromDate, setAppliedFromDate] = useState('');
  const [appliedToDate, setAppliedToDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // PDF Printing Modal State
  const [printingPatient, setPrintingPatient] = useState(null);

  // Load patients on mount
  useEffect(() => {
    const loadedData = getPatients();
    setPatients(loadedData);
  }, []);

  // Reset Option 1 pagination on search query change
  useEffect(() => {
    setOption1Page(1);
  }, [searchQuery]);

  // Helper to normalize any date into standard YYYY-MM-DD for accurate comparison
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

  // Helper to extract standard YYYY-MM-DD for any patient object reliably
  const getPatientYMD = (patient) => {
    if (!patient) return '';

    let ymd = normalizeToYMD(patient.registrationDate);
    if (ymd) return ymd;

    ymd = normalizeToYMD(patient.createdAt);
    if (ymd) return ymd;

    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper to parse date string (DD/MM/YYYY or YYYY-MM-DD) into Date object for sorting
  const parseDateObj = (dateInput) => {
    if (!dateInput) return new Date(0);
    const ymd = typeof dateInput === 'object' ? getPatientYMD(dateInput) : normalizeToYMD(dateInput);
    if (ymd && ymd.length === 10) {
      const [y, m, d] = ymd.split('-').map(n => parseInt(n, 10));
      return new Date(y, m - 1, d);
    }
    return new Date(0);
  };

  // Helper to format Date & Time safely
  const getPatientDateTime = (patient) => {
    let dateVal = '';
    let timeVal = patient.registrationTime || '';

    const ymd = getPatientYMD(patient);
    if (ymd && ymd.length === 10) {
      const [y, m, d] = ymd.split('-');
      dateVal = `${d}/${m}/${y}`;
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

  // OPTION 1: Filter & Sort Patient Visit History (Latest Date First)
  const patientSearchResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];
    
    const matched = patients.filter(p =>
      p.fullName.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.mobileNumber.includes(q) ||
      (p.aadhaarId && p.aadhaarId.toLowerCase().includes(q)) ||
      (p.address && p.address.toLowerCase().includes(q))
    );

    return matched.sort((a, b) => {
      const dateA = parseDateObj(a);
      const dateB = parseDateObj(b);
      return dateB - dateA;
    });
  }, [patients, searchQuery]);

  // Option 1 Pagination Logic
  const option1TotalPages = Math.max(1, Math.ceil(patientSearchResults.length / itemsPerPage));
  const paginatedOption1Patients = useMemo(() => {
    const startIndex = (option1Page - 1) * itemsPerPage;
    return patientSearchResults.slice(startIndex, startIndex + itemsPerPage);
  }, [patientSearchResults, option1Page]);

  // Handle Option 2 Date Filter Submit
  const handleDateFilterSubmit = (e) => {
    if (e) e.preventDefault();
    setAppliedFromDate(fromDate);
    setAppliedToDate(toDate);
    setCurrentPage(1);
  };

  // Handle Option 2 Clear Filter
  const handleClearDateFilter = () => {
    setFromDate('');
    setToDate('');
    setAppliedFromDate('');
    setAppliedToDate('');
    setCurrentPage(1);
  };

  // OPTION 2: Filter Date Range (Sorted Latest Date First)
  const dateFilteredPatients = useMemo(() => {
    const fromYMD = normalizeToYMD(appliedFromDate);
    const toYMD = normalizeToYMD(appliedToDate);

    let filtered = patients;
    if (fromYMD || toYMD) {
      filtered = patients.filter(p => {
        const pYMD = getPatientYMD(p);
        if (!pYMD) return false;
        if (fromYMD && pYMD < fromYMD) return false;
        if (toYMD && pYMD > toYMD) return false;
        return true;
      });
    }

    return filtered.sort((a, b) => {
      const dateA = parseDateObj(a);
      const dateB = parseDateObj(b);
      return dateB - dateA;
    });
  }, [patients, appliedFromDate, appliedToDate]);

  // Option 2 Pagination Logic
  const totalPages = Math.max(1, Math.ceil(dateFilteredPatients.length / itemsPerPage));

  useEffect(() => {
    setCurrentPage(1);
  }, [fromDate, toDate]);

  const paginatedDatePatients = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return dateFilteredPatients.slice(startIndex, startIndex + itemsPerPage);
  }, [dateFilteredPatients, currentPage]);

  return (
    <div className="fd-wrapper" style={{ paddingBottom: '3rem' }}>
      {/* Container Card */}
      <div className="fd-card">
        {/* Header Title */}
        <div className="fd-card-header" style={{ marginBottom: '1.5rem' }}>
          <div>
            <h2 className="fd-card-title">
              <User size={22} style={{ color: '#005a9e' }} />
              Patient Details
            </h2>
          </div>
        </div>

        {/* Option View Selector Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '1.5rem',
            borderBottom: '1px solid #e2e8f0',
            paddingBottom: '0.75rem',
            flexWrap: 'wrap'
          }}
        >
          <button
            type="button"
            onClick={() => setViewMode('patient')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              border: viewMode === 'patient' ? '2px solid #005a9e' : '1px solid #cbd5e1',
              backgroundColor: viewMode === 'patient' ? '#f0f9ff' : '#ffffff',
              color: viewMode === 'patient' ? '#005a9e' : '#475569',
              fontWeight: viewMode === 'patient' ? '700' : '500',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s ease'
            }}
          >
            <Search size={16} />
            Search by Patient Details
          </button>

          <button
            type="button"
            onClick={() => setViewMode('date')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              border: viewMode === 'date' ? '2px solid #005a9e' : '1px solid #cbd5e1',
              backgroundColor: viewMode === 'date' ? '#f0f9ff' : '#ffffff',
              color: viewMode === 'date' ? '#005a9e' : '#475569',
              fontWeight: viewMode === 'date' ? '700' : '500',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s ease'
            }}
          >
            <Calendar size={16} />
            Search Date Wise
          </button>
        </div>

        {/* ================================================================== */}
        {/* OPTION 1: SEARCH BY PATIENT DETAILS VIEW                           */}
        {/* ================================================================== */}
        {viewMode === 'patient' && (
          <div style={{ position: 'relative', minHeight: '340px' }}>
            {/* Search Input */}
            <div className="fd-search-box" style={{ marginBottom: '1.5rem' }}>
              <Search className="fd-search-icon" size={16} />
              <input
                type="text"
                className="fd-input fd-search-input"
                placeholder="Search by patient details..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Patient Search Results */}
            {!searchQuery.trim() ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '3rem 1.5rem',
                  color: '#94a3b8',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px dashed #cbd5e1'
                }}
              >
                <Search size={32} style={{ color: '#cbd5e1', marginBottom: '0.5rem' }} />
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#475569' }}>
                  Enter Patient details to view here
                </div>
              </div>
            ) : patientSearchResults.length === 0 ? (
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="fd-table-wrapper">
                  <table className="fd-table">
                    <thead>
                      <tr>
                        <th>Visit Date & Time</th>
                        <th>Patient ID & Name</th>
                        <th>Aadhaar / Mobile</th>
                        <th>Age / Gender</th>
                        <th>Test Details</th>
                        <th>Barcodes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedOption1Patients.map((patient) => {
                        const { dateVal, timeVal } = getPatientDateTime(patient);

                        return (
                          <tr key={patient.id + '_' + dateVal}>
                            {/* Visit Date & Time */}
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: '700', color: '#005a9e', fontSize: '13px' }}>
                                <Calendar size={13} style={{ color: '#0284c7' }} />
                                {dateVal}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748b', fontSize: '12px', marginTop: '0.2rem' }}>
                                <Clock size={12} />
                                {timeVal}
                              </div>
                            </td>

                            {/* Patient ID & Name */}
                            <td>
                              <div className="fd-patient-id">{patient.id}</div>
                              <div className="fd-patient-name">{patient.fullName}</div>
                              <div className="fd-subtext">Ref: {patient.referringDoctor || 'Direct'}</div>
                            </td>

                            {/* Aadhaar & Mobile */}
                            <td>
                              <div><strong>Aadhaar:</strong> {patient.aadhaarId}</div>
                              <div className="fd-subtext"><strong>Mobile:</strong> {patient.mobileNumber}</div>
                              {patient.address && (
                                <div className="fd-subtext" style={{ fontStyle: 'italic' }}>
                                  Addr: {patient.address}
                                </div>
                              )}
                            </td>

                            {/* Age & Gender */}
                            <td>
                              <div>{patient.age} Yrs / {patient.gender}</div>
                              <div className="fd-subtext">{patient.encounterType}</div>
                            </td>

                            {/* Test Details */}
                            <td>
                              <div className="fd-tests-list-display">
                                {patient.tests.map((testId) => {
                                  const testObj = AVAILABLE_TESTS.find((t) => t.id === testId);
                                  return (
                                    <span key={testId} className="fd-test-chip">
                                      {testObj ? testObj.name : testId}
                                    </span>
                                  );
                                })}
                              </div>
                            </td>

                            {/* Barcodes */}
                            <td>
                              <div className="fd-barcodes-list">
                                {patient.barcodes &&
                                  patient.barcodes.map((b) => (
                                    <span key={b.barcodeId} className={`fd-tube-tag fd-tube-${b.color}`}>
                                      <span className={`fd-tube-dot ${b.color}`}></span>
                                      {b.barcodeId}
                                    </span>
                                  ))}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Option 1 Bottom Row: Centered Pagination & Right Excel Download */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginTop: '1.25rem',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}
                >
                  <div style={{ flex: 1 }}></div>

                  {/* Centered Pagination Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center' }}>
                    <button
                      type="button"
                      className="fd-btn-secondary"
                      disabled={option1Page === 1}
                      onClick={() => setOption1Page((prev) => Math.max(prev - 1, 1))}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        opacity: option1Page === 1 ? 0.5 : 1,
                        cursor: option1Page === 1 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <ChevronLeft size={14} /> Previous
                    </button>

                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>
                      Page {option1Page} of {option1TotalPages}
                    </span>

                    <button
                      type="button"
                      className="fd-btn-secondary"
                      disabled={option1Page >= option1TotalPages}
                      onClick={() => setOption1Page((prev) => Math.min(prev + 1, option1TotalPages))}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        opacity: option1Page >= option1TotalPages ? 0.5 : 1,
                        cursor: option1Page >= option1TotalPages ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Next <ChevronRight size={14} />
                    </button>
                  </div>

                  {/* Download Patient Details Button in Bottom Right Corner */}
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => exportPatientHistoryToExcel(patientSearchResults, searchQuery)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.65rem 1.25rem',
                        backgroundColor: '#15803d',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '700',
                        fontSize: '13px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#166534')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#15803d')}
                    >
                      <FileSpreadsheet size={16} />
                      Download Patient Details
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================== */}
        {/* OPTION 2: SEARCH DATE WISE VIEW                                    */}
        {/* ================================================================== */}
        {viewMode === 'date' && (
          <div style={{ position: 'relative', minHeight: '340px' }}>
            {/* Date Range Filter Form */}
            <form
              onSubmit={handleDateFilterSubmit}
              style={{
                display: 'flex',
                gap: '1.25rem',
                alignItems: 'flex-end',
                marginBottom: '1.5rem',
                backgroundColor: '#f8fafc',
                padding: '1rem 1.25rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                flexWrap: 'wrap'
              }}
            >
              <div className="fd-form-group" style={{ maxWidth: '220px' }}>
                <label className="fd-label">
                  <Calendar size={14} /> From Date
                </label>
                <input
                  type="date"
                  className="fd-input"
                  style={{ cursor: 'pointer' }}
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                />
              </div>

              <div className="fd-form-group" style={{ maxWidth: '220px' }}>
                <label className="fd-label">
                  <Calendar size={14} /> To Date
                </label>
                <input
                  type="date"
                  className="fd-input"
                  style={{ cursor: 'pointer' }}
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                />
              </div>

              <button
                type="submit"
                onClick={handleDateFilterSubmit}
                className="fd-btn-primary"
                style={{ height: '38px', padding: '0 1.25rem', fontSize: '13px', cursor: 'pointer' }}
              >
                Submit
              </button>

              {(fromDate || toDate || appliedFromDate || appliedToDate) && (
                <button
                  type="button"
                  onClick={handleClearDateFilter}
                  className="fd-btn-secondary"
                  style={{ height: '38px', fontSize: '12px' }}
                >
                  Clear Date Filter
                </button>
              )}
            </form>

            {/* Date Wise Patient Table */}
            <div className="fd-table-wrapper">
              <table className="fd-table">
                <thead>
                  <tr>
                    <th>Registration Date & Time</th>
                    <th>Patient ID & Name</th>
                    <th>Aadhaar / Mobile</th>
                    <th>Age / Gender</th>
                    <th>Test Details</th>
                    <th>Barcodes</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedDatePatients.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: '#dc2626', fontWeight: '600' }}>
                        No Records Found
                      </td>
                    </tr>
                  ) : (
                    paginatedDatePatients.map((patient) => {
                      const { dateVal, timeVal } = getPatientDateTime(patient);

                      return (
                        <tr key={patient.id}>
                          {/* Date & Time */}
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: '700', color: '#005a9e', fontSize: '13px' }}>
                              <Calendar size={13} style={{ color: '#0284c7' }} />
                              {dateVal}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748b', fontSize: '12px', marginTop: '0.2rem' }}>
                              <Clock size={12} />
                              {timeVal}
                            </div>
                          </td>

                          {/* Patient ID & Name */}
                          <td>
                            <div className="fd-patient-id">{patient.id}</div>
                            <div className="fd-patient-name">{patient.fullName}</div>
                            <div className="fd-subtext">Ref: {patient.referringDoctor || 'Direct'}</div>
                          </td>

                          {/* Aadhaar & Mobile */}
                          <td>
                            <div><strong>Aadhaar:</strong> {patient.aadhaarId}</div>
                            <div className="fd-subtext"><strong>Mobile:</strong> {patient.mobileNumber}</div>
                          </td>

                          {/* Age & Gender */}
                          <td>
                            <div>{patient.age} Yrs / {patient.gender}</div>
                            <div className="fd-subtext">{patient.encounterType}</div>
                          </td>

                          {/* Tests */}
                          <td>
                            <div className="fd-tests-list-display">
                              {patient.tests.map((testId) => {
                                const testObj = AVAILABLE_TESTS.find((t) => t.id === testId);
                                return (
                                  <span key={testId} className="fd-test-chip">
                                    {testObj ? testObj.name : testId}
                                  </span>
                                );
                              })}
                            </div>
                          </td>

                          {/* Barcodes */}
                          <td>
                            <div className="fd-barcodes-list">
                              {patient.barcodes &&
                                patient.barcodes.map((b) => (
                                  <span key={b.barcodeId} className={`fd-tube-tag fd-tube-${b.color}`}>
                                    <span className={`fd-tube-dot ${b.color}`}></span>
                                    {b.barcodeId}
                                  </span>
                                ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls & Bottom Right Corner Download Button */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginTop: '1.25rem',
                flexWrap: 'wrap',
                gap: '1rem'
              }}
            >
              <div style={{ flex: 1 }}></div>

              {/* Pagination controls centered */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center' }}>
                <button
                  type="button"
                  className="fd-btn-secondary"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    opacity: currentPage === 1 ? 0.5 : 1,
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  <ChevronLeft size={14} /> Previous
                </button>

                <span style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  type="button"
                  className="fd-btn-secondary"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    opacity: currentPage >= totalPages ? 0.5 : 1,
                    cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer'
                  }}
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>

              {/* Download Excel Button anchored on bottom right corner */}
              <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                {dateFilteredPatients.length > 0 && (
                  <button
                    type="button"
                    onClick={() => exportDateRangePatientsToExcel(dateFilteredPatients, fromDate, toDate)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.65rem 1.25rem',
                      backgroundColor: '#15803d',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '700',
                      fontSize: '13px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#166534')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#15803d')}
                  >
                    <FileSpreadsheet size={16} />
                    Download Patient Details
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PDF PRINT / REQUISITION MODAL */}
      {printingPatient && (
        <PatientRegisterPdf
          patient={printingPatient}
          onClose={() => setPrintingPatient(null)}
        />
      )}
    </div>
  );
}

export default Patient_Details;
