/* ==========================================================================
   Consignment Service: Prepare, Transfer & Track Consignments (CON-2026-XXXX)
   ========================================================================== */

import { getMasterSamples, saveMasterSamples } from './sampleService';
import { logAuditAction } from './auditService';

export const CONSIGNMENT_STORAGE_KEY = 'LIMS_CONSIGNMENTS_MASTER';

const INITIAL_MOCK_CONSIGNMENTS = [
  {
    consignmentId: 'CON-2026-0001',
    spokeCenter: 'CD Spoke Vijayawada',
    destinationHub: 'Central Hub Laboratory',
    sampleCount: 3,
    sampleBarcodes: ['LAV-1001-A', 'RED-1002-B', 'GREY-1002-C'],
    status: 'Transferred to Hub',
    dispatchedDate: '23/09/2026',
    dispatchedTime: '10:30 AM',
    dispatchedBy: 'cdspoke',
    receivedAtHub: null,
    receivedBy: null,
    timeline: [
      { step: 'Prepared at Spoke', status: 'Completed', timestamp: '23/09/2026 10:15 AM' },
      { step: 'Transferred to Hub', status: 'Completed', timestamp: '23/09/2026 10:30 AM' },
      { step: 'Received at Hub', status: 'Pending', timestamp: '-' },
      { step: 'Hub Accession', status: 'Pending', timestamp: '-' }
    ]
  }
];

export const getConsignments = () => {
  try {
    const raw = localStorage.getItem(CONSIGNMENT_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CONSIGNMENT_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_CONSIGNMENTS));
      return INITIAL_MOCK_CONSIGNMENTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading consignments:', e);
    return INITIAL_MOCK_CONSIGNMENTS;
  }
};

export const saveConsignments = (consignments) => {
  try {
    localStorage.setItem(CONSIGNMENT_STORAGE_KEY, JSON.stringify(consignments));
  } catch (e) {
    console.error('Error saving consignments:', e);
  }
};

export const createAndTransferConsignment = (selectedBarcodes, spokeName = 'CD Spoke Vijayawada') => {
  if (!selectedBarcodes || selectedBarcodes.length === 0) {
    throw new Error('Please select at least one verified sample for consignment.');
  }

  const consignments = getConsignments();
  const nextNum = consignments.length + 1;
  const numStr = nextNum.toString().padStart(4, '0');
  const consignmentId = `CON-2026-${numStr}`;

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB');
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const newConsignment = {
    consignmentId,
    spokeCenter: spokeName,
    destinationHub: 'Central Hub Laboratory',
    sampleCount: selectedBarcodes.length,
    sampleBarcodes: [...selectedBarcodes],
    status: 'Transferred to Hub',
    dispatchedDate: dateStr,
    dispatchedTime: timeStr,
    dispatchedBy: 'cdspoke',
    receivedAtHub: null,
    receivedBy: null,
    timeline: [
      { step: 'Prepared at Spoke', status: 'Completed', timestamp: `${dateStr} ${timeStr}` },
      { step: 'Transferred to Hub', status: 'Completed', timestamp: `${dateStr} ${timeStr}` },
      { step: 'Received at Hub', status: 'Pending', timestamp: '-' },
      { step: 'Hub Accession', status: 'Pending', timestamp: '-' }
    ]
  };

  const updatedConsignments = [newConsignment, ...consignments];
  saveConsignments(updatedConsignments);

  // Update sample status
  const masterSamples = getMasterSamples();
  const updatedSamples = masterSamples.map((s) => {
    if (selectedBarcodes.includes(s.barcode)) {
      return {
        ...s,
        consignmentId,
        hubStatus: 'Transferred to Hub',
        readyForBox: false
      };
    }
    return s;
  });
  saveMasterSamples(updatedSamples);

  logAuditAction(
    'Consignment Created',
    'Consignment',
    consignmentId,
    `Dispatched ${selectedBarcodes.length} samples in consignment ${consignmentId} to Hub`
  );

  return newConsignment;
};

export const receiveConsignmentAtHub = (consignmentId, hubUser = 'hubuser') => {
  const consignments = getConsignments();
  const now = new Date();
  const dateTimeStr = `${now.toLocaleDateString('en-GB')} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  let target = null;
  const updatedConsignments = consignments.map((c) => {
    if (c.consignmentId === consignmentId) {
      target = {
        ...c,
        status: 'Received at Hub',
        receivedAtHub: dateTimeStr,
        receivedBy: hubUser,
        timeline: c.timeline.map((t) => {
          if (t.step === 'Received at Hub') {
            return { ...t, status: 'Completed', timestamp: dateTimeStr };
          }
          return t;
        })
      };
      return target;
    }
    return c;
  });

  saveConsignments(updatedConsignments);

  // Update master samples
  if (target) {
    const samples = getMasterSamples();
    const updatedSamples = samples.map((s) => {
      if (target.sampleBarcodes.includes(s.barcode)) {
        return {
          ...s,
          hubStatus: 'Received at Hub'
        };
      }
      return s;
    });
    saveMasterSamples(updatedSamples);
  }

  logAuditAction('Consignment Received', 'Consignment', consignmentId, `Consignment ${consignmentId} received at Hub`);
  return target;
};
