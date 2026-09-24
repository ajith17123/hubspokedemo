import React from 'react';
import '../../assets/style/Reports.css';

export default function LabTestsConducted() {
  const testsSummary = [
    { name: 'Complete Blood Count (CBC)', dept: 'Hematology', analyzer: 'SYSMEX XN-1000', count: 42, success: 42, failed: 0, retest: 0 },
    { name: 'HbA1c Glycated Hemoglobin', dept: 'Biochemistry', analyzer: 'SYSMEX XN-1000', count: 35, success: 34, failed: 1, retest: 1 },
    { name: 'Thyroid Profile (T3/T4/TSH)', dept: 'Immunoassay', analyzer: 'ADVIA Centaur XPT', count: 28, success: 28, failed: 0, retest: 0 },
    { name: 'Liver Function Test (LFT)', dept: 'Clinical Chemistry', analyzer: 'BECKMAN AU480', count: 22, success: 21, failed: 1, retest: 1 },
    { name: 'Renal Function Test (RFT)', dept: 'Clinical Chemistry', analyzer: 'BECKMAN AU480', count: 19, success: 19, failed: 0, retest: 0 },
    { name: 'Fasting Plasma Glucose', dept: 'Clinical Chemistry', analyzer: 'BECKMAN AU480', count: 30, success: 30, failed: 0, retest: 0 }
  ];

  return (
    <div className="rep-card">
      <h3 style={{ margin: '0 0 1rem 0', color: '#005a9e', fontSize: '16px' }}>
        🔬 Diagnostic Tests Volume & Analyzer Performance Summary
      </h3>

      <table className="cons-table">
        <thead>
          <tr>
            <th>Test Investigation Name</th>
            <th>Department</th>
            <th>Analyzer Instrument</th>
            <th>Total Conducted</th>
            <th>Success</th>
            <th>Failed / Retest</th>
          </tr>
        </thead>
        <tbody>
          {testsSummary.map((t) => (
            <tr key={t.name}>
              <td><strong>{t.name}</strong></td>
              <td>{t.dept}</td>
              <td>{t.analyzer}</td>
              <td><strong>{t.count}</strong></td>
              <td><span style={{ color: '#008744', fontWeight: 'bold' }}>{t.success}</span></td>
              <td><span style={{ color: t.failed > 0 ? '#dc2626' : '#64748b' }}>{t.failed}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
