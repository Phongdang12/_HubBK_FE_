import { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  subtext?: string;
  children: ReactNode;
}

const ChartCard = ({ title, subtext, children }: ChartCardProps) => {
  return (
    <div className='rounded-lg bg-white p-6 shadow-sm'>
      <div className='mb-4'>
        <h3 className='text-lg font-semibold text-gray-800'>{title}</h3>
        {subtext && (
          <p className='mt-1 text-sm text-gray-600'>{subtext}</p>
        )}
      </div>
      <div className='h-64 md:h-80'>{children}</div>
    </div>
  );
};

export default ChartCard;

