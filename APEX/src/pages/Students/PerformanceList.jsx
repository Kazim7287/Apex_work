import React from 'react';
import { Bar } from 'react-chartjs-2';
import { ListContainer, ListCard, ListTitle, ListDetails } from '../../styles/ListStyles';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const performanceData = [
  { subject: 'Math', score: 85 },
  { subject: 'Science', score: 90 },
  { subject: 'English', score: 88 },
];

// Chart configuration
const chartData = {
  labels: performanceData.map(item => item.subject), // Subject labels
  datasets: [
    {
      label: 'Scores',
      data: performanceData.map(item => item.score), // Scores for each subject
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'], // Colors for each bar
    },
  ],
};

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Student Performance Chart',
    },
  },
};

const PerformanceList = () => {
  return (
    <ListContainer>
      <ListCard>
        <ListTitle>Performance Chart</ListTitle>
        {/* Bar chart displaying the performance */}
        <Bar data={chartData} options={chartOptions} />
      </ListCard>

      {/* Display performance data list */}
      {performanceData.map((performance, index) => (
        <ListCard key={index}>
          <ListTitle>{performance.subject}</ListTitle>
          <ListDetails>Score: {performance.score}</ListDetails>
        </ListCard>
      ))}
    </ListContainer>
  );
};

export default PerformanceList;

