import React, { useState } from 'react';
import '../../assets/style/Pathologist.css';
import { Send, CheckCircle2, PhoneCall } from 'lucide-react';
import { getSMSLogs, sendSMSNotification } from '../../services/notificationService';
import { getReports } from '../../services/reportService';

export default function ReportsSending({ onTriggerToast }) {
  const [logs, setLogs] = useState(getSMSLogs());
  const reports = getReports();

  const handleResendSMS = (report) => {
    sendSMSNotification(report);
    setLogs(getSMSLogs());
    if (onTriggerToast) onTriggerToast(`SMS notification resent to ${report.mobileNumber} for Report ${report.reportId}!`);
  };

  return (
    <div className="path-card">
      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, color: '#005a9e', fontSize: '15px' }}>
          📱 SMS Delivery Tracker & Patient Download URL Logs
        </h3>
        <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
          Track automated SMS dispatches sent to patients upon report digital signing.
        </p>
      </div>

      <table className="cons-table">
        <thead>
          <tr>
            <th>Report ID</th>
            <th>Patient Name</th>
            <th>Mobile Number</th>
            <th>SMS Delivery Message</th>
            <th>Sent Timestamp</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((rep) => (
            <tr key={rep.reportId}>
              <td><strong style={{ color: '#005a9e' }}>{rep.reportId}</strong></td>
              <td>{rep.patientName}</td>
              <td>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <PhoneCall size={12} color="#008744" /> {rep.mobileNumber}
                </span>
              </td>
              <td style={{ fontSize: '11px', color: '#475569', maxWidth: '300px' }}>
                Govt. City Diagnostic Centre: Dear {rep.patientName}, your report ({rep.reportId}) is ready. Download link: {window.location.origin}/#/report/{rep.reportId}
              </td>
              <td>{rep.smsSentAt || 'Just now'}</td>
              <td>
                <span style={{ color: '#008744', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={12} /> Delivered
                </span>
              </td>
              <td>
                <button
                  onClick={() => handleResendSMS(rep)}
                  style={{ background: 'none', border: '1px solid #cbd5e1', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                >
                  <Send size={12} /> Resend SMS
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
