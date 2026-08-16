
import React from 'react';
import { motion } from 'framer-motion';

export default function VoyagerIcon({ size = 60, status = 'ACTIVE' }) {
    const isStalled = status === 'STALLED';
    const primaryColor = isStalled ? '#FF4B4B' : '#4ECDC4';
    const engineColor = isStalled ? '#550000' : '#00FFFF';

    return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Engine Glow (Only if active) */}
            {!isStalled && (
                <motion.circle
                    cx="50" cy="85" r="8"
                    fill={engineColor}
                    initial={{ opacity: 0.5, scale: 0.8 }}
                    animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 0.2, repeat: Infinity }}
                    style={{ filter: 'blur(4px)' }}
                />
            )}

            {/* Main Body Fuselage */}
            <path d="M50 15 L60 40 L65 70 L50 80 L35 70 L40 40 Z" fill="#E0E6ED" stroke={primaryColor} strokeWidth="2" />

            {/* Cockpit */}
            <path d="M50 25 L54 35 L46 35 Z" fill="#333" />

            {/* Wings / Solar Panels */}
            <path d="M60 40 L90 60 L85 75 L65 70" fill="rgba(10, 20, 30, 0.8)" stroke={primaryColor} strokeWidth="1" />
            <path d="M40 40 L10 60 L15 75 L35 70" fill="rgba(10, 20, 30, 0.8)" stroke={primaryColor} strokeWidth="1" />

            {/* Detail Lines */}
            <line x1="50" y1="40" x2="50" y2="70" stroke="#8892b0" strokeWidth="1" />

            {/* Engine Nozzles */}
            <rect x="42" y="80" width="6" height="4" fill="#333" />
            <rect x="52" y="80" width="6" height="4" fill="#333" />
        </svg>
    );
}
