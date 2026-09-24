import React, { useState, useMemo } from 'react';

function SearchLabOrders({ orders, onVerifyOrder, onViewOrderBarcodes, onPrintOrder }) {
  const todayStr = new Date().toISOString().split('T')[0];

  const [fromDate, setFromDate] = useState(todayStr);
  const [toDate, setToDate] = useState(todayStr);
  const [patientName, setPatientName] = useState('');
  const [visitBarcode, setVisitBarcode] = useState('');
  const [sampleBarcode, setSampleBarcode] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [ipOpId, setIpOpId] = useState('');
  const [testNameFilter, setTestNameFilter] = useState('All');
  const [barcodeStatusFilter, setBarcodeStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Applied search state
  const [searchParams, setSearchParams] = useState({
    patientName: '',
    visitBarcode: '',
    sampleBarcode: '',
    mobileNumber: '',
    ipOpId: '',
    testName: 'All',
    barcodeStatus: 'All',
    type: 'All'
  });

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setSearchParams({
      patientName,
      visitBarcode,
      sampleBarcode,
      mobileNumber,
      ipOpId,
      testName: testNameFilter,
      barcodeStatus: barcodeStatusFilter,
      type: typeFilter
    });
  };

  const handleClear = () => {
    setFromDate(todayStr);
    setToDate(todayStr);
    setPatientName('');
    setVisitBarcode('');
    setSampleBarcode('');
    setMobileNumber('');
    setIpOpId('');
    setTestNameFilter('All');
    setBarcodeStatusFilter('All');
    setTypeFilter('All');
    setSearchParams({
      patientName: '',
      visitBarcode: '',
      sampleBarcode: '',
      mobileNumber: '',
      ipOpId: '',
      testName: 'All',
      barcodeStatus: 'All',
      type: 'All'
    });
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (searchParams.patientName && !order.patientName.toLowerCase().includes(searchParams.patientName.toLowerCase())) {
        return false;
      }
      if (searchParams.visitBarcode && !order.id.toLowerCase().includes(searchParams.visitBarcode.toLowerCase())) {
        return false;
      }
      if (searchParams.sampleBarcode && !(order.samples || []).some(s => s.barcode.toLowerCase().includes(searchParams.sampleBarcode.toLowerCase()))) {
        return false;
      }
      if (searchParams.mobileNumber && !order.contact.includes(searchParams.mobileNumber)) {
        return false;
      }
      if (searchParams.ipOpId && !(order.opIpId || '').toLowerCase().includes(searchParams.ipOpId.toLowerCase()) && !(order.pid || '').toLowerCase().includes(searchParams.ipOpId.toLowerCase())) {
        return false;
      }
      if (searchParams.testName !== 'All' && !order.tests.some(t => t.toLowerCase().includes(searchParams.testName.toLowerCase()))) {
        return false;
      }
      if (searchParams.barcodeStatus !== 'All' && order.status.toLowerCase() !== searchParams.barcodeStatus.toLowerCase()) {
        return false;
      }
      if (searchParams.type !== 'All' && order.type !== searchParams.type) {
        return false;
      }
      return true;
    });
  }, [orders, searchParams]);

  return (
    <div className="diag-search-page">
      {/* Filter Bar Controls Card */}
      <div className="diag-filter-card">
        <form onSubmit={handleSearch}>
          <div className="diag-filter-grid">
            {/* From Date */}
            <div className="diag-form-group">
              <label>From Date</label>
              <input
                type="date"
                className="diag-input"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            {/* To Date */}
            <div className="diag-form-group">
              <label>To Date</label>
              <input
                type="date"
                className="diag-input"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>

            {/* Patient Name */}
            <div className="diag-form-group">
              <label>Patient Name</label>
              <input
                type="text"
                className="diag-input"
                placeholder="Enter Patient Name"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
              />
            </div>

            {/* Visit Barcode */}
            <div className="diag-form-group">
              <label>Visit Barcode</label>
              <input
                type="text"
                className="diag-input"
                placeholder="Visit Barcode"
                value={visitBarcode}
                onChange={(e) => setVisitBarcode(e.target.value)}
              />
            </div>

            {/* Sample Barcode */}
            <div className="diag-form-group">
              <label>Sample Barcode</label>
              <input
                type="text"
                className="diag-input"
                placeholder="Sample Barcode"
                value={sampleBarcode}
                onChange={(e) => setSampleBarcode(e.target.value)}
              />
            </div>

            {/* Mobile Number */}
            <div className="diag-form-group">
              <label>Mobile Number</label>
              <input
                type="text"
                className="diag-input"
                placeholder="Mobile Number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
              />
            </div>

            {/* IP/OP Id */}
            <div className="diag-form-group">
              <label>IP/OP Id</label>
              <input
                type="text"
                className="diag-input"
                placeholder="IP/OP Id"
                value={ipOpId}
                onChange={(e) => setIpOpId(e.target.value)}
              />
            </div>

            {/* Dropdown 1: Test Name */}
            <div className="diag-form-group">
              <label>Test Name</label>
              <select
                className="diag-select"
                value={testNameFilter}
                onChange={(e) => setTestNameFilter(e.target.value)}
              >
                <option value="All">All Tests</option>
                <option value="HbA1c">HbA1c</option>
                <option value="Complete Blood Count">Complete Blood Count</option>
                <option value="Thyroid Profile">Thyroid Profile</option>
                <option value="LFT">LFT</option>
                <option value="RFT">RFT</option>
                <option value="Fasting Blood Sugar">Fasting Blood Sugar</option>
              </select>
            </div>

            {/* Dropdown 2: Barcode Status */}
            <div className="diag-form-group">
              <label>Barcode Status</label>
              <select
                className="diag-select"
                value={barcodeStatusFilter}
                onChange={(e) => setBarcodeStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Verified">Verified</option>
              </select>
            </div>

            {/* Dropdown 3: Type */}
            <div className="diag-form-group">
              <label>Encounter Type</label>
              <select
                className="diag-select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="All">All Types</option>
                <option value="OP">OP (Out-Patient)</option>
                <option value="IP">IP (In-Patient)</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="diag-btn-group">
              <button type="button" className="diag-btn-clear" onClick={handleClear}>
                Clear
              </button>
              <button type="submit" className="diag-btn-search">
                🔍 Search
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Results Table Card */}
      <div className="diag-table-card">
        <div className="diag-table-wrapper">
          <table className="diag-data-table">
            <thead>
              <tr>
                <th>Sl No</th>
                <th>Patient Details</th>
                <th>PID / OP-IP ID</th>
                <th>Visit Barcode / ID</th>
                <th>Mobile</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order, idx) => (
                  <tr key={order.id}>
                    <td>{idx + 1}</td>
                    <td>
                      <div className="diag-patient-name">{order.patientName}</div>
                      <div className="diag-patient-meta">
                        {order.age} Yrs / {order.gender} • Type: <strong style={{ color: '#0f172a' }}>{order.type}</strong>
                      </div>
                    </td>
                    <td>
                      <div className="diag-mono-id">{order.pid}</div>
                      <div className="diag-patient-meta">OP/IP: {order.opIpId}</div>
                    </td>
                    <td>
                      <span className="diag-mono-id" style={{ color: '#0f766e' }}>
                        {order.id}
                      </span>
                    </td>
                    <td>{order.contact}</td>
                    <td>{order.date}</td>
                    <td>
                      {order.status === 'Verified' ? (
                        <span className="diag-status-pill diag-status-verified">
                          ✓ Verified
                        </span>
                      ) : (
                        <span className="diag-status-pill diag-status-pending">
                          ⏳ Pending
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                        {order.status === 'Pending' ? (
                          <button
                            className="diag-link-verify"
                            onClick={() => onVerifyOrder(order.id)}
                          >
                            Verify
                          </button>
                        ) : (
                          <button
                            className="diag-link-view"
                            onClick={() => onViewOrderBarcodes(order.id)}
                          >
                            View Barcodes
                          </button>
                        )}
                        <button
                          className="diag-btn-print-icon"
                          title="Print Lab Requisition"
                          onClick={() => onPrintOrder(order.id)}
                        >
                          🖨️ Print
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🧪</div>
                    <div style={{ fontWeight: 600, color: '#475569' }}>No Lab Orders Found</div>
                    <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                      Try adjusting your filter search criteria above.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SearchLabOrders;
