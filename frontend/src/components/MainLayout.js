import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Breadcrumb from './Breadcrumb';
import CustomTitleBar from './CustomTitleBar';
import './MainLayout.css';

function MainLayout() {

    const [refreshKey, setRefreshKey] = useState(0);

    const refreshSidebar = () => {
        setRefreshKey(oldKey => oldKey + 1);
    };

    return (
        <div className="layout">
            <CustomTitleBar />
            {/*<Header className="header" />*/}
            <div className="body">
                <Sidebar key={refreshKey} className="sidebar"/>
                    <div className="main-content">
                        <Breadcrumb className="breadcrumb"/>
                        <Outlet context={{ refreshSidebar }}/>
                    </div>
            </div>
        </div>
    );
}

export default MainLayout;