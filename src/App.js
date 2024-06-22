import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

// Import all JSON files from the data folder
const importAll = (r) => r.keys().map(r);
const dataFiles = importAll(require.context('./data', false, /\.json$/));

const App = () => {
  const [selectedMetric, setSelectedMetric] = useState('Cluster Utilization');
  const [selectedRuns, setSelectedRuns] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [samplingInterval, setSamplingInterval] = useState(10); // Default sampling interval
  const [runs, setRuns] = useState([]);

  useEffect(() => {
    // Generate run labels based on the imported files
    const generatedRuns = dataFiles.map((_, index) => `Run ${index + 1}`);
    setRuns(generatedRuns);
  }, []);

  const handleMetricChange = (event) => {
    setSelectedMetric(event.target.value);
  };

  const handleRunClick = (run) => {
    setSelectedRuns((prevRuns) => {
      if (prevRuns.includes(run)) {
        return prevRuns.filter((r) => r !== run);
      } else {
        return [...prevRuns, run];
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
      const plotData = selectedRuns.map((run, index) => {
        const runIndex = runs.indexOf(run);
        const data = dataFiles[runIndex];
        const totalGpus = data["0"].free_gpus; // Assuming the total GPUs is the free_gpus at time 0

        const runData = Object.keys(data)
          .filter((_, i) => i % samplingInterval === 0)
          .map((time) => ({
            x: parseInt(time, 10),
            y: totalGpus - data[time].free_gpus,
          })).sort((a, b) => a.x - b.x); // Sort data by time

        return {
          label: run,
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
          text: 'Cluster Utilization',
        },
      },
    },
  };

  return (
    <div>
      <h1>Visualization</h1>
      <label>
        Select Metric:
        <select value={selectedMetric} onChange={handleMetricChange}>
          <option value="Cluster Utilization">Cluster Utilization</option>
        </select>
      </label>
      <div>
        {runs.map((run) => (
          <button
            key={run}
            onClick={() => handleRunClick(run)}
            style={{
              backgroundColor: selectedRuns.includes(run) ? 'blue' : 'grey',
              color: 'white',
              margin: '5px',
            }}
          >
            {run}
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

export default App;
