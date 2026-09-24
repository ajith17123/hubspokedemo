import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import '../assets/style/Navbar.css';
import { ChevronDown, LogOut, UserCheck } from 'lucide-react';
import { getCurrentUser, logout, switchDemoRole } from '../services/authService';

function Navbar() {
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [activeDropdown, setActiveDropdown] = useState(null); // 'front_desk' | 'diagnostics' | 'consignments' | 'hub' | 'pathologist' | 'reports' | 'user_menu' | null
  const navbarRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Format today's date DD/MM/YYYY
  const todayDateStr = new Date().toLocaleDateString('en-GB');

  // Sync user state on changes
  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentUser(getCurrentUser());
    };
    window.addEventListener('storage', handleAuthChange);
    return () => window.removeEventListener('storage', handleAuthChange);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (navbarRef.current && !navbarRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleDropdownAction = (path) => {
    setActiveDropdown(null);
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(getCurrentUser());
    setActiveDropdown(null);
    navigate('/login');
  };

  const handleRoleSwitch = (role) => {
    const updated = switchDemoRole(role);
    setCurrentUser(updated);
    setActiveDropdown(null);
    if (role === 'spoke') navigate('/front_desk');
    else if (role === 'hub') navigate('/Hub');
    else if (role === 'pathologist') navigate('/pathologist');
  };

  const toggleDropdown = (name) => {
    setActiveDropdown(prev => prev === name ? null : name);
  };

  const openDropdownOnHover = (name) => {
    setActiveDropdown(name);
  };

  return (
    <header style={{ width: '100%' }} ref={navbarRef}>
      {/* Top White Header Banner */}
      <div className="lims-top-header">
        {/* Left: Government Seal Emblem Logo */}
        <div className="lims-emblem-box">
          <svg className="lims-emblem-seal" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="46" fill="#f8fafc" stroke="#008744" strokeWidth="4"/>
            <circle cx="50" cy="50" r="38" fill="none" stroke="#d97706" strokeWidth="2" strokeDasharray="4 2"/>
            <path d="M50 20 L58 36 L76 38 L62 50 L66 68 L50 58 L34 68 L38 50 L24 38 L42 36 Z" fill="#008744" opacity="0.85"/>
            <circle cx="50" cy="50" r="16" fill="#0070c0"/>
            <text x="50" y="54" fontSize="10" fill="#ffffff" textAnchor="middle" fontWeight="bold">AP</text>
          </svg>
        </div>

        {/* Center: Department & Diagnostic Center Titles */}
        <div className="lims-header-center">
          <h1 className="lims-header-title">GOVT. CITY DIAGNOSTIC CENTRE</h1>
          <div className="lims-header-city">Vijayawada</div>
          <div className="lims-header-dept">Department of Health, Medical & Family Welfare</div>
          <div className="lims-header-gov">Government of Andhra Pradesh</div>
        </div>

        {/* Right: Branch Name, Welcome User & Date */}
        <div className="lims-header-right" style={{ position: 'relative' }}>
          <div className="lims-branch-tag">
            Branch: <span className="lims-branch-name">{currentUser.branch || 'CD Spoke'}</span>
          </div>
          <div
            className="lims-user-welcome"
            onClick={() => toggleDropdown('user_menu')}
            style={{ cursor: 'pointer' }}
            title="Click to switch role or log out"
          >
            Welcome: <span className="lims-user-name">{currentUser.welcomeName || 'cdspoke'}</span>
            <ChevronDown size={12} color="#008744" />
          </div>
          <div className="lims-header-date">
            Date : {todayDateStr}
          </div>

          {/* Quick User Role Switcher Dropdown */}
          {activeDropdown === 'user_menu' && (
            <div className="lims-dropdown-menu" style={{ right: 0, left: 'auto', minWidth: '180px', top: '100%' }}>
              <div style={{ padding: '6px 12px', fontSize: '11px', color: '#fef08a', fontWeight: 'bold', borderBottom: '1px solid #00562b' }}>
                Role: {currentUser.roleName}
              </div>
              <div className="lims-dropdown-item" onClick={() => handleRoleSwitch('spoke')}>
                <UserCheck size={12} style={{ marginRight: '6px' }} /> Switch to Spoke
              </div>
              <div className="lims-dropdown-item" onClick={() => handleRoleSwitch('hub')}>
                <UserCheck size={12} style={{ marginRight: '6px' }} /> Switch to Hub
              </div>
              <div className="lims-dropdown-item" onClick={() => handleRoleSwitch('pathologist')}>
                <UserCheck size={12} style={{ marginRight: '6px' }} /> Switch to Pathologist
              </div>
              <div className="lims-dropdown-item" onClick={handleLogout} style={{ borderTop: '1px solid #00562b', color: '#fca5a5' }}>
                <LogOut size={12} style={{ marginRight: '6px' }} /> Logout
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Green Navigation Bar */}
      <nav className="lims-navbar">
        <ul className="lims-nav-list">
          {/* 1. Front Desk Dropdown Item */}
          <li className="lims-nav-item">
            <button
              type="button"
              className={`lims-nav-link lims-dropdown-toggle ${location.pathname.startsWith('/front_desk') ? 'active-highlight' : ''}`}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              onClick={() => toggleDropdown('front_desk')}
              onMouseEnter={() => openDropdownOnHover('front_desk')}
            >
              Front Desk
              <ChevronDown size={14} style={{ transform: activeDropdown === 'front_desk' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {activeDropdown === 'front_desk' && (
              <div className="lims-dropdown-menu" onMouseLeave={() => setActiveDropdown(null)}>
                <div className="lims-dropdown-item" onClick={() => handleDropdownAction('/front_desk/new_patient')}>
                  New Patient Registration
                </div>
                <div className="lims-dropdown-item" onClick={() => handleDropdownAction('/front_desk/existing_patient')}>
                  Existing Patient Registration
                </div>
                <div className="lims-dropdown-item" onClick={() => handleDropdownAction('/front_desk/update_patient')}>
                  Update Patient Details
                </div>
                <div className="lims-dropdown-item" onClick={() => handleDropdownAction('/front_desk/search_patient')}>
                  Search Patient Details
                </div>
                <div className="lims-dropdown-item" onClick={() => handleDropdownAction('/front_desk/sync_status')}>
                  Sync Status
                </div>
              </div>
            )}
          </li>

          {/* 2. Diagnostics Dropdown Item */}
          <li className="lims-nav-item">
            <button
              type="button"
              className={`lims-nav-link lims-dropdown-toggle ${location.pathname.startsWith('/diagnostics') ? 'active-highlight' : ''}`}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              onClick={() => toggleDropdown('diagnostics')}
              onMouseEnter={() => openDropdownOnHover('diagnostics')}
            >
              Diagnostics
              <ChevronDown size={14} style={{ transform: activeDropdown === 'diagnostics' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {activeDropdown === 'diagnostics' && (
              <div className="lims-dropdown-menu" onMouseLeave={() => setActiveDropdown(null)}>
                <div className="lims-dropdown-item" onClick={() => handleDropdownAction('/diagnostics/search_lab_orders')}>
                  Search Lab Orders
                </div>
                <div className="lims-dropdown-item" onClick={() => handleDropdownAction('/diagnostics/sample_collection')}>
                  Sample Collection Desk
                </div>
                <div className="lims-dropdown-item" onClick={() => handleDropdownAction('/diagnostics/verify_barcode')}>
                  Barcode Verification & Segregation
                </div>
                <div className="lims-dropdown-item" onClick={() => handleDropdownAction('/diagnostics/lab_orders_print')}>
                  Lab Orders Print
                </div>
              </div>
            )}
          </li>

          {/* 3. Consignments Dropdown Item */}
          <li className="lims-nav-item">
            <button
              type="button"
              className={`lims-nav-link lims-dropdown-toggle ${location.pathname.toLowerCase().startsWith('/consignment') ? 'active-highlight' : ''}`}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              onClick={() => toggleDropdown('consignments')}
              onMouseEnter={() => openDropdownOnHover('consignments')}
            >
              Consignments
              <ChevronDown size={14} style={{ transform: activeDropdown === 'consignments' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {activeDropdown === 'consignments' && (
              <div className="lims-dropdown-menu" onMouseLeave={() => setActiveDropdown(null)}>
                <div className="lims-dropdown-item" onClick={() => handleDropdownAction('/Consignment/create')}>
                  Prepare & Create Consignment
                </div>
                <div className="lims-dropdown-item" onClick={() => handleDropdownAction('/Consignment/track')}>
                  Track Consignment Shipments
                </div>
              </div>
            )}
          </li>

          {/* 4. Hub Dropdown Item */}
          <li className="lims-nav-item">
            <button
              type="button"
              className={`lims-nav-link lims-dropdown-toggle ${location.pathname.toLowerCase().startsWith('/hub') ? 'active-highlight' : ''}`}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              onClick={() => toggleDropdown('hub')}
              onMouseEnter={() => openDropdownOnHover('hub')}
            >
              Hub
              <ChevronDown size={14} style={{ transform: activeDropdown === 'hub' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {activeDropdown === 'hub' && (
              <div className="lims-dropdown-menu" onMouseLeave={() => setActiveDropdown(null)}>
                <div className="lims-dropdown-item" onClick={() => handleDropdownAction('/Hub/incoming')}>
                  Incoming Consignments
                </div>
                <div className="lims-dropdown-item" onClick={() => handleDropdownAction('/Hub/accession')}>
                  Sample Accession
                </div>
                <div className="lims-dropdown-item" onClick={() => handleDropdownAction('/Hub/analyser')}>
                  Analyzer Testing Queue
                </div>
                <div className="lims-dropdown-item" onClick={() => handleDropdownAction('/Hub/results')}>
                  Diagnostic Results
                </div>
                <div className="lims-dropdown-item" onClick={() => handleDropdownAction('/Hub/verification')}>
                  Lab Verification
                </div>
              </div>
            )}
          </li>

          {/* 5. Pathologist Dropdown Item */}
          <li className="lims-nav-item">
            <button
              type="button"
              className={`lims-nav-link lims-dropdown-toggle ${location.pathname.startsWith('/pathologist') ? 'active-highlight' : ''}`}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              onClick={() => toggleDropdown('pathologist')}
              onMouseEnter={() => openDropdownOnHover('pathologist')}
            >
              Pathologist
              <ChevronDown size={14} style={{ transform: activeDropdown === 'pathologist' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {activeDropdown === 'pathologist' && (
              <div className="lims-dropdown-menu" onMouseLeave={() => setActiveDropdown(null)}>
                <div className="lims-dropdown-item" onClick={() => handleDropdownAction('/pathologist/review')}>
                  Pending Reports Review List
                </div>
                <div className="lims-dropdown-item" onClick={() => handleDropdownAction('/pathologist/sending')}>
                  SMS Notification Tracker
                </div>
              </div>
            )}
          </li>

          {/* 6. Reports Dropdown Item */}
          <li className="lims-nav-item">
            <button
              type="button"
              className={`lims-nav-link lims-dropdown-toggle ${location.pathname.startsWith('/reports') ? 'active-highlight' : ''}`}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              onClick={() => toggleDropdown('reports')}
              onMouseEnter={() => openDropdownOnHover('reports')}
            >
              Reports
              <ChevronDown size={14} style={{ transform: activeDropdown === 'reports' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {activeDropdown === 'reports' && (
              <div className="lims-dropdown-menu" onMouseLeave={() => setActiveDropdown(null)}>
                <div className="lims-dropdown-item" onClick={() => handleDropdownAction('/reports/daily_summary')}>
                  Daily Summary
                </div>
                <div className="lims-dropdown-item" onClick={() => handleDropdownAction('/reports/mis')}>
                  MIS Report
                </div>
                <div className="lims-dropdown-item" onClick={() => handleDropdownAction('/reports/test_reports')}>
                  Tests Conducted
                </div>
                <div className="lims-dropdown-item" onClick={() => handleDropdownAction('/reports/sop')}>
                  SOP Repository
                </div>
              </div>
            )}
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Navbar;
