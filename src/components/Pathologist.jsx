import React, { useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import '../assets/style/Pathologist.css';
import TestReports from './Pathologist/TestReports';
import ReportReview from './Pathologist/ReportReview';
import ReportsSending from './Pathologist/ReportsSending';
import Toast from './common/Toast';

function Pathologist() {
  const navigate = useNavigate();
  const [selectedReport, setSelectedReport] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const handleSelectReport = (report) => {
    setSelectedReport(report);
    navigate('/pathologist/detail');
  };

  return (
    <div className="path-container">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}

      <Routes>
        <Route path="review" element={<TestReports onSelectReport={handleSelectReport} />} />
        <Route path="detail" element={<ReportReview report={selectedReport} onBack={() => navigate('/pathologist/review')} onTriggerToast={(msg) => setToastMessage(msg)} />} />
        <Route path="sending" element={<ReportsSending onTriggerToast={(msg) => setToastMessage(msg)} />} />
        <Route path="*" element={<Navigate to="review" replace />} />
      </Routes>
    </div>
  );
}

export default Pathologist;
