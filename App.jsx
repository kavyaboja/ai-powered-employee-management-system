import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Tasks from './pages/Tasks';
import AIReviews from './pages/AIReviews';
import ResumeScanner from './pages/ResumeScanner';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'employees':
        return <Employees />;
      case 'tasks':
        return <Tasks />;
      case 'ai-reviews':
        return <AIReviews />;
      case 'resume-scanner':
        return <ResumeScanner />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      {/* Navigation Sidebar */}
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      {/* Main Workspace Frame */}
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}
