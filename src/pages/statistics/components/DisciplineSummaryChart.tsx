import { useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

interface DisciplineSummaryChartProps {
  data: {
    severity: string;
    count: number;
  }[];
  onSeverityClick?: (severity: string) => void;
}

const DisciplineSummaryChart = ({
  data,
  onSeverityClick,
}: DisciplineSummaryChartProps) => {
  const chartRef = useRef<ChartJS<'bar'>>(null);

  if (!data || data.length === 0) {
    return (
      <div className='flex h-full items-center justify-center text-gray-500'>
        No data available
      </div>
    );
  }

  const severityColors: Record<string, string> = {
    low: '#198754',
    medium: '#ffc107',
    high: '#fd7e14',
    expulsion: '#dc3545',
  };

  const chartData = {
    labels: data.map((item) =>
      item.severity.charAt(0).toUpperCase() + item.severity.slice(1),
    ),
    datasets: [
      {
        label: 'Violations',
        data: data.map((item) => item.count),
        backgroundColor: data.map(
          (item) => severityColors[item.severity.toLowerCase()] || '#6c757d',
        ),
        borderColor: data.map(
          (item) => severityColors[item.severity.toLowerCase()] || '#6c757d',
        ),
        borderWidth: 1,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    onClick: (event, elements) => {
      if (elements.length > 0 && onSeverityClick) {
        const index = elements[0].index;
        onSeverityClick(data[index].severity);
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
            return `${context.parsed.x} cases`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          display: false,
        },
      },
    },
  };

  return <Bar ref={chartRef} data={chartData} options={options} />;
};

export default DisciplineSummaryChart;

