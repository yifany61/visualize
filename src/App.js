import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import GlobalMetrics from './GlobalMetrics';
import PerRoundMetrics from './PerRoundMetrics';
import JobLevelMetrics from './JobLevelMetrics';

const MainPage = () => (
  <div>
    <h1>Main Page</h1>
    <nav>
      <ul>
        <li>
          <Link to="/global-metrics">Global Metrics</Link>
        </li>
        <li>
          <Link to="/per-round-metrics">Per Round Metrics</Link>
        </li>
        <li>
          <Link to="/job-level-metrics">Job Level Metrics</Link>
        </li>
      </ul>
    </nav>
  </div>
);

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/global-metrics" element={<GlobalMetrics />} />
      <Route path="/per-round-metrics" element={<PerRoundMetrics />} />
      <Route path="/job-level-metrics" element={<JobLevelMetrics />} />
    </Routes>
  </Router>
);

export default App;
