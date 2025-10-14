import React, { useState, useRef } from 'react';
import type { User } from '../types';

interface EditProfileModalProps {
    user: User;
    onUpdateProfile: (updatedData: Partial<User>) => void;
    onClose: () => void;
}

const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                resolve(event.target.result as string);
            } else {
                reject(new Error("Couldn't read file"));
            }
        };
        reader.onerror = (error) => {
            reject(error);
        };
        reader.readAsDataURL(file);
    });
};

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ user, onUpdateProfile, onClose }) => {
    const [name, setName] = useState(user.name);
    const [bio, setBio] = useState(user.bio);
    const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                const dataUri = await fileToDataUri(file);
                setAvatarUrl(dataUri);
            } catch (error) {
                console.error("Error converting file to data URI:", error);
            }
        }
    };

    const handleSave = () => {
        onUpdateProfile({ name, bio, avatarUrl });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-4">
                <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
                <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                        <img src={avatarUrl} alt="Profile" className="h-32 w-32 rounded-full object-cover" />
                         <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-0 right-0 bg-highlight text-white p-2 rounded-full hover:bg-blue-500 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                                <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                            </svg>
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                    </div>
                     <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Name"
                        className="w-full bg-gray-100 dark:bg-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"
                    />
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Bio"
                        className="w-full bg-gray-100 dark:bg-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight resize-none"
                        rows={3}
                    />
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                    <button onClick={handleSave} className="bg-highlight px-4 py-2 rounded-lg text-white font-semibold hover:bg-blue-500 transition-colors">Save</button>
                </div>
            </div>
        </div>
    );
};
