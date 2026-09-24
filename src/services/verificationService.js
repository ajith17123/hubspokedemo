/* ==========================================================================
   Verification Service: Lab Technician Verification & Status Lifecycle
   ========================================================================== */

import { getResults, saveResults } from './resultService';
import { getMasterSamples, saveMasterSamples } from './sampleService';
import { logAuditAction } from './auditService';
import { createReportFromVerifiedResults } from './reportService';

export const verifyTestResult = (resultId, action = 'approve', verifierName = 'hubuser', reason = '') => {
  const results = getResults();
  let updatedResult = null;

  const now = new Date();
  const dateTimeStr = `${now.toLocaleDateString('en-GB')} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  const updatedResults = results.map((r) => {
    if (r.resultId === resultId || r.barcode === resultId) {
      const nextStatus = action === 'approve' ? 'Approved' : action === 'retest' ? 'Retest Requested' : 'Hold';
      updatedResult = {
        ...r,
        verificationStatus: nextStatus,
        verifiedBy: verifierName,
        verifiedAt: dateTimeStr,
        holdReason: action === 'hold' ? reason : null,
        retestReason: action === 'retest' ? reason : null
      };
      return updatedResult;
    }
    return r;
  });

  saveResults(updatedResults);

  // Update master sample status
  if (updatedResult) {
    const samples = getMasterSamples();
    const updatedSamples = samples.map((s) => {
      if (s.barcode === updatedResult.barcode) {
        return {
          ...s,
          hubStatus: action === 'approve' ? 'Pathologist Review Pending' : action === 'retest' ? 'Retest Pending' : 'Hold'
        };
      }
      return s;
    });
    saveMasterSamples(updatedSamples);

    if (action === 'approve') {
      createReportFromVerifiedResults(updatedResult);
    }

    logAuditAction(
      'Result Verification',
      'Result',
      updatedResult.resultId,
      `Result ${updatedResult.resultId} marked as ${updatedResult.verificationStatus}`
    );
  }

  return updatedResult;
};
