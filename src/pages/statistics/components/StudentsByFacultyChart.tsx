import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface StudentsByFacultyChartProps {
  data: { faculty: string; count: number }[];
  onFacultyClick?: (faculty: string) => void;
}

const StudentsByFacultyChart = ({
  data,
  onFacultyClick,
}: StudentsByFacultyChartProps) => {
  const chartRef = useRef<ChartJS<'doughnut'>>(null);

  if (!data || data.length === 0) {
    return (
      <div className='flex h-full items-center justify-center text-gray-500'>
        No data available
      </div>
    );
  }

  const chartData = {
    labels: data.map((item) => item.faculty),
    datasets: [
      {
        data: data.map((item) => item.count),
        backgroundColor: [
          '#0d6efd',
          '#198754',
          '#ffc107',
          '#dc3545',
          '#6f42c1',
          '#fd7e14',
          '#20c997',
          '#0dcaf0',
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (event, elements) => {
      if (elements.length > 0 && onFacultyClick) {
        const index = elements[0].index;
        onFacultyClick(data[index].faculty);
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
        position: 'right',
        labels: {
          padding: 15,
          font: {
            size: 12,
          },
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.labels && data.datasets) {
              return data.labels.map((label, i) => {
                const dataset = data.datasets[0];
                const value = dataset.data[i] as number;
                const total = (dataset.data as number[]).reduce(
                  (a, b) => a + b,
                  0,
                );
                const percentage = ((value / total) * 100).toFixed(1);
                return {
                  text: `${label}: ${value} (${percentage}%)`,
                  fillStyle: dataset.backgroundColor?.[i] as string,
                  hidden: false,
                  index: i,
                };
              });
            }
            return [];
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = (context.dataset.data as number[]).reduce(
              (a, b) => a + b,
              0,
            );
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} students (${percentage}%)`;
          },
        },
      },
    },
  };

  return <Doughnut ref={chartRef} data={chartData} options={options} />;
};

export default StudentsByFacultyChart;

