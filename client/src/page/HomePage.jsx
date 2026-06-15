import React from 'react';
import Homenav from '../Components/Homenav';
import Hero from '../Components/Hero';
import Services from '../Components/Services';

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

        {/* Main content container with centralized padding */}
        <div className="relative z-10 min-h-screen">
          <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-5 py-3 md:py-4 lg:py-2">
            <div className="bg-black bg-opacity-80 rounded-lg p-6 md:p-8 lg:p-10">
              <Homenav />
              <Hero />
              <Services />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;