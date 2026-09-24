import React from 'react';
import '../assets/style/Footer.css';

function Footer() {
  return (
    <footer className="lims-footer">
      <div className="lims-footer-content">
        <div>
          <div className="lims-footer-dept">
            Department of Health, Medical & Family Welfare | Government of Andhra Pradesh
          </div>
          <div className="lims-footer-copy">
            &copy; {new Date().getFullYear()} Govt. City Diagnostic Centre (LIMS Network). All rights reserved.
          </div>
        </div>

        <div className="lims-footer-links">
          <a href="#help" className="lims-footer-link">Helpdesk & Support</a>
          <a href="#privacy" className="lims-footer-link">Privacy Policy</a>
          <a href="#terms" className="lims-footer-link">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
