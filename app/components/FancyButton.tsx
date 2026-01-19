"use client";

import React from 'react';
import '../fancy-ui.css';

interface FancyButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'small' | 'icon';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export function FancyButton({ 
  children, 
  onClick, 
  className = '', 
  variant = 'default',
  disabled = false,
  type = 'button'
}: FancyButtonProps) {
  return (
    <>
      {/* SVG Filters */}
      <svg className="svg-filters">
        <filter width="300%" x="-100%" height="300%" y="-100%" id="unopaq">
          <feColorMatrix
            values="1 0 0 0 0 
                    0 1 0 0 0 
                    0 0 1 0 0 
                    0 0 0 9 0"
          />
        </filter>
        <filter width="300%" x="-100%" height="300%" y="-100%" id="unopaq2">
          <feColorMatrix
            values="1 0 0 0 0 
                    0 1 0 0 0 
                    0 0 1 0 0 
                    0 0 0 3 0"
          />
        </filter>
        <filter width="300%" x="-100%" height="300%" y="-100%" id="unopaq3">
          <feColorMatrix
            values="1 0 0 0.2 0 
                    0 1 0 0.2 0 
                    0 0 1 0.2 0 
                    0 0 0 2 0"
          />
        </filter>
      </svg>

      <div className={`fancy-button-wrapper ${variant === 'small' ? 'fancy-button-small' : ''} ${variant === 'icon' ? 'fancy-button-icon' : ''} ${className}`}>
        <div className="fancy-button-container">
          <div className="fancy-button-spin fancy-button-spin-blur" />
          <div className="fancy-button-spin fancy-button-spin-intense" />
          <div className="fancy-button-border">
            <div className="fancy-button-spin-inside" />
            <button 
              className="fancy-button" 
              onClick={onClick}
              disabled={disabled}
              type={type}
            >
              {children}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
