import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, defs, linearGradient, stop } from 'recharts';
import axios from 'axios';

function StockChartTiny({ ticker, percentageChange }) {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/api/stocks/prices/${ticker}`);

                // Extract the prices array from the response
                const pricesArray = response.data.prices;

                // Check if the pricesArray is indeed an array and contains data
                if (Array.isArray(pricesArray) && pricesArray.length > 0) {
                    // Set the last 5 days' data for the chart
                    setData(pricesArray.slice(-5));
                } else {
                    console.warn('Prices array is empty or invalid:', pricesArray);
                    setData([]);  // Handle the case where there is no valid data
                }
            } catch (error) {
                console.error('Error fetching stock prices:', error);
            }
        };

        fetchData();
    }, [ticker]);

    // Determine the color of the line and area based on the percentage change
    let strokeColor = '#808080'; // default to grey
    if (percentageChange > 0) {
        strokeColor = '#00ff00'; // green for positive change
    } else if (percentageChange < 0) {
        strokeColor = '#ff0000'; // red for negative change
    }

    // Find the min and max prices to set the domain of the Y-axis
    const minPrice = Math.min(...data.map(item => item.close_price));
    const maxPrice = Math.max(...data.map(item => item.close_price));

    return (
        <AreaChart width={150} height={40} data={data}>
            <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={strokeColor} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={strokeColor} stopOpacity={0}/>
                </linearGradient>
            </defs>
            <XAxis dataKey="date" hide />
            <YAxis domain={[minPrice, maxPrice]} hide />
            <Area type="monotone" dataKey="close_price" stroke={strokeColor} fillOpacity={1} fill="url(#colorUv)" />
        </AreaChart>
    );
}

export default StockChartTiny;
