import React, { useState } from 'react';

function StockSelector({ onAddStock }) {
    const [ticker, setTicker] = useState('');

    const handleAdd = () => {
        onAddStock(ticker);
        setTicker('');
    };

    return (
        <div>
            <input
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                placeholder="Enter stock ticker"
            />
            <button onClick={handleAdd}>Add Stock</button>
        </div>
    );
}

export default StockSelector;