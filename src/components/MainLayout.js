import React from 'react';
import SidebarWrapper from './Sidebar';

const MainLayout = ({ children }) => {
  return (
    <div className="d-flex">
      <SidebarWrapper />
      <main className="main-content flex-grow-1">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
