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
    <div className="flex items-start space-x-3 mt-3">
        <img src={author?.avatarUrl} alt={author?.name} className="h-8 w-8 rounded-full" />
        <p className="text-sm">
            <span className="font-bold mr-2">{author?.handle}</span>
            {comment.text}
        </p>
    </div>
);

interface PostProps {
    post: PostType;
    author: User;
    currentUser: User;
    usersById: Record<string, User>;
    onLike: (postId: string) => void;
    onAddComment: (postId: string, text: string) => void;
    onEditPost: (postId:string, newContent: string) => void;
    navigateTo: (page: Page, userId?: string) => void;
}

export const Post: React.FC<PostProps> = ({ post, author, currentUser, usersById, onLike, onAddComment, onEditPost, navigateTo }) => {
    const [commentText, setCommentText] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(post.content);
    const [showLikeAnimation, setShowLikeAnimation] = useState(false);
    const isLiked = post.likes.includes(currentUser.id);

    const handleCommentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (commentText.trim()) {
            onAddComment(post.id, commentText);
            setCommentText('');
        }
    };
    
    const handleLikeClick = () => {
        if (!isLiked) {
            setShowLikeAnimation(true);
            setTimeout(() => {
                setShowLikeAnimation(false);
            }, 1000); // Duration of the ping animation
        }
        onLike(post.id);
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

    return (
        <div className="py-4">
            <div className="flex items-center justify-between px-4 mb-3">
                <div className="flex items-center space-x-3">
                     <img src={author?.avatarUrl} alt={author?.name} className="h-10 w-10 rounded-full cursor-pointer" onClick={() => navigateTo('profile', author.id)} />
                     <div>
                        <span className="font-bold cursor-pointer" onClick={() => navigateTo('profile', author.id)}>{author?.handle}</span>
                     </div>
                </div>
                {currentUser.id === author.id && !isEditing && (
                    <button onClick={() => setIsEditing(true)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                        <PencilIcon className="h-5 w-5" />
                    </button>
                )}
            </div>
            
            {post.mediaUrl && (
                <div className="bg-gray-100 dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700">
                    {post.mediaType === 'image' ? (
                         <img src={post.mediaUrl} alt="Post content" className="w-full h-auto object-cover" style={{maxHeight: '70vh'}}/>
                    ) : post.mediaType === 'video' ? (
                        <video src={post.mediaUrl} controls className="w-full h-auto" style={{maxHeight: '70vh'}} />
                    ) : null}
                </div>
            )}
            
            <div className="px-4">
                <div className="relative flex justify-start space-x-4 py-3">
                    <button onClick={handleLikeClick} className={`transform transition-transform duration-150 ease-in-out ${isLiked ? 'scale-110' : 'hover:scale-110'}`}>
                        <HeartIcon className={`h-7 w-7 ${isLiked ? 'text-red-500' : 'hover:text-red-500'}`} filled={isLiked} />
                    </button>
                    <button>
                        <CommentIcon className="h-7 w-7" />
                    </button>
                    {showLikeAnimation && (
                        <div className="absolute top-3 left-0 pointer-events-none">
                            <HeartIcon
                                filled
                                className="h-7 w-7 text-red-500 animate-ping"
                            />
                        </div>
                    )}
                </div>

                {post.likes.length > 0 && (
                     <p className="font-bold text-sm">{post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}</p>
                )}

                {isEditing ? (
                    <div className="mt-2">
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
                    <p className="mt-2 text-sm">
                        <span className="font-bold mr-2 cursor-pointer" onClick={() => navigateTo('profile', author.id)}>{author?.handle}</span>
                        {post.content}
                    </p>
                )}

                {post.comments.length > 2 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">View all {post.comments.length} comments</p>
                )}
                
                {post.comments.slice(0, 2).map(comment => (
                    <Comment key={comment.id} comment={comment} author={usersById[comment.authorId]} />
                ))}

                 <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mt-3">{timeAgo(post.timestamp)} ago</p>
            </div>
            
             <form onSubmit={handleCommentSubmit} className="border-t border-gray-200 dark:border-gray-700 mt-4 px-4 py-2">
                <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full bg-transparent focus:outline-none text-sm"
                />
            </form>
        </div>
    );
};