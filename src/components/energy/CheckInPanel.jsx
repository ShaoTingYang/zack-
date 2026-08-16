
import React, { useState } from 'react';
import { useEnergy } from '../../context/EnergyContext';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const RATING_COLORS = {
    high: '#6BCB77',
    medium: '#FFD93D',
    low: '#FF4B4B'
};

const RATING_LABELS = {
    high: 'HIGH',
    medium: 'MED',
    low: 'LOW'
};

export default function CheckInPanel() {
    const { userInfo, addCheckin } = useEnergy();
    const [selections, setSelections] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    const handleSelect = (keyword, quality) => {
        setSelections(prev => ({
            ...prev,
            [keyword]: quality
        }));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        const promises = Object.entries(selections).map(([kw, quality]) => {
            return addCheckin(selectedDate, kw, quality);
        });

        await Promise.all(promises);
        setSubmitting(false);
        setSelections({});
        // Alert removed as requested
    };

    return (
        <div style={{
            background: 'rgba(255,255,255,0.03)',
            padding: '24px',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h2 style={{ margin: 0 }}>Inject Energy</h2>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        max={format(new Date(), 'yyyy-MM-dd')}
                        className="custom-date-picker"
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: '#fff',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            outline: 'none',
                            fontFamily: 'inherit',
                            fontSize: '0.9em',
                            cursor: 'pointer'
                        }}
                    />
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSubmit}
                    disabled={submitting || Object.keys(selections).length === 0}
                    style={{
                        background: submitting ? '#333' : '#4ECDC4',
                        color: submitting ? '#888' : '#000',
                        border: 'none',
                        padding: '10px 30px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        borderRadius: '4px',
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        boxShadow: submitting ? 'none' : '0 0 15px rgba(78, 205, 196, 0.4)'
                    }}
                >
                    {submitting ? 'INJECTING...' : 'CONFIRM INJECTION'}
                </motion.button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                {userInfo.keywords.map(kw => (
                    <div key={kw} style={{
                        background: 'rgba(0,0,0,0.3)',
                        borderRadius: '8px',
                        padding: '16px',
                        border: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                    }}>
                        <h3 style={{ margin: 0, color: '#fff', fontSize: '18px' }}>{kw}</h3>

                        <div style={{ display: 'flex', gap: '8px' }}>
                            {['high', 'medium', 'low'].map(q => {
                                const isSelected = selections[kw] === q;
                                const baseColor = RATING_COLORS[q];

                                return (
                                    <motion.button
                                        key={q}
                                        onClick={() => handleSelect(kw, q)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        style={{
                                            flex: 1,
                                            padding: '8px 0',
                                            border: `1px solid ${isSelected ? baseColor : 'rgba(255,255,255,0.1)'}`,
                                            background: isSelected ? baseColor : 'transparent',
                                            color: isSelected ? '#000' : baseColor,
                                            cursor: 'pointer',
                                            borderRadius: '4px',
                                            fontWeight: 'bold',
                                            fontSize: '12px',
                                            textTransform: 'uppercase',
                                            opacity: (selections[kw] && !isSelected) ? 0.3 : 1
                                        }}
                                    >
                                        {RATING_LABELS[q]}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
