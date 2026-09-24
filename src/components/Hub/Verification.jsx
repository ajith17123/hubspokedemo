import React, { useState } from 'react';
import { getResults } from '../../services/resultService';
import { verifyTestResult } from '../../services/verificationService';

export default function Verification({ onTriggerToast }) {
  const [results, setResults] = useState(getResults());

  const handleVerify = (resultId, action) => {
    verifyTestResult(resultId, action, 'hubuser');
    setResults(getResults());
    if (onTriggerToast) {
      if (action === 'approve') onTriggerToast(`Result ${resultId} verified and sent to Pathologist for review!`);
      else if (action === 'retest') onTriggerToast(`Retest requested for result ${resultId}.`);
      else onTriggerToast(`Result ${resultId} placed on hold.`);
    }
  };

  return (
    <section className="hub-panel">
      <div className="hub-section-header-row">
        <h3>🔬 LAB TECHNICIAN RESULT VERIFICATION</h3>
      </div>
      <div className="hub-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Result ID</th>
              <th>Barcode ID</th>
              <th>Patient Name</th>
              <th>Investigation</th>
              <th>Analyzer</th>
              <th>Verification Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {results.length > 0 ? (
              results.map((res) => (
                <tr key={res.resultId}>
                  <td><strong>{res.resultId}</strong></td>
                  <td>{res.barcode}</td>
                  <td>{res.patientName}</td>
                  <td>{res.investigation}</td>
                  <td>{res.analyzer}</td>
                  <td>
                    <span className={`hub-status-badge ${res.verificationStatus === 'Approved' ? 'hub-status-success' : 'hub-status-warning'}`}>
                      {res.verificationStatus}
                    </span>
                  </td>
                  <td>
                    {res.verificationStatus !== 'Approved' ? (
                      <div className="hub-inline-actions">
                        <button className="hub-primary-button hub-mini-button" onClick={() => handleVerify(res.resultId, 'approve')}>
                          Approve Result
                        </button>
                        <button className="hub-secondary-button hub-mini-button" onClick={() => handleVerify(res.resultId, 'retest')}>
                          Retest
                        </button>
                        <button className="hub-secondary-button hub-mini-button" onClick={() => handleVerify(res.resultId, 'hold')}>
                          Hold
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: '#008744', fontWeight: 'bold', fontSize: '11px' }}>✓ Approved by Tech</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  No pending results for verification.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
