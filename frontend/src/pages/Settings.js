import React, { useState, useEffect } from 'react';

function Settings() {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });

    useEffect(() => {
        document.body.classList.toggle('dark-theme', isDarkMode);
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    return (
        <div>
            <h1>Einstellungen</h1>
            <label>
                Dark Mode
                <input
                    type="checkbox"
                    checked={isDarkMode}
                    onChange={toggleTheme}
                />
            </label>
        </div>
    );
}

export default Settings;