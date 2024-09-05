import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import './Edit.css';
import { ReactComponent as PlusIcon } from '../assets/svg/plus.svg';
import { ReactComponent as MinusIcon } from '../assets/svg/minus.svg';

function EditPage() {
    const [pages, setPages] = useState([]);
    const { refreshSidebar } = useOutletContext();

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = () => {
        if (window.electron && window.electron.ipcRenderer) {
            window.electron.ipcRenderer.invoke('get-all-pages').then((result) => {
                const filteredPages = result.filter(page => page.name !== 'Home');
                setPages(filteredPages);
            }).catch((error) => {
                console.error('Error fetching pages:', error);
            });
        }
    };

    const togglePageSelection = (id, selected) => {
        if (window.electron && window.electron.ipcRenderer) {
            window.electron.ipcRenderer.invoke('toggle-page-selection', { id, selected })
                .then(() => {
                    fetchPages();  // Re-fetch pages to update the UI

                    // Notify the main process to refresh the sidebar
                    window.electron.ipcRenderer.send('refresh-sidebar');
                })
                .catch((error) => {
                    console.error('Error updating page selection:', error);
                });
        }
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
        <div className="edit-page">
            <h1>Edit Pages</h1>
            {Object.keys(categories).map((category) => (
                <div key={category} className="category-section">
                    <h2>{category}</h2>
                    <div className="category-items">
                        {categories[category].map((page) => {
                            const IconComponent = iconMap[page.icon];
                            return (
                                <button key={page.id} className="edit-page-item" onClick={() => togglePageSelection(page.id, page.selected)}>
                                    <IconComponent className="icon" />
                                    <span>{page.name}</span>
                                    {page.selected ? (
                                        <MinusIcon className="toggle-icon" />
                                    ) : (
                                        <PlusIcon className="toggle-icon" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default EditPage;