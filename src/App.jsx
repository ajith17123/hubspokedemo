import './App.css';
import { Routes, Route, HashRouter, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import React from 'react';
import 'aos/dist/aos.css';
import AOS from 'aos';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './components/Login';
import Front_Desk from './components/Front_Desk';
import Diagnostics from './components/Diagnostics';
import Consignment from './components/Consignment';
import Hub from './components/Hub';
import Pathologist from './components/Pathologist';
import Reports from './components/Reports';
import PublicReportView from './pages/PublicReportView';
import AccessDenied from './pages/AccessDenied';

function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname.toLowerCase() === '/login';

  return (
    <>
      {!isLoginPage && <Navbar />}
      <main style={{ flex: 1, minHeight: isLoginPage ? '100vh' : 'calc(100vh - 160px)', backgroundColor: 'forestgreen' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/front_desk/*" element={<Front_Desk />} />
          <Route path="/diagnostics/*" element={<Diagnostics />} />
          <Route path="/Consignment/*" element={<Consignment />} />
          <Route path="/Hub/*" element={<Hub />} />
          <Route path="/pathologist/*" element={<Pathologist />} />
          <Route path="/reports/*" element={<Reports />} />
          <Route path="/report/:reportId" element={<PublicReportView />} />
          <Route path="/access-denied" element={<AccessDenied />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
      {!isLoginPage && <Footer />}
    </>
  );
}

function App() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
    });
  }, []);

  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}

export default App;
