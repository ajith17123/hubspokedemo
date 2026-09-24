import * as XLSX from 'xlsx';

/**
 * Export Patient Visit History to Excel (.xlsx)
 * @param {Array} patientRecords List of patient records for the searched patient
 * @param {String} searchTerm Query used for search
 */
export const exportPatientHistoryToExcel = (patientRecords, searchTerm = '') => {
  if (!patientRecords || patientRecords.length === 0) {
    alert('No patient data available to export.');
    return;
  }

  const exportData = patientRecords.map((p, index) => {
    const testsDisplay = Array.isArray(p.tests) ? p.tests.join(', ') : (p.tests || 'N/A');
    const barcodesDisplay = Array.isArray(p.barcodes)
      ? p.barcodes.map(b => b.barcodeId).join(', ')
      : 'N/A';

    return {
      'S.No': index + 1,
      'Patient ID (UHID)': p.id || 'N/A',
      'Full Name': p.fullName || 'N/A',
      'Aadhaar / Gov ID': p.aadhaarId || 'N/A',
      'Age (Yrs)': p.age || 'N/A',
      'Gender': p.gender || 'N/A',
      'Mobile Number': p.mobileNumber || 'N/A',
      'Encounter Type': p.encounterType || 'N/A',
      'Referring Doctor': p.referringDoctor || 'Self / Direct',
      'Address': p.address || 'N/A',
      'Visit Date': p.registrationDate || (p.createdAt ? p.createdAt.split(' ')[0] : 'N/A'),
      'Visit Time': p.registrationTime || (p.createdAt ? p.createdAt.split(' ').slice(1).join(' ') : 'N/A'),
      'Tests Ordered': testsDisplay,
      'Specimen Barcodes': barcodesDisplay,
      'Status': p.status || 'Registered'
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Patient Visit History');

  // Auto-fit column widths
  const maxColWidths = exportData.reduce((acc, row) => {
    Object.keys(row).forEach((key, colIndex) => {
      const valueLength = String(row[key] || '').length;
      acc[colIndex] = Math.max(acc[colIndex] || key.length, valueLength);
    });
    return acc;
  }, []);

  worksheet['!cols'] = maxColWidths.map(w => ({ wch: Math.min(Math.max(w + 3, 12), 40) }));

  const firstPatientName = patientRecords[0]?.fullName ? patientRecords[0].fullName.replace(/[^a-zA-Z0-9]/g, '_') : 'Patient';
  const fileName = `${firstPatientName}_Visit_History_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

/**
 * Export Date-Filtered Patient List to Excel (.xlsx)
 * @param {Array} patientList Filtered list of patients
 * @param {String} fromDate From Date string
 * @param {String} toDate To Date string
 */
export const exportDateRangePatientsToExcel = (patientList, fromDate = '', toDate = '') => {
  if (!patientList || patientList.length === 0) {
    alert('No patient records found for the selected date range.');
    return;
  }

  const exportData = patientList.map((p, index) => {
    const testsDisplay = Array.isArray(p.tests) ? p.tests.join(', ') : (p.tests || 'N/A');
    const barcodesDisplay = Array.isArray(p.barcodes)
      ? p.barcodes.map(b => b.barcodeId).join(', ')
      : 'N/A';

    return {
      'S.No': index + 1,
      'Registration Date': p.registrationDate || (p.createdAt ? p.createdAt.split(' ')[0] : 'N/A'),
      'Registration Time': p.registrationTime || (p.createdAt ? p.createdAt.split(' ').slice(1).join(' ') : 'N/A'),
      'Patient ID (UHID)': p.id || 'N/A',
      'Full Name': p.fullName || 'N/A',
      'Aadhaar / Gov ID': p.aadhaarId || 'N/A',
      'Age (Yrs)': p.age || 'N/A',
      'Gender': p.gender || 'N/A',
      'Mobile Number': p.mobileNumber || 'N/A',
      'Encounter Type': p.encounterType || 'N/A',
      'Referring Doctor': p.referringDoctor || 'Self / Direct',
      'Address': p.address || 'N/A',
      'Tests Ordered': testsDisplay,
      'Specimen Barcodes': barcodesDisplay,
      'Status': p.status || 'Registered'
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Date-Wise Patient Report');

  // Auto-fit column widths
  const maxColWidths = exportData.reduce((acc, row) => {
    Object.keys(row).forEach((key, colIndex) => {
      const valueLength = String(row[key] || '').length;
      acc[colIndex] = Math.max(acc[colIndex] || key.length, valueLength);
    });
    return acc;
  }, []);

  worksheet['!cols'] = maxColWidths.map(w => ({ wch: Math.min(Math.max(w + 3, 12), 40) }));

  const dateSuffix = fromDate || toDate ? `_${fromDate}_to_${toDate}` : `_${new Date().toISOString().slice(0, 10)}`;
  const fileName = `Patient_Report${dateSuffix}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};
