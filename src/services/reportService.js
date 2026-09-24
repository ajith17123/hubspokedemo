/* ==========================================================================
   Report Service: Pathologist Review, Digital Signatures & PDF Generation
   ========================================================================== */

import { logAuditAction } from './auditService';
import { sendSMSNotification } from './notificationService';

export const REPORTS_STORAGE_KEY = 'LIMS_PATIENT_REPORTS_MASTER';

const INITIAL_MOCK_REPORTS = [
  {
    reportId: 'REP-2026-0001',
    patientId: 'SPK-1004',
    patientName: 'ANITHA REDDY',
    age: '29',
    gender: 'Female',
    mobileNumber: '9876543210',
    opIpId: 'OP-7825',
    labOrderId: 'CDS-0825-00088',
    tests: ['HbA1c', 'Complete Blood Count (CBC)'],
    parameters: [
      { parameter: 'Glycated Hemoglobin (HbA1c)', value: 6.4, unit: '%', referenceRange: '4.0 - 5.6', flag: 'High' },
      { parameter: 'Hemoglobin', value: 13.5, unit: 'g/dL', referenceRange: '13.0 - 17.0', flag: 'Normal' },
      { parameter: 'RBC Count', value: 4.8, unit: 'm/mm³', referenceRange: '4.5 - 5.9', flag: 'Normal' },
      { parameter: 'WBC Count', value: 7200, unit: 'cells/mm³', referenceRange: '4000 - 11000', flag: 'Normal' }
    ],
    verifiedBy: 'Lab Tech Rajesh',
    pathologistStatus: 'Pending Review',
    digitalSignature: null,
    signedAt: null,
    pdfStatus: 'Generated',
    pdfUrl: '/report/REP-2026-0001',
    smsStatus: 'Pending',
    smsSentAt: null
  },
  {
    reportId: 'REP-2026-0002',
    patientId: 'SPK-1001',
    patientName: 'K. RAMESH BABU',
    age: '45',
    gender: 'Male',
    mobileNumber: '9988776655',
    opIpId: 'OP-7821',
    labOrderId: 'CDS-0825-00080',
    tests: ['Thyroid Profile', 'LFT'],
    parameters: [
      { parameter: 'Total T3', value: 1.2, unit: 'ng/mL', referenceRange: '0.8 - 2.0', flag: 'Normal' },
      { parameter: 'Total T4', value: 8.5, unit: 'µg/dL', referenceRange: '5.1 - 14.1', flag: 'Normal' },
      { parameter: 'TSH', value: 2.8, unit: 'µIU/mL', referenceRange: '0.45 - 4.50', flag: 'Normal' }
    ],
    verifiedBy: 'Lab Tech Suresh',
    pathologistStatus: 'Approved & Signed',
    digitalSignature: 'Dr. K. S. Rao, MD (Pathology) - Reg #APMC-48192',
    signedAt: '23/09/2026 04:30 PM',
    pdfStatus: 'Generated',
    pdfUrl: '/report/REP-2026-0002',
    smsStatus: 'Sent',
    smsSentAt: '23/09/2026 04:31 PM'
  }
];

export const getReports = () => {
  try {
    const raw = localStorage.getItem(REPORTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_REPORTS));
      return INITIAL_MOCK_REPORTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_REPORTS));
      return INITIAL_MOCK_REPORTS;
    }
    return parsed;
  } catch (e) {
    console.error('Error loading reports:', e);
    return INITIAL_MOCK_REPORTS;
  }
};

export const saveReports = (reports) => {
  try {
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
  } catch (e) {
    console.error('Error saving reports:', e);
  }
};

export const createReportFromVerifiedResults = (verifiedResult) => {
  const reports = getReports();
  const existing = reports.find((r) => r.labOrderId === verifiedResult.labOrderId);

  if (existing) return existing;

  const num = reports.length + 1;
  const reportId = `REP-2026-${num.toString().padStart(4, '0')}`;

  const newReport = {
    reportId,
    patientId: verifiedResult.patientId || 'N/A',
    patientName: verifiedResult.patientName || 'N/A',
    age: verifiedResult.age || '',
    gender: verifiedResult.gender || '',
    mobileNumber: verifiedResult.mobileNumber || '',
    opIpId: verifiedResult.opIpId || '',
    labOrderId: verifiedResult.labOrderId,
    tests: Array.isArray(verifiedResult.investigation) ? verifiedResult.investigation : [verifiedResult.investigation],
    parameters: verifiedResult.parameters || [],
    verifiedBy: verifiedResult.verifiedBy || 'Hub Tech',
    pathologistStatus: 'Pending Review',
    digitalSignature: null,
    signedAt: null,
    pdfStatus: 'Pending',
    pdfUrl: `/report/${reportId}`,
    smsStatus: 'Pending',
    smsSentAt: null
  };

  saveReports([newReport, ...reports]);
  logAuditAction('Report Created', 'Report', reportId, `Created lab report ${reportId} for pathologist review`);
  return newReport;
};

export const signAndApproveReportByPathologist = (reportId, pathologistName = 'Dr. K. S. Rao, MD (Pathology)') => {
  const reports = getReports();
  const now = new Date();
  const dateStr = `${now.toLocaleDateString('en-GB')} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  let targetReport = null;

  const updatedReports = reports.map((rep) => {
    if (rep.reportId === reportId) {
      targetReport = {
        ...rep,
        pathologistStatus: 'Approved & Signed',
        digitalSignature: `${pathologistName} - Reg #APMC-${Math.floor(10000 + Math.random() * 90000)}`,
        signedAt: dateStr,
        pdfStatus: 'Generated'
      };
      return targetReport;
    }
    return rep;
  });

  saveReports(updatedReports);

  if (targetReport) {
    // Automatically trigger mock SMS delivery
    sendSMSNotification(targetReport);
    logAuditAction('Report Digitally Signed', 'Report', reportId, `Pathologist ${pathologistName} digitally signed report ${reportId}`);
  }

  return targetReport;
};
