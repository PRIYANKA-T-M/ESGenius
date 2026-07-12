import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Governance from './modules/governance/Governance';
import Environmental from './modules/environmental/Environmental';
import Social from './modules/social/Social';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/governance" replace />} />
        <Route path="/governance" element={<Governance />} />
        <Route path="/environmental" element={<Environmental />} />
        <Route path="/social" element={<Social />} />
      </Routes>
    </Router>
  );
}

export default App;
