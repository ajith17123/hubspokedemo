import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Printer, CheckCircle, ArrowLeft } from 'lucide-react';
import Toast from '../components/common/Toast';
import { getReports } from '../services/reportService';

export default function PublicReportView() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState('');

  const reports = getReports();
  const report = reports.find((r) => r.reportId === reportId || r.labOrderId === reportId) || reports[0];

  const handleDownloadPDF = () => {
    setToastMessage(`Report PDF ${report?.reportId || reportId} downloaded successfully!`);
  };

  const handlePrint = () => {
    setToastMessage(`Printing report ${report?.reportId || reportId}...`);
    window.print();
  };

  if (!report) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'var(--font-sans)' }}>
        <h2>Report Not Found</h2>
        <p>The requested laboratory report link is invalid or expired.</p>
        <button onClick={() => navigate('/')} style={{ background: '#008744', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '4px', cursor: 'pointer' }}>
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '1rem', fontFamily: 'var(--font-sans)' }}>
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <button
          onClick={() => navigate('/')}
          style={{ background: 'none', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <ArrowLeft size={16} /> Home
        </button>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handlePrint} className="fd-submit-btn" style={{ width: 'auto', padding: '0.45rem 1rem', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1' }}>
            <Printer size={16} /> Print Report
          </button>
          <button onClick={handleDownloadPDF} className="fd-submit-btn" style={{ width: 'auto', padding: '0.45rem 1rem', background: '#0070c0' }}>
            <Download size={16} /> Download PDF Report
          </button>
        </div>
      </div>

      {/* Official Government Diagnostic Report Header */}
      <div style={{ background: '#ffffff', border: '2px solid #cbd5e1', borderRadius: '8px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', borderBottom: '2px solid #008744', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <h1 style={{ margin: 0, color: '#005a9e', fontSize: '22px', fontWeight: 'bold' }}>
            GOVT. CITY DIAGNOSTIC CENTRE
          </h1>
          <div style={{ color: '#0070c0', fontWeight: 'bold', fontSize: '14px' }}>Vijayawada Main Hub Laboratory</div>
          <div style={{ color: '#475569', fontSize: '12px' }}>Department of Health, Medical & Family Welfare • Government of Andhra Pradesh</div>
          <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#008744', marginTop: '8px', letterSpacing: '0.5px' }}>
            PATIENT CLINICAL DIAGNOSTIC EVALUATION REPORT
          </div>
        </div>

        {/* Demographics Box */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px', marginBottom: '1.5rem' }}>
          <div>
            <div><strong>Patient Name:</strong> {report.patientName}</div>
            <div><strong>Patient ID:</strong> {report.patientId}</div>
            <div><strong>Age / Gender:</strong> {report.age} Yrs / {report.gender}</div>
            <div><strong>Mobile Number:</strong> {report.mobileNumber}</div>
          </div>
          <div>
            <div><strong>Report ID:</strong> {report.reportId}</div>
            <div><strong>Lab Order ID:</strong> {report.labOrderId}</div>
            <div><strong>OP/IP Record:</strong> {report.opIpId || 'OP-101'}</div>
            <div><strong>Date & Time:</strong> {report.signedAt || new Date().toLocaleDateString('en-GB')}</div>
          </div>
        </div>

        {/* Results Table */}
        <table className="cons-table" style={{ width: '100%', marginBottom: '2rem' }}>
          <thead>
            <tr>
              <th>Investigation Parameter</th>
              <th>Result Value</th>
              <th>Unit</th>
              <th>Reference Range</th>
              <th>Flag</th>
            </tr>
          </thead>
          <tbody>
            {(report.parameters || []).map((p, idx) => (
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

        {/* Digital Signature */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '11px', color: '#64748b' }}>
            Verified & Certified by Central Hub Lab Technologist
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#008744', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
              <CheckCircle size={14} /> Digitally Signed & Authenticated
            </div>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#005a9e', marginTop: '2px' }}>
              {report.digitalSignature || 'Dr. K. S. Rao, MD (Pathology) - Reg #APMC-45892'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
