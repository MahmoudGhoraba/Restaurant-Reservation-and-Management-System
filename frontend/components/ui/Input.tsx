import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="form-group w-full">
      {label && (
        <label className="form-label">
          {label}
        </label>
      )}
      <input
        className={`form-input ${error ? 'error' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="form-error">{error}</p>
      )}
    </div>
  );
};
