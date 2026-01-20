import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    User,
    FileText,
    CreditCard,
    Info,
    HelpCircle,
    LogOut,
    LayoutDashboard,
    ShoppingBag
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar, isDesktopCollapsed }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Design Colors
    const colors = {
        primary: '#6A4C9C', // Deep Purple
        secondary: '#4DA1D6', // Light Blue/Cyan
        active: '#3B8AC0', // Slightly darker blue for active state
        text: '#FFFFFF'
    };

    // Updated Order: Dashboard, Orders, Quotations, My Wallet, Info, Profile, Help
    const menuItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/receiver-dashboard' },
        { name: 'Orders', icon: <ShoppingBag size={20} />, path: '/orders' }, // Assuming path
        { name: 'Quotations', icon: <FileText size={20} />, path: '/quotations' },
        { name: 'My Wallet', icon: <CreditCard size={20} />, path: '/wallet' },
        { name: 'Info', icon: <Info size={20} />, path: '/info' },
        { name: 'Profile', icon: <User size={20} />, path: '/profile' },
        { name: 'Help', icon: <HelpCircle size={20} />, path: '/help' },
    ];

    const handleNavigation = (path) => {
        navigate(path);
        if (window.innerWidth < 768) {
            toggleSidebar(); // Close on mobile after click
        }
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar Container */}
            <div className={`
                fixed top-0 left-0 h-full z-50 transition-all duration-300 ease-in-out shadow-2xl
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0 md:static md:h-full
                ${isDesktopCollapsed ? 'w-64 md:w-20' : 'w-64'}
                flex flex-col
            `} style={{ backgroundColor: colors.secondary }}>

                {/* Navigation Menu */}
                <div className="flex-1 py-6 space-y-1 overflow-x-hidden">
                    {menuItems.map((item, index) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <button
                                key={index}
                                onClick={() => handleNavigation(item.path)}
                                title={isDesktopCollapsed ? item.name : ''}
                                className={`
                                    w-full flex items-center gap-4 px-6 py-4 text-white transition-all duration-200
                                    ${isActive ? 'bg-white/20 font-semibold border-r-4 border-white' : 'hover:bg-white/10'}
                                    ${isDesktopCollapsed ? 'justify-center md:px-0' : ''}
                                `}
                            >
                                <span className={`${isActive ? 'opacity-100 scale-110' : 'opacity-80'} transition-transform duration-200`}>
                                    {item.icon}
                                </span>
                                <span className={`tracking-wide text-sm whitespace-nowrap transition-opacity duration-200 ${isDesktopCollapsed ? 'md:hidden' : 'block'}`}>
                                    {item.name}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Logout Footer */}
                <div className="p-4 border-t border-white/10">
                    <button
                        onClick={logout}
                        title={isDesktopCollapsed ? "Logout" : ""}
                        className={`
                            w-full flex items-center gap-4 px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors duration-200
                            ${isDesktopCollapsed ? 'justify-center' : ''}
                        `}
                    >
                        <LogOut size={20} />
                        <span className={`font-medium whitespace-nowrap ${isDesktopCollapsed ? 'md:hidden' : 'block'}`}>Logout</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
