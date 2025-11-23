import { useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

interface ViolationsOverTimeChartProps {
  data: {
    month: string;
    count: number;
  }[];
  onMonthClick?: (month: string, year: string) => void;
}

const ViolationsOverTimeChart = ({ data, onMonthClick }: ViolationsOverTimeChartProps) => {
  const chartRef = useRef<ChartJS<'line'>>(null);

  if (!data || data.length === 0) {
    return (
      <div className='flex h-full items-center justify-center text-gray-500'>
        No data available
      </div>
    );
  }

  const chartData = {
    labels: data.map((item) => item.month),
    datasets: [
      {
        label: 'Violations',
        data: data.map((item) => item.count),
        borderColor: '#0d6efd',
        backgroundColor: 'rgba(13, 110, 253, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: '#0d6efd',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (event, elements) => {
      if (elements.length > 0 && onMonthClick) {
        const index = elements[0].index;
        const monthData = data[index];
        if (monthData) {
          // Parse month string like "Mar 2025" to extract month and year
          const parts = monthData.month.split(' ');
          if (parts.length === 2) {
            const month = parts[0];
            const year = parts[1];
            onMonthClick(month, year);
          }
        }
      }
    },
    onHover: (event, elements) => {
      const target = event.native?.target as HTMLElement;
      if (target) {
        target.style.cursor = elements.length > 0 ? 'pointer' : 'default';
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `${context.parsed.y} violations`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
    },
  };

  return <Line ref={chartRef} data={chartData} options={options} />;
};

export default ViolationsOverTimeChart;

