import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  iconColor: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  progress?: {
    value: number;
    max: number;
  };
}

const KPICard = ({
  title,
  value,
  subtext,
  icon: Icon,
  iconColor,
  trend,
  progress,
}: KPICardProps) => {
  return (
    <div className='rounded-lg bg-white p-6 shadow-sm transition-shadow hover:shadow-md'>
      <div className='flex items-start justify-between'>
        <div className='flex-1'>
          <p className='text-sm font-medium uppercase tracking-wide text-gray-500'>
            {title}
          </p>
          <p className='mt-2 text-3xl font-bold text-gray-900'>{value}</p>
          {subtext && (
            <p className='mt-1 text-sm text-gray-600'>{subtext}</p>
          )}
          {trend && (
            <div className='mt-2 flex items-center gap-1'>
              <span
                className={`text-sm font-medium ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend.isPositive ? '▲' : '▼'} {trend.value}
              </span>
              <span className='text-sm text-gray-500'>vs last month</span>
            </div>
          )}
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-lg ${iconColor}`}
        >
          <Icon className='h-6 w-6 text-white' />
        </div>
      </div>
      {progress && (
        <div className='mt-4'>
          <div className='h-2 w-full overflow-hidden rounded-full bg-gray-200'>
            <div
              className='h-full bg-blue-600 transition-all duration-300'
              style={{
                width: `${(progress.value / progress.max) * 100}%`,
              }}
            />
          </div>
          <p className='mt-1 text-xs text-gray-500'>
            {progress.value} / {progress.max}
          </p>
        </div>
      )}
    </div>
  );
};

export default KPICard;

