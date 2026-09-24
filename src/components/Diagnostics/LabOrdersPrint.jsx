import React, { useState } from 'react';
import DiagnosticsPdf from '../Downloadables/DiagnosticsPdf';

function LabOrdersPrint({ selectedOrder, orders, onSelectOrder, onBackToSearch }) {
  const [showPdfModal, setShowPdfModal] = useState(false);

  if (!selectedOrder) {
    return (
      <div className="diag-table-card" style={{ padding: '3rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🖨️</div>
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>No Order Selected for Printing</h3>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Please select an order from the Search Lab Orders queue to generate its requisition slip.
        </p>
        <button className="diag-btn-search" onClick={onBackToSearch}>
          ← Back to Search Queue
        </button>
      </div>
    );
  }

  const { id, patientName, pid, opIpId, age, gender, contact, date, tests = [], samples = [], type = 'OP' } = selectedOrder;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="diag-print-page">
      {/* Top Action Bar (hidden when printing) */}
      <div className="diag-action-bar no-print">
        <button className="diag-btn-clear" onClick={onBackToSearch} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          ← Back to Search Queue
        </button>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {orders && orders.length > 1 && (
            <select
              className="diag-select"
              style={{ width: 'auto', padding: '0.4rem 0.75rem' }}
              value={id}
              onChange={(e) => onSelectOrder(e.target.value)}
            >
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.id} - {o.patientName}
                </option>
              ))}
            </select>
          )}

          <button className="diag-btn-clear" onClick={() => setShowPdfModal(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            📥 Download PDF
          </button>

          <button className="diag-btn-search" onClick={handlePrint} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            🖨️ Print Requisition
          </button>
        </div>
      </div>

      {/* Printable Sheet Card */}
      <div className="diag-print-paper">
        {/* Slip Header */}
        <div className="diag-print-header">
          <div>
            <h2 style={{ margin: 0, fontSize: '1.35rem', color: '#0f172a' }}>
              Govt. City Diagnostic Centre, Vijayawada
            </h2>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
              Hub & Spoke Laboratory Network • Phlebotomy & Test Requisition Slip
            </span>
          </div>

          <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#475569' }}>
            <div><strong>Spoke Center:</strong> Spoke-04 Intakes</div>
            <div><strong>Requisition Date:</strong> {date || new Date().toLocaleString()}</div>
          </div>
        </div>

        {/* Patient Demographics Grid */}
        <div className="diag-print-grid">
          <div className="diag-print-row">
            <strong>Patient Name:</strong>
            <span style={{ fontWeight: 700, color: '#0f172a' }}>{patientName}</span>
          </div>
          <div className="diag-print-row">
            <strong>Visit Barcode / ID:</strong>
            <span className="diag-mono-id" style={{ color: '#0f766e' }}>{id}</span>
          </div>
          <div className="diag-print-row">
            <strong>PID / OP-IP ID:</strong>
            <span>{pid} (OP/IP: {opIpId})</span>
          </div>
          <div className="diag-print-row">
            <strong>Age / Gender:</strong>
            <span>{age} Yrs / {gender}</span>
          </div>
          <div className="diag-print-row">
            <strong>Contact Mobile:</strong>
            <span>{contact}</span>
          </div>
          <div className="diag-print-row">
            <strong>Encounter Type:</strong>
            <span style={{ fontWeight: 700 }}>{type}</span>
          </div>
        </div>

        {/* Requisitioned Tests */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', color: '#1e293b' }}>
            Ordered Diagnostic Tests ({tests.length}):
          </h4>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {tests.map((testName, i) => (
              <span
                key={i}
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  backgroundColor: '#f1f5f9',
                  color: '#1e293b',
                  padding: '0.3rem 0.65rem',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              >
                {testName}
              </span>
            ))}
          </div>
        </div>

        {/* Segregated Collection Tubes & Checkboxes */}
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', color: '#1e293b' }}>
            Physical Specimen Tube Barcodes ({samples.length}):
          </h4>

          <div className="diag-print-tubes-grid">
            {samples.length > 0 ? (
              samples.map((sample) => (
                <div key={sample.barcode} className="diag-print-tube-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className={`diag-tube-pill diag-tube-${sample.tubeCategory}`}>
                      {sample.tubeType}
                    </span>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                      <input type="checkbox" defaultChecked={sample.readyForBox} /> Collected
                    </label>
                  </div>

                  <div className="diag-barcode-visual">
                    |||| ||| ||||| |||
                  </div>

                  <div className="diag-mono-id" style={{ textAlign: 'center', fontSize: '1rem', color: '#0f172a' }}>
                    {sample.barcode}
                  </div>

                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.4rem' }}>
                    <strong>Analyzer:</strong> {sample.analyzer}<br />
                    <strong>Tests:</strong> {sample.tests.join(', ')}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '6px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                No segregated tube barcodes generated yet.
              </div>
            )}
          </div>
        </div>

        {/* Slip Footer Signatures */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#64748b' }}>
          <div>
            <div>____________________________</div>
            <div style={{ marginTop: '4px', fontWeight: 600 }}>Phlebotomist Signature</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div>____________________________</div>
            <div style={{ marginTop: '4px', fontWeight: 600 }}>Lab Intake Officer</div>
          </div>
        </div>
      </div>

      {/* PDF Download Modal */}
      {showPdfModal && (
        <DiagnosticsPdf
          order={selectedOrder}
          onClose={() => setShowPdfModal(false)}
        />
      )}
    </div>
  );
}

export default LabOrdersPrint;
