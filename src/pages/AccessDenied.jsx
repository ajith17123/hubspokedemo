import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function AccessDenied() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '4rem 2rem', textAlign: 'center', fontFamily: 'var(--font-sans)', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ color: '#dc2626', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
        <ShieldAlert size={64} />
      </div>
      <h2 style={{ color: '#005a9e', fontSize: '24px', fontWeight: 'bold', margin: '0 0 1rem 0' }}>
        Access Restricted
      </h2>
      <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.6', marginBottom: '2rem' }}>
        You do not have permission to access this module under your current logged-in role. Please contact your system administrator or switch to an authorized role.
      </p>
      <button
        onClick={() => navigate('/')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#008744',
          color: '#ffffff',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '6px',
          fontWeight: '600',
          cursor: 'pointer'
        }}
      >
        <ArrowLeft size={16} /> Return to Home
      </button>
    </div>
  );
}
