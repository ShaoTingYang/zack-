
import React from 'react';
import { useEnergy } from '../../context/EnergyContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#6BCB77', '#FFD93D', '#FF4B4B', '#4ECDC4', '#C7F464', '#FF6B6B', '#4D96FF'];

export default function GravityChart() {
    const { gravityScores, userInfo } = useEnergy();

    // Transform data for Recharts
    // Need format: [{ date: '2026-01-01', keyword1: 50, keyword2: 60 }, ...]

    // 1. Get all dates from the first keyword (assuming all have same dates)
    const firstKw = userInfo.keywords[0];
    const history = gravityScores[firstKw] || [];

    const chartData = history.map((h, index) => {
        const row = { date: h.date };
        userInfo.keywords.forEach(kw => {
            const kwHistory = gravityScores[kw];
            if (kwHistory && kwHistory[index]) {
                row[kw] = kwHistory[index].score;
            }
        });
        return row;
    });

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis
                    dataKey="date"
                    stroke="#888"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(str) => str.slice(5)} // Show MM-DD
                />
                <YAxis stroke="#888" domain={[0, 100]} />
                <Tooltip
                    contentStyle={{ backgroundColor: '#050B14', border: '1px solid #444' }}
                    itemStyle={{ color: '#fff' }}
                    labelStyle={{ color: '#aaa' }}
                />
                <Legend />
                {userInfo.keywords.map((kw, i) => (
                    <Line
                        key={kw}
                        type="monotone"
                        dataKey={kw}
                        stroke={COLORS[i % COLORS.length]}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
                    />
                ))}
            </LineChart>
        </ResponsiveContainer>
    );
}
