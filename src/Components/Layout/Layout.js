import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import './Layout.css';

function Layout({ children }) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  return (
    <div className="app-layout">
      <TopBar />
      <div className="app-body">
        <Sidebar
          expanded={sidebarExpanded}
          onToggleExpand={() => setSidebarExpanded(v => !v)}
        />
        <div className={`app-content ${sidebarExpanded ? 'sidebar-open' : ''}`}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default Layout;