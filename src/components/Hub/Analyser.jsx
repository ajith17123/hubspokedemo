import React, { useState } from 'react';
import { getAnalyzerQueue, runAnalyzerSimulation } from '../../services/analyzerService';
import { generateResultsForBarcode } from '../../services/resultService';

export default function Analyser({ onTriggerToast }) {
  const [queue, setQueue] = useState(getAnalyzerQueue());

  const handleRun = (barcode, patientDetails, tests) => {
    runAnalyzerSimulation(barcode, false);
    generateResultsForBarcode(barcode, patientDetails, tests);
    setQueue(getAnalyzerQueue());
    if (onTriggerToast) onTriggerToast(`Analyzer run completed for barcode ${barcode}. Diagnostic results generated!`);
  };

  const handleRetest = (barcode) => {
    runAnalyzerSimulation(barcode, true);
    setQueue(getAnalyzerQueue());
    if (onTriggerToast) onTriggerToast(`Retest flag set for barcode ${barcode}. Re-running instrument calibration...`);
  };

  return (
    <section className="hub-panel">
      <div className="hub-section-header-row">
        <h3>⚡ AUTOMATED ANALYZER TESTING QUEUE</h3>
      </div>
      <div className="hub-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Barcode ID</th>
              <th>Patient Name</th>
              <th>Investigation</th>
              <th>Specimen Tube</th>
              <th>Analyzer Instrument</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {queue.length > 0 ? (
              queue.map((row) => (
                <tr key={row.queueId || row.barcode}>
                  <td><strong>{row.barcode}</strong></td>
                  <td>{row.patientName || row.patient}</td>
                  <td>{(row.tests || [row.investigation]).join(', ')}</td>
                  <td>{row.tubeType}</td>
                  <td><span style={{ fontWeight: 'bold', color: '#005a9e' }}>{row.analyzer}</span></td>
                  <td>
                    <span className={`hub-status-badge ${row.status === 'Test Success' ? 'hub-status-success' : row.status === 'Test Failed' ? 'hub-status-danger' : 'hub-status-warning'}`}>
                      {row.status}
                    </span>
                  </td>
                  <td>
                    <div className="hub-inline-actions">
                      <button
                        className="hub-primary-button hub-mini-button"
                        onClick={() => handleRun(row.barcode, { patientId: row.patientId, patientName: row.patientName || row.patient, labOrderId: row.labOrderId, analyzer: row.analyzer }, row.tests || [row.investigation])}
                      >
                        Run Test
                      </button>
                      <button className="hub-secondary-button hub-mini-button" onClick={() => handleRetest(row.barcode)}>
                        Retest
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  No active samples in the analyzer testing queue. Accept samples in Accession to populate queue.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
