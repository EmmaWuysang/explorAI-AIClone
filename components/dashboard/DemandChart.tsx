'use client';

import React from 'react';

interface DemandChartProps {
    data: { date: string; value: number }[];
}

export default function DemandChart({ data }: DemandChartProps) {
    if (!data || data.length === 0) return null;

    const height = 200;
    const width = 500; // SVG coordinate system
    const padding = 20;

    const maxValue = Math.max(...data.map(d => d.value)) * 1.1; // 10% headroom
    const minValue = 0;

    // Scale helpers
    const getX = (index: number) => (index / (data.length - 1)) * (width - padding * 2) + padding;
    const getY = (value: number) => height - padding - ((value - minValue) / (maxValue - minValue)) * (height - padding * 2);

    // Build the SVG path
    const points = data.map((d, i) => `${getX(i)},${getY(d.value)}`).join(' ');
    const areaPath = `M ${getX(0)},${height - padding} L ${points} L ${getX(data.length - 1)},${height - padding} Z`;
    const linePath = `M ${points}`;

    return (
        <div className="w-full h-[200px] mt-4 select-none">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full text-purple-600">
                <defs>
                    <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                    </linearGradient>
                </defs>
                
                {/* Horizontal Grid Lines */}
                {[0.25, 0.5, 0.75].map((tick, i) => (
                    <line 
                        key={i}
                        x1={padding} 
                        y1={getY(maxValue * tick)} 
                        x2={width - padding} 
                        y2={getY(maxValue * tick)} 
                        stroke="currentColor" 
                        strokeOpacity="0.1" 
                        strokeDasharray="4 4" 
                    />
                ))}

                {/* Area */}
                <path d={areaPath} fill="url(#gradient)" />
                
                {/* Line */}
                <path d={linePath} fill="none" stroke="currentColor" strokeWidth="2" />

                {/* X Axis Labels (first and last) */}
                <text x={padding} y={height - 2} fontSize="10" fill="currentColor" opacity="0.6">
                    {data[0]?.date.slice(5)}
                </text>
                <text x={width - padding} y={height - 2} textAnchor="end" fontSize="10" fill="currentColor" opacity="0.6">
                    {data[data.length - 1]?.date.slice(5)}
                </text>
            </svg>
        </div>
    );
}
