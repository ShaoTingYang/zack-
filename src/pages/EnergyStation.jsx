
import React from 'react';
import { EnergyProvider, useEnergy, USERS } from '../context/EnergyContext';
import CheckInPanel from '../components/energy/CheckInPanel';
import GravityChart from '../components/energy/GravityChart';
import EnergyCalendar from '../components/energy/EnergyCalendar';
import { motion } from 'framer-motion';

function EnergyStationContent({ goHome }) {
    const { currentUser, setCurrentUser, userInfo } = useEnergy();

    return (
        <div style={{
            height: '100vh',
            background: '#050B14',
            color: '#E0E6ED',
            fontFamily: '"Rajdhani", sans-serif',
            padding: '20px',
            boxSizing: 'border-box',
            overflowX: 'hidden',
            overflowY: 'auto'
        }}>
            {/* Header */}
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '40px',
                borderBottom: '1px solid rgba(78, 205, 196, 0.3)',
                paddingBottom: '20px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button onClick={goHome} style={{
                        background: 'transparent', border: '1px solid #4ECDC4', color: '#4ECDC4',
                        padding: '8px 16px', cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase'
                    }}>
                        &lt; Back to Orbit
                    </button>
                    <h1 style={{ margin: 0, fontSize: '24px', letterSpacing: '2px', textTransform: 'uppercase', textShadow: '0 0 10px rgba(78, 205, 196, 0.5)' }}>
                        Energy Station <span style={{ fontSize: '0.6em', opacity: 0.7 }}>// 2026</span>
                    </h1>
                </div>

                {/* User Switcher */}
                <div style={{ display: 'flex', gap: '10px', background: 'rgba(255,255,255,0.05)', padding: '5px', borderRadius: '4px' }}>
                    {Object.values(USERS).map(u => (
                        <button
                            key={u.id}
                            onClick={() => setCurrentUser(u.id)}
                            style={{
                                background: currentUser === u.id ? '#4ECDC4' : 'transparent',
                                color: currentUser === u.id ? '#000' : '#8892b0',
                                border: 'none',
                                padding: '8px 16px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                transition: 'all 0.3s ease',
                                borderRadius: '2px'
                            }}
                        >
                            {u.name}
                        </button>
                    ))}
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '40px', maxWidth: '1200px', margin: '0 auto' }}>

                {/* Section 1: Input */}
                <section>
                    <CheckInPanel />
                </section>

                {/* Section 2: Chart */}
                <section style={{ background: 'rgba(10, 20, 30, 0.5)', padding: '20px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <h2 style={{ marginTop: 0, marginBottom: '20px', borderLeft: '4px solid #FFD93D', paddingLeft: '10px' }}>GRAVITY TRAJECTORY</h2>
                    <div style={{ height: '400px' }}>
                        <GravityChart />
                    </div>
                </section>

                {/* Section 3: Calendar History */}
                <section>
                    <h2 style={{ marginTop: 0, marginBottom: '20px', borderLeft: '4px solid #FF4B4B', paddingLeft: '10px' }}>TEMPORAL RECORD</h2>
                    <EnergyCalendar />
                </section>

            </div>
        </div>
    );
}

export default function EnergyStation({ goTo }) {
    return <EnergyStationContent goHome={() => goTo('home')} />;
}
