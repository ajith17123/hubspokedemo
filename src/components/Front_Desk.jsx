import React from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import '../assets/style/Front_Desk.css';

import New_Patient from './Front_Desk/New_Patient';
import Existing_Patient from './Front_Desk/Existing_Patient';
import Update_Patient from './Front_Desk/Update_Patient';
import Patient_Details from './Front_Desk/Patient_Details';
import Sync_Status from './Front_Desk/Sync_Status';

function Front_Desk() {
  const navigate = useNavigate();

  const handleRegistrationSuccess = () => {
    navigate('/front_desk/search_patient');
  };

  return (
    <div className="fd-container" style={{ width: '100%' }}>
      <Routes>
        <Route path="new_patient" element={<New_Patient onRegistrationSuccess={handleRegistrationSuccess} />} />
        <Route path="existing_patient" element={<Existing_Patient onRegistrationSuccess={handleRegistrationSuccess} />} />
        <Route path="update_patient" element={<Update_Patient />} />
        <Route path="search_patient" element={<Patient_Details />} />
        <Route path="sync_status" element={<Sync_Status />} />
        <Route path="*" element={<Navigate to="new_patient" replace />} />
      </Routes>
    </div>
  );
}

export default Front_Desk;
