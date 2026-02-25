import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const DashboardLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar />

      {/* Main content area �" offset by sidebar width */}
      <div className="ml-64 flex flex-col min-h-screen transition-all duration-300">
        <TopBar />

        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
