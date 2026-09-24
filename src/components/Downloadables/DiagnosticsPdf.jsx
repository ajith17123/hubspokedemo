import React, { useState } from 'react';
import './DiagnosticsPdf.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function DiagnosticsPdf({ order, onClose }) {
  const [isGenerating, setIsGenerating] = useState(false);

  if (!order) return null;

  const handleDownloadPDF = async () => {
    const element = document.getElementById(`diagnostics-pdf-slip-${order.id}`);
    if (!element) return;

    try {
      setIsGenerating(true);
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`LIMS_Requisition_${order.id}.pdf`);
    } catch (error) {
      console.error('Error generating Diagnostics PDF:', error);
      alert('Failed to generate PDF document.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="diag-pdf-overlay">
      <div className="diag-pdf-modal">
        <div className="diag-pdf-header">
          <div>
            <h3>Lab Requisition & Specimen Slip</h3>
            <span>Order Reference: {order.id}</span>
          </div>
          <button className="diag-pdf-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="diag-pdf-body">
          <div id={`diagnostics-pdf-slip-${order.id}`} className="diag-pdf-receipt">
            <div className="diag-pdf-brand">
              <div>
                <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>
                  Govt. City Diagnostic Centre, Vijayawada
                </h2>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Hub & Spoke Laboratory Network • Phlebotomy Requisition Slip
                </span>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#475569' }}>
                <div><strong>Order ID:</strong> {order.id}</div>
                <div><strong>Date:</strong> {order.date}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem', marginBottom: '1.25rem', backgroundColor: '#f8fafc', padding: '0.85rem', borderRadius: '6px' }}>
              <div><strong>Patient Name:</strong> {order.patientName}</div>
              <div><strong>PID / OP-IP ID:</strong> {order.pid} / {order.opIpId}</div>
              <div><strong>Age / Gender:</strong> {order.age} Yrs / {order.gender}</div>
              <div><strong>Contact No:</strong> {order.contact}</div>
              <div><strong>Patient Type:</strong> {order.type}</div>
              <div><strong>Requisition Status:</strong> <span style={{ color: order.status === 'Verified' ? '#15803d' : '#b45309', fontWeight: 'bold' }}>{order.status}</span></div>
            </div>

            <div style={{ fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.5rem', color: '#1e293b' }}>
              Requisitioned Tests ({order.tests ? order.tests.length : 0}):
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              {order.tests && order.tests.map((t, idx) => (
                <span key={idx} style={{ fontSize: '0.75rem', fontWeight: '600', backgroundColor: '#e2e8f0', color: '#1e293b', padding: '0.25rem 0.6rem', borderRadius: '4px' }}>
                  {t}
                </span>
              ))}
            </div>

            <div style={{ fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.5rem', color: '#1e293b' }}>
              Segregated Tube Barcodes ({order.samples ? order.samples.length : 0}):
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              {order.samples && order.samples.map((sample) => (
                <div key={sample.barcode} style={{ border: '1px border #cbd5e1', borderRadius: '6px', padding: '0.75rem', backgroundColor: '#ffffff' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>{sample.tubeType}</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: '800', letterSpacing: '0.1em', margin: '0.25rem 0', color: '#0f172a' }}>
                    {sample.barcode}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    Target Analyzer: {sample.analyzer}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="diag-pdf-footer">
          <button className="diag-pdf-btn-cancel" onClick={onClose}>Close</button>
          <button className="diag-pdf-btn-cancel" onClick={handlePrint}>Print Window</button>
          <button className="diag-pdf-btn-download" onClick={handleDownloadPDF} disabled={isGenerating}>
            {isGenerating ? 'Generating PDF...' : 'Download PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DiagnosticsPdf;
