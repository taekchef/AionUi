import React from 'react';
import { Slider } from '@arco-design/web-react';

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
}

const SliderControl: React.FC<SliderControlProps> = ({ label, value, min, max, step = 1, unit = '', onChange }) => {
  return (
    <div className='space-y-6px'>
      <div className='flex items-center justify-between gap-12px'>
        <span className='text-13px text-[var(--text-primary)]'>{label}</span>
        <span className='min-w-68px text-right text-12px text-[var(--text-secondary)]'>
          {value}
          {unit}
        </span>
      </div>
      <Slider
        className='theme-designer-slider'
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(nextValue) => {
          if (typeof nextValue === 'number') {
            onChange(nextValue);
          }
        }}
      />
      <div className='flex items-center justify-between text-11px text-[var(--text-disabled)]'>
        <span>
          {min}
          {unit}
        </span>
        <span>
          {max}
          {unit}
        </span>
      </div>
    </div>
  );
};

export default SliderControl;
