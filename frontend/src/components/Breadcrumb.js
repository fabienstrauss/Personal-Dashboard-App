import React from 'react';
import { useLocation } from 'react-router-dom';
import './Breadcrumb.css';

const routes = [
    { path: '/', name: 'Home', category: 'Allgemein', icon: 'HomeIcon' },
    { path: '/stocks', name: 'Aktien', category: 'Finanzen', icon: 'BarLineChartIcon' },
    { path: '/notes', name: 'Notizen', category: 'Allgemein', icon: 'StickerSquareIcon' },
    { path: '/calendar', name: 'Kalender', category: 'Allgemein', icon: 'CalendarIcon' },
    { path: '/todo', name: 'ToDo-Liste', category: 'Allgemein', icon: 'CheckDoneIcon' },
    { path: '/weather', name: 'Wetter', category: 'Allgemein', icon: 'CloudIcon' },
    { path: '/qotd', name: 'Zitat des Tages', category: 'Inspiration', icon: 'PilcrowIcon' },
    { path: '/moodboards', name: 'Moodboards', category: 'Inspiration', icon: 'ClipboardIcon' },
    { path: '/dividend_calendar', name: 'Dividendenkalender', category: 'Finanzen', icon: 'CalendarDateIcon' },
    { path: '/stock_news', name: 'Aktien Newsfeed', category: 'Finanzen', icon: 'BookOpenIcon' },
    { path: '/markt_heatmap', name: 'Markt-Heatmap', category: 'Finanzen', icon: 'ThermometerIcon' },
    { path: '/currency_converter', name: 'Währungsumrechner', category: 'Finanzen', icon: 'CoinSwapIcon' },
    { path: '/bookmarks', name: 'Lesezeichen', category: 'Allgemein', icon: 'BookmarkIcon' }
];

// Routes to exclude from the breadcrumb
const excludedRoutes = ['/settings', '/edit'];

function Breadcrumb() {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    // Helper function to get the route info by path
    const getRouteInfo = (pathname) => {
        return routes.find(route => route.path === pathname) || {};
    };

    return (
        <div className="breadcrumb">
            {pathnames.map((value, index) => {
                const to = `/${pathnames.slice(0, index + 1).join('/')}`;

                // Skip rendering if the route is in the excludedRoutes list
                if (excludedRoutes.includes(to)) {
                    return null;
                }

                const routeInfo = getRouteInfo(to);
                const last = index === pathnames.length - 1;

                return (
                    <span key={to}>
                        {!last && routeInfo.category && (
                            <span>{routeInfo.category} - </span>
                        )}
                        {last ? (
                            <span>{routeInfo.category ? `${routeInfo.category} - ${routeInfo.name || value}` : value}</span>
                        ) : (
                            <span>
                                <a href={to}>{routeInfo.name || value}</a> /
                            </span>
                        )}
                    </span>
                );
            })}
        </div>
    );
}

export default Breadcrumb;
