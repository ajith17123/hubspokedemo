/* ==========================================================================
   Barcode Service: Verification & Printing Actions
   ========================================================================== */

import { getMasterSamples, saveMasterSamples } from './sampleService';
import { logAuditAction } from './auditService';

export const verifyBarcode = (scannedCode) => {
  if (!scannedCode || !scannedCode.trim()) {
    throw new Error('Barcode scan code cannot be empty.');
  }

  const code = scannedCode.trim().toUpperCase();
  const samples = getMasterSamples();

  let matchedSample = null;
  const updatedSamples = samples.map((s) => {
    if (s.barcode.toUpperCase() === code || s.sampleId.toUpperCase() === code) {
      if (s.verificationStatus === 'Verified') {
        matchedSample = { ...s, alreadyVerified: true };
        return s;
      }
      matchedSample = {
        ...s,
        verificationStatus: 'Verified',
        collectionStatus: 'Sample Collected',
        readyForBox: true,
        verifiedAt: new Date().toLocaleString('en-GB')
      };
      return matchedSample;
    }
    return s;
  });

  if (!matchedSample) {
    throw new Error(`Barcode ${code} not found in system registry.`);
  }

  if (!matchedSample.alreadyVerified) {
    saveMasterSamples(updatedSamples);
    logAuditAction(
      'Barcode Verified',
      'Barcode',
      matchedSample.barcode,
      `Barcode ${matchedSample.barcode} verified & tagged ready for consignment`
    );
  }

  return matchedSample;
};

export const toggleSampleConsignmentReady = (barcode) => {
  const samples = getMasterSamples();
  let updatedSample = null;

  const updated = samples.map((s) => {
    if (s.barcode === barcode) {
      updatedSample = {
        ...s,
        readyForBox: !s.readyForBox
      };
      return updatedSample;
    }
    return s;
  });

  saveMasterSamples(updated);
  return updatedSample;
};
