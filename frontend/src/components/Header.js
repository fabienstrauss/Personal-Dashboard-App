import React, {useState} from 'react';
import './Header.css';

function Header() {

    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <header className="header">
            <div className="logo">Personal Dashboard</div>
            <div className="header-buttons">
                <button className="profile-button" onClick={toggleMenu}></button>
                <div className={`popup-menu ${menuOpen ? 'active' : ''}`}>
                    <button>Profile</button>
                    <button>Settings</button>
                    <button>Logout</button>
                </div>
            </div>
        </header>
    );
}

export default Header;