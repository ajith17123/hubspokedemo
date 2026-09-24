import React from 'react';

function VerifyBarcode({ selectedOrder, orders, onSelectOrder, onToggleReadyForBox, onBackToSearch }) {
  if (!selectedOrder) {
    return (
      <div className="diag-table-card" style={{ padding: '3rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏷️</div>
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>No Order Selected for Verification</h3>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Please select a pending or verified order from the Search Lab Orders queue.
        </p>
        <button className="diag-btn-search" onClick={onBackToSearch}>
          ← Back to Search Queue
        </button>
      </div>
    );
  }

  const { id, patientName, pid, opIpId, age, gender, samples = [] } = selectedOrder;

  return (
    <div className="diag-verify-page">
      {/* Top Action Header Bar */}
      <div className="diag-action-bar">
        <button className="diag-btn-clear" onClick={onBackToSearch} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          ← Back to Search Queue
        </button>

        {/* Quick Order Selector */}
        {orders && orders.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <select
              className="diag-select"
              style={{ width: 'auto', padding: '0.4rem 0.75rem', fontWeight: 600, borderRadius: '8px', border: '1px solid #cbd5e1' }}
              value={id}
              onChange={(e) => onSelectOrder(e.target.value)}
            >
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.id} - {o.patientName} ({o.status})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 3 Top Summary Legend Cards - Matching Pill Cap Card Design */}
      <div className="diag-legend-grid">
        {/* Lavender Cap Card */}
        <div className="diag-legend-card diag-legend-pill-card diag-legend-lavender">
          <div className="diag-tube-pill-cap lavender-cap"></div>
          <div className="diag-tube-card-body">
            <h4 className="diag-legend-title" style={{ color: '#6b21a8' }}>
              Lavender Cap (EDTA)
            </h4>
            <div className="diag-legend-desc" style={{ color: '#7e22ce' }}>
              HbA1c, Complete Blood Count (CBC)
            </div>
          </div>
        </div>

        {/* Red Cap Card */}
        <div className="diag-legend-card diag-legend-pill-card diag-legend-red">
          <div className="diag-tube-pill-cap red-cap"></div>
          <div className="diag-tube-card-body">
            <h4 className="diag-legend-title" style={{ color: '#991b1b' }}>
              Red Cap (Serum)
            </h4>
            <div className="diag-legend-desc" style={{ color: '#c2410c' }}>
              Thyroid Profile, LFT, RFT
            </div>
          </div>
        </div>

        {/* Grey Cap Card */}
        <div className="diag-legend-card diag-legend-pill-card diag-legend-grey">
          <div className="diag-tube-pill-cap grey-cap"></div>
          <div className="diag-tube-card-body">
            <h4 className="diag-legend-title" style={{ color: '#1e293b' }}>
              Grey Cap (Sodium Fluoride)
            </h4>
            <div className="diag-legend-desc" style={{ color: '#475569' }}>
              Fasting Blood Sugar / Glucose
            </div>
          </div>
        </div>
      </div>

      {/* Selected Patient Context Banner */}
      <div className="diag-patient-banner">
        <div className="diag-patient-banner-info">
          <div className="diag-banner-item">
            <label>Patient Name</label>
            <span>{patientName}</span>
          </div>
          <div className="diag-banner-item">
            <label>Visit Barcode / ID</label>
            <span style={{ color: '#0f766e' }}>{id}</span>
          </div>
          <div className="diag-banner-item">
            <label>PID / OP-IP</label>
            <span>{pid} (OP/IP: {opIpId})</span>
          </div>
          <div className="diag-banner-item">
            <label>Age / Sex</label>
            <span>{age} Yrs / {gender}</span>
          </div>
        </div>

        <div>
          <span className={`diag-status-pill ${selectedOrder.status === 'Verified' ? 'diag-status-verified' : 'diag-status-pending'}`}>
            {selectedOrder.status === 'Verified' ? '✓ Segregation Verified' : '⏳ Pending'}
          </span>
        </div>
      </div>

      {/* Tube Barcode Table */}
      <div className="diag-table-card">
        <div className="diag-table-wrapper">
          <table className="diag-data-table">
            <thead>
              <tr>
                <th>Patient ID / Name</th>
                <th>Tube Type</th>
                <th>Assigned Barcode</th>
                <th>Assigned Tests</th>
                <th>Verification Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {samples.length > 0 ? (
                samples.map((sample) => (
                  <tr key={sample.barcode}>
                    <td>
                      <div className="diag-patient-name">{patientName}</div>
                      <div className="diag-mono-id" style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        PID: {pid}
                      </div>
                    </td>

                    <td>
                      <span className={`diag-tube-pill diag-tube-${sample.tubeCategory}`}>
                        🧪 {sample.tubeType}
                      </span>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                        Analyzer: {sample.analyzer}
                      </div>
                    </td>

                    <td>
                      <span className="diag-mono-id" style={{ fontSize: '0.95rem' }}>
                        {sample.barcode}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        {sample.tests.map((test, i) => (
                          <span
                            key={i}
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              backgroundColor: '#f1f5f9',
                              color: '#334155',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              border: '1px solid #cbd5e1'
                            }}
                          >
                            {test}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td>
                      <span className="diag-status-pill diag-status-verified">
                        ✓ Verified
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <button
                        className={`diag-btn-toggle-box ${sample.readyForBox ? 'packed' : ''}`}
                        onClick={() => onToggleReadyForBox(id, sample.barcode)}
                      >
                        {sample.readyForBox ? '✓ Packed in Box' : 'Ready for Box'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚠️</div>
                    <div style={{ fontWeight: 600, color: '#475569' }}>Tubes Not Segregated Yet</div>
                    <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                      Click 'Verify' from the Search queue to process tube segregation for this order.
                    </p>
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

export default VerifyBarcode;
