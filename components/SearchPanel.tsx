import React, { useState, useEffect, useRef } from 'react';
import type { User, Page } from '../types';
import { SearchIcon, XIcon } from './icons';

interface SearchPanelProps {
    isOpen: boolean;
    onClose: () => void;
    users: User[];
    navigateTo: (page: Page, userId?: string) => void;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({ isOpen, onClose, users, navigateTo }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const panelRef = useRef<HTMLDivElement>(null);

    // Effect to handle clicks outside the panel to close it
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);


    const filteredUsers = searchTerm
        ? users.filter(user =>
            (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.handle.toLowerCase().includes(searchTerm.toLowerCase())) &&
            user.id !== 'chatbot-assistant' // Exclude chatbot from search results
        )
        : [];

    const handleNavigation = (userId: string) => {
        navigateTo('profile', userId);
        setSearchTerm('');
        onClose();
    };

    return (
        <div className={`fixed inset-0 z-40 transition-opacity duration-300 ${isOpen ? 'bg-black bg-opacity-50' : 'bg-opacity-0 pointer-events-none'}`}>
            <div 
                ref={panelRef}
                className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 w-80 flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                        <h1 className="text-xl font-bold">Search</h1>
                         <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                            <XIcon className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="relative mt-4">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search for users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-100 dark:bg-gray-800 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-highlight"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {searchTerm && filteredUsers.length === 0 && (
                        <p className="text-gray-500 dark:text-gray-400 text-center mt-8">No users found.</p>
                    )}
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredUsers.map(user => (
                            <div key={user.id} onClick={() => handleNavigation(user.id)} className="flex items-center space-x-3 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <img src={user.avatarUrl} alt={user.name} className="h-12 w-12 rounded-full" />
                                <div>
                                    <p className="font-semibold">{user.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">@{user.handle}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};