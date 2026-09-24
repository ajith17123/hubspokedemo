import React, { useState } from 'react';
import '../../assets/style/Pathologist.css';
import { Award, Download, Printer, ArrowLeft, CheckCircle } from 'lucide-react';
import { signAndApproveReportByPathologist } from '../../services/reportService';

export default function ReportReview({ report, onBack, onTriggerToast }) {
  const [currentReport, setCurrentReport] = useState(report);
  const [signing, setSigning] = useState(false);

  if (!currentReport) return null;

  const handleSign = () => {
    setSigning(true);
    setTimeout(() => {
      const updated = signAndApproveReportByPathologist(currentReport.reportId, 'Dr. K. S. Rao, MD (Pathology)');
      setCurrentReport(updated);
      setSigning(false);
      if (onTriggerToast) onTriggerToast(`Report ${updated.reportId} digitally signed & approved! SMS notification dispatched.`);
    }, 1000);
  };

  const handleDownloadPDF = () => {
    if (onTriggerToast) onTriggerToast(`Report PDF ${currentReport.reportId} downloaded successfully!`);
  };

  const handlePrint = () => {
    if (onTriggerToast) onTriggerToast(`Sending ${currentReport.reportId} to printer...`);
    window.print();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <button
          onClick={onBack}
          style={{ background: 'none', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
        >
          <ArrowLeft size={14} /> Back to Reports List
        </button>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handlePrint} className="fd-submit-btn" style={{ width: 'auto', padding: '0.45rem 1rem', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1' }}>
            <Printer size={14} /> Print Report
          </button>
          <button onClick={handleDownloadPDF} className="fd-submit-btn" style={{ width: 'auto', padding: '0.45rem 1rem', background: '#0070c0' }}>
            <Download size={14} /> Download PDF
          </button>
          {currentReport.pathologistStatus !== 'Approved & Signed' && (
            <button onClick={handleSign} className="fd-submit-btn" style={{ width: 'auto', padding: '0.45rem 1rem', background: '#008744' }} disabled={signing}>
              <Award size={14} /> {signing ? 'Signing...' : 'Digitally Sign & Release Report'}
            </button>
          )}
        </div>
      </div>

      {/* Official Government Diagnostic Report Document Preview */}
      <div className="path-report-preview">
        {/* Document Header */}
        <div style={{ textAlign: 'center', borderBottom: '2px solid #008744', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, color: '#005a9e', fontSize: '20px', fontWeight: 'bold' }}>
            GOVT. CITY DIAGNOSTIC CENTRE
          </h2>
          <div style={{ color: '#0070c0', fontWeight: 'bold', fontSize: '13px' }}>Vijayawada Main Center</div>
          <div style={{ color: '#475569', fontSize: '11px' }}>Department of Health, Medical & Family Welfare • Govt. of Andhra Pradesh</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#008744', marginTop: '8px', textTransform: 'uppercase' }}>
            OFFICIAL CLINICAL LABORATORY EVALUATION REPORT
          </div>
        </div>

        {/* Patient & Order Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '6px', fontSize: '12px', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
          <div>
            <div><strong>Patient Name:</strong> {currentReport.patientName}</div>
            <div><strong>Patient ID:</strong> {currentReport.patientId}</div>
            <div><strong>Age / Gender:</strong> {currentReport.age} Yrs / {currentReport.gender}</div>
            <div><strong>Mobile Number:</strong> {currentReport.mobileNumber}</div>
          </div>
          <div>
            <div><strong>Report ID:</strong> {currentReport.reportId}</div>
            <div><strong>Lab Order ID:</strong> {currentReport.labOrderId}</div>
            <div><strong>OP/IP ID:</strong> {currentReport.opIpId || 'OP-101'}</div>
            <div><strong>Report Date:</strong> {currentReport.signedAt || new Date().toLocaleDateString('en-GB')}</div>
          </div>
        </div>

        {/* Test Results Table */}
        <table className="cons-table" style={{ marginBottom: '1.5rem' }}>
          <thead>
            <tr>
              <th>Investigation / Test Parameter</th>
              <th>Observed Result Value</th>
              <th>Unit</th>
              <th>Biological Reference Range</th>
              <th>Flag / Interpretation</th>
            </tr>
          </thead>
          <tbody>
            {(currentReport.parameters || []).map((p, idx) => (
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

        {/* Pathologist Digital Signature Block */}
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #cbd5e1', paddingTop: '1rem' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Verified by Hub Lab Technologist</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#334155' }}>{currentReport.verifiedBy || 'Senior Technician'}</div>
          </div>

          <div style={{ textAlign: 'right' }}>
            {currentReport.pathologistStatus === 'Approved & Signed' ? (
              <div>
                <div style={{ color: '#008744', fontWeight: 'bold', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                  <CheckCircle size={14} /> Digitally Authenticated & Released
                </div>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#005a9e', marginTop: '2px' }}>
                  {currentReport.digitalSignature}
                </div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>Signed: {currentReport.signedAt}</div>
              </div>
            ) : (
              <div style={{ color: '#d97706', fontSize: '12px', fontWeight: 'bold' }}>
                ⏳ Pending Pathologist Digital Signature
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
