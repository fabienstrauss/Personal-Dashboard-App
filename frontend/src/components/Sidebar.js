import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';
import { ReactComponent as SettingsIcon } from '../assets/svg/settings.svg';
import { ReactComponent as EditIcon } from '../assets/svg/edit.svg';

function Sidebar() {
    const [pages, setPages] = useState([]);

    useEffect(() => {
        const fetchPages = () => {
            if (window.electron && window.electron.ipcRenderer) {
                window.electron.ipcRenderer.invoke('get-selected-pages').then((result) => {
                    setPages(result);
                }).catch((error) => {
                    console.error('Error fetching selected pages:', error);
                });
            }
        };

        fetchPages();  // Initial fetch when the component mounts

        if (window.electron && window.electron.ipcRenderer) {
            window.electron.ipcRenderer.on('refresh-sidebar', fetchPages);
        }

        return () => {
            if (window.electron && window.electron.ipcRenderer) {
                window.electron.ipcRenderer.removeListener('refresh-sidebar', fetchPages);
            }
        };
    }, []);


    const [isShrunk, setIsShrunk] = useState(false);
    const navigate = useNavigate();

    const toggleSidebar = () => {
        setIsShrunk(!isShrunk);
    };

    const navigateTo = (path) => {
        navigate(path);
    };

    const iconMap = {
        BarLineChartIcon: require('../assets/svg/bar-line-chart.svg').ReactComponent,
        BookmarkIcon: require('../assets/svg/bookmark.svg').ReactComponent,
        BookOpenIcon: require('../assets/svg/book-open.svg').ReactComponent,
        CalendarIcon: require('../assets/svg/calendar.svg').ReactComponent,
        CalendarDateIcon: require('../assets/svg/calendar-date.svg').ReactComponent,
        CheckDoneIcon: require('../assets/svg/check-done.svg').ReactComponent,
        ClipboardIcon: require('../assets/svg/clipboard.svg').ReactComponent,
        CloudIcon: require('../assets/svg/cloud.svg').ReactComponent,
        CoinSwapIcon: require('../assets/svg/coin-swap.svg').ReactComponent,
        HomeIcon: require('../assets/svg/home.svg').ReactComponent,
        PilcrowIcon: require('../assets/svg/pilcrow.svg').ReactComponent,
        StickerSquareIcon: require('../assets/svg/sticker-square.svg').ReactComponent,
        ThermometerIcon: require('../assets/svg/thermometer.svg').ReactComponent,
    };

    const categories = pages.reduce((acc, page) => {
        if (!acc[page.category]) {
            acc[page.category] = [];
        }
        acc[page.category].push(page);
        return acc;
    }, {});

    return (
        <nav className={`sidebar ${isShrunk ? 'shrunk' : 'expanded'}`}>
            <div className="sidebar-header">
                <button className="hide-button" onClick={toggleSidebar}>
                    <i className={`fas fa-chevron-${isShrunk ? 'right' : 'left'}`}></i>
                </button>
                {!isShrunk &&
                    <button onClick={() => navigateTo('/edit')} className="editButton">
                        <EditIcon className="settingsIcon"/>
                    </button>}
            </div>

            {!isShrunk && (
                <div className="sidebar-content">
                    {Object.keys(categories).map((category) => (
                        <div key={category} className="section">
                            <h4>{category}</h4>
                            <ul>
                                {categories[category].map((page) => {
                                    const IconComponent = iconMap[page.icon];
                                    return (
                                        <li key={page.id}>
                                            <button onClick={() => navigateTo(page.route)} className="nav-button">
                                                <IconComponent className="icon"/>
                                                {page.name}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </div>
            )}

            <div className="sidebar-footer">
                <button onClick={() => navigateTo('/settings')} className="footerButton">
                    <SettingsIcon className="settingsIcon"/>
                </button>
            </div>
        </nav>
    );
}

export default Sidebar;