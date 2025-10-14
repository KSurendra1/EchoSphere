import React from 'react';
import type { Page } from '../types';
import { HomeIcon, MessagesIcon, BellIcon, ProfileIcon, SettingsIcon, SearchIcon } from './icons';

interface NavbarProps {
    currentPage: Page;
    navigateTo: (page: Page, userId?: string) => void;
    currentUserId: string;
    unreadMessages: number;
    unreadNotifications: number;
    onOpenCreatePost: () => void;
    onToggleSearch: () => void;
}

const NavItem: React.FC<{
    label: string;
    icon: React.ReactNode;
    active: boolean;
    onClick: () => void;
    badgeCount?: number;
}> = ({ label, icon, active, onClick, badgeCount }) => (
    <button onClick={onClick} className="flex items-center space-x-4 p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors w-full">
        <div className="relative">
            {icon}
            {badgeCount && badgeCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {badgeCount}
                </span>
            )}
        </div>
        <span className={`text-xl hidden md:block ${active ? 'font-bold' : ''}`}>{label}</span>
    </button>
);

export const Navbar: React.FC<NavbarProps> = ({ currentPage, navigateTo, currentUserId, unreadMessages, unreadNotifications, onOpenCreatePost, onToggleSearch }) => {
    return (
        <nav className="h-screen sticky top-0 px-2 py-4 flex flex-col border-r border-gray-200 dark:border-gray-700 md:w-64 z-30">
            <div className="text-highlight text-3xl font-bold p-3 mb-4 hidden md:block">
                EchoSphere
            </div>
             <div className="text-highlight text-3xl font-bold p-3 mb-4 md:hidden">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
            </div>
            <div className="flex-1 space-y-2">
                <NavItem label="Home" icon={<HomeIcon className="h-7 w-7" />} active={currentPage === 'feed'} onClick={() => navigateTo('feed')} />
                <NavItem label="Search" icon={<SearchIcon className="h-7 w-7" />} active={false} onClick={onToggleSearch} />
                <NavItem label="Messages" icon={<MessagesIcon className="h-7 w-7" />} active={currentPage === 'messages'} onClick={() => navigateTo('messages')} badgeCount={unreadMessages} />
                <NavItem label="Notifications" icon={<BellIcon className="h-7 w-7" />} active={currentPage === 'notifications'} onClick={() => navigateTo('notifications')} badgeCount={unreadNotifications} />
                <NavItem label="Profile" icon={<ProfileIcon className="h-7 w-7" />} active={currentPage === 'profile'} onClick={() => navigateTo('profile', currentUserId)} />
                <NavItem label="Settings" icon={<SettingsIcon className="h-7 w-7" />} active={currentPage === 'settings'} onClick={() => navigateTo('settings')} />
            </div>
            <div className="mt-auto p-2">
                 <button onClick={onOpenCreatePost} className="w-full bg-highlight text-white font-bold py-3 px-4 rounded-full hover:bg-blue-500 transition-colors text-lg">
                    <span className="hidden md:block">Post</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:hidden mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                </button>
            </div>
        </nav>
    );
};