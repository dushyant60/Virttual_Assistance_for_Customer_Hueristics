import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const DonutChart = ({ agentTime, customerTime, silentTime }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartInstance.current !== null) {
      chartInstance.current.destroy();
    }

    if (chartRef.current !== null) {
      const ctx = chartRef.current.getContext('2d');

      chartInstance.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Agent Time', 'Customer Time', 'Silent Time'],
          datasets: [{
            label: 'Time Distribution',
            data: [agentTime, customerTime, silentTime],
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)', // Agent Time color
              'rgba(54, 162, 235, 0.6)', // Customer Time color
              'rgba(255, 206, 86, 0.6)', // Silent Time color
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
            ],
            borderWidth: 1,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%', // Adjust the inner radius here (e.g., '70%')
          aspectRatio: 1, // Adjust the aspect ratio for height
          plugins: {
            legend: {
              display: true,
              position: 'bottom', // Adjust legend position (top, bottom, left, right)
              labels: {
                boxWidth: 15, // Adjust the box width of legend items
                padding: 15, // Adjust the padding between legend items
              },
            },
          },
        },
      });
    }

    // Clean up the chart instance when the component unmounts
    return () => {
      if (chartInstance.current !== null) {
        chartInstance.current.destroy();
      }
    };
  }, [agentTime, customerTime, silentTime]);

  return (
    <div className="chart-container" style={{height:"35vh",width:"334px", padding:"10px"}}>
    <canvas ref={chartRef} height={200} /> {/* Adjust the height value */}
  </div>
  );
};

export default DonutChart;
