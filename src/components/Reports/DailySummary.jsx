import React from 'react';
import '../../assets/style/Reports.css';
import { fetchAllPatients } from '../../services/patientService';
import { getMasterSamples } from '../../services/sampleService';
import { getReports } from '../../services/reportService';

export default function DailySummary() {
  const patients = fetchAllPatients();
  const samples = getMasterSamples();
  const reports = getReports();

  const collectedCount = samples.filter((s) => s.collectionStatus === 'Sample Collected').length;
  const verifiedCount = samples.filter((s) => s.verificationStatus === 'Verified').length;
  const signedCount = reports.filter((r) => r.pathologistStatus === 'Approved & Signed').length;

  return (
    <div className="rep-card">
      <h3 style={{ margin: '0 0 1rem 0', color: '#005a9e', fontSize: '16px' }}>
        📊 Daily Laboratory Operations Summary ({new Date().toLocaleDateString('en-GB')})
      </h3>

      <div className="rep-grid-4">
        <div className="rep-stat-box">
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>TOTAL PATIENT REGISTRATIONS</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#005a9e', margin: '4px 0' }}>{patients.length}</div>
          <div style={{ fontSize: '11px', color: '#475569' }}>Registered today across network</div>
        </div>

        <div className="rep-stat-box rep-stat-box-green">
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>SAMPLES COLLECTED</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#008744', margin: '4px 0' }}>{collectedCount}</div>
          <div style={{ fontSize: '11px', color: '#475569' }}>Phlebotomy intake completed</div>
        </div>

        <div className="rep-stat-box rep-stat-box-amber">
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>BARCODES VERIFIED</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#d97706', margin: '4px 0' }}>{verifiedCount}</div>
          <div style={{ fontSize: '11px', color: '#475569' }}>Ready for hub processing</div>
        </div>

        <div className="rep-stat-box rep-stat-box-green">
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>REPORTS APPROVED & SIGNED</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#008744', margin: '4px 0' }}>{signedCount}</div>
          <div style={{ fontSize: '11px', color: '#475569' }}>Digitally released to patients</div>
        </div>
      </div>

      <h4 style={{ color: '#1e293b', fontSize: '14px', marginBottom: '0.75rem' }}>Network Summary Breakdown</h4>
      <table className="cons-table">
        <thead>
          <tr>
            <th>Facility / Hub Location</th>
            <th>Registrations</th>
            <th>Samples Collected</th>
            <th>Consignments Dispatched</th>
            <th>Hub Accessions</th>
            <th>Reports Released</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>CD Spoke Vijayawada Main</strong></td>
            <td>{patients.length}</td>
            <td>{collectedCount}</td>
            <td>1</td>
            <td>1</td>
            <td>{signedCount}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
