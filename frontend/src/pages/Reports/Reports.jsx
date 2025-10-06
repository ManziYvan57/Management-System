import React from 'react';
import ReportsByTerminal from './ReportsByTerminal';
import './Reports.css';

const Reports = () => {
  const terminals = [
    { value: 'Kigali', label: 'Kigali' },
    { value: 'Kampala', label: 'Kampala' },
    { value: 'Nairobi', label: 'Nairobi' },
    { value: 'Juba', label: 'Juba' },
    { value: 'Goma', label: 'Goma' },
    { value: 'Bor', label: 'Bor' }
  ];

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1>Reports & Analytics</h1>
        <p>Generate comprehensive reports and analytics for your transport operations</p>
      </div>
      {terminals.map(terminal => (
        <ReportsByTerminal key={terminal.value} terminal={terminal} />
      ))}
    </div>
  );
};

export default Reports;