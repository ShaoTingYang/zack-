
import React, { useState } from 'react';
import { useEnergy } from '../../context/EnergyContext';
import {
    format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
    eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths,
    addYears, subYears, addWeeks, subWeeks, getMonth, getYear
} from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const QUALITY_COLORS = {
    high: '#6BCB77',   // Green
    medium: '#FFD93D', // Yellow
    low: '#FF4B4B'     // Red
};

export default function EnergyCalendar() {
    const { checkins, userInfo, currentUser } = useEnergy();
    const [viewMode, setViewMode] = useState('month'); // 'year', 'month', 'week'
    const [currentDate, setCurrentDate] = useState(new Date());

    // -- Helpers --
    const getStatusColor = (date, keyword) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const checkin = checkins.find(c =>
            c.user_id === currentUser &&
            c.keyword === keyword &&
            c.date === dateStr
        );
        if (!checkin) return 'rgba(255,255,255,0.05)';
        return QUALITY_COLORS[checkin.quality] || 'rgba(255,255,255,0.05)';
    };

    const next = () => {
        if (viewMode === 'year') setCurrentDate(addYears(currentDate, 1));
        if (viewMode === 'month') setCurrentDate(addMonths(currentDate, 1));
        if (viewMode === 'week') setCurrentDate(addWeeks(currentDate, 1));
    };

    const prev = () => {
        if (viewMode === 'year') setCurrentDate(subYears(currentDate, 1));
        if (viewMode === 'month') setCurrentDate(subMonths(currentDate, 1));
        if (viewMode === 'week') setCurrentDate(subWeeks(currentDate, 1));
    };

    // -- Renderers --

    // Small Grid for Year View (Day cell)
    const MiniDayCell = ({ date, monthDate, keyword }) => {
        const isCurrentMonth = isSameMonth(date, monthDate);
        return (
            <div style={{
                width: '100%',
                paddingTop: '100%', // Aspect Ratio 1:1
                position: 'relative',
                background: isCurrentMonth ? getStatusColor(date, keyword) : 'transparent',
                borderRadius: '1px',
                opacity: isCurrentMonth ? 1 : 0
            }} />
        );
    };

    // Month Block for Year View
    const MonthBlock = ({ monthDate, keyword }) => {
        const start = startOfWeek(startOfMonth(monthDate));
        const end = endOfWeek(endOfMonth(monthDate));
        const days = eachDayOfInterval({ start, end });

        return (
            <div style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '10px', color: '#888', marginBottom: '2px' }}>{format(monthDate, 'MMM')}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px' }}>
                    {days.map(d => (
                        <MiniDayCell key={d.toString()} date={d} monthDate={monthDate} keyword={keyword} />
                    ))}
                </div>
            </div>
        );
    };

    // Full Month Grid
    const FullMonthGrid = ({ monthDate, keyword }) => {
        const start = startOfWeek(startOfMonth(monthDate));
        const end = endOfWeek(endOfMonth(monthDate));
        const days = eachDayOfInterval({ start, end });

        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                    <div key={d} style={{ textAlign: 'center', fontSize: '10px', color: '#555' }}>{d}</div>
                ))}
                {days.map(d => {
                    const isCurrentMonth = isSameMonth(d, monthDate);
                    const color = getStatusColor(d, keyword);
                    const hasData = color !== 'rgba(255,255,255,0.05)';

                    return (
                        <div key={d.toISOString()} style={{
                            height: '30px',
                            background: isCurrentMonth ? color : 'transparent',
                            border: isCurrentMonth && !hasData ? '1px solid rgba(255,255,255,0.05)' : 'none',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            color: hasData ? '#000' : '#444',
                            opacity: isCurrentMonth ? 1 : 0.2
                        }}>
                            {isCurrentMonth ? format(d, 'd') : ''}
                        </div>
                    );
                })}
            </div>
        );
    };

    // Week Grid
    const WeekGrid = ({ weekDate, keyword }) => {
        const start = startOfWeek(weekDate);
        const end = endOfWeek(weekDate);
        const days = eachDayOfInterval({ start, end });

        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
                {days.map(d => {
                    const color = getStatusColor(d, keyword);
                    const hasData = color !== 'rgba(255,255,255,0.05)';
                    return (
                        <div key={d.toISOString()} style={{
                            height: '60px',
                            background: color,
                            borderRadius: '6px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: !hasData ? '1px solid rgba(255,255,255,0.1)' : 'none'
                        }}>
                            <span style={{ fontSize: '10px', color: hasData ? '#000' : '#888' }}>{format(d, 'EEE')}</span>
                            <span style={{ fontSize: '16px', fontWeight: 'bold', color: hasData ? '#000' : '#fff' }}>{format(d, 'd')}</span>
                        </div>
                    )
                })}
            </div>
        )
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

            {/* Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setViewMode('year')} style={{ background: viewMode === 'year' ? '#4ECDC4' : 'transparent', color: viewMode === 'year' ? '#000' : '#fff', border: '1px solid #4ECDC4', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>YEAR</button>
                    <button onClick={() => setViewMode('month')} style={{ background: viewMode === 'month' ? '#4ECDC4' : 'transparent', color: viewMode === 'month' ? '#000' : '#fff', border: '1px solid #4ECDC4', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>MONTH</button>
                    <button onClick={() => setViewMode('week')} style={{ background: viewMode === 'week' ? '#4ECDC4' : 'transparent', color: viewMode === 'week' ? '#000' : '#fff', border: '1px solid #4ECDC4', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>WEEK</button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button onClick={prev} style={{ background: 'transparent', border: 'none', color: '#4ECDC4', cursor: 'pointer', fontSize: '18px' }}>&lt;</button>
                    <span style={{ minWidth: '100px', textAlign: 'center', fontWeight: 'bold' }}>
                        {viewMode === 'year' && format(currentDate, 'yyyy')}
                        {viewMode === 'month' && format(currentDate, 'MMMM yyyy')}
                        {viewMode === 'week' && `Week ${format(currentDate, 'w, yyyy')}`}
                    </span>
                    <button onClick={next} style={{ background: 'transparent', border: 'none', color: '#4ECDC4', cursor: 'pointer', fontSize: '18px' }}>&gt;</button>
                </div>
            </div>

            {/* Keywords Loop */}
            {userInfo.keywords.map(kw => (
                <div key={kw} style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px' }}>
                    <h4 style={{ margin: '0 0 15px 0', textTransform: 'uppercase', color: '#4ECDC4', fontSize: '14px', letterSpacing: '1px' }}>{kw}</h4>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={viewMode + currentDate.toString()}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {viewMode === 'year' && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '15px' }}>
                                    {Array.from({ length: 12 }).map((_, i) => {
                                        const mDate = new Date(getYear(currentDate), i, 1);
                                        return <MonthBlock key={i} monthDate={mDate} keyword={kw} />
                                    })}
                                </div>
                            )}

                            {viewMode === 'month' && (
                                <FullMonthGrid monthDate={currentDate} keyword={kw} />
                            )}

                            {viewMode === 'week' && (
                                <WeekGrid weekDate={currentDate} keyword={kw} />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );
}
