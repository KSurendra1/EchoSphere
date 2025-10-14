
import React, { useState } from 'react';
import type { Post as PostType, User, Comment as CommentType, Page } from '../types';
import { HeartIcon, CommentIcon, PencilIcon } from './icons';

const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "m";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "min";
    return Math.floor(seconds) + "s";
};

const Comment: React.FC<{ comment: CommentType, author?: User }> = ({ comment, author }) => (
    <div className="flex items-start space-x-3">
        <img src={author?.avatarUrl} alt={author?.name} className="h-8 w-8 rounded-full" />
        <div className="text-sm">
            <p>
                <span className="font-bold mr-2">{author?.handle}</span>
                {comment.text}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{timeAgo(comment.timestamp)} ago</p>
        </div>
    </div>
);

interface PostModalProps {
    post: PostType;
    author: User;
    currentUser: User;
    usersById: Record<string, User>;
    onLike: (postId: string) => void;
    onAddComment: (postId: string, text: string) => void;
    onEditPost: (postId: string, newContent: string) => void;
    navigateTo: (page: Page, userId?: string) => void;
    onClose: () => void;
}

export const PostModal: React.FC<PostModalProps> = ({ post, author, currentUser, usersById, onLike, onAddComment, onEditPost, navigateTo, onClose }) => {
    const [commentText, setCommentText] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(post.content);
    const isLiked = post.likes.includes(currentUser.id);

    const handleCommentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (commentText.trim()) {
            onAddComment(post.id, commentText);
            setCommentText('');
        }
    };

    const handleSaveEdit = () => {
        if (editedContent.trim()) {
            onEditPost(post.id, editedContent);
            setIsEditing(false);
        }
    };

    const handleCancelEdit = () => {
        setEditedContent(post.content);
        setIsEditing(false);
    };
    
    const handleNavigate = (page: Page, userId?: string) => {
        onClose(); // Close modal before navigating
        navigateTo(page, userId);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={onClose}>
            <button onClick={onClose} className="absolute top-4 right-4 text-white text-4xl font-light z-50">&times;</button>
            <div className="bg-white dark:bg-gray-800 w-full max-w-5xl h-full max-h-[90vh] flex mx-4 rounded-lg overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="w-1/2 md:w-3/5 bg-black flex items-center justify-center">
                    {post.mediaType === 'image' && <img src={post.mediaUrl} alt={post.content} className="max-h-full max-w-full object-contain"/>}
                    {post.mediaType === 'video' && <video src={post.mediaUrl} controls autoPlay className="max-h-full max-w-full object-contain"/>}
                </div>
                <div className="w-1/2 md:w-2/5 flex flex-col border-l border-gray-200 dark:border-gray-700">
                    <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-3">
                            <img src={author?.avatarUrl} alt={author?.name} className="h-10 w-10 rounded-full cursor-pointer" onClick={() => handleNavigate('profile', author.id)} />
                            <span className="font-bold cursor-pointer" onClick={() => handleNavigate('profile', author.id)}>{author?.handle}</span>
                        </div>
                        {currentUser.id === author.id && !isEditing && (
                            <button onClick={() => setIsEditing(true)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                                <PencilIcon className="h-5 w-5" />
                            </button>
                        )}
                    </header>
                    <main className="flex-1 overflow-y-auto p-4 space-y-4">
                        <div className="flex items-start space-x-3">
                            <img src={author?.avatarUrl} alt={author?.name} className="h-8 w-8 rounded-full" />
                            <div className="text-sm">
                                {isEditing ? (
                                    <div>
                                        <textarea
                                            value={editedContent}
                                            onChange={(e) => setEditedContent(e.target.value)}
                                            className="w-full bg-gray-100 dark:bg-gray-700 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight resize-y"
                                            rows={3}
                                            autoFocus
                                        />
                                        <div className="flex justify-end space-x-2 mt-2">
                                            <button onClick={handleCancelEdit} className="px-3 py-1 text-sm rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                                            <button onClick={handleSaveEdit} className="bg-highlight px-3 py-1 text-sm rounded-full text-white font-semibold hover:bg-blue-500 transition-colors disabled:opacity-50" disabled={!editedContent.trim()}>Save</button>
                                        </div>
                                    </div>
                                ) : (
                                    <p>
                                        <span className="font-bold mr-2 cursor-pointer" onClick={() => handleNavigate('profile', author.id)}>{author?.handle}</span>
                                        {post.content}
                                    </p>
                                )}
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{timeAgo(post.timestamp)} ago</p>
                            </div>
                        </div>
                        <div className="border-t border-gray-200 dark:border-gray-700 -mx-4"></div>
                        {post.comments.map(comment => (
                            <Comment key={comment.id} comment={comment} author={usersById[comment.authorId]} />
                        ))}
                    </main>
                    <footer className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex justify-start space-x-4">
                            <button onClick={() => onLike(post.id)} className={`transform transition-transform duration-150 ease-in-out ${isLiked ? 'scale-110' : 'hover:scale-110'}`}>
                                <HeartIcon className={`h-7 w-7 ${isLiked ? 'text-red-500' : 'hover:text-red-500'}`} filled={isLiked} />
                            </button>
                            <button>
                                <CommentIcon className="h-7 w-7" />
                            </button>
                        </div>
                        {post.likes.length > 0 && (
                            <p className="font-bold text-sm mt-2">{post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}</p>
                        )}
                    </footer>
                    <form onSubmit={handleCommentSubmit} className="border-t border-gray-200 dark:border-gray-700 p-4">
                        <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Add a comment..."
                            className="w-full bg-transparent focus:outline-none text-sm"
                        />
                    </form>
                </div>
            </div>
        </div>
    );
};
