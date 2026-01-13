import React from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showPercentage = true,
}) => {
  const percentage = (value / max) * 100;

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-semibold text-slate-700">{label}</label>
          {showPercentage && (
            <span className="text-xs font-bold text-slate-600">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
