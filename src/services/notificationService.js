/* ==========================================================================
   Notification Service: Simulated SMS Dispatch & Report Download Links
   ========================================================================== */

import { getReports, saveReports } from './reportService';
import { logAuditAction } from './auditService';

export const NOTIFICATIONS_STORAGE_KEY = 'LIMS_SMS_NOTIFICATIONS_MASTER';

export const getSMSLogs = () => {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error loading SMS logs:', e);
    return [];
  }
};

export const saveSMSLogs = (logs) => {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(logs));
  } catch (e) {
    console.error('Error saving SMS logs:', e);
  }
};

export const sendSMSNotification = (report) => {
  const logs = getSMSLogs();
  const now = new Date();
  const dateStr = `${now.toLocaleDateString('en-GB')} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  const secureLink = `${window.location.origin}/#/report/${report.reportId}`;
  const smsBody = `Govt. City Diagnostic Centre, Vijayawada: Dear ${report.patientName}, your lab report (${report.reportId}) is ready. Download here: ${secureLink}`;

  const smsEntry = {
    smsId: `SMS-${Date.now().toString().slice(-5)}`,
    reportId: report.reportId,
    patientId: report.patientId,
    patientName: report.patientName,
    mobileNumber: report.mobileNumber || '9848022338',
    messageBody: smsBody,
    status: 'Sent',
    sentAt: dateStr
  };

  saveSMSLogs([smsEntry, ...logs]);

  // Update report sms status
  const reports = getReports();
  const updatedReports = reports.map((r) => {
    if (r.reportId === report.reportId) {
      return {
        ...r,
        smsStatus: 'Sent',
        smsSentAt: dateStr
      };
    }
    return r;
  });
  saveReports(updatedReports);

  logAuditAction('SMS Dispatched', 'Notification', smsEntry.smsId, `SMS sent to ${smsEntry.mobileNumber} for report ${report.reportId}`);
  return smsEntry;
};
