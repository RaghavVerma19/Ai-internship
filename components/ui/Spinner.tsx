
import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md', text }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div
        className={`${sizeClasses[size]} border-primary dark:border-dark-primary border-t-transparent rounded-full animate-spin`}
      ></div>
      {text && <p className="text-on-surface-secondary dark:text-dark-on-surface-secondary animate-pulse">{text}</p>}
    </div>
  );
};

export default Spinner;
