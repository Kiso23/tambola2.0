import React, { useMemo } from 'react';

const SNOWFLAKES = ['❄', '❅', '❆', '✦', '·'];

export default function SnowBackground() {
  const flakes = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      animationDuration: `${6 + Math.random() * 10}s`,
      animationDelay: `${Math.random() * 10}s`,
      fontSize: `${0.6 + Math.random() * 1.2}rem`,
      opacity: 0.3 + Math.random() * 0.5,
      symbol: SNOWFLAKES[Math.floor(Math.random() * SNOWFLAKES.length)],
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Gradient sky */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-200 via-blue-100 to-blue-50" />

      {/* Trees silhouette */}
      <div className="absolute bottom-0 left-0 right-0 h-32 opacity-20">
        <svg viewBox="0 0 1440 128" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-full">
          <path d="M0,128 L60,60 L80,80 L120,20 L160,60 L180,40 L220,10 L260,50 L280,30 L320,0 L360,40 L380,20 L420,60 L460,30 L480,50 L520,10 L560,60 L600,30 L640,70 L680,20 L720,50 L760,10 L800,60 L840,30 L880,70 L920,20 L960,50 L1000,0 L1040,50 L1080,30 L1120,70 L1160,20 L1200,50 L1240,10 L1280,60 L1320,30 L1360,70 L1440,40 L1440,128 Z" fill="#1e40af"/>
        </svg>
      </div>

      {/* Snowflakes */}
      {flakes.map((flake) => (
        <span
          key={flake.id}
          className="snowflake select-none"
          style={{
            left: flake.left,
            animationDuration: flake.animationDuration,
            animationDelay: flake.animationDelay,
            fontSize: flake.fontSize,
            opacity: flake.opacity,
            color: '#93c5fd',
          }}
        >
          {flake.symbol}
        </span>
      ))}
    </div>
  );
}
