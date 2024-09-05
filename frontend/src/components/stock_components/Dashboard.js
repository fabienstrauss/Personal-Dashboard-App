import React from 'react';
import StockChart from './StockChart';

function Dashboard({ stocks }) {
    return (
        <div>
            {stocks.map((stock, index) => (
                <StockChart key={index} ticker={stock} />
            ))}
        </div>
    );
}

export default Dashboard;
