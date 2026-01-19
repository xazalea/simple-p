"use client";

import React from 'react';
import '../fancy-ui.css';

interface FancyInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  className?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  required?: boolean;
  autoFocus?: boolean;
}

export function FancyInput({ 
  value, 
  onChange, 
  onKeyPress, 
  placeholder = '', 
  type = 'text',
  className = '',
  icon,
  disabled = false,
  required = false,
  autoFocus = false
}: FancyInputProps) {
  return (
    <div className={`fancy-input-container ${className}`}>
      <div className="fancy-input-wrapper">
        <div className="fancy-input-white" />
        <div className="fancy-input-border" />
        <div className="fancy-input-dark-border-bg" />
        <div className="fancy-input-glow" />
        <div className="fancy-input-mask" />
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-gray-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          onKeyPress={onKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoFocus={autoFocus}
          className={`fancy-input ${icon ? 'pl-12' : ''}`}
        />
      </div>
    </div>
  );
}
