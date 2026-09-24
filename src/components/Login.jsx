import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/style/Login.css';
import { login, DEMO_USERS } from '../services/authService';

function Login() {
  const [username, setUsername] = useState('spoke');
  const [password, setPassword] = useState('spoke123');
  const [role, setRole] = useState('spoke');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Username is required.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }

    try {
      const user = login(username, password, role);
      // Trigger navbar update event
      window.dispatchEvent(new Event('storage'));

      if (user.role === 'spoke') {
        navigate('/front_desk');
      } else if (user.role === 'hub') {
        navigate('/Hub');
      } else if (user.role === 'pathologist') {
        navigate('/pathologist');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Invalid username or password.');
    }
  };

  const handleQuickDemo = (demoUser) => {
    setUsername(demoUser.username);
    setPassword(demoUser.password);
    setRole(demoUser.role);
    try {
      const user = login(demoUser.username, demoUser.password, demoUser.role);
      window.dispatchEvent(new Event('storage'));
      if (user.role === 'spoke') navigate('/front_desk');
      else if (user.role === 'hub') navigate('/Hub');
      else if (user.role === 'pathologist') navigate('/pathologist');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="lims-login-container">
      <div className="lims-login-card">
        {/* Header Branding */}
        <div className="lims-login-header">
          <svg className="lims-login-seal" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="46" fill="#f8fafc" stroke="#008744" strokeWidth="4"/>
            <circle cx="50" cy="50" r="38" fill="none" stroke="#d97706" strokeWidth="2" strokeDasharray="4 2"/>
            <path d="M50 20 L58 36 L76 38 L62 50 L66 68 L50 58 L34 68 L38 50 L24 38 L42 36 Z" fill="#008744" opacity="0.85"/>
            <circle cx="50" cy="50" r="16" fill="#0070c0"/>
            <text x="50" y="54" fontSize="10" fill="#ffffff" textAnchor="middle" fontWeight="bold">AP</text>
          </svg>
          <h2 className="lims-login-title">GOVT. CITY DIAGNOSTIC CENTRE</h2>
          <div className="lims-login-subtitle">Vijayawada</div>
          <div className="lims-login-dept">Department of Health, Medical & Family Welfare</div>
        </div>

        {/* Form Body */}
        <form className="lims-login-form" onSubmit={handleLoginSubmit}>
          {error && <div className="lims-error-alert">{error}</div>}

          <div className="lims-form-group">
            <label htmlFor="username">Username *</label>
            <input
              id="username"
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="lims-form-group">
            <label htmlFor="password">Password *</label>
            <input
              id="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="lims-form-group">
            <label htmlFor="role">Login Type / Role *</label>
            <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="spoke">Spoke Login </option>
              <option value="hub">Hub Login</option>
              <option value="pathologist">Pathologist Login </option>
            </select>
          </div>

          <button type="submit" className="lims-login-btn">
            Login
          </button>
        </form>

        
      </div>
    </div>
  );
}

export default Login;
