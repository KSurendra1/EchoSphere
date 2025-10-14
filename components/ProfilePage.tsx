import React, { useState, useRef, useCallback } from 'react';
import type { User, Post, Page } from '../types';
import { PostModal } from './PostModal';
import { VideoIcon } from './icons';

interface ProfilePageProps {
    user: User;
    currentUser: User;
    posts: Post[];
    totalPostCount: number;
    onEditProfile: () => void;
    onToggleFollow: (targetUserId: string) => void;
    onViewPost: (post: Post) => void;
    hasMorePosts: boolean;
    loadMorePosts: () => void;
}

const ProfileHeader: React.FC<{ user: User; postCount: number; currentUser: User; onEditProfile: () => void; onToggleFollow: (userId: string) => void; }> = ({ user, postCount, currentUser, onEditProfile, onToggleFollow }) => {
    
    const isCurrentUser = user.id === currentUser.id;
    const isFollowing = currentUser.following.includes(user.id);
    
    return (
        <div className="p-4 md:p-8 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4 md:space-x-8">
                <img src={user.avatarUrl} alt={user.name} className="h-20 w-20 md:h-36 md:w-36 rounded-full object-cover" />
                <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                        <h1 className="text-2xl font-light">{user.handle}</h1>
                        {isCurrentUser ? (
                            <button onClick={onEditProfile} className="px-4 py-1.5 text-sm font-semibold rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                Edit Profile
                            </button>
                        ) : (
                            <button onClick={() => onToggleFollow(user.id)} className={`px-4 py-1.5 text-sm font-semibold rounded ${isFollowing ? 'border border-gray-300 dark:border-gray-600' : 'bg-highlight text-white'}`}>
                                {isFollowing ? 'Following' : 'Follow'}
                            </button>
                        )}
                    </div>
                    <div className="hidden md:flex space-x-6 mb-3">
                        <span><span className="font-semibold">{postCount}</span> posts</span>
                        <span><span className="font-semibold">{user.followers.length}</span> followers</span>
                        <span><span className="font-semibold">{user.following.length}</span> following</span>
                    </div>
                    <div>
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{user.bio}</p>
                    </div>
                </div>
            </div>
            <div className="flex md:hidden justify-around border-t border-gray-200 dark:border-gray-700 mt-4 pt-4 text-center">
                 <span><span className="font-semibold block">{postCount}</span> posts</span>
                 <span><span className="font-semibold block">{user.followers.length}</span> followers</span>
                 <span><span className="font-semibold block">{user.following.length}</span> following</span>
            </div>
        </div>
    );
};

const PostGrid: React.FC<{ posts: Post[], onPostClick: (post: Post) => void }> = ({ posts, onPostClick }) => (
    <div className="grid grid-cols-3 gap-1">
        {posts.map(post => (
            <div key={post.id} className="relative aspect-square cursor-pointer group" onClick={() => onPostClick(post)}>
                {post.mediaType === 'image' && <img src={post.mediaUrl} alt="post" className="w-full h-full object-cover" />}
                {post.mediaType === 'video' && (
                     <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <VideoIcon className="h-12 w-12 text-white opacity-70" />
                    </div>
                )}
                <div className="absolute top-2 right-2">
                     {post.mediaType === 'video' && <VideoIcon className="h-5 w-5 text-white" />}
                </div>

                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center space-x-4 text-white">
                    <span className="opacity-0 group-hover:opacity-100 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                        {post.likes.length}
                    </span>
                    <span className="opacity-0 group-hover:opacity-100 flex items-center">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.839 8.839 0 01-4.082-.952l-1.024.542a1 1 0 01-1.23-1.23l.542-1.024A8.839 8.839 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM4.5 10a5.5 5.5 0 1111 0 5.5 5.5 0 01-11 0z" clipRule="evenodd" /></svg>
                        {post.comments.length}
                    </span>
                </div>
            </div>
        ))}
    </div>
);


export const ProfilePage: React.FC<ProfilePageProps> = ({ user, currentUser, posts, totalPostCount, onEditProfile, onToggleFollow, onViewPost, hasMorePosts, loadMorePosts }) => {
    
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
                <h1 className="text-xl font-bold">{user.name}</h1>
            </div>
            <ProfileHeader 
                user={user} 
                postCount={totalPostCount} 
                currentUser={currentUser}
                onEditProfile={onEditProfile}
                onToggleFollow={onToggleFollow}
            />
            <PostGrid posts={posts} onPostClick={onViewPost} />
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