import React from 'react';

const HomePage = () => {
  return (
    <>
      {/* Background container with black base and dim green grid */}
      <div className="relative min-h-screen w-full bg-black overflow-hidden">
        {/* SVG grid pattern with very dim green */}
        <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dimGreenGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              {/* Horizontal line */}
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#0a2f0a"
                strokeWidth="0.8"
                opacity="0.6"
              />
              {/* Vertical line */}
              <path
                d="M 0 40 L 40 40 40 0"
                fill="none"
                stroke="#0a2f0a"
                strokeWidth="0.8"
                opacity="0.6"
              />
            </pattern>

            {/* Secondary finer grid for more "cells and rows" feel */}
            <pattern id="dimGreenGridFine" width="10" height="10" patternUnits="userSpaceOnUse">
              <path
                d="M 10 0 L 0 0 0 10"
                fill="none"
                stroke="#0a2f0a"
                strokeWidth="0.4"
                opacity="0.4"
              />
            </pattern>
          </defs>

          {/* Apply both grids */}
          <rect width="100%" height="100%" fill="url(#dimGreenGridFine)" />
          <rect width="100%" height="100%" fill="url(#dimGreenGrid)" />
        </svg>

        {/* Optional: Subtle dot pattern at intersections for extra "cell" feel */}
        <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dimGreenDots" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="0" cy="0" r="1.2" fill="#0f3f0f" opacity="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dimGreenDots)" />
        </svg>

        {/* Your page content goes here */}
        <div className="relative z-10">
          {/* Example content - replace with your actual content */}
          <div className="flex flex-col items-center justify-center min-h-screen text-white">
            <h1 className="text-4xl font-bold mb-4" style={{ textShadow: '0 0 10px rgba(0,255,0,0.2)' }}>
              Home Page
            </h1>
            <p className="text-lg" style={{ color: '#4a7c4a' }}>
              Content with dim green accent
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;