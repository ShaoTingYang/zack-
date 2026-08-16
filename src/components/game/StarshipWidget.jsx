
import React, { useState } from 'react';
import { useEnergy } from '../../context/EnergyContext';
import { motion, AnimatePresence } from 'framer-motion';
import VoyagerIcon from './VoyagerIcon';

export default function StarshipWidget() {
    const { starshipState } = useEnergy();
    const [isHovered, setIsHovered] = useState(false);

    if (!starshipState) return null;

    // Destructure detailed stats
    const { progress, keywordStats } = starshipState;

    // Calculate Unexplored Area
    const unexplored = Math.max(0, 100 - progress);

    // Define Planet display order and naming
    const PLANET_ORDER = [
        { key: '求索', name: '求索星' },
        { key: '真实', name: '真实星' },
        { key: '专注', name: '专注星' },
        { key: '减负', name: '减负星' },
        { key: '思考', name: '思考星' },
        { key: '在场', name: '在场星' },
        { key: '投入', name: '投入星' }
    ];

    return (
        <div
            style={{
                position: 'fixed',
                bottom: '30px',
                right: '30px',
                zIndex: 1000,
                fontFamily: '"Rajdhani", sans-serif',
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Percentage Display */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                style={{
                    color: '#4ECDC4',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    letterSpacing: '1px',
                    textShadow: '0 0 10px rgba(78, 205, 196, 0.5)'
                }}
            >
                {progress.toFixed(4)}%
            </motion.div>

            {/* Hover Card */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, x: 20, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            position: 'absolute',
                            bottom: '90px',
                            right: '0',
                            background: 'rgba(5, 10, 15, 0.95)',
                            border: '1px solid #4ECDC4',
                            borderRadius: '8px',
                            padding: '20px',
                            width: '280px',
                            backdropFilter: 'blur(10px)',
                            color: '#E0E6ED',
                            boxShadow: '0 0 30px rgba(78, 205, 196, 0.2)'
                        }}
                    >
                        <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: 'bold', color: '#4ECDC4', borderBottom: '1px solid rgba(78, 205, 196, 0.3)', paddingBottom: '10px', textTransform: 'uppercase' }}>
                            太阳系探索状态
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                            {/* Unexplored Area */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                <span style={{ color: '#888' }}>未探明区域</span>
                                <span style={{ color: '#FF4B4B', fontWeight: 'bold' }}>{unexplored.toFixed(2)}%</span>
                            </div>

                            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '5px 0' }} />

                            {/* Individual Planets */}
                            {PLANET_ORDER.map(p => {
                                const val = keywordStats[p.key] || 0;
                                return (
                                    <div key={p.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: '#A0AEC0' }}>{p.name}</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '60px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
                                                <div style={{ width: `${Math.min(100, val)}%`, height: '100%', background: val >= 100 ? '#6BCB77' : '#4ECDC4', borderRadius: '2px' }} />
                                            </div>
                                            <span style={{ minWidth: '45px', textAlign: 'right', color: val >= 100 ? '#6BCB77' : '#fff' }}>{val.toFixed(2)}%</span>
                                        </div>
                                    </div>
                                );
                            })}

                            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '5px 0' }} />

                            {/* System Progress */}
                            <div style={{ marginTop: '5px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                    <span style={{ color: '#fff', fontWeight: 'bold' }}>星系探索进度</span>
                                    <span style={{ color: '#4ECDC4', fontWeight: 'bold', fontSize: '14px' }}>{progress.toFixed(4)}%</span>
                                </div>
                                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                                    <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #4ECDC4, #6BCB77)', borderRadius: '3px', boxShadow: '0 0 10px rgba(78, 205, 196, 0.5)' }} />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* The Ship Icon */}
            <motion.div
                animate={{
                    y: [0, -4, 0],
                }}
                transition={{
                    y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }}
                style={{
                    width: '70px',
                    height: '70px',
                    background: 'radial-gradient(circle at center, rgba(78, 205, 196, 0.1) 0%, rgba(5, 11, 20, 0.6) 100%)',
                    border: '1px solid rgba(78, 205, 196, 0.3)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 0 20px rgba(78, 205, 196, 0.2)',
                    position: 'relative'
                }}
                onClick={() => setIsHovered(!isHovered)} // Click to toggle on mobile if needed
            >
                <VoyagerIcon size={50} status={'ACTIVE'} />

                <svg width="70" height="70" style={{ position: 'absolute', transform: 'rotate(-90deg)', pointerEvents: 'none' }}>
                    <circle
                        cx="35"
                        cy="35"
                        r="33"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="2"
                        fill="none"
                    />
                    <circle
                        cx="35"
                        cy="35"
                        r="33"
                        stroke={'#4ECDC4'}
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray="207.3"
                        strokeDashoffset={207.3 - (Math.min(1, progress / 100) * 207.3)}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 1s ease' }}
                    />
                </svg>
            </motion.div>
        </div>
    );
}
