import React from 'react';
import { getResults } from '../../services/resultService';

export default function Results() {
  const results = getResults();

  return (
    <section className="hub-panel">
      <div className="hub-section-header-row">
        <h3>📋 MULTI-PARAMETER DIAGNOSTIC RESULTS</h3>
      </div>
      {results.length > 0 ? (
        results.map((res) => (
          <div key={res.resultId} style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '1rem', marginBottom: '1rem', background: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
              <div>
                <strong style={{ color: '#005a9e', fontSize: '15px' }}>{res.investigation}</strong>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Barcode: <strong>{res.barcode}</strong> • Patient: <strong>{res.patientName}</strong> ({res.patientId})
                </div>
              </div>
              <div>
                <span className="hub-status-badge hub-status-info">{res.analyzer}</span>
              </div>
            </div>

            <div className="hub-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Parameter Name</th>
                    <th>Observed Result</th>
                    <th>Unit</th>
                    <th>Reference Range</th>
                    <th>Flag</th>
                  </tr>
                </thead>
                <tbody>
                  {(res.parameters || []).map((p, idx) => (
                    <tr key={idx}>
                      <td><strong>{p.parameter}</strong></td>
                      <td><strong style={{ color: p.flag === 'High' ? '#dc2626' : p.flag === 'Low' ? '#d97706' : '#0f172a' }}>{p.value}</strong></td>
                      <td>{p.unit}</td>
                      <td>{p.referenceRange}</td>
                      <td>
                        <span style={{ fontWeight: 'bold', color: p.flag === 'High' ? '#dc2626' : p.flag === 'Low' ? '#d97706' : '#008744' }}>
                          {p.flag}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      ) : (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
          No diagnostic results generated yet.
        </div>
      )}
    </section>
  );
}
