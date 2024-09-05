const express = require('express');
const axios = require('axios');
const yahooFinance = require('yahoo-finance2').default;
const { db, saveStock } = require('../database');
const router = express.Router();

console.log('saveStock function:', saveStock);

// Alpha Vantage API Key (replace with your actual key)
const ALPHA_VANTAGE_API_KEY = 'HI6ZMQLVK1HQN7IC';

const createPriceTableForStock = (ticker) => {
    const tableName = `stock_prices_${ticker}`;
    return new Promise((resolve, reject) => {
        db.run(`
            CREATE TABLE IF NOT EXISTS ${tableName} (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date DATE,
                open_price REAL,
                high_price REAL,
                low_price REAL,
                close_price REAL,
                volume INTEGER
            )
        `, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(tableName); // Return the table name
            }
        });
    });
};

// Route to get all visible stocks
router.get('/visible-stocks', async (req, res) => {
    try {
        db.all('SELECT ticker, data FROM stocks WHERE visible = 1', [], async (err, rows) => {
            if (err) {
                console.error('Failed to retrieve visible stocks:', err.message);
                res.status(500).json({ error: 'Failed to retrieve visible stocks' });
            } else {
                const enhancedStocks = [];

                for (let stock of rows) {
                    const stockData = JSON.parse(stock.data);
                    const tableName = `stock_prices_${stock.ticker}`;
                    let lastClosePrice, percentageChange;

                    await new Promise((resolve) => {
                        db.all(`SELECT open_price, close_price FROM ${tableName} ORDER BY date DESC LIMIT 1`, [], (err, priceRows) => {
                            if (priceRows && priceRows.length > 0) {
                                lastClosePrice = priceRows[0].close_price;
                                percentageChange = ((priceRows[0].close_price - priceRows[0].open_price) / priceRows[0].open_price * 100).toFixed(2);
                            }
                            resolve();
                        });
                    });

                    enhancedStocks.push({
                        ticker: stock.ticker,
                        fullName: stockData.longName,
                        lastClosePrice,
                        percentageChange,
                        currency: stockData.currency
                    });
                }

                res.status(200).json(enhancedStocks);
            }
        });
    } catch (error) {
        console.error('Failed to retrieve visible stocks:', error.message);
        res.status(500).json({ error: 'Failed to retrieve visible stocks' });
    }
});

const saveHistoricalPrices = (tableName, historicalData) => {
    return new Promise((resolve, reject) => {
        const chunkSize = 500; // Choose a chunk size that keeps you within the SQLite variable limit
        const chunks = [];

        // Split data into chunks
        for (let i = 0; i < historicalData.length; i += chunkSize) {
            chunks.push(historicalData.slice(i, i + chunkSize));
        }

        // Insert each chunk separately
        const insertChunk = (chunk) => {
            return new Promise((resolveChunk, rejectChunk) => {
                const placeholders = chunk.map(() => '(?, ?, ?, ?, ?, ?)').join(',');
                const values = chunk.flatMap(entry => [
                    new Date(entry.date).toISOString().split('T')[0], // Convert Unix timestamp to YYYY-MM-DD
                    entry.open, entry.high, entry.low, entry.close, entry.volume
                ]);

                db.run(`
                    INSERT INTO ${tableName} (date, open_price, high_price, low_price, close_price, volume)
                    VALUES ${placeholders}
                `, values, (err) => {
                    if (err) {
                        rejectChunk(err);
                    } else {
                        resolveChunk();
                    }
                });
            });
        };

        // Process all chunks sequentially
        (async () => {
            for (const chunk of chunks) {
                await insertChunk(chunk);
            }
            resolve();
        })().catch(reject);
    });
};

const getLastDateInTable = (tableName) => {
    return new Promise((resolve, reject) => {
        db.get(`SELECT MAX(date) as lastDate FROM ${tableName}`, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row.lastDate);
            }
        });
    });
};

const fetchMissingData = async (ticker, tableName) => {
    const lastDate = await getLastDateInTable(tableName);

    const startDate = new Date(lastDate);
    startDate.setDate(startDate.getDate() + 1); // Start from the day after the last date

    const endDate = new Date().toISOString().split('T')[0]; // Today's date

    return await yahooFinance.historical(ticker, {
        period1: startDate.toISOString().split('T')[0],
        period2: endDate,
    });
};

// Route to fetch and save stock data along with historical data
router.post('/add', async (req, res) => {
    const { ticker } = req.body;
    try {
        const stockData = await yahooFinance.quote(ticker);
        const stockId = await saveStock(ticker, stockData);

        const tableName = await createPriceTableForStock(ticker);
        const existingData = await getLastDateInTable(tableName);

        let historicalData;
        if (existingData) {
            // Fetch only missing data
            historicalData = await fetchMissingData(ticker, tableName);
        } else {
            // Fetch all data if the table is empty
            historicalData = await getCompleteHistoricalData(ticker);
        }

        await saveHistoricalPrices(tableName, historicalData);

        res.status(200).json({ message: 'Stock added/updated successfully with historical data' });
    } catch (error) {
        console.error('Failed to add/update stock:', error.message);
        res.status(500).json({ error: 'Failed to add/update stock' });
    }
});

module.exports = router;

// Route to get live stock data
router.get('/live/:ticker', async (req, res) => {
    const { ticker } = req.params;
    try {
        const liveData = await fetchLiveStockData(ticker);
        res.status(200).json(liveData);
    } catch (error) {
        console.error('Failed to fetch live stock data:', error);
        res.status(500).json({ error: 'Failed to fetch live stock data' });
    }
});

// Route to get historical prices for a specific stock
router.get('/prices/:ticker', async (req, res) => {
    const { ticker } = req.params;
    const tableName = `stock_prices_${ticker}`;

    try {
        db.all(`SELECT date, open_price, close_price FROM ${tableName} ORDER BY date ASC`, [], (err, rows) => {
            if (err) {
                return res.status(500).json({ error: `Failed to fetch stock prices for ${ticker}` });
            }
            if (!rows || rows.length === 0) {
                return res.status(404).json({ error: `No price data found for ticker ${ticker}` });
            }

            const lastClosePrice = rows[rows.length - 1].close_price;
            const lastOpenPrice = rows[rows.length - 1].open_price;
            const percentageChange = ((lastClosePrice - lastOpenPrice) / lastOpenPrice * 100).toFixed(2);

            res.status(200).json({
                prices: rows,
                lastClosePrice,
                percentageChange,
            });
        });
    } catch (error) {
        res.status(500).json({ error: `Failed to fetch stock prices for ${ticker}` });
    }
});


// Route to get all saved stocks
router.get('/', async (req, res) => {
    try {
        const stocks = await getStocks();
        res.status(200).json(stocks);
    } catch (error) {
        console.error('Failed to retrieve stocks:', error);
        res.status(500).json({ error: 'Failed to retrieve stocks' });
    }
});

const getCompleteHistoricalData = async (ticker) => {
    const startDate = '1970-01-01'; // Start from the earliest possible date
    const endDate = new Date().toISOString().split('T')[0]; // Today's date

    return await yahooFinance.historical(ticker, {
        period1: startDate,
        period2: endDate,
    });
};

// Fetch live stock data from Alpha Vantage
async function fetchLiveStockData(ticker) {
    try {
        const response = await axios.get('https://www.alphavantage.co/query', {
            params: {
                function: 'TIME_SERIES_INTRADAY',
                symbol: ticker,
                interval: '1min',
                apikey: ALPHA_VANTAGE_API_KEY
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching live stock data:', error);
        throw new Error('Failed to fetch live stock data');
    }
}

module.exports = router;