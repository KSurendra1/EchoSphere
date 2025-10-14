
import React from 'react';
import type { Notification, User, Post, Page } from '../types';
import { HeartIcon, CommentIcon, ProfileIcon, VideoIcon } from './icons';

interface NotificationsPageProps {
    notifications: Notification[];
    usersById: Record<string, User>;
    postsById: Record<string, Post>;
    onViewPost: (post: Post) => void;
}

const NotificationItem: React.FC<{ notification: Notification; actor: User; post?: Post; onViewPost: (post: Post) => void; }> = ({ notification, actor, post, onViewPost }) => {
    
    const PostThumbnail: React.FC<{post: Post}> = ({ post }) => (
        <div className="ml-auto w-12 h-12 flex-shrink-0 cursor-pointer" onClick={() => onViewPost(post)}>
            {post.mediaType === 'image' && <img src={post.mediaUrl} className="w-full h-full object-cover rounded" />}
            {post.mediaType === 'video' && (
                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                    <VideoIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                </div>
            )}
        </div>
    );

    const getNotificationContent = () => {
        const base = (
            <div className="flex-1">
                <img src={actor.avatarUrl} alt={actor.name} className="h-8 w-8 rounded-full inline-block mr-2" />
                <span className="font-semibold">{actor.handle}</span>
            </div>
        );

        switch (notification.type) {
            case 'like':
                return <><HeartIcon className="h-8 w-8 text-red-500 mr-4" filled /> {base} liked your post.</>;
            case 'comment':
                 return <><CommentIcon className="h-8 w-8 text-blue-500 mr-4" /> {base} commented on your post.</>;
            case 'follow':
                 return <><ProfileIcon className="h-8 w-8 text-green-500 mr-4" /> {base} started following you.</>;
            default:
                return null;
        }
    };

    return (
        <div className={`flex items-center p-4 border-b border-gray-200 dark:border-gray-700 ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
            <div className="flex items-center w-full">
                {getNotificationContent()}
                {post && (notification.type === 'like' || notification.type === 'comment') && <PostThumbnail post={post} />}
            </div>
        </div>
    );
};

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ notifications, usersById, postsById, onViewPost }) => {
    return (
        <div>
            <div className="sticky top-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md z-10 p-4 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-xl font-bold">Notifications</h1>
            </div>
            <div>
                {notifications.length > 0 ? (
                    notifications.map(notification => {
                        const actor = usersById[notification.actorId];
                        const post = notification.postId ? postsById[notification.postId] : undefined;
                        if (!actor) return null;
                        return <NotificationItem key={notification.id} notification={notification} actor={actor} post={post} onViewPost={onViewPost} />;
                    })
                ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 p-8">No notifications yet.</p>
                )}
            </div>
        </div>
    );
};
