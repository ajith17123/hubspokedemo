import React, { useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import '../assets/style/Consignment.css';
import PrepareConsignment from './Consignment/PrepareConsignment';
import TrackConsignment from './Consignment/TrackConsignment';
import Toast from './common/Toast';

function Consignment() {
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState('');

  const handleTransferSuccess = (consignment) => {
    setToastMessage(`Consignment ${consignment.consignmentId} successfully transferred to Hub!`);
    navigate('/Consignment/track');
  };

  return (
    <div className="cons-container">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}

      <Routes>
        <Route path="create" element={<PrepareConsignment onTransferSuccess={handleTransferSuccess} />} />
        <Route path="track" element={<TrackConsignment />} />
        <Route path="*" element={<Navigate to="create" replace />} />
      </Routes>
    </div>
  );
}

export default Consignment;
