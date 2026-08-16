
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEnergy } from '../../context/EnergyContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays, startOfWeek, startOfMonth, startOfYear, isSameDay, isAfter } from 'date-fns';

export default function PlanetDetailModal({ keyword, onClose }) {
    const { PLANET_METADATA, keywordTasks, addKeywordTask, toggleKeywordTask, deleteKeywordTask, checkins, currentUser, gravityScores } = useEnergy();
    const [newTaskInput, setNewTaskInput] = useState('');

    const meta = PLANET_METADATA[keyword] || { en: 'Unknown', desc: 'No description available.' };

    // Determine which user owns this keyword
    const USERS_LOCAL = {
        JIANG: { id: 'jiang', keywords: ['专注', '求索', '真实'] },
        ZHEN: { id: 'zhen', keywords: ['思考', '减负', '在场', '投入'] }
    };
    const keywordOwner = USERS_LOCAL.JIANG.keywords.includes(keyword) ? 'jiang' : 'zhen';

    // -- Data Processing for Chart --
    // We use the already computed gravityScores from context (which is for currentUser)
    const chartData = useMemo(() => {
        if (!gravityScores || !gravityScores[keyword]) return [];
        // Take last 30 days for the chart to keep it readable, or full year? User said "Gravity Trajectory", maybe full year is better but might be flat.
        // Let's show last 30 days by default or full year if available.
        return gravityScores[keyword];
    }, [gravityScores, keyword]);

    // -- Stats Calculation --
    const stats = useMemo(() => {
        const today = new Date();
        const userCheckins = checkins.filter(c => c.user_id === keywordOwner && c.keyword === keyword);

        const calcPeriod = (startDate) => {
            return userCheckins.filter(c => isAfter(new Date(c.date), startDate)).length;
        }

        return {
            week: calcPeriod(subDays(today, 7)),
            month: calcPeriod(startOfMonth(today)),
            year: calcPeriod(startOfYear(today))
        };
    }, [checkins, keywordOwner, keyword]);


    // -- Tasks --
    const tasks = keywordTasks.filter(t => t.keyword === keyword && t.user_id === keywordOwner);

    const handleAddTask = (e) => {
        if (e.key === 'Enter' && newTaskInput.trim()) {
            addKeywordTask(keyword, newTaskInput.trim());
            setNewTaskInput('');
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(5px)',
                    zIndex: 2000,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
                onClick={onClose} // Click outside to close
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    style={{
                        width: '90%',
                        maxWidth: '600px',
                        maxHeight: '90vh',
                        background: '#0a0f18',
                        border: '1px solid #4ECDC4',
                        borderRadius: '12px',
                        padding: '24px',
                        overflowY: 'auto',
                        color: '#E0E6ED',
                        fontFamily: '"Rajdhani", sans-serif',
                        boxShadow: '0 0 50px rgba(78, 205, 196, 0.2)'
                    }}
                    onClick={e => e.stopPropagation()} // Prevent close on click inside
                >
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '32px', color: '#4ECDC4' }}>{keyword}</h2>
                            <span style={{ fontSize: '18px', color: '#8892b0', textTransform: 'uppercase', letterSpacing: '2px' }}>{meta.en}</span>
                        </div>
                        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#888', fontSize: '24px', cursor: 'pointer' }}>×</button>
                    </div>

                    {/* Description */}
                    <div style={{ marginBottom: '30px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', borderLeft: '4px solid #4ECDC4', fontSize: '16px', lineHeight: '1.6' }}>
                        {meta.desc}
                    </div>

                    {/* Visualization */}
                    <div style={{ marginBottom: '30px' }}>
                        <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', marginBottom: '15px' }}>引力轨迹 (GRAVITY)</h3>
                        <div style={{ display: 'flex', gap: '20px', marginBottom: '15px', fontSize: '14px', color: '#8892b0' }}>
                            <span>本周记录: <b style={{ color: '#fff' }}>{stats.week}</b></span>
                            <span>本月记录: <b style={{ color: '#fff' }}>{stats.month}</b></span>
                            <span>年度累计: <b style={{ color: '#fff' }}>{stats.year}</b></span>
                        </div>
                        <div style={{ height: '200px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <XAxis dataKey="date" hide />
                                    <YAxis domain={[0, 100]} hide />
                                    <Tooltip
                                        contentStyle={{ background: '#050b14', border: '1px solid #4ECDC4', color: '#fff' }}
                                        itemStyle={{ color: '#4ECDC4' }}
                                        labelStyle={{ display: 'none' }}
                                    />
                                    <Line type="monotone" dataKey="score" stroke="#4ECDC4" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Sub-tasks */}
                    <div>
                        <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', marginBottom: '15px' }}>子任务 (SUB-TASKS)</h3>

                        {/* Input */}
                        <input
                            type="text"
                            placeholder="添加新的探索任务 (Press Enter)..."
                            value={newTaskInput}
                            onChange={e => setNewTaskInput(e.target.value)}
                            onKeyDown={handleAddTask}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'rgba(0,0,0,0.3)',
                                border: '1px solid #333',
                                borderRadius: '4px',
                                color: '#fff',
                                marginBottom: '15px',
                                boxSizing: 'border-box'
                            }}
                        />

                        {/* List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {tasks.length === 0 && <div style={{ color: '#666', fontStyle: 'italic' }}>暂无子任务</div>}
                            {tasks.map(t => (
                                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px' }}>
                                    <input
                                        type="checkbox"
                                        checked={t.is_completed}
                                        onChange={() => toggleKeywordTask(t.id, t.is_completed)}
                                        style={{ cursor: 'pointer', accentColor: '#4ECDC4' }}
                                    />
                                    <span style={{
                                        flex: 1,
                                        textDecoration: t.is_completed ? 'line-through' : 'none',
                                        color: t.is_completed ? '#666' : '#fff',
                                        opacity: t.is_completed ? 0.6 : 1
                                    }}>
                                        {t.content}
                                    </span>
                                    <button
                                        onClick={() => deleteKeywordTask(t.id)}
                                        style={{ background: 'transparent', border: 'none', color: '#555', cursor: 'pointer' }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
