
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { User, Post, Page } from '../types';
import { Post as PostComponent } from './Post';
import { SparklesIcon, ImageIcon, VideoIcon } from './icons';
import { generateImageFromText } from '../services/geminiService';

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

export const CreatePostModal: React.FC<{ onCreatePost: (content: string, mediaUrl: string, mediaType: 'image' | 'video') => void, onClose: () => void }> = ({ onCreatePost, onClose }) => {
    const [prompt, setPrompt] = useState('');
    const [caption, setCaption] = useState('');
    const [mediaUrl, setMediaUrl] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(0); // 0: choice, 1: AI, 2: Upload, 3: Caption
    const imageInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    const handleGenerateImage = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        const generatedUrl = await generateImageFromText(prompt);
        if (generatedUrl) {
            setMediaUrl(generatedUrl);
            setMediaType('image');
            setStep(3); // Go to caption step
        }
        setIsLoading(false);
    };
    
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                const dataUri = await fileToDataUri(file);
                setMediaUrl(dataUri);
                setMediaType(file.type.startsWith('image') ? 'image' : 'video');
                setStep(3); // Go to caption step
            } catch (error) {
                console.error("Error converting file to data URI:", error);
            }
        }
    };
    
    const handleSharePost = () => {
        if (caption.trim() && mediaUrl && mediaType) {
            onCreatePost(caption, mediaUrl, mediaType);
            onClose();
        }
    };

    const resetFlow = () => {
        setStep(0);
        setMediaUrl(null);
        setMediaType(null);
        setPrompt('');
        setCaption('');
    };

    const renderStepContent = () => {
        switch (step) {
            case 1: // AI Generation
                return (
                    <>
                        <h3 className="text-lg font-semibold mb-4 text-center">Generate with AI</h3>
                        <p className="text-gray-500 dark:text-gray-400 my-4 text-sm">Enter a prompt and let AI create an image for your post.</p>
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., a photorealistic cat wearing sunglasses"
                            className="w-full bg-gray-100 dark:bg-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"
                        />
                        <div className="flex justify-end space-x-4 mt-6">
                            <button onClick={resetFlow} className="px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Back</button>
                            <button onClick={handleGenerateImage} disabled={isLoading || !prompt.trim()} className="bg-highlight px-4 py-2 rounded-lg text-white font-semibold disabled:opacity-50 hover:bg-blue-500 transition-colors flex items-center">
                                {isLoading ? 'Generating...' : 'Generate'}
                            </button>
                        </div>
                    </>
                );
            case 3: // Caption
                return (
                     <div>
                        {mediaType === 'image' && <img src={mediaUrl!} alt="Post preview" className="w-full rounded-lg max-h-96 object-contain bg-gray-800 dark:bg-gray-900" />}
                        {mediaType === 'video' && <video src={mediaUrl!} controls autoPlay loop muted className="w-full rounded-lg max-h-96 object-contain bg-gray-800 dark:bg-gray-900" />}
                         <textarea
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            placeholder="Write a caption..."
                            className="w-full bg-transparent text-lg placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none resize-none mt-4"
                            rows={4}
                        />
                        <div className="flex justify-end space-x-4 mt-4">
                            <button onClick={resetFlow} className="px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Back</button>
                            <button onClick={handleSharePost} disabled={!caption.trim()} className="bg-highlight px-4 py-2 rounded-lg text-white font-semibold disabled:opacity-50 hover:bg-blue-500 transition-colors">
                                Share
                            </button>
                        </div>
                    </div>
                );
            case 0: // Initial Choice
            default:
                return (
                    <>
                        <div className="flex flex-col items-center justify-center h-48">
                            <ImageIcon className="h-16 w-16 text-gray-400 dark:text-gray-500" />
                            <p className="text-gray-500 dark:text-gray-400 mt-4">Create a new post</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <button onClick={() => setStep(1)} className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Generate with AI</button>
                            <button onClick={() => imageInputRef.current?.click()} className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Upload Image</button>
                            <button onClick={() => videoInputRef.current?.click()} className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Upload Video</button>
                        </div>
                        <input type="file" ref={imageInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                        <input type="file" ref={videoInputRef} onChange={handleFileChange} className="hidden" accept="video/*" />
                    </>
                );
        }
    };
    

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg mx-4 transform transition-all">
                <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
                    <h2 className="text-xl font-bold text-center flex-grow">Create new post</h2>
                    <button onClick={onClose} className="text-2xl font-light leading-none">&times;</button>
                </div>
                {renderStepContent()}
            </div>
        </div>
    );
};


interface FeedProps {
    posts: Post[];
    currentUser: User;
    usersById: Record<string, User>;
    onLikePost: (postId: string) => void;
    onAddComment: (postId: string, text: string) => void;
    onEditPost: (postId: string, newContent: string) => void;
    navigateTo: (page: Page, userId?: string) => void;
    hasMorePosts: boolean;
    loadMorePosts: () => void;
}

export const Feed: React.FC<FeedProps> = ({ posts, currentUser, usersById, onLikePost, onAddComment, onEditPost, navigateTo, hasMorePosts, loadMorePosts }) => {
    
    const observer = useRef<IntersectionObserver | null>(null);
    const loaderRef = useCallback((node: HTMLDivElement | null) => {
        if (observer.current) observer.current.disconnect();
        
        if (node) {
            observer.current = new IntersectionObserver(entries => {
                if (entries[0].isIntersecting && hasMorePosts) {
                    loadMorePosts();
                }
            });
            observer.current.observe(node);
        }
    }, [hasMorePosts, loadMorePosts]);

    return (
        <div>
            <div className="sticky top-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md z-10 p-4 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-xl font-bold">Home</h1>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {posts.map(post => (
                    <PostComponent 
                        key={post.id} 
                        post={post} 
                        author={usersById[post.authorId]}
                        currentUser={currentUser}
                        usersById={usersById}
                        onLike={onLikePost}
                        onAddComment={onAddComment}
                        onEditPost={onEditPost}
                        navigateTo={navigateTo}
                    />
                ))}
            </div>
            <div ref={loaderRef} className="h-20 flex justify-center items-center">
                 {hasMorePosts && (
                    <svg className="animate-spin h-8 w-8 text-highlight" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                 )}
            </div>
        </div>
    );
};
