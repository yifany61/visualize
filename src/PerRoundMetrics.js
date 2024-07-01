import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const importAll = (r) => r.keys().map((file) => file.replace('./', ''));
const dataFiles = importAll(require.context('./data', false, /\.json$/));

const PerRoundMetrics = () => {
  const [selectedMetric, setSelectedMetric] = useState('Cluster Utilization');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [samplingInterval, setSamplingInterval] = useState(10);

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
        const data = require(`./data/${file}`);

        const metricKey = selectedMetric === 'Cluster Utilization' ? 'free_gpus' : 'jobs_running';
        const totalGpus = data["0"].free_gpus;

        const runData = Object.keys(data)
          .filter((_, i) => i % samplingInterval === 0)
          .map((time) => ({
            x: parseInt(time, 10),
            y: selectedMetric === 'Cluster Utilization' 
               ? totalGpus - data[time].free_gpus 
               : data[time].jobs_running,
          })).sort((a, b) => a.x - b.x);

        return {
          label: file.replace('.json', ''),
          data: runData,
          borderColor: predefinedColors[index % predefinedColors.length],
          backgroundColor: predefinedColors[index % predefinedColors.length].replace('1)', '0.2)'),
          fill: false,
        };
      });

      setChartData({
        datasets: plotData,
      });
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
          text: 'Time',
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
      <h1>Per Round Metrics</h1>
      <label>
        Select Metric:
        <select value={selectedMetric} onChange={handleMetricChange}>
          <option value="Cluster Utilization">Cluster Utilization</option>
          <option value="Number of Running Jobs">Number of Running Jobs</option>
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
      <button onClick={handlePlotClick}>Plot</button>
      {chartData && <Line data={chartData} options={options} />}
    </div>
  );
};

export default PerRoundMetrics;
