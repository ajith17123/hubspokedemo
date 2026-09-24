import React, { useState } from 'react';
import { getMasterSamples } from '../../services/sampleService';
import { accessionSampleAtHub } from '../../services/analyzerService';

export default function Accession({ onTriggerToast }) {
  const [samples, setSamples] = useState(getMasterSamples());
  const [modal, setModal] = useState({ open: false, sample: null, reason: 'Insufficient Sample' });

  const handleAccept = (barcode) => {
    accessionSampleAtHub(barcode, 'accept');
    setSamples(getMasterSamples());
    if (onTriggerToast) onTriggerToast(`Sample ${barcode} accessioned and queued for analyzer testing!`);
  };

  const openRejectModal = (sample) => {
    setModal({ open: true, sample, reason: 'Insufficient Sample' });
  };

  const confirmReject = () => {
    if (!modal.sample) return;
    accessionSampleAtHub(modal.sample.barcode, 'reject', modal.reason);
    setSamples(getMasterSamples());
    if (onTriggerToast) onTriggerToast(`Sample ${modal.sample.barcode} rejected: ${modal.reason}`);
    setModal({ open: false, sample: null, reason: 'Insufficient Sample' });
  };

  return (
    <section className="hub-panel">
      <div className="hub-section-header-row">
        <h3>🔬 HUB ACCESSION & SAMPLE VERIFICATION</h3>
      </div>
      <div className="hub-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Barcode ID</th>
              <th>Patient Details</th>
              <th>Lab Order ID</th>
              <th>Specimen Tube Type</th>
              <th>Tests Requested</th>
              <th>Accession Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {samples.length > 0 ? (
              samples.map((sample) => (
                <tr key={sample.barcode}>
                  <td><strong>{sample.barcode}</strong></td>
                  <td>
                    <div><strong>{sample.patientName}</strong></div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{sample.patientId}</div>
                  </td>
                  <td>{sample.labOrderId}</td>
                  <td>
                    <span className={`fd-tube-tag fd-tube-${sample.tubeCategory || 'red'}`}>
                      {sample.tubeType}
                    </span>
                  </td>
                  <td>{(sample.tests || []).join(', ')}</td>
                  <td>
                    <span className={`hub-status-badge ${sample.accessionStatus === 'Accepted at Hub' ? 'hub-status-success' : sample.accessionStatus === 'Rejected at Hub' ? 'hub-status-danger' : 'hub-status-warning'}`}>
                      {sample.accessionStatus || 'Pending Accession'}
                    </span>
                  </td>
                  <td>
                    {sample.accessionStatus !== 'Accepted at Hub' ? (
                      <div className="hub-inline-actions">
                        <button className="hub-primary-button hub-mini-button" onClick={() => handleAccept(sample.barcode)}>
                          Accept
                        </button>
                        <button className="hub-secondary-button hub-mini-button" onClick={() => openRejectModal(sample)}>
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#008744', fontWeight: 'bold' }}>✓ Queued for Testing</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  No pending samples for accession.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Rejection Reason Modal */}
      {modal.open && (
        <div className="hub-modal-overlay" onClick={() => setModal({ open: false, sample: null, reason: 'Insufficient Sample' })}>
          <div className="hub-modal" onClick={(e) => e.stopPropagation()}>
            <div className="hub-modal-header">
              <h4>SAMPLE REJECTION REASON</h4>
              <button className="hub-close-button" onClick={() => setModal({ open: false, sample: null, reason: 'Insufficient Sample' })}>×</button>
            </div>
            <div className="hub-form-field">
              <label>Select Reason *</label>
              <select value={modal.reason} onChange={(e) => setModal((prev) => ({ ...prev, reason: e.target.value }))}>
                <option>Insufficient Sample</option>
                <option>Hemolyzed Sample</option>
                <option>Barcode Mismatch</option>
                <option>Wrong Container</option>
                <option>Leaking Container</option>
                <option>Incorrect Label</option>
                <option>Other</option>
              </select>
            </div>
            <div className="hub-modal-actions">
              <button className="hub-secondary-button" onClick={() => setModal({ open: false, sample: null, reason: 'Insufficient Sample' })}>Cancel</button>
              <button className="hub-primary-button" onClick={confirmReject}>Confirm Rejection</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
