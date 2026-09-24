import React, { useState } from 'react';
import './patientregister_pdf.css';
import { Printer, Download, X } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { AVAILABLE_TESTS } from '../../DataStorage/patientData';

function PatientRegisterPdf({ patient, onClose }) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  if (!patient) return null;

  // Trigger Browser Print
  const handlePrintWindow = () => {
    window.print();
  };

  // Client-Side PDF Generation & Direct File Download
  const handleDownloadPDF = async () => {
    const receiptElement = document.getElementById('lims-patient-receipt');
    if (!receiptElement) return;

    try {
      setIsGeneratingPDF(true);
      const canvas = await html2canvas(receiptElement, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`LIMS_Requisition_${patient.id}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to download PDF.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="pdf-modal-overlay">
      <div className="pdf-modal-content">
        <div className="pdf-modal-header">
          <div>
            <h3 style={{ margin: 0, color: '#005a9e' }}>
              Patient Requisition & Specimen Receipt
            </h3>
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              Preview, Print or Download PDF
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Printable & Downloadable LIMS Receipt Layout */}
        <div id="lims-patient-receipt" className="pdf-receipt-wrapper">
          <div className="pdf-receipt-header-banner">
            <div>
              <div className="pdf-receipt-brand">HUB & SPOKE LIMS NETWORK</div>
              <div style={{ fontSize: '12px', color: '#475569' }}>Spoke Center-04 Intake Counter</div>
            </div>
            <div className="pdf-receipt-meta">
              <div><strong>Requisition #:</strong> {patient.id}</div>
              <div><strong>Date & Time:</strong> {patient.createdAt || patient.registrationDate || new Date().toLocaleString()}</div>
            </div>
          </div>

          <table className="pdf-receipt-patient-table">
            <tbody>
              <tr>
                <td className="label-col">Patient Name:</td>
                <td><strong>{patient.fullName}</strong></td>
                <td className="label-col">Patient ID:</td>
                <td><strong>{patient.id}</strong></td>
              </tr>
              <tr>
                <td className="label-col">Age / Gender:</td>
                <td>{patient.age} Yrs / {patient.gender}</td>
                <td className="label-col">Encounter:</td>
                <td>{patient.encounterType}</td>
              </tr>
              <tr>
                <td className="label-col">Mobile No:</td>
                <td>{patient.mobileNumber}</td>
                <td className="label-col">Aadhaar / Gov ID:</td>
                <td>{patient.aadhaarId}</td>
              </tr>
              <tr>
                <td className="label-col">Referring Doctor:</td>
                <td>{patient.referringDoctor || 'Direct / Self'}</td>
                <td className="label-col">Address:</td>
                <td>{patient.address || 'N/A'}</td>
              </tr>
            </tbody>
          </table>

          <div style={{ margin: '1rem 0 0.5rem 0', fontWeight: 'bold', fontSize: '13px', color: '#0f172a' }}>
            Ordered Diagnostic Tests ({patient.tests ? patient.tests.length : 0}):
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {patient.tests && patient.tests.map(testId => {
              const testObj = AVAILABLE_TESTS ? AVAILABLE_TESTS.find(t => t.id === testId) : null;
              return (
                <span
                  key={testId}
                  style={{
                    fontSize: '11px',
                    fontWeight: 500,
                    color: '#1e293b',
                    backgroundColor: '#f1f5f9',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1'
                  }}
                >
                  {testObj ? testObj.name : testId}
                </span>
              );
            })}
          </div>

          <div style={{ margin: '1rem 0 0.5rem 0', fontWeight: 'bold', fontSize: '13px', color: '#0f172a' }}>
            Specimen Tube Barcode Labels ({patient.barcodes ? patient.barcodes.length : 0}):
          </div>
          <div className="pdf-barcode-box-grid">
            {patient.barcodes && patient.barcodes.map(b => (
              <div key={b.barcodeId} className="pdf-barcode-card">
                <span className={`fd-tube-tag fd-tube-${b.color}`}>
                  <span className={`fd-tube-dot ${b.color}`}></span>
                  {b.category}
                </span>
                <div className="pdf-barcode-font-lines">|||| | ||||| || |||</div>
                <div style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '12px' }}>{b.barcodeId}</div>
                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '0.2rem' }}>
                  {b.tests.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer Buttons */}
        <div className="pdf-modal-footer">
          <button
            type="button"
            className="fd-btn-secondary"
            onClick={onClose}
          >
            Close
          </button>

          <button
            type="button"
            className="fd-action-btn"
            onClick={handlePrintWindow}
            style={{ padding: '0.6rem 1rem', fontSize: '13px' }}
          >
            <Printer size={16} />
            Print Requisition
          </button>

          <button
            type="button"
            className="fd-btn-primary"
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1rem', fontSize: '13px' }}
          >
            <Download size={16} />
            {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PatientRegisterPdf;
