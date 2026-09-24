/* ==========================================================================
   Analyzer Service: Simulator for ADVIA, BECKMAN, SYSMEX Automated Testing
   ========================================================================== */

import { getMasterSamples, saveMasterSamples } from './sampleService';
import { logAuditAction } from './auditService';

export const ANALYZER_QUEUE_KEY = 'LIMS_ANALYZER_QUEUE';

export const ANALYZER_MAPPING = {
  SYSMEX: { name: 'SYSMEX XN-1000', category: 'Cell Counts / Hematology & HbA1c', tubeType: 'Lavender EDTA Tube' },
  ADVIA: { name: 'ADVIA Centaur XPT', category: 'Thyroid Profile & Immunoassay', tubeType: 'Red Serum Tube' },
  BECKMAN: { name: 'BECKMAN Coulter AU480', category: 'Routine Chemistry, LFT, RFT & Glucose', tubeType: 'Red/Grey Tube' }
};

export const getAnalyzerQueue = () => {
  try {
    const raw = localStorage.getItem(ANALYZER_QUEUE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading analyzer queue:', e);
    return [];
  }
};

export const saveAnalyzerQueue = (queue) => {
  try {
    localStorage.setItem(ANALYZER_QUEUE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.error('Error saving analyzer queue:', e);
  }
};

// Accession sample into analyzer queue
export const accessionSampleAtHub = (barcode, action = 'accept', rejectionReason = '') => {
  const masterSamples = getMasterSamples();
  let targetSample = null;

  const updatedSamples = masterSamples.map((s) => {
    if (s.barcode === barcode) {
      targetSample = {
        ...s,
        accessionStatus: action === 'accept' ? 'Accepted at Hub' : 'Rejected at Hub',
        rejectionReason: action === 'reject' ? rejectionReason : null,
        hubStatus: action === 'accept' ? 'Testing Pending' : 'Rejected'
      };
      return targetSample;
    }
    return s;
  });

  saveMasterSamples(updatedSamples);

  if (action === 'accept' && targetSample) {
    const queue = getAnalyzerQueue();
    const existing = queue.find((q) => q.barcode === barcode);
    if (!existing) {
      const queueItem = {
        queueId: `Q-${Date.now()}`,
        barcode: targetSample.barcode,
        patientId: targetSample.patientId,
        patientName: targetSample.patientName,
        labOrderId: targetSample.labOrderId,
        tests: targetSample.tests,
        tubeType: targetSample.tubeType,
        analyzer: targetSample.analyzer || 'BECKMAN',
        status: 'Testing Pending',
        startedAt: null,
        completedAt: null
      };
      saveAnalyzerQueue([queueItem, ...queue]);
    }
    logAuditAction('Sample Accessioned', 'Sample', barcode, `Sample ${barcode} accepted into Hub testing queue`);
  } else if (action === 'reject' && targetSample) {
    logAuditAction('Sample Rejected', 'Sample', barcode, `Sample ${barcode} rejected at Hub: ${rejectionReason}`);
  }

  return targetSample;
};

// Simulate running analyzer for a barcode
export const runAnalyzerSimulation = (barcode, forceFail = false) => {
  const queue = getAnalyzerQueue();
  let updatedItem = null;
  const now = new Date();
  const dateStr = `${now.toLocaleDateString('en-GB')} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  const updatedQueue = queue.map((item) => {
    if (item.barcode === barcode) {
      const nextStatus = forceFail ? 'Test Failed' : 'Test Success';
      updatedItem = {
        ...item,
        status: nextStatus,
        completedAt: dateStr,
        failureReason: forceFail ? 'Analyzer Calibration Warning / Clotted Sample' : null
      };
      return updatedItem;
    }
    return item;
  });

  saveAnalyzerQueue(updatedQueue);

  // Update master sample status
  const samples = getMasterSamples();
  const updatedSamples = samples.map((s) => {
    if (s.barcode === barcode) {
      return {
        ...s,
        hubStatus: forceFail ? 'Test Failed' : 'Results Ready'
      };
    }
    return s;
  });
  saveMasterSamples(updatedSamples);

  if (updatedItem) {
    logAuditAction('Analyzer Run Completed', 'Analyzer', barcode, `Analyzer completed run for ${barcode}: ${updatedItem.status}`);
  }

  return updatedItem;
};
