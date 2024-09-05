import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Bar } from 'recharts';
import axios from 'axios';

function StockChart({ ticker }) {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/api/stocks/prices/${ticker}`);
                setData(response.data);
            } catch (error) {
                console.error('Error fetching stock prices:', error);
            }
        };

        fetchData();
    }, [ticker]);

    return (
        <LineChart width={600} height={400} data={data}>
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <CartesianGrid stroke="#f5f5f5" />
            <Line type="monotone" dataKey="close_price" stroke="#ff7300" yAxisId="left" dot={false} />
            <Bar dataKey="volume" fill="#8884d8" yAxisId="right" />
        </LineChart>
    );
}

export default StockChart;