/* ==========================================================================
   Sample & Phlebotomy Service: Segregation & Sample Collection Logic
   ========================================================================== */

import { getOrders, saveOrders, TUBE_MATRIX } from '../DataStorage/patientData';
import { logAuditAction } from './auditService';

export const SAMPLES_STORAGE_KEY = 'LIMS_SAMPLES_MASTER';

const INITIAL_MOCK_SAMPLES = [
  {
    sampleId: 'SMP-LAV-1001-A',
    barcode: 'LAV-1001-A',
    patientId: 'SPK-1001',
    patientName: 'K. RAMESH BABU',
    labOrderId: 'CDS-0826-00001',
    tubeType: 'Lavender Cap (EDTA)',
    tubeCategory: 'lavender',
    analyzer: 'SYSMEX',
    tests: ['HbA1c', 'CBC Panel'],
    collectionStatus: 'Sample Collected',
    collectionDate: '24/09/2026',
    collectionTime: '08:45 AM',
    collectedBy: 'Phlebotomist Vijayawada',
    verificationStatus: 'Verified',
    readyForBox: true,
    consignmentId: null,
    hubStatus: 'Pending Dispatch'
  },
  {
    sampleId: 'SMP-RED-1001-B',
    barcode: 'RED-1001-B',
    patientId: 'SPK-1001',
    patientName: 'K. RAMESH BABU',
    labOrderId: 'CDS-0826-00001',
    tubeType: 'Red Cap (Serum)',
    tubeCategory: 'red',
    analyzer: 'ADVIA / BECKMAN',
    tests: ['Thyroid Profile'],
    collectionStatus: 'Sample Collected',
    collectionDate: '24/09/2026',
    collectionTime: '08:45 AM',
    collectedBy: 'Phlebotomist Vijayawada',
    verificationStatus: 'Verified',
    readyForBox: false,
    consignmentId: null,
    hubStatus: 'Pending Dispatch'
  },
  {
    sampleId: 'SMP-RED-1002-B',
    barcode: 'RED-1002-B',
    patientId: 'SPK-1002',
    patientName: 'S. LAKSHMI PRIYA',
    labOrderId: 'CDS-0826-00002',
    tubeType: 'Red Cap (Serum)',
    tubeCategory: 'red',
    analyzer: 'ADVIA / BECKMAN',
    tests: ['LFT', 'RFT', 'Thyroid Profile'],
    collectionStatus: 'Sample Collected',
    collectionDate: '24/09/2026',
    collectionTime: '09:30 AM',
    collectedBy: 'Phlebotomist Vijayawada',
    verificationStatus: 'Verified',
    readyForBox: false,
    consignmentId: null,
    hubStatus: 'Pending Dispatch'
  },
  {
    sampleId: 'SMP-GREY-1002-C',
    barcode: 'GREY-1002-C',
    patientId: 'SPK-1002',
    patientName: 'S. LAKSHMI PRIYA',
    labOrderId: 'CDS-0826-00002',
    tubeType: 'Grey Cap (Sodium Fluoride)',
    tubeCategory: 'grey',
    analyzer: 'BECKMAN',
    tests: ['Fasting Glucose'],
    collectionStatus: 'Sample Collected',
    collectionDate: '24/09/2026',
    collectionTime: '09:30 AM',
    collectedBy: 'Phlebotomist Vijayawada',
    verificationStatus: 'Verified',
    readyForBox: false,
    consignmentId: null,
    hubStatus: 'Pending Dispatch'
  },
  {
    sampleId: 'SMP-LAV-1003-A',
    barcode: 'LAV-1003-A',
    patientId: 'SPK-1003',
    patientName: 'V. VENKATARAMANA',
    labOrderId: 'CDS-0826-00003',
    tubeType: 'Lavender Cap (EDTA)',
    tubeCategory: 'lavender',
    analyzer: 'SYSMEX',
    tests: ['CBC Panel'],
    collectionStatus: 'Pending',
    collectionDate: null,
    collectionTime: null,
    collectedBy: null,
    verificationStatus: 'Pending Verification',
    readyForBox: false,
    consignmentId: null,
    hubStatus: 'Pending Dispatch'
  },
  {
    sampleId: 'SMP-GREY-1003-C',
    barcode: 'GREY-1003-C',
    patientId: 'SPK-1003',
    patientName: 'V. VENKATARAMANA',
    labOrderId: 'CDS-0826-00003',
    tubeType: 'Grey Cap (Sodium Fluoride)',
    tubeCategory: 'grey',
    analyzer: 'BECKMAN',
    tests: ['Fasting Glucose'],
    collectionStatus: 'Sample Collected',
    collectionDate: '24/09/2026',
    collectionTime: '10:15 AM',
    collectedBy: 'Phlebotomist Vijayawada',
    verificationStatus: 'Pending Barcode Scan',
    readyForBox: false,
    consignmentId: null,
    hubStatus: 'Pending Dispatch'
  }
];

export const getMasterSamples = () => {
  try {
    const raw = localStorage.getItem(SAMPLES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SAMPLES_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_SAMPLES));
      return INITIAL_MOCK_SAMPLES;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(SAMPLES_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_SAMPLES));
      return INITIAL_MOCK_SAMPLES;
    }
    return parsed;
  } catch (e) {
    console.error('Error reading master samples:', e);
    return INITIAL_MOCK_SAMPLES;
  }
};

export const saveMasterSamples = (samples) => {
  try {
    localStorage.setItem(SAMPLES_STORAGE_KEY, JSON.stringify(samples));
  } catch (e) {
    console.error('Error writing master samples:', e);
  }
};

// Segregate lab order into sample tubes according to clinical rules
export const generateSamplesForOrder = (order) => {
  const currentSamples = getMasterSamples();
  const tubeGroups = {};

  (order.tests || []).forEach((testName) => {
    let tubeCategory = 'red';
    const normalized = (testName || '').toLowerCase();
    if (TUBE_MATRIX.lavender.testMatches.some((m) => normalized.includes(m))) {
      tubeCategory = 'lavender';
    } else if (TUBE_MATRIX.grey.testMatches.some((m) => normalized.includes(m))) {
      tubeCategory = 'grey';
    }

    if (!tubeGroups[tubeCategory]) {
      tubeGroups[tubeCategory] = {
        tubeCategory,
        tubeInfo: TUBE_MATRIX[tubeCategory],
        tests: []
      };
    }
    tubeGroups[tubeCategory].tests.push(testName);
  });

  const numPart = (order.id.match(/\d+$/) || ['1001'])[0];
  const letterMap = { lavender: 'A', red: 'B', grey: 'C' };

  const newSamples = Object.values(tubeGroups).map((group) => {
    const barcodeId = `${group.tubeInfo.prefix}-${numPart}-${letterMap[group.tubeCategory] || 'A'}`;
    return {
      sampleId: `SMP-${barcodeId}`,
      barcode: barcodeId,
      patientId: order.pid || order.patientId || 'N/A',
      patientName: order.patientName || 'N/A',
      labOrderId: order.id,
      tubeType: group.tubeInfo.type,
      tubeCategory: group.tubeCategory,
      analyzer: group.tubeInfo.analyzer,
      tests: group.tests,
      collectionStatus: 'Pending',
      collectionDate: null,
      collectionTime: null,
      collectedBy: null,
      verificationStatus: 'Pending Verification',
      readyForBox: false,
      consignmentId: null,
      hubStatus: 'Pending Dispatch'
    };
  });

  // Merge with existing
  const existingOther = currentSamples.filter((s) => s.labOrderId !== order.id);
  const updatedList = [...newSamples, ...existingOther];
  saveMasterSamples(updatedList);
  return newSamples;
};

export const collectSample = (barcodeId, phlebotomistName = 'Phlebotomist Desk') => {
  const samples = getMasterSamples();
  let updatedSample = null;

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB');
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const updated = samples.map((s) => {
    if (s.barcode === barcodeId || s.sampleId === barcodeId) {
      updatedSample = {
        ...s,
        collectionStatus: 'Sample Collected',
        collectionDate: dateStr,
        collectionTime: timeStr,
        collectedBy: phlebotomistName,
        verificationStatus: 'Pending Barcode Scan'
      };
      return updatedSample;
    }
    return s;
  });

  saveMasterSamples(updated);
  if (updatedSample) {
    logAuditAction(
      'Sample Collected',
      'Sample',
      updatedSample.barcode,
      `Sample ${updatedSample.barcode} collected for ${updatedSample.patientName}`
    );
  }
  return updatedSample;
};
