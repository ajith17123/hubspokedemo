/* ==========================================================================
   Patient Service: High-Level API Abstraction for Patient CRUD & Visits
   ========================================================================== */

import {
  getPatients,
  savePatient,
  updatePatient,
  deletePatient,
  AVAILABLE_TESTS
} from '../DataStorage/patientData';
import { logAuditAction } from './auditService';

export const fetchAllPatients = () => {
  return getPatients();
};

export const findPatientById = (patientId) => {
  const patients = getPatients();
  return patients.find((p) => p.id === patientId || p.seqId === patientId);
};

export const searchPatients = (query) => {
  const patients = getPatients();
  if (!query || !query.trim()) return patients;
  const q = query.toLowerCase().trim();
  return patients.filter(
    (p) =>
      p.fullName.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.mobileNumber.includes(q) ||
      p.aadhaarId.includes(q)
  );
};

export const registerNewPatient = (patientInput) => {
  const newVisit = savePatient(patientInput);
  logAuditAction(
    'Patient Registered',
    'Patient',
    newVisit.id,
    `Registered new patient ${newVisit.fullName} with tests: ${newVisit.tests.join(', ')}`
  );
  return newVisit;
};

export const registerExistingPatientVisit = (patientInput, existingPatient) => {
  const newVisit = savePatient(patientInput, existingPatient);
  logAuditAction(
    'New Visit Registered',
    'Patient',
    newVisit.id,
    `Registered visit for existing patient ${newVisit.fullName} with tests: ${newVisit.tests.join(', ')}`
  );
  return newVisit;
};

export const updatePatientDetails = (patientId, updatedInput) => {
  const updated = updatePatient(patientId, updatedInput);
  logAuditAction(
    'Patient Updated',
    'Patient',
    patientId,
    `Updated demographics for ${updated.fullName}`
  );
  return updated;
};

export const removePatient = (patientId) => {
  const result = deletePatient(patientId);
  logAuditAction('Patient Deleted', 'Patient', patientId, `Removed record ${patientId}`);
  return result;
};

export const getAvailableDiagnosticTests = () => {
  return AVAILABLE_TESTS;
};
