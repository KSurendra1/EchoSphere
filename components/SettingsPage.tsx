import React, { useState } from 'react';
import type { User } from '../types';

const SettingsSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="py-6">
        <h2 className="text-lg font-semibold text-gray-500 dark:text-gray-400 px-4">{title}</h2>
        <div className="mt-2 divide-y divide-gray-200 dark:divide-gray-700">
            {children}
        </div>
    </div>
);

const SettingsItem: React.FC<{ label: string, description?: string, action?: React.ReactNode, onClick?: () => void }> = ({ label, description, action, onClick }) => (
    <div onClick={onClick} className={`p-4 flex justify-between items-center ${onClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50' : ''} transition-colors`}>
        <div>
            <p className="font-medium">{label}</p>
            {description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>}
        </div>
        {action && <div>{action}</div>}
    </div>
);

const ToggleSwitch: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
    <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-highlight"></div>
    </label>
);


const ChangePasswordModal: React.FC<{ onClose: () => void; onSave: () => void; }> = ({ onClose, onSave }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-4">
                 <h2 className="text-xl font-bold mb-4">Change Password</h2>
                 <div className="space-y-4">
                     <input type="password" placeholder="Current Password" className="w-full bg-gray-100 dark:bg-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight" />
                     <input type="password" placeholder="New Password" className="w-full bg-gray-100 dark:bg-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight" />
                     <input type="password" placeholder="Confirm New Password" className="w-full bg-gray-100 dark:bg-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight" />
                 </div>
                 <div className="flex justify-end space-x-4 mt-6">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                    <button onClick={() => { onSave(); onClose(); }} className="bg-highlight px-4 py-2 rounded-lg text-white font-semibold hover:bg-blue-500 transition-colors">Save Changes</button>
                 </div>
            </div>
        </div>
    );
};


interface SettingsPageProps {
    currentUser: User;
    usersById: Record<string, User>;
    onEditProfile: () => void;
    onChangePassword: () => void;
    onTogglePrivacy: () => void;
    onUnblockUser: (userId: string) => void;
    onChangeTheme: (theme: 'light' | 'dark') => void;
    currentTheme: 'light' | 'dark';
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ currentUser, usersById, onEditProfile, onChangePassword, onTogglePrivacy, onUnblockUser, onChangeTheme, currentTheme }) => {
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    return (
        <div>
            <div className="sticky top-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md z-10 p-4 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-xl font-bold">Settings</h1>
            </div>
            <div>
                <SettingsSection title="Account">
                    <SettingsItem label="Edit Profile" description="Change your name, bio, and profile picture." onClick={onEditProfile} />
                    <SettingsItem label="Change Password" description="Update your login credentials." onClick={() => setIsPasswordModalOpen(true)} />
                </SettingsSection>
                 <SettingsSection title="Privacy">
                    <SettingsItem 
                        label="Private Account" 
                        description="Make your posts visible only to your followers."
                        action={<ToggleSwitch checked={currentUser.isPrivate} onChange={onTogglePrivacy} />}
                    />
                    <SettingsItem label="Blocked Accounts" description="Manage the accounts you've blocked." />
                     {currentUser.blockedUsers.length > 0 ? currentUser.blockedUsers.map(userId => {
                         const user = usersById[userId];
                         return (
                            <div key={userId} className="p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <div className="flex items-center space-x-3">
                                    <img src={user.avatarUrl} alt={user.name} className="h-10 w-10 rounded-full" />
                                    <div>
                                        <p className="font-semibold">{user.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">@{user.handle}</p>
                                    </div>
                                </div>
                                <button onClick={() => onUnblockUser(userId)} className="px-3 py-1 text-sm font-semibold rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800">
                                    Unblock
                                </button>
                            </div>
                         )
                     }) : <p className="text-sm text-gray-500 dark:text-gray-400 p-4">You haven't blocked any accounts.</p>}
                </SettingsSection>
                 <SettingsSection title="Theme">
                    <SettingsItem 
                        label="Appearance" 
                        description={`Currently in ${currentTheme === 'dark' ? 'Dark' : 'Light'} mode.`}
                        action={
                            <div className="flex space-x-2">
                                <button onClick={() => onChangeTheme('light')} className={`px-4 py-2 rounded-lg text-sm ${currentTheme === 'light' ? 'bg-highlight text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Light</button>
                                <button onClick={() => onChangeTheme('dark')} className={`px-4 py-2 rounded-lg text-sm ${currentTheme === 'dark' ? 'bg-highlight text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Dark</button>
                            </div>
                        }
                    />
                </SettingsSection>
            </div>
            {isPasswordModalOpen && <ChangePasswordModal onClose={() => setIsPasswordModalOpen(false)} onSave={onChangePassword} />}
        </div>
    );
};