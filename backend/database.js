const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create a new database if it doesn't exist
const db = new sqlite3.Database(path.join(__dirname, 'database.db'), (err) => {
    if (err) {
        console.error('Could not connect to the database', err);
    } else {
        console.log('Connected to the SQLite database');
    }
});

// Initialize the database schema
db.serialize(() => {
    // Create 'pages' table
    db.run(`CREATE TABLE IF NOT EXISTS pages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        route TEXT NOT NULL,
        selected INTEGER NOT NULL,
        category TEXT,
        icon TEXT
    )`, (err) => {
        if (err) {
            console.error('Error creating pages table:', err.message);
        } else {
            console.log('Pages table created or already exists');
        }
    });

    // Create 'stocks' table
    db.run(`CREATE TABLE IF NOT EXISTS stocks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticker TEXT NOT NULL,
        data TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) {
            console.error('Error creating stocks table:', err.message);
        } else {
            console.log('Stocks table created or already exists');
        }
    });
/*
    db.run(`CREATE TABLE IF NOT EXISTS stock_prices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        stock_id INTEGER,
        date DATE,
        open_price REAL,
        high_price REAL,
        low_price REAL,
        close_price REAL,
        volume INTEGER,
        FOREIGN KEY(stock_id) REFERENCES stocks(id)
    )`, (err) => {
        if (err) {
            console.error('Error creating stock_prices table:', err.message);
        } else {
            console.log('Stock prices table created or already exists');
        }
    });
 */
    // Insert initial data into 'pages' table if it's empty
    db.get("SELECT COUNT(*) AS count FROM pages", (err, row) => {
        if (err) {
            console.error('Error counting pages:', err.message);
            return;
        }
        if (row.count === 0) {
            // Insert initial data
            db.run(`INSERT INTO pages (name, route, selected, category, icon) VALUES
                ('Home', '/', 1, 'Allgemein', 'HomeIcon'),
                ('Stocks', '/stocks', 1, 'Finance', 'BarLineChartIcon'),
                ('Notes', '/notes', 1, 'Allgemein', 'StickerSquareIcon'),
                ('Kalender', '/calendar', 0, 'Allgemein', 'CalendarIcon'),
                ('ToDo-Liste', '/todo', 0, 'Allgemein', 'CheckDoneIcon'),
                ('Wetter', '/weather', 0, 'Allgemein', 'CloudIcon'),
                ('Zitat des Tages', '/qotd', 0, 'Inspiration', 'PilcrowIcon'),
                ('Moodboards', '/moodboards', 0, 'Inspiration', 'ClipboardIcon'),
                ('Dividendenkalender', '/dividend_calendar', 0, 'Finanzen', 'CalendarDateIcon'),
                ('Aktien Newsfeed', '/stock_news', 0, 'Finanzen', 'BookOpenIcon'),
                ('Markt-Heatmap', '/markt_heatmap', 0, 'Finanzen', 'ThermometerIcon'),
                ('Währungsumrechner', '/currency_converter', 0, 'Finanzen', 'CoinSwapIcon'),
                ('Bookmarks', '/bookmarks', 0, 'Allgemein', 'BookmarkIcon')`,
                (err) => {
                    if (err) {
                        console.error('Error inserting initial data:', err.message);
                    } else {
                        console.log('Initial data inserted into pages table');
                    }
                });
        }
    });
});

// Function to save stock data or update if it already exists
const saveStock = (ticker, data) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT id FROM stocks WHERE ticker = ?', [ticker], (err, row) => {
            if (err) {
                reject(err);
            } else if (row) {
                // If stock exists, update the data
                db.run('UPDATE stocks SET data = ?, created_at = CURRENT_TIMESTAMP WHERE id = ?', [JSON.stringify(data), row.id], (err) => {
                    if (err) reject(err);
                    resolve(row.id); // Return the ID of the updated row
                });
            } else {
                // If stock does not exist, insert a new row
                db.run('INSERT INTO stocks (ticker, data) VALUES (?, ?)', [ticker, JSON.stringify(data)], function (err) {
                    if (err) reject(err);
                    resolve(this.lastID); // Resolve with the ID of the newly inserted row
                });
            }
        });
    });
};



// Function to get all stock data
const getStocks = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM stocks', (err, rows) => {
            if (err) reject(err);
            resolve(rows);
        });
    });
};

// Export the database and functions
module.exports = {
    db,
    saveStock,
    getStocks
};
