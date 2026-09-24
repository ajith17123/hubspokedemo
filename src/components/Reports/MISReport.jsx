import React, { useState } from 'react';
import '../../assets/style/Reports.css';
import { Download, Printer, Filter } from 'lucide-react';
import { fetchAllPatients } from '../../services/patientService';

export default function MISReport({ onTriggerToast }) {
  const patients = fetchAllPatients();
  const todayStr = new Date().toISOString().split('T')[0];

  const [fromDate, setFromDate] = useState(todayStr);
  const [toDate, setToDate] = useState(todayStr);
  const [programType, setProgramType] = useState('All');

  const handleExportExcel = () => {
    if (onTriggerToast) onTriggerToast('MIS Data Report exported to Excel successfully!');
  };

  const handlePrintMIS = () => {
    if (onTriggerToast) onTriggerToast('Printing MIS Summary Report...');
    window.print();
  };

  return (
    <div className="rep-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, color: '#005a9e', fontSize: '16px' }}>
            📈 Management Information System (MIS) Report
          </h3>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Filter diagnostic performance metrics across date ranges and health programs.
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handlePrintMIS} className="fd-submit-btn" style={{ width: 'auto', padding: '0.45rem 1rem', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1' }}>
            <Printer size={14} /> Print Summary
          </button>
          <button onClick={handleExportExcel} className="fd-submit-btn" style={{ width: 'auto', padding: '0.45rem 1rem', background: '#008744' }}>
            <Download size={14} /> Export to Excel
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
        <div>
          <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>From Date</label>
          <input type="date" className="fd-input" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        </div>
        <div>
          <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>To Date</label>
          <input type="date" className="fd-input" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </div>
        <div>
          <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Program Type</label>
          <select className="fd-select" value={programType} onChange={(e) => setProgramType(e.target.value)}>
            <option value="All">All Health Programs</option>
            <option value="General">General</option>
            <option value="Government Health Program">Government Health Program</option>
            <option value="Screening Program">Screening Program</option>
            <option value="NCD Program">NCD Program</option>
          </select>
        </div>
      </div>

      <table className="cons-table">
        <thead>
          <tr>
            <th>Patient ID</th>
            <th>Patient Name</th>
            <th>Age / Gender</th>
            <th>Program Type</th>
            <th>Registration Date</th>
            <th>Lab Order ID</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((p) => (
            <tr key={p.id}>
              <td><strong>{p.id}</strong></td>
              <td>{p.fullName}</td>
              <td>{p.age} Yrs / {p.gender}</td>
              <td>
                <span style={{ fontSize: '11px', padding: '2px 8px', background: '#e0f2fe', color: '#0369a1', borderRadius: '4px', fontWeight: '600' }}>
                  {p.programType || 'General'}
                </span>
              </td>
              <td>{p.registrationDate || '23/09/2026'}</td>
              <td>LO-2026-{p.seqId}</td>
              <td><span style={{ color: '#008744', fontWeight: 'bold' }}>✓ Registered</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
