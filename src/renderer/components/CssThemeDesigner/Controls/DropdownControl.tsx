import React from 'react';
import AionSelect from '@/renderer/components/base/AionSelect';
import type { DropdownOption } from '../types';

interface DropdownControlProps {
  label: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
}

const DropdownControl: React.FC<DropdownControlProps> = ({ label, value, options, onChange }) => {
  return (
    <div className='space-y-6px'>
      <div className='flex items-center justify-between gap-12px'>
        <span className='text-13px text-[var(--text-primary)]'>{label}</span>
      </div>
      <AionSelect value={value} onChange={(nextValue) => onChange(String(nextValue))} size='middle'>
        {options.map((option) => (
          <AionSelect.Option key={option.value} value={option.value}>
            {option.label}
          </AionSelect.Option>
        ))}
      </AionSelect>
    </div>
  );
};

export default DropdownControl;
