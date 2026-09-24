import React from 'react';
import '../../assets/style/Reports.css';
import { FileText, Download } from 'lucide-react';

export default function SOPList({ onTriggerToast }) {
  const sops = [
    { id: 'SOP-PLB-001', title: 'Standard Operating Procedure for Venipuncture & Phlebotomy', dept: 'Spoke Phlebotomy', version: 'v2.1', updated: '15/01/2026' },
    { id: 'SOP-BC-002', title: 'Barcode Generation & Color-Coded Tube Segregation Protocol', dept: 'Spoke Front Desk', version: 'v1.8', updated: '20/02/2026' },
    { id: 'SOP-CSG-003', title: 'Cold-Chain Sample Packaging & Consignment Transport Guidelines', dept: 'Logistics', version: 'v3.0', updated: '10/03/2026' },
    { id: 'SOP-HUB-004', title: 'Central Hub Accession, Inspection & Rejection Criteria', dept: 'Hub Receiving', version: 'v2.4', updated: '01/04/2026' },
    { id: 'SOP-ANZ-005', title: 'Automated Analyzer Quality Control & Calibration SOP (SYSMEX/ADVIA/BECKMAN)', dept: 'Hub Laboratory', version: 'v4.1', updated: '12/05/2026' },
    { id: 'SOP-PATH-006', title: 'Pathologist Evaluation, Digital Signature & Critical Value Release Protocol', dept: 'Pathology', version: 'v2.0', updated: '01/08/2026' }
  ];

  const handleDownloadSOP = (sop) => {
    if (onTriggerToast) onTriggerToast(`SOP Document (${sop.id}) downloaded successfully!`);
  };

  return (
    <div className="rep-card">
      <h3 style={{ margin: '0 0 1rem 0', color: '#005a9e', fontSize: '16px' }}>
        📜 Standard Operating Procedures (SOP) Repository
      </h3>

      <table className="cons-table">
        <thead>
          <tr>
            <th>SOP Code</th>
            <th>Document Title</th>
            <th>Department</th>
            <th>Version</th>
            <th>Last Revised</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {sops.map((sop) => (
            <tr key={sop.id}>
              <td><strong>{sop.id}</strong></td>
              <td>
                <div style={{ fontWeight: '600', color: '#0f172a' }}>{sop.title}</div>
              </td>
              <td>{sop.dept}</td>
              <td><span style={{ fontSize: '11px', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{sop.version}</span></td>
              <td>{sop.updated}</td>
              <td>
                <button
                  onClick={() => handleDownloadSOP(sop)}
                  style={{ background: 'none', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '4px 8px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Download size={12} /> Download SOP
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
