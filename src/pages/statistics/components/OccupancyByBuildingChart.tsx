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

interface OccupancyByBuildingChartProps {
  data: {
    building: string;
    totalCapacity: number;
    currentResidents: number;
    available: number;
  }[];
  onBuildingClick?: (building: string) => void;
}

const OccupancyByBuildingChart = ({
  data,
  onBuildingClick,
}: OccupancyByBuildingChartProps) => {
  const chartRef = useRef<ChartJS<'bar'>>(null);

  if (!data || data.length === 0) {
    return (
      <div className='flex h-full items-center justify-center text-gray-500'>
        No data available
      </div>
    );
  }

  const chartData = {
    labels: data.map((item) => item.building),
    datasets: [
      {
        label: 'Occupied',
        data: data.map((item) => item.currentResidents),
        backgroundColor: '#0d6efd',
        borderColor: '#0a58ca',
        borderWidth: 1,
      },
      {
        label: 'Available',
        data: data.map((item) => item.available),
        backgroundColor: '#e9ecef',
        borderColor: '#dee2e6',
        borderWidth: 1,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (event, elements) => {
      if (elements.length > 0 && onBuildingClick) {
        const index = elements[0].index;
        onBuildingClick(data[index].building);
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
        position: 'top',
        labels: {
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          footer: (items) => {
            const item = items[0];
            const buildingData = data[item.dataIndex];
            const percentage = (
              (buildingData.currentResidents / buildingData.totalCapacity) *
              100
            ).toFixed(1);
            return `${buildingData.building}: ${buildingData.currentResidents}/${buildingData.totalCapacity} (${percentage}% occupied)`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: {
          stepSize: 10,
        },
      },
    },
  };

  return <Bar ref={chartRef} data={chartData} options={options} />;
};

export default OccupancyByBuildingChart;

