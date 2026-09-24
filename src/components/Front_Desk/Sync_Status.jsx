import React, { useState } from 'react';
import '../../assets/style/Front_Desk.css';
import { RefreshCw, CheckCircle, Clock } from 'lucide-react';
import { fetchAllPatients } from '../../services/patientService';

export default function Sync_Status() {
  const patients = fetchAllPatients();
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(new Date().toLocaleTimeString());

  const handleSyncNow = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setLastSyncTime(new Date().toLocaleTimeString());
    }, 1200);
  };

  return (
    <div className="fd-card">
      <div className="fd-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="fd-card-title">
          <RefreshCw size={20} className={syncing ? 'spin-icon' : ''} />
          Central Server Sync Status
        </h2>
        <button
          onClick={handleSyncNow}
          className="fd-submit-btn"
          style={{ width: 'auto', padding: '0.45rem 1rem', fontSize: '12px' }}
          disabled={syncing}
        >
          {syncing ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>

      <div style={{ marginBottom: '1rem', fontSize: '13px', color: '#475569', display: 'flex', gap: '1.5rem' }}>
        <span><strong>Hub Location:</strong> Central Hub Vijayawada</span>
        <span><strong>Last Sync Time:</strong> {lastSyncTime}</span>
        <span><strong>Status:</strong> <span style={{ color: '#008744', fontWeight: 'bold' }}>● Operational</span></span>
      </div>

      <div className="fd-table-wrapper">
        <table className="fd-table">
          <thead>
            <tr>
              <th>Record Type</th>
              <th>Record ID</th>
              <th>Patient Name</th>
              <th>Date</th>
              <th>Sync Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p.id}>
                <td>Patient Registration</td>
                <td><strong>{p.id}</strong></td>
                <td>{p.fullName}</td>
                <td>{p.registrationDate || 'Today'}</td>
                <td>
                  <span className="fd-status-badge fd-status-completed" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle size={12} /> Synced
                  </span>
                </td>
                <td>
                  <button onClick={handleSyncNow} style={{ background: 'none', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', cursor: 'pointer' }}>
                    Re-sync
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
