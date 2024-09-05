import React from 'react';
import { Routes, Route } from 'react-router-dom';

import MainLayout from './components/MainLayout';
import Home from './pages/Home';
import Stocks from './pages/StocksPage';
import Notes from './pages/Notes';
import Settings from './pages/Settings';
import Bookmarks from './pages/Bookmarks';
import Edit from './pages/Edit';
import Calendar from './pages/Calendar';
import ToDo from './pages/ToDo';
import Weather from './pages/Weather';
import QOTD from './pages/QOTD';
import Moodboards from './pages/Moodboards';
import DividendCalendar from './pages/DividendCalendar';
import StockNews from './pages/StockNews';
import MarketHeatmap from './pages/MarketHeatmap';
import CurrencyConverter from './pages/CurrencyConverter';
import TestPage from './pages/TestPage';

function App() {
    return (
        <Routes>
            <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="stocks" element={<Stocks />} />
                <Route path="notes" element={<Notes />} />
                <Route path="bookmarks" element={<Bookmarks />} />
                <Route path="settings" element={<Settings />} />
                <Route path="edit" element={<Edit />} />
                <Route path="calendar" element={<Calendar />} />
                <Route path="todo" element={<ToDo />} />
                <Route path="weather" element={<Weather />} />
                <Route path="qotd" element={<QOTD />} />
                <Route path="moodboards" element={<Moodboards />} />
                <Route path="dividend_calendar" element={<DividendCalendar />} />
                <Route path="stock_news" element={<StockNews />} />
                <Route path="markt_heatmap" element={<MarketHeatmap />} />
                <Route path="currency_converter" element={<CurrencyConverter />} />
                <Route path="test" element={<TestPage />} />
            </Route>
        </Routes>
    );
}

export default App;