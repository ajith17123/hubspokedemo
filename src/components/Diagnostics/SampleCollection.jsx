import React, { useState } from 'react';
import '../../assets/style/Diagnostics.css';
import { CheckCircle, Clock, UserCheck } from 'lucide-react';
import { getMasterSamples, collectSample } from '../../services/sampleService';

export default function SampleCollection({ onCompleteCollection }) {
  const [samples, setSamples] = useState(getMasterSamples());
  const [message, setMessage] = useState('');

  const handleCollect = (barcode) => {
    const updated = collectSample(barcode, 'Phlebotomist Vijayawada');
    setSamples(getMasterSamples());
    setMessage(`Sample ${barcode} marked as collected!`);
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="diag-search-page">
      <div className="diag-filter-card">
        <h3 style={{ margin: '0 0 1rem 0', color: '#005a9e', fontSize: '16px' }}>
          💉 Phlebotomy & Sample Collection Desk
        </h3>
        <p style={{ margin: 0, fontSize: '13px', color: '#475569' }}>
          Collect individual diagnostic tubes (Lavender EDTA, Red Serum, Grey NaF) from registered patients.
        </p>
      </div>

      {message && (
        <div style={{ padding: '0.75rem 1rem', background: '#dcfce7', color: '#15803d', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', marginBottom: '1rem' }}>
          ✓ {message}
        </div>
      )}

      <div className="diag-table-card">
        <div className="diag-table-wrapper">
          <table className="diag-data-table">
            <thead>
              <tr>
                <th>Barcode ID</th>
                <th>Patient Details</th>
                <th>Lab Order ID</th>
                <th>Tube / Sample Type</th>
                <th>Tests Included</th>
                <th>Collection Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {samples.length > 0 ? (
                samples.map((sample) => (
                  <tr key={sample.barcode}>
                    <td>
                      <span className="diag-mono-id">{sample.barcode}</span>
                    </td>
                    <td>
                      <div className="diag-patient-name">{sample.patientName}</div>
                      <div className="diag-patient-meta">ID: {sample.patientId}</div>
                    </td>
                    <td>{sample.labOrderId}</td>
                    <td>
                      <span className={`fd-tube-tag fd-tube-${sample.tubeCategory || 'red'}`}>
                        {sample.tubeType}
                      </span>
                    </td>
                    <td>{(sample.tests || []).join(', ')}</td>
                    <td>
                      {sample.collectionStatus === 'Sample Collected' ? (
                        <span className="diag-status-pill diag-status-verified" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle size={12} /> Collected
                        </span>
                      ) : (
                        <span className="diag-status-pill diag-status-pending" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} /> Pending Collection
                        </span>
                      )}
                    </td>
                    <td>
                      {sample.collectionStatus !== 'Sample Collected' ? (
                        <button
                          onClick={() => handleCollect(sample.barcode)}
                          className="diag-link-verify"
                          style={{ border: 'none', cursor: 'pointer' }}
                        >
                          Collect Sample
                        </button>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#64748b' }}>
                          {sample.collectionTime || 'Collected'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                    No pending samples found for collection.
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
