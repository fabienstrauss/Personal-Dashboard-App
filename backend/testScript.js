const yahooFinance = require('yahoo-finance2').default;

(async () => {
    try {
        const stockData = await yahooFinance.quote('AAPL'); // Test with a valid ticker
        console.log(stockData);
    } catch (error) {
        console.error('Error:', error.message, error.stack);
    }
})();