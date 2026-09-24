import React from 'react';
import '../../assets/style/Pathologist.css';
import { FileText, CheckCircle, Clock } from 'lucide-react';
import { getReports } from '../../services/reportService';

export default function TestReports({ onSelectReport }) {
  const reports = getReports();

  return (
    <div className="path-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, color: '#005a9e', fontSize: '15px' }}>
          Diagnostic Reports Pending Pathologist Authentication
        </h3>
        <span style={{ fontSize: '12px', color: '#64748b' }}>
          {reports.length} Total Reports
        </span>
      </div>

      <table className="cons-table">
        <thead>
          <tr>
            <th>Report ID</th>
            <th>Patient Name & Details</th>
            <th>Lab Order ID</th>
            <th>Tests Conducted</th>
            <th>Technician Status</th>
            <th>Pathologist Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {reports.length > 0 ? (
            reports.map((rep) => (
              <tr key={rep.reportId}>
                <td><strong style={{ color: '#005a9e' }}>{rep.reportId}</strong></td>
                <td>
                  <div><strong>{rep.patientName}</strong></div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{rep.patientId} • {rep.gender}, {rep.age} Yrs</div>
                </td>
                <td>{rep.labOrderId}</td>
                <td>{(rep.tests || []).join(', ')}</td>
                <td>
                  <span style={{ color: '#008744', fontWeight: 'bold' }}>✓ Verified</span>
                </td>
                <td>
                  {rep.pathologistStatus === 'Approved & Signed' ? (
                    <span style={{ color: '#008744', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle size={12} /> Approved & Signed
                    </span>
                  ) : (
                    <span style={{ color: '#d97706', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> Pending Review
                    </span>
                  )}
                </td>
                <td>
                  <button
                    onClick={() => onSelectReport(rep)}
                    className="fd-submit-btn"
                    style={{ width: 'auto', padding: '0.4rem 0.85rem', fontSize: '11px', backgroundColor: '#005a9e' }}
                  >
                    <FileText size={14} /> Review & Sign
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                No lab reports currently pending review.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
