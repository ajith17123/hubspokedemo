import React, { useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import '../assets/style/Hub.css';
import Toast from './common/Toast';

import IncomingConsignments from './Hub/IncomingConsignments';
import Accession from './Hub/Accession';
import Analyser from './Hub/Analyser';
import Results from './Hub/Results';
import Verification from './Hub/Verification';

function HubOverview({ onTriggerToast }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <IncomingConsignments onTriggerToast={onTriggerToast} />
      <Accession onTriggerToast={onTriggerToast} />
      <Analyser onTriggerToast={onTriggerToast} />
      <Results />
      <Verification onTriggerToast={onTriggerToast} />
    </div>
  );
}

function Hub() {
  const [toastMessage, setToastMessage] = useState('');

  return (
    <div className="hub-page">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}

      <div className="hub-page-shell">
        {/* Dedicated Sub-Page Router */}
        <Routes>
          <Route path="all" element={<HubOverview onTriggerToast={(msg) => setToastMessage(msg)} />} />
          <Route path="incoming" element={<IncomingConsignments onTriggerToast={(msg) => setToastMessage(msg)} />} />
          <Route path="accession" element={<Accession onTriggerToast={(msg) => setToastMessage(msg)} />} />
          <Route path="analyser" element={<Analyser onTriggerToast={(msg) => setToastMessage(msg)} />} />
          <Route path="results" element={<Results />} />
          <Route path="verification" element={<Verification onTriggerToast={(msg) => setToastMessage(msg)} />} />
          <Route path="*" element={<Navigate to="incoming" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default Hub;
