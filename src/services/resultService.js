/* ==========================================================================
   Result Service: Diagnostic Parameters, Reference Ranges & Auto-Flagging
   ========================================================================== */

import { logAuditAction } from './auditService';
import { getMasterSamples, saveMasterSamples } from './sampleService';

export const RESULTS_STORAGE_KEY = 'LIMS_TEST_RESULTS_MASTER';

export const DEFAULT_PARAMETER_MODELS = {
  hba1c: [
    { parameter: 'Glycated Hemoglobin (HbA1c)', value: 6.4, unit: '%', referenceRange: '4.0 - 5.6 (Normal), 5.7 - 6.4 (Prediabetes)', flag: 'High' }
  ],
  cbc: [
    { parameter: 'Hemoglobin', value: 13.5, unit: 'g/dL', referenceRange: '13.0 - 17.0', flag: 'Normal' },
    { parameter: 'RBC Count', value: 4.8, unit: 'm/mm³', referenceRange: '4.5 - 5.9', flag: 'Normal' },
    { parameter: 'WBC Count', value: 7200, unit: 'cells/mm³', referenceRange: '4000 - 11000', flag: 'Normal' },
    { parameter: 'Platelet Count', value: 2.5, unit: 'Lakhs/mm³', referenceRange: '1.5 - 4.5', flag: 'Normal' },
    { parameter: 'Hematocrit (PCV)', value: 41, unit: '%', referenceRange: '40 - 50', flag: 'Normal' }
  ],
  thyroid: [
    { parameter: 'Total T3', value: 1.2, unit: 'ng/mL', referenceRange: '0.8 - 2.0', flag: 'Normal' },
    { parameter: 'Total T4', value: 8.5, unit: 'µg/dL', referenceRange: '5.1 - 14.1', flag: 'Normal' },
    { parameter: 'TSH (Thyroid Stimulating Hormone)', value: 2.8, unit: 'µIU/mL', referenceRange: '0.45 - 4.50', flag: 'Normal' }
  ],
  lft: [
    { parameter: 'Bilirubin Total', value: 0.9, unit: 'mg/dL', referenceRange: '0.2 - 1.2', flag: 'Normal' },
    { parameter: 'SGOT / AST', value: 28, unit: 'U/L', referenceRange: '10 - 40', flag: 'Normal' },
    { parameter: 'SGPT / ALT', value: 32, unit: 'U/L', referenceRange: '7 - 56', flag: 'Normal' },
    { parameter: 'Alkaline Phosphatase (ALP)', value: 85, unit: 'U/L', referenceRange: '44 - 147', flag: 'Normal' }
  ],
  rft: [
    { parameter: 'Serum Creatinine', value: 1.0, unit: 'mg/dL', referenceRange: '0.7 - 1.3', flag: 'Normal' },
    { parameter: 'Blood Urea Nitrogen (BUN)', value: 14, unit: 'mg/dL', referenceRange: '7 - 20', flag: 'Normal' },
    { parameter: 'Uric Acid', value: 5.4, unit: 'mg/dL', referenceRange: '3.5 - 7.2', flag: 'Normal' }
  ],
  glucose: [
    { parameter: 'Fasting Plasma Glucose', value: 104, unit: 'mg/dL', referenceRange: '70 - 99', flag: 'High' }
  ]
};

const INITIAL_MOCK_RESULTS = [
  {
    resultId: 'RES-9001',
    barcode: 'LAV-0995-A',
    labOrderId: 'CDS-0825-00088',
    patientId: 'SPK-1004',
    patientName: 'ANITHA REDDY',
    investigation: 'HbA1c, CBC Panel',
    analyzer: 'SYSMEX',
    parameters: [
      ...DEFAULT_PARAMETER_MODELS.hba1c,
      ...DEFAULT_PARAMETER_MODELS.cbc
    ],
    verificationStatus: 'Verified',
    resultDate: '24/09/2026 09:00 AM',
    verifiedBy: 'Lab Tech Rajesh'
  },
  {
    resultId: 'RES-9002',
    barcode: 'RED-0996-B',
    labOrderId: 'CDS-0825-00089',
    patientId: 'SPK-1004',
    patientName: 'ANITHA REDDY',
    investigation: 'Thyroid Profile',
    analyzer: 'ADVIA / BECKMAN',
    parameters: [...DEFAULT_PARAMETER_MODELS.thyroid],
    verificationStatus: 'Verification Pending',
    resultDate: '24/09/2026 09:30 AM',
    verifiedBy: null
  }
];

export const getResults = () => {
  try {
    const raw = localStorage.getItem(RESULTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(RESULTS_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_RESULTS));
      return INITIAL_MOCK_RESULTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(RESULTS_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_RESULTS));
      return INITIAL_MOCK_RESULTS;
    }
    return parsed;
  } catch (e) {
    console.error('Error loading results:', e);
    return INITIAL_MOCK_RESULTS;
  }
};

export const saveResults = (results) => {
  try {
    localStorage.setItem(RESULTS_STORAGE_KEY, JSON.stringify(results));
  } catch (e) {
    console.error('Error saving results:', e);
  }
};

export const generateResultsForBarcode = (barcode, patientDetails, tests = []) => {
  const currentResults = getResults();
  const existing = currentResults.find((r) => r.barcode === barcode);
  if (existing) return existing;

  let combinedParameters = [];

  (tests || []).forEach((testName) => {
    const norm = testName.toLowerCase();
    if (norm.includes('hba1c')) combinedParameters.push(...DEFAULT_PARAMETER_MODELS.hba1c);
    else if (norm.includes('cbc') || norm.includes('blood count')) combinedParameters.push(...DEFAULT_PARAMETER_MODELS.cbc);
    else if (norm.includes('thyroid')) combinedParameters.push(...DEFAULT_PARAMETER_MODELS.thyroid);
    else if (norm.includes('lft')) combinedParameters.push(...DEFAULT_PARAMETER_MODELS.lft);
    else if (norm.includes('rft')) combinedParameters.push(...DEFAULT_PARAMETER_MODELS.rft);
    else if (norm.includes('glucose') || norm.includes('sugar')) combinedParameters.push(...DEFAULT_PARAMETER_MODELS.glucose);
  });

  if (combinedParameters.length === 0) {
    combinedParameters = [...DEFAULT_PARAMETER_MODELS.cbc];
  }

  const now = new Date();
  const resultRecord = {
    resultId: `RES-${Date.now().toString().slice(-4)}`,
    barcode,
    labOrderId: patientDetails.labOrderId || 'N/A',
    patientId: patientDetails.patientId || 'N/A',
    patientName: patientDetails.patientName || 'N/A',
    investigation: tests.join(', ') || 'Diagnostic Panel',
    analyzer: patientDetails.analyzer || 'SYSMEX',
    parameters: combinedParameters,
    verificationStatus: 'Verification Pending',
    resultDate: `${now.toLocaleDateString('en-GB')} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    verifiedBy: null
  };

  saveResults([resultRecord, ...currentResults]);
  logAuditAction('Results Generated', 'Result', resultRecord.resultId, `Generated results for barcode ${barcode}`);
  return resultRecord;
};
