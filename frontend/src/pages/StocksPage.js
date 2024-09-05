import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import StockSelector from '../components/stock_components/StockSelector';
import StockChartTiny from '../components/stock_components/StockChartTiny';
import './StocksPage.css';

function StocksPage() {
    const [visibleStocks, setVisibleStocks] = useState([]); // For managing visible stocks

    useEffect(() => {
        axios.get('http://localhost:3001/api/stocks/visible-stocks')
            .then(response => {
                setVisibleStocks(response.data);
            })
            .catch(error => console.error('Error fetching visible stocks:', error));
    }, []);

    const addStockToDashboard = (ticker) => {
        axios.post('http://localhost:3001/api/stocks/add', { ticker: ticker })
            .then(response => {
                setVisibleStocks([...visibleStocks, response.data]);
            })
            .catch(error => {
                console.error('Error adding stock:', error.response || error.message);
            });
    };

    return (
        <div>
            <h1>My Stock Dashboard</h1>
            <StockSelector onAddStock={addStockToDashboard} />
            <div>
                {visibleStocks.map(stock => (
                    <div key={stock.ticker} className="stock-item">
                        <div className="stock-info">
                            <h2>{stock.ticker}</h2>
                            <p>{stock.fullName}</p> {/* Display the full name */}
                        </div>
                        <StockChartTiny ticker={stock.ticker} />
                        <div className="stock-price">
                            <p>{stock.lastClosePrice} {stock.currency}</p> {/* Display the price with currency */}
                            <p>{stock.percentageChange}%</p>
                        </div>
                        <Link to={`/stocks/${stock.ticker}`} className="details-button">Details</Link>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default StocksPage;


/*
ToDo:

- fix Stock Selector add function
- add full name and currency to overview of stock
- add ticker page to display detailed stock
- make the selector better by having a sort of list
- make stocks deselect able
- rethink logic of api calls
    - what when /stock is called
    - how to refresh
- think about caching information
- make look better with css
    - maybe make graph red when % is - and green when +
- add live prices
    - display them in tiny chart (last day)
    - find a way to get historical intraday data maybe
    - think about (AI) how to combine historical data with intraday/live data and how to display them
 */