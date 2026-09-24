import React, { useState } from 'react';
import '../../assets/style/Consignment.css';
import { Search, Truck, CheckCircle, Clock } from 'lucide-react';
import { getConsignments } from '../../services/consignmentService';

export default function TrackConsignment() {
  const consignments = getConsignments();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = consignments.filter(
    (c) =>
      c.consignmentId.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
      c.spokeCenter.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  return (
    <div>
      <div className="cons-card">
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
              Search Consignment ID or Spoke Center
            </label>
            <input
              type="text"
              className="fd-input"
              placeholder="e.g. CON-2026-0001"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filtered.map((cons) => (
          <div key={cons.consignmentId} style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '1.25rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <div>
                <h4 style={{ margin: 0, color: '#005a9e', fontSize: '16px' }}>
                  <Truck size={18} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                  {cons.consignmentId}
                </h4>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  Dispatched from: <strong>{cons.spokeCenter}</strong> &rarr; Destination: <strong>{cons.destinationHub}</strong>
                </div>
              </div>

              <div style={{ textTransform: 'uppercase', fontSize: '12px', fontWeight: 'bold', padding: '4px 10px', background: '#dbeafe', color: '#1e40af', borderRadius: '12px' }}>
                {cons.status}
              </div>
            </div>

            {/* Timeline */}
            <div className="cons-timeline">
              {cons.timeline.map((step, idx) => (
                <React.Fragment key={step.step}>
                  <div className="cons-timeline-step">
                    <div className={`cons-step-circle ${step.status === 'Completed' ? 'cons-step-completed' : 'cons-step-pending'}`}>
                      {idx + 1}
                    </div>
                    <div>
                      <div>{step.step}</div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>{step.timestamp}</div>
                    </div>
                  </div>
                  {idx < cons.timeline.length - 1 && (
                    <div style={{ color: '#cbd5e1', fontWeight: 'bold' }}>&rarr;</div>
                  )}
                </React.Fragment>
              ))}
            </div>

            <div style={{ fontSize: '12px', background: '#f8fafc', padding: '8px 12px', borderRadius: '4px' }}>
              <strong>Sample Barcodes Included ({cons.sampleCount}):</strong> {cons.sampleBarcodes.join(', ')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
