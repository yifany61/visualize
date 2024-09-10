import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

// Import all files from the global directory
const importAll = (r) => r.keys().map((file) => file.replace('./', ''));
const dataFiles = importAll(require.context('./global', false, /\.json$/));

const GlobalMetrics = () => {
  const [selectedMetric, setSelectedMetric] = useState('Average Responsiveness');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [samplingInterval, setSamplingInterval] = useState(10);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);

  useEffect(() => {
    // Find the largest time value from all files
    const findMaxEndTime = () => {
      let maxEndTime = 0;
      dataFiles.forEach((file) => {
        const data = require(`./global/${file}`);
        
        // Loop through each job in the file and extract the end time (second value of each array)
        Object.values(data).forEach((values) => {
          const jobEndTime = values[1];  // Second value is the end time
          if (jobEndTime > maxEndTime) {
            maxEndTime = jobEndTime;
          }
        });
      });
      setEndTime(maxEndTime);
    };
  
    findMaxEndTime();
  }, []);
  

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

  const handleStartTimeChange = (event) => {
    setStartTime(parseInt(event.target.value, 10));
  };

  const handleEndTimeChange = (event) => {
    setEndTime(parseInt(event.target.value, 10));
  };

  const handlePlotClick = () => {
    try {
      const plotData = selectedFiles.map((file, index) => {
        const data = require(`./global/${file}`);
        let totalResponsiveness = 0;
        let count = 0;
  
        Object.entries(data).forEach(([jobId, values]) => {
          const jobStartTime = values[0]; // First value is the start time
          const jobEndTime = values[1]; // Second value is the end time (responsiveness calculation)
  
          // Check if the job's start time falls within the user-specified range
          if ((startTime === 0 || jobStartTime >= startTime) && (endTime === 0 || jobStartTime <= endTime)) {
            const responsiveness = jobEndTime - jobStartTime;
            totalResponsiveness += responsiveness;
            count += 1;
          }
        });
  
        const averageResponsiveness = count > 0 ? totalResponsiveness / count : 0;
  
        return {
          label: file.replace('.json', ''),
          data: [averageResponsiveness],
          backgroundColor: predefinedColors[index % predefinedColors.length],
        };
      });
  
      setChartData({
        labels: selectedFiles.map(file => file.replace('.json', '')),
        datasets: [{
          label: 'Average Responsiveness',
          data: plotData.map(item => item.data[0]),
          backgroundColor: plotData.map(item => item.backgroundColor),
        }],
      });
    } catch (error) {
      console.error('Error plotting data:', error);
      alert('Error plotting data. Check console for details.');
    }
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

  const options = {
    scales: {
      x: {
        title: {
          display: true,
          text: 'Files',
        },
        type: 'category',
        labels: selectedFiles.map(file => file.replace('.json', '')),
      },
      y: {
        title: {
          display: true,
          text: 'Average Responsiveness',
        },
      },
    },
  };

  return (
    <div>
      <nav>
        <Link to="/">Back to Main Page</Link>
      </nav>
      <h1>Global Metrics</h1>
      <label>
        Select Metric:
        <select value={selectedMetric} onChange={handleMetricChange}>
          <option value="Average Responsiveness">Average Responsiveness</option>
          {/* Add more global metrics as needed */}
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
        Start Time:
        <input 
          type="number" 
          value={startTime} 
          onChange={handleStartTimeChange} 
          min="0" 
        />
      </label>
      <label>
        End Time:
        <input 
          type="number" 
          value={endTime} 
          onChange={handleEndTimeChange} 
          min="0" 
        />
      </label>
      <button onClick={handlePlotClick}>Plot</button>
      {chartData && <Bar data={chartData} options={options} />}
    </div>
  );
};

export default GlobalMetrics;
