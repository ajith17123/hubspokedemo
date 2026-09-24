import React, { useState } from 'react';
import '../../assets/style/Consignment.css';
import { Send, CheckSquare, Square } from 'lucide-react';
import { getMasterSamples } from '../../services/sampleService';
import { createAndTransferConsignment } from '../../services/consignmentService';

export default function PrepareConsignment({ onTransferSuccess }) {
  const masterSamples = getMasterSamples();
  // Ready samples are those verified & not yet assigned to a consignment
  const readySamples = masterSamples.filter((s) => s.verificationStatus === 'Verified' && !s.consignmentId);

  const [selectedBarcodes, setSelectedBarcodes] = useState([]);
  const [message, setMessage] = useState('');

  const toggleSelect = (barcode) => {
    if (selectedBarcodes.includes(barcode)) {
      setSelectedBarcodes(selectedBarcodes.filter((b) => b !== barcode));
    } else {
      setSelectedBarcodes([...selectedBarcodes, barcode]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedBarcodes.length === readySamples.length) {
      setSelectedBarcodes([]);
    } else {
      setSelectedBarcodes(readySamples.map((s) => s.barcode));
    }
  };

  const handleTransfer = () => {
    if (selectedBarcodes.length === 0) {
      alert('Please select at least one sample to transfer.');
      return;
    }

    try {
      const consignment = createAndTransferConsignment(selectedBarcodes, 'CD Spoke Vijayawada');
      setMessage(`Consignment ${consignment.consignmentId} created & transferred to Central Hub Laboratory!`);
      setSelectedBarcodes([]);
      if (onTransferSuccess) onTransferSuccess(consignment);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      {message && (
        <div style={{ padding: '0.85rem 1rem', background: '#dcfce7', color: '#15803d', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', marginBottom: '1rem' }}>
          ✓ {message}
        </div>
      )}

      <div className="cons-card">
        <div className="cons-header-row">
          <div>
            <h3 style={{ margin: 0, color: '#005a9e', fontSize: '15px' }}>
              Samples Verified & Ready for Consignment Packaging
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              {selectedBarcodes.length} of {readySamples.length} samples selected
            </span>
          </div>
          <button
            onClick={handleTransfer}
            className="fd-submit-btn"
            style={{ width: 'auto', padding: '0.65rem 1.25rem', backgroundColor: '#008744' }}
            disabled={selectedBarcodes.length === 0}
          >
            <Send size={16} /> Transfer Selected to Central Hub
          </button>
        </div>

        <div className="cons-table-wrapper">
          <table className="cons-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    {selectedBarcodes.length === readySamples.length && readySamples.length > 0 ? (
                      <CheckSquare size={16} color="#008744" />
                    ) : (
                      <Square size={16} color="#64748b" />
                    )}
                  </button>
                </th>
                <th>Sample Barcode</th>
                <th>Patient Name & ID</th>
                <th>Lab Order ID</th>
                <th>Tube / Specimen Type</th>
                <th>Tests Included</th>
                <th>Verification Status</th>
              </tr>
            </thead>
            <tbody>
              {readySamples.length > 0 ? (
                readySamples.map((s) => {
                  const isSelected = selectedBarcodes.includes(s.barcode);
                  return (
                    <tr key={s.barcode} style={{ backgroundColor: isSelected ? '#f0fdf4' : 'inherit' }}>
                      <td>
                        <button
                          type="button"
                          onClick={() => toggleSelect(s.barcode)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          {isSelected ? <CheckSquare size={16} color="#008744" /> : <Square size={16} color="#64748b" />}
                        </button>
                      </td>
                      <td><strong style={{ color: '#0070c0' }}>{s.barcode}</strong></td>
                      <td>
                        <div><strong>{s.patientName}</strong></div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{s.patientId}</div>
                      </td>
                      <td>{s.labOrderId}</td>
                      <td>
                        <span className={`fd-tube-tag fd-tube-${s.tubeCategory || 'red'}`}>
                          {s.tubeType}
                        </span>
                      </td>
                      <td>{(s.tests || []).join(', ')}</td>
                      <td>
                        <span style={{ color: '#008744', fontWeight: 'bold' }}>✓ Verified</span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                    No verified samples ready for consignment dispatch.
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
