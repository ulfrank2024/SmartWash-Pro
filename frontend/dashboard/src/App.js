import React, { useState } from 'react'; // Import useState
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './App.css';
import StatusPage from './components/StatusPage';
import InvestorView from './components/InvestorView';
import LiveView from './components/LiveView';
import FinanceCharts from './components/FinanceCharts';
import CashAuditView from './components/CashAuditView'; // Import CashAuditView
// Admin Components
import AdminDashboard from './components/AdminDashboard';
import CityManagement from './components/CityManagement';
import ServicePointManagement from './components/ServicePointManagement';
import WashingStationManagement from './components/WashingStationManagement';
import UserAssignmentManagement from './components/UserAssignmentManagement'; // Import UserAssignmentManagement


function App() {
  const { t, i18n } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile menu

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <Router>
      <div className="App flex flex-col min-h-screen">
        <header className="bg-gray-800 text-white p-4 shadow-md">
          <nav className="container mx-auto flex items-center justify-between">
            <Link to="/" className="text-xl font-bold">{t('dashboard_title')}</Link>

            {/* Hamburger icon for mobile (always hamburger, only visible on mobile) */}
            <div className="md:hidden">
              <button onClick={toggleMobileMenu} className="text-white focus:outline-none">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>
            </div>

            {/* Desktop menu */}
            <ul className="hidden md:flex space-x-4 items-center">
              <li>
                <Link to="/" className="hover:text-gray-300">{t('home_link')}</Link>
              </li>
              <li>
                <Link to="/investor" className="hover:text-gray-300">{t('investor_link')}</Link>
              </li>
              <li>
                <Link to="/live" className="hover:text-gray-300">{t('live_status_link')}</Link>
              </li>
              <li>
                <Link to="/finance" className="hover:text-gray-300">{t('finance_charts_link')}</Link>
              </li>
              <li> {/* New navigation link for Cash Audit */}
                <Link to="/audit" className="hover:text-gray-300">{t('cash_audit_title')}</Link>
              </li>
              <li> {/* New navigation link for Admin Dashboard */}
                <Link to="/admin" className="hover:text-gray-300">{t('admin_dashboard_title')}</Link>
              </li>
              <li className="ml-4">
                <select
                  onChange={(e) => changeLanguage(e.target.value)}
                  value={i18n.language}
                  className="bg-gray-700 text-white p-1 rounded"
                >
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                </select>
              </li>
            </ul>
          </nav>
        </header>

        {/* Mobile menu overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-gray-800/90 text-white p-4 absolute top-0 left-0 w-full h-full z-10 flex flex-col items-center justify-center">
            {/* Close button (cross icon) within the overlay */}
            <button onClick={toggleMobileMenu} className="absolute top-4 right-4 text-white focus:outline-none">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>

            <ul className="flex flex-col space-y-4 text-center">
              <li>
                <Link to="/" onClick={toggleMobileMenu} className="block text-2xl hover:text-gray-300 py-2">{t('home_link')}</Link>
              </li>
              <li>
                <Link to="/investor" onClick={toggleMobileMenu} className="block text-2xl hover:text-gray-300 py-2">{t('investor_link')}</Link>
              </li>
              <li>
                <Link to="/live" onClick={toggleMobileMenu} className="block text-2xl hover:text-gray-300 py-2">{t('live_status_link')}</Link>
              </li>
              <li>
                <Link to="/finance" onClick={toggleMobileMenu} className="block text-2xl hover:text-gray-300 py-2">{t('finance_charts_link')}</Link>
              </li>
              <li> {/* New navigation link for Cash Audit */}
                <Link to="/audit" onClick={toggleMobileMenu} className="block text-2xl hover:text-gray-300 py-2">{t('cash_audit_title')}</Link>
              </li>
              <li> {/* New navigation link for Admin Dashboard */}
                <Link to="/admin" onClick={toggleMobileMenu} className="block text-2xl hover:text-gray-300 py-2">{t('admin_dashboard_title')}</Link>
              </li>
              <li className="mt-4">
                <select
                  onChange={(e) => {
                    changeLanguage(e.target.value);
                    toggleMobileMenu(); // Close menu after language selection
                  }}
                  value={i18n.language}
                  className="bg-gray-700 text-white p-2 rounded text-lg"
                >
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                </select>
              </li>
            </ul>
          </div>
        )}

        <main className="flex-grow container mx-auto p-4">
          <Routes>
            <Route path="/" element={<StatusPage />} />
            <Route path="/investor" element={<InvestorView />} />
            <Route path="/live" element={<LiveView />} />
            <Route path="/finance" element={<FinanceCharts />} />
            <Route path="/audit" element={<CashAuditView />} /> {/* New route for CashAuditView */}
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/cities" element={<CityManagement />} />
            <Route path="/admin/service-points" element={<ServicePointManagement />} />
            <Route path="/admin/washing-stations" element={<WashingStationManagement />} />
            <Route path="/admin/user-assignments" element={<UserAssignmentManagement />} /> {/* New route for UserAssignmentManagement */}
          </Routes>
        </main>

        <footer className="bg-gray-800 text-white p-4 text-center mt-auto">
          <p>&copy; 2025 {t('dashboard_title')}</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
