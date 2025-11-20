import { FC } from 'react';
import { Input } from '@/components/ui/input';

interface Props {
  ssnQuery: string;
  setSsnQuery: (val: string) => void;
}

const StudentFilter: FC<Props> = ({ ssnQuery, setSsnQuery }) => {
  return (
    <div className='mb-4 flex items-center gap-3'>
      <Input
        placeholder='Search by SSN'
        className='w-64'
        value={ssnQuery}
        onChange={(e) => setSsnQuery(e.target.value)}
      />
    </div>
  );
};

export default StudentFilter;
