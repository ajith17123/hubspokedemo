import React from 'react';
import { getConsignments, receiveConsignmentAtHub } from '../../services/consignmentService';

export default function IncomingConsignments({ onTriggerToast }) {
  const consignments = getConsignments();

  const handleReceive = (consignmentId) => {
    receiveConsignmentAtHub(consignmentId, 'hubuser');
    if (onTriggerToast) onTriggerToast(`Consignment ${consignmentId} received at Central Hub Laboratory!`);
  };

  return (
    <section className="hub-panel">
      <div className="hub-section-header-row">
        <h3>🚚 INCOMING SPOKE CONSIGNMENTS</h3>
      </div>
      <div className="hub-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Consignment ID</th>
              <th>Spoke Center</th>
              <th>Destination Hub</th>
              <th>Sample Count</th>
              <th>Dispatch Date & Time</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {consignments.map((c) => (
              <tr key={c.consignmentId}>
                <td><strong>{c.consignmentId}</strong></td>
                <td>{c.spokeCenter}</td>
                <td>{c.destinationHub}</td>
                <td>{c.sampleCount} Samples</td>
                <td>{c.dispatchedDate} {c.dispatchedTime}</td>
                <td>
                  <span className={`hub-status-badge ${c.status === 'Received at Hub' ? 'hub-status-success' : 'hub-status-warning'}`}>
                    {c.status}
                  </span>
                </td>
                <td>
                  {c.status !== 'Received at Hub' ? (
                    <button className="hub-primary-button hub-mini-button" onClick={() => handleReceive(c.consignmentId)}>
                      Receive at Hub
                    </button>
                  ) : (
                    <span style={{ fontSize: '11px', color: '#008744', fontWeight: 'bold' }}>✓ Received</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
