import React, { useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import '../assets/style/Reports.css';
import DailySummary from './Reports/DailySummary';
import MISReport from './Reports/MISReport';
import LabTestsConducted from './Reports/LabTestsConducted';
import SOPList from './Reports/SOPList';
import Toast from './common/Toast';

function Reports() {
  const [toastMessage, setToastMessage] = useState('');

  return (
    <div className="rep-container">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}

      <Routes>
        <Route path="daily_summary" element={<DailySummary />} />
        <Route path="mis" element={<MISReport onTriggerToast={(msg) => setToastMessage(msg)} />} />
        <Route path="test_reports" element={<LabTestsConducted />} />
        <Route path="sop" element={<SOPList onTriggerToast={(msg) => setToastMessage(msg)} />} />
        <Route path="*" element={<Navigate to="daily_summary" replace />} />
      </Routes>
    </div>
  );
}

export default Reports;
