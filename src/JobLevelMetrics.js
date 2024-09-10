import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

// Import data files from the job directory
const importAll = (r) => r.keys().map((file) => file.replace('./', ''));
const dataFiles = importAll(require.context('./job', false, /\.json$/));

const JobLevelMetrics = () => {
  const [selectedMetric, setSelectedMetric] = useState('Job Status');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [samplingInterval, setSamplingInterval] = useState(10);
  const [jobId, setJobId] = useState('');

  const handleMetricChange = (event) => {
    setSelectedMetric(event.target.value);
  };

  const handleFileClick = (file) => {
    setSelectedFiles((prevFiles) => {
      if (prevFiles.includes(file)) {
        return prevFiles.filter((f) => f !== file);
      } else {
        return [...prevFiles, file];
      }
    });
  };

  const handleSamplingIntervalChange = (event) => {
    setSamplingInterval(parseInt(event.target.value, 10));
  };

  const handleJobIdChange = (event) => {
    setJobId(event.target.value);
  };

  const predefinedColors = [
    'rgba(255, 99, 132, 1)',
    'rgba(54, 162, 235, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(255, 159, 64, 1)',
    'rgba(199, 199, 199, 1)',
    'rgba(83, 102, 255, 1)',
    'rgba(255, 182, 193, 1)',
    'rgba(144, 238, 144, 1)',
  ];

  const handlePlotClick = () => {
    try {
      const plotData = selectedFiles.map((file, index) => {
        const data = require(`./job/${file}`);

        // Only plot the data for the specific job ID entered by the user
        if (!data[jobId]) {
          alert(`Job ID ${jobId} not found in file: ${file}`);
          return null;
        }

        const runData = Object.keys(data)
          .filter((job) => job === jobId)  // Filter based on the job ID
          .map((job) => ({
            x: parseInt(job, 10),
            y: data[job][1], // Example: Use second value for the metric (e.g., end time or job status)
          }));

        return {
          label: file.replace('.json', ''),
          data: runData,
          borderColor: predefinedColors[index % predefinedColors.length],
          backgroundColor: predefinedColors[index % predefinedColors.length].replace('1)', '0.2)'),
          fill: false,
        };
      }).filter(item => item !== null);

      if (plotData.length > 0) {
        setChartData({
          datasets: plotData,
        });
      }
    } catch (error) {
      console.error('Error plotting data:', error);
      alert('Error plotting data. Check console for details.');
    }
  };

  const options = {
    scales: {
      x: {
        title: {
          display: true,
          text: 'Job ID',
        },
        type: 'linear',
        position: 'bottom',
      },
      y: {
        title: {
          display: true,
          text: selectedMetric,
        },
      },
    },
  };

  return (
    <div>
      <nav>
        <Link to="/">Back to Main Page</Link>
      </nav>
      <h1>Job Level Metrics</h1>
      <label>
        Select Metric:
        <select value={selectedMetric} onChange={handleMetricChange}>
          <option value="Job Status">Throughput</option>
          <option value="Job Completion Time">Number of GPUs utilized</option>
        </select>
      </label>
      <div>
        {dataFiles.map((file, index) => (
          <button
            key={index}
            onClick={() => handleFileClick(file)}
            style={{
              backgroundColor: selectedFiles.includes(file) ? 'blue' : 'grey',
              color: 'white',
              margin: '5px',
            }}
          >
            {file.replace('.json', '')}
          </button>
        ))}
      </div>
      <label>
        Sampling Interval:
        <input 
          type="number" 
          value={samplingInterval} 
          onChange={handleSamplingIntervalChange} 
          min="1" 
        />
      </label>
      <label>
        Job ID:
        <input 
          type="text" 
          value={jobId} 
          onChange={handleJobIdChange} 
        />
      </label>
      <button onClick={handlePlotClick}>Plot</button>
      {chartData && <Line data={chartData} options={options} />}
    </div>
  );
};

export default JobLevelMetrics;
