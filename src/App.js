import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import data from './data/v100_tiresias_4_8_prefer_split_300_first-gpu_1000_2000_Las_load_8.0_cluster_stats.json'; // Adjust this path as necessary

Chart.register(...registerables);

const App = () => {
  const [selectedMetric, setSelectedMetric] = useState('Cluster Utilization');
  const [selectedRuns, setSelectedRuns] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [samplingInterval, setSamplingInterval] = useState(10); // Default sampling interval

  const runs = ['Run 1'];

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

  const handlePlotClick = () => {
    try {
      const totalGpus = data["0"].free_gpus; // Assuming the total GPUs is the free_gpus at time 0

      const plotData = selectedRuns.map((run, index) => {
        if (run !== 'Run 1') {
          throw new Error(`Data for ${run} is not available`);
        }

        const runData = Object.keys(data)
          .filter((_, i) => i % samplingInterval === 0)
          .map((time) => ({
            x: parseInt(time, 10),
            y: totalGpus - data[time].free_gpus,
          })).sort((a, b) => a.x - b.x); // Sort data by time

        return {
          label: run,
          data: runData,
          borderColor: `rgba(${index * 50}, 99, 132, 1)`,
          backgroundColor: `rgba(${index * 50}, 99, 132, 0.2)`,
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
