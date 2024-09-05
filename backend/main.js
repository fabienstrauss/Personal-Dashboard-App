const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { db } = require('./database');
const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');

let mainWindow;

async function createWindow() {
    const isDev = await import('electron-is-dev').then(module => module.default);

    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        title: '',
        titleBarStyle: 'hiddenInset', // or hidden (see electron documentation for explanation)
        backgroundColor: '#F9F9F9',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
        },
    });

    const startUrl = isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, 'build/index.html')}`;
    mainWindow.loadURL(startUrl);

/*
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
 */

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// IPC handler to get all pages
ipcMain.handle('get-all-pages', (event) => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM pages', [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
});

// IPC handler to toggle page selection
ipcMain.handle('toggle-page-selection', (event, { id, selected }) => {
    return new Promise((resolve, reject) => {
        const newSelected = selected ? 0 : 1;
        db.run('UPDATE pages SET selected = ? WHERE id = ?', [newSelected, id], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();

                // Send a message to the renderer process to refresh the sidebar
                mainWindow.webContents.send('refresh-sidebar');
            }
        });
    });
});

// IPC handler to refresh sidebar
ipcMain.on('refresh-sidebar', () => {
    // Notify the sidebar to refresh (if needed)
    mainWindow.webContents.send('refresh-sidebar');
});

// ---

/*
// Set up Express server
const server = express();
server.use(cors()); // Enable CORS for all routes

server.get('/test', (req, res) => {
    db.all("SELECT * FROM pages", [], (err, rows) => {
        if (err) {
            console.error('Error fetching pages:', err.message);
            res.status(500).send('Error fetching pages');
        } else {
            console.log('Fetched pages:', rows);
            res.json(rows);
        }
    });
});

// Start the Express server
server.listen(3001, () => {
    console.log('Express server running on http://localhost:3001');
});
 */

ipcMain.handle('get-selected-pages', (event) => {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT * FROM pages
            WHERE selected = 1
            ORDER BY
                CASE
                    WHEN name = 'Home' THEN 0
                    ELSE 1
                    END,
                name ASC
        `, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
});

// for the fetching of stock data via python script
ipcMain.handle('fetch-stock-data', async (event, ticker) => {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', [path.join(__dirname, 'scripts', 'fetch_stock_data.py'), ticker]);

        pythonProcess.stdout.on('data', (data) => {
            resolve(data.toString());
        });

        pythonProcess.stderr.on('data', (data) => {
            reject(data.toString());
        });
    });
});

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
