import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu, Bell, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = ({ children }) => {
    const { user } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [desktopCollapsed, setDesktopCollapsed] = useState(false);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
    const toggleDesktopSidebar = () => setDesktopCollapsed(!desktopCollapsed);

    // Helper to get name safely
    const getUserName = () => {
        if (!user) return 'User Name';
        // Handle potential nested user object or direct properties
        return user.name || user.user?.name || 'User Name';
    };

    const getUserInitial = () => {
        const name = getUserName();
        return name.charAt(0).toUpperCase();
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
            {/* Top Header - Sticky & Full Width */}
            <header className="bg-[#5b4d9d] shadow-md sticky top-0 z-30 h-20 flex-none flex items-center justify-between px-6 md:px-10 text-white">

                {/* Left: Branding & Toggle */}
                <div className="flex items-center gap-4">
                    {/* Mobile Toggle */}
                    <button
                        onClick={toggleSidebar}
                        className="p-2 -ml-2 rounded-lg hover:bg-white/10 md:hidden text-white transition-colors"
                    >
                        <Menu size={24} />
                    </button>

                    {/* Desktop Toggle (Minimizes Sidebar) */}
                    <button
                        onClick={toggleDesktopSidebar}
                        className="hidden md:block p-2 -ml-2 rounded-lg hover:bg-white/10 text-white transition-colors"
                        title={desktopCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        <Menu size={24} />
                    </button>

                    <h1 className="text-2xl font-extrabold tracking-tight">
                        Akalimo
                    </h1>
                </div>

                {/* Right: Profile & Actions */}
                <div className="flex items-center gap-6">
                    {/* Notification Bell */}
                    <button className="relative p-2 text-white/80 hover:text-white transition-colors rounded-full hover:bg-white/10">
                        <Bell size={20} />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                    </button>

                    {/* User Profile */}
                    <div className="flex items-center gap-4 pl-6 border-l border-white/20">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold leading-tight text-white">
                                {getUserName()}
                            </p>
                            <p className="text-xs text-white/70 font-medium">
                                {user?.location || user?.user?.location || 'Location'}
                            </p>
                        </div>
                        {/* Avatar - White Circle with colored Icon */}
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white flex items-center justify-center text-[#5b4d9d] font-bold text-lg shadow-md">
                            {getUserName() !== 'User Name' ? getUserInitial() : <User size={24} strokeWidth={2.5} />}
                        </div>
                    </div>
                </div>
            </header>

            {/* Content Wrapper (Sidebar + Main) */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <Sidebar
                    isOpen={sidebarOpen}
                    toggleSidebar={toggleSidebar}
                    isDesktopCollapsed={desktopCollapsed}
                />

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
