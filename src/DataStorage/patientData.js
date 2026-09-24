/* ==========================================================================
   Patient API & Persistence Layer (Local Storage / Data Abstraction Layer)
   ========================================================================== */

const STORAGE_KEY = 'lims_spoke_patients';
const SEQ_KEY = 'lims_spoke_patient_seq';
const SCANNED_STORAGE_KEY = 'lims_scanned_samples';
const ALL_SAMPLES_DB_KEY = 'lims_all_specimens_db';

// Master List of Available Diagnostic Tests
export const AVAILABLE_TESTS = [
  { id: 'hba1c', name: 'HbA1c', category: 'Lavender EDTA Tube', color: 'lavender', tubeCode: 'LAV', tubeLetter: 'A' },
  { id: 'cbc', name: 'CBC Panel', category: 'Lavender EDTA Tube', color: 'lavender', tubeCode: 'LAV', tubeLetter: 'A' },
  { id: 'thyroid', name: 'Thyroid Profile (T3/T4/TSH)', category: 'Red Serum Tube', color: 'red', tubeCode: 'RED', tubeLetter: 'B' },
  { id: 'lft', name: 'LFT - Liver Function Test', category: 'Red Serum Tube', color: 'red', tubeCode: 'RED', tubeLetter: 'B' },
  { id: 'rft', name: 'RFT - Renal Function Test', category: 'Red Serum Tube', color: 'red', tubeCode: 'RED', tubeLetter: 'B' },
  { id: 'glucose', name: 'Fasting Glucose', category: 'Grey Sodium Fluoride Tube', color: 'grey', tubeCode: 'GREY', tubeLetter: 'C' },
];

// Smart Barcode Generator Function
export const generateSmartBarcodes = (selectedTestIds, patientSeqId, visitIndex = 1) => {
  const selectedTests = AVAILABLE_TESTS.filter(t => selectedTestIds.includes(t.id));
  const tubeGroups = {};
  const visitTag = visitIndex > 1 ? `-V${visitIndex}` : '';

  selectedTests.forEach(test => {
    if (!tubeGroups[test.tubeCode]) {
      tubeGroups[test.tubeCode] = {
        tubeCode: test.tubeCode,
        category: test.category,
        color: test.color,
        barcodeId: `${test.tubeCode}-${patientSeqId}${visitTag}-${test.tubeLetter}`,
        tests: []
      };
    }
    tubeGroups[test.tubeCode].tests.push(test.name);
  });

  return Object.values(tubeGroups);
};

const INITIAL_MOCK_PATIENTS = [
  {
    id: 'SPK-1001',
    seqId: '1001',
    fullName: 'K. RAMESH BABU',
    aadhaarId: '9823-1120-4491',
    age: 45,
    gender: 'Male',
    encounterType: 'OPD',
    mobileNumber: '9988776655',
    referringDoctor: 'Dr. V. Sharma, MD',
    address: 'Governorpet, Vijayawada',
    tests: ['hba1c', 'cbc'],
    barcodes: [
      { tubeCode: 'LAV', category: 'Lavender EDTA Tube', color: 'lavender', barcodeId: 'LAV-1001-A', tests: ['HbA1c', 'CBC Panel'] }
    ],
    status: 'Verified',
    registrationDate: '24/09/2026',
    registrationTime: '08:30 AM',
    createdAt: '24/09/2026 08:30 AM'
  },
  {
    id: 'SPK-1002',
    seqId: '1002',
    fullName: 'S. LAKSHMI PRIYA',
    aadhaarId: '4410-9921-0012',
    age: 32,
    gender: 'Female',
    encounterType: 'OPD',
    mobileNumber: '9876543210',
    referringDoctor: 'Dr. M. Reddi',
    address: 'Moghalrajpuram, Vijayawada',
    tests: ['thyroid', 'lft', 'rft'],
    barcodes: [
      { tubeCode: 'RED', category: 'Red Serum Tube', color: 'red', barcodeId: 'RED-1002-B', tests: ['Thyroid Profile', 'LFT', 'RFT'] }
    ],
    status: 'Verified',
    registrationDate: '24/09/2026',
    registrationTime: '09:15 AM',
    createdAt: '24/09/2026 09:15 AM'
  },
  {
    id: 'SPK-1003',
    seqId: '1003',
    fullName: 'V. VENKATARAMANA',
    aadhaarId: '7721-3094-1188',
    age: 58,
    gender: 'Male',
    encounterType: 'IPD',
    mobileNumber: '9123456789',
    referringDoctor: 'Dr. P. Swamy',
    address: 'Suryaraopet, Vijayawada',
    tests: ['glucose', 'cbc'],
    barcodes: [
      { tubeCode: 'LAV', category: 'Lavender EDTA Tube', color: 'lavender', barcodeId: 'LAV-1003-A', tests: ['CBC Panel'] },
      { tubeCode: 'GREY', category: 'Grey Sodium Fluoride Tube', color: 'grey', barcodeId: 'GREY-1003-C', tests: ['Fasting Glucose'] }
    ],
    status: 'Pending Verification',
    registrationDate: '24/09/2026',
    registrationTime: '10:00 AM',
    createdAt: '24/09/2026 10:00 AM'
  }
];

// Initialize or Fetch Patients from Storage / Backend API
export const getPatients = () => {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    let list = [];
    if (!rawData) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    list = JSON.parse(rawData);

    // Data migration / sanitization pass for existing localStorage items
    let updated = false;
    const sanitized = list.map(p => {
      let regDate = p.registrationDate;
      let regTime = p.registrationTime;
      let created = p.createdAt;

      // Ensure registrationDate exists and is valid
      if (!regDate || regDate === 'N/A') {
        if (created && /\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/.test(created)) {
          regDate = created.split(' ')[0];
        } else if (p.id === 'SPK-1001') {
          regDate = '05/09/2026';
        } else if (p.id === 'SPK-1002') {
          regDate = '22/09/2026';
        } else if (p.id === 'SPK-1003') {
          regDate = '03/09/2026';
        } else {
          regDate = new Date().toLocaleDateString('en-GB');
        }
        updated = true;
      }

      // Ensure registrationTime exists
      if (!regTime) {
        if (created && created.includes(':')) {
          const match = created.match(/\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?/i);
          if (match) regTime = match[0];
        }
        if (!regTime) regTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        updated = true;
      }

      // Ensure createdAt exists
      if (!created) {
        created = `${regDate} ${regTime}`;
        updated = true;
      }

      return {
        ...p,
        registrationDate: regDate,
        registrationTime: regTime,
        createdAt: created
      };
    });

    if (updated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    }

    return sanitized;
  } catch (error) {
    console.error('Error fetching patients from storage:', error);
    return INITIAL_MOCK_PATIENTS;
  }
};

// Helper: Format Date & Time DD/MM/YYYY, hh:mm A
const getFormattedDateTime = () => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB'); // DD/MM/YYYY
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // 06:35 PM
  return { dateStr, timeStr, dateTimeStr: `${dateStr} ${timeStr}` };
};

// Save Patient Record (New Registration or Returning Visit)
export const savePatient = (patientInput, existingPatient = null) => {
  try {
    const currentPatients = getPatients();
    let patientId = '';
    let seqIdStr = '';
    let visitIndex = 1;

    if (existingPatient && existingPatient.id) {
      // Returning Patient: Reuse existing Patient ID & Sequence ID
      patientId = existingPatient.id;
      seqIdStr = existingPatient.seqId || existingPatient.id.replace('SPK-', '');

      // Calculate visit count for this patient ID
      const existingVisitsCount = currentPatients.filter(p => p.id === patientId).length;
      visitIndex = existingVisitsCount + 1;
    } else {
      // New Patient: Auto Increment Sequence ID
      let currentSeq = parseInt(localStorage.getItem(SEQ_KEY) || '1001', 10);
      seqIdStr = currentSeq.toString();
      patientId = `SPK-${seqIdStr}`;
      localStorage.setItem(SEQ_KEY, (currentSeq + 1).toString());
    }

    const generatedBarcodes = generateSmartBarcodes(patientInput.selectedTests, seqIdStr, visitIndex);
    const { dateStr, timeStr, dateTimeStr } = getFormattedDateTime();

    const newPatientVisit = {
      id: patientId,
      seqId: seqIdStr,
      fullName: patientInput.fullName.trim(),
      aadhaarId: patientInput.aadhaarId.trim(),
      age: parseInt(patientInput.age, 10),
      gender: patientInput.gender,
      encounterType: patientInput.encounterType,
      mobileNumber: patientInput.mobileNumber.trim(),
      referringDoctor: patientInput.referringDoctor.trim() || 'Self / Direct',
      address: (patientInput.address || '').trim(),
      tests: [...patientInput.selectedTests],
      barcodes: generatedBarcodes,
      status: 'Pending Verification',
      registrationDate: dateStr,
      registrationTime: timeStr,
      createdAt: dateTimeStr
    };

    const updatedList = [newPatientVisit, ...currentPatients];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

    return newPatientVisit;
  } catch (error) {
    console.error('Error saving patient:', error);
    throw error;
  }
};

// Update Full Patient Record
export const updatePatient = (patientId, updatedInput) => {
  try {
    const currentPatients = getPatients();
    let updatedRecord = null;

    const updatedList = currentPatients.map(patient => {
      if (patient.id === patientId) {
        const generatedBarcodes = generateSmartBarcodes(updatedInput.selectedTests, patient.seqId);
        updatedRecord = {
          ...patient,
          fullName: updatedInput.fullName.trim(),
          aadhaarId: updatedInput.aadhaarId.trim(),
          age: parseInt(updatedInput.age, 10),
          gender: updatedInput.gender,
          encounterType: updatedInput.encounterType,
          mobileNumber: updatedInput.mobileNumber.trim(),
          referringDoctor: updatedInput.referringDoctor.trim() || 'Self / Direct',
          address: (updatedInput.address || '').trim(),
          tests: [...updatedInput.selectedTests],
          barcodes: generatedBarcodes
        };
        return updatedRecord;
      }
      return patient;
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    return updatedRecord;
  } catch (error) {
    console.error('Error updating patient:', error);
    throw error;
  }
};

// Delete Patient Record
export const deletePatient = (patientId) => {
  try {
    const currentPatients = getPatients();
    const updatedList = currentPatients.filter(patient => patient.id !== patientId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    return true;
  } catch (error) {
    console.error('Error deleting patient:', error);
    throw error;
  }
};

// ==========================================================================
// Diagnostics & Phlebotomy Module: Patient Orders & Segregation Service
// Key: 'LIMS_PATIENT_ORDERS'
// ==========================================================================

export const ORDERS_STORAGE_KEY = 'LIMS_PATIENT_ORDERS';

// Clinical Segregation & Tube Mapping Matrix Rules
export const TUBE_MATRIX = {
  lavender: {
    type: 'Lavender Cap (EDTA)',
    color: 'lavender',
    prefix: 'LAV',
    analyzer: 'SYSMEX',
    tagBg: '#f3e8ff',
    tagText: '#7e22ce',
    tagBorder: '#9333ea',
    accentColor: '#9333ea',
    description: 'HbA1c, Complete Blood Count (CBC)',
    testMatches: ['hba1c', 'complete blood count', 'cbc', 'cbc panel']
  },
  red: {
    type: 'Red Cap (Serum)',
    color: 'red',
    prefix: 'RED',
    analyzer: 'ADVIA / BECKMAN',
    tagBg: '#ffe4e6',
    tagText: '#be123c',
    tagBorder: '#e11d48',
    accentColor: '#e11d48',
    description: 'Thyroid Profile, LFT, RFT, Lipid Profile',
    testMatches: ['thyroid', 'thyroid profile', 'lft', 'rft', 'lipid profile']
  },
  grey: {
    type: 'Grey Cap (Sodium Fluoride)',
    color: 'grey',
    prefix: 'GREY',
    analyzer: 'BECKMAN',
    tagBg: '#f1f5f9',
    tagText: '#334155',
    tagBorder: '#475569',
    accentColor: '#475569',
    description: 'Fasting Blood Sugar / Glucose',
    testMatches: ['fasting blood sugar', 'glucose', 'fbs', 'fasting glucose']
  }
};

// Default Mock Orders matching portal records
const INITIAL_MOCK_ORDERS = [
  {
    id: 'CDS-0826-00001',
    patientName: 'K. RAMESH BABU',
    pid: 'SPK-1001',
    opIpId: 'OP-7821',
    age: 45,
    gender: 'Male',
    status: 'Verified',
    tests: ['HbA1c', 'Complete Blood Count (CBC)', 'Thyroid Profile'],
    samples: [
      { barcode: 'LAV-1001-A', tubeCategory: 'lavender', tubeType: 'Lavender Cap (EDTA)', analyzer: 'SYSMEX', tests: ['HbA1c', 'CBC Panel'], verificationStatus: 'Verified', readyForBox: true },
      { barcode: 'RED-1001-B', tubeCategory: 'red', tubeType: 'Red Cap (Serum)', analyzer: 'ADVIA / BECKMAN', tests: ['Thyroid Profile'], verificationStatus: 'Verified', readyForBox: false }
    ]
  },
  {
    id: 'CDS-0826-00002',
    patientName: 'S. LAKSHMI PRIYA',
    pid: 'SPK-1002',
    opIpId: 'OP-7822',
    age: 32,
    gender: 'Female',
    status: 'Verified',
    tests: ['Thyroid Profile', 'LFT', 'RFT', 'Fasting Blood Sugar'],
    samples: [
      { barcode: 'RED-1002-B', tubeCategory: 'red', tubeType: 'Red Cap (Serum)', analyzer: 'ADVIA / BECKMAN', tests: ['Thyroid Profile', 'LFT', 'RFT'], verificationStatus: 'Verified', readyForBox: false },
      { barcode: 'GREY-1002-C', tubeCategory: 'grey', tubeType: 'Grey Cap (Sodium Fluoride)', analyzer: 'BECKMAN', tests: ['Fasting Glucose'], verificationStatus: 'Verified', readyForBox: false }
    ]
  },
  {
    id: 'CDS-0826-00003',
    patientName: 'V. VENKATARAMANA',
    pid: 'SPK-1003',
    opIpId: 'IP-4019',
    age: 58,
    gender: 'Male',
    status: 'Pending',
    tests: ['Complete Blood Count (CBC)', 'Fasting Blood Sugar'],
    samples: [
      { barcode: 'LAV-1003-A', tubeCategory: 'lavender', tubeType: 'Lavender Cap (EDTA)', analyzer: 'SYSMEX', tests: ['CBC Panel'], verificationStatus: 'Pending Verification', readyForBox: false },
      { barcode: 'GREY-1003-C', tubeCategory: 'grey', tubeType: 'Grey Cap (Sodium Fluoride)', analyzer: 'BECKMAN', tests: ['Fasting Glucose'], verificationStatus: 'Pending Barcode Scan', readyForBox: false }
    ]
  }
];

// Determine tube category for a test name
export const getTubeCategoryForTest = (testName) => {
  const normalized = (testName || '').toLowerCase().trim();
  if (TUBE_MATRIX.lavender.testMatches.some(m => normalized.includes(m))) return 'lavender';
  if (TUBE_MATRIX.red.testMatches.some(m => normalized.includes(m))) return 'red';
  if (TUBE_MATRIX.grey.testMatches.some(m => normalized.includes(m))) return 'grey';
  return 'red'; // Default fallback
};

// Retrieve all patient orders from localStorage under 'LIMS_PATIENT_ORDERS'
export const getOrders = () => {
  try {
    const rawData = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!rawData) {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_ORDERS));
      return INITIAL_MOCK_ORDERS;
    }
    const orders = JSON.parse(rawData);
    if (!Array.isArray(orders) || orders.length === 0) {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_ORDERS));
      return INITIAL_MOCK_ORDERS;
    }
    return orders;
  } catch (error) {
    console.error('Error reading LIMS_PATIENT_ORDERS from localStorage:', error);
    return INITIAL_MOCK_ORDERS;
  }
};

// Persist orders list to localStorage
export const saveOrders = (orders) => {
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch (error) {
    console.error('Error writing LIMS_PATIENT_ORDERS to localStorage:', error);
  }
};

// Verify and segregate order tests into unique collection tubes
export const verifyAndSegregateOrder = (orderId) => {
  const orders = getOrders();
  let updatedOrder = null;

  const updatedOrders = orders.map((order) => {
    if (order.id === orderId) {
      // Group tests by tube type
      const tubeGroups = {};

      order.tests.forEach((testName) => {
        const catKey = getTubeCategoryForTest(testName);
        if (!tubeGroups[catKey]) {
          tubeGroups[catKey] = {
            categoryKey: catKey,
            tubeType: TUBE_MATRIX[catKey].type,
            prefix: TUBE_MATRIX[catKey].prefix,
            analyzer: TUBE_MATRIX[catKey].analyzer,
            tests: []
          };
        }
        tubeGroups[catKey].tests.push(testName);
      });

      // Extract numeric suffix from order ID e.g., CDS-0826-00003 -> 00003 or 1001
      const numPart = (order.id.match(/\d+$/) || ['1001'])[0];
      const letterMap = { lavender: 'A', red: 'B', grey: 'C' };

      const samples = Object.values(tubeGroups).map((group) => {
        const barcodeId = `${group.prefix}-${numPart}-${letterMap[group.categoryKey] || 'A'}`;
        return {
          barcode: barcodeId,
          tubeCategory: group.categoryKey,
          tubeType: group.tubeType,
          analyzer: group.analyzer,
          tests: group.tests,
          verificationStatus: 'Verified',
          readyForBox: false
        };
      });

      updatedOrder = {
        ...order,
        status: 'Verified',
        samples
      };
      return updatedOrder;
    }
    return order;
  });

  saveOrders(updatedOrders);
  return updatedOrder;
};

// Toggle readyForBox flag for a specific tube in an order
export const toggleReadyForBox = (orderId, barcodeValue) => {
  const orders = getOrders();
  let updatedOrder = null;

  const updatedOrders = orders.map((order) => {
    if (order.id === orderId) {
      const updatedSamples = (order.samples || []).map((sample) => {
        if (sample.barcode === barcodeValue) {
          return { ...sample, readyForBox: !sample.readyForBox };
        }
        return sample;
      });

      updatedOrder = {
        ...order,
        samples: updatedSamples
      };
      return updatedOrder;
    }
    return order;
  });

  saveOrders(updatedOrders);
  return updatedOrders;
};

