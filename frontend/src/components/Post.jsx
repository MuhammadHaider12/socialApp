import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHeart, FiMessageCircle, FiShare2, FiMoreHorizontal, FiTrash2 } from 'react-icons/fi';

const Post = ({ post, onLike, onComment, onDelete }) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const currentUserId = user?._id || user?.id;
  const isLiked = post.likes?.includes(currentUserId);
  const isOwnPost = post.user._id === currentUserId;

  const handleComment = (e) => {
    e.preventDefault();
    if (commentText.trim() && onComment) {
      onComment(post._id, commentText);
      setCommentText('');
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffMs = now - postDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return postDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getAvatar = (name) => {
    return name?.charAt(0).toUpperCase() || 'U';
  };

  const handleDelete = async () => {
    if (onDelete) {
      try {
        await onDelete(post._id);
        setShowDeleteConfirm(false);
        setShowOptions(false);
      } catch (err) {
        console.error('Error deleting post:', err);
        alert('Failed to delete post. Please try again.');
      }
    }
  };

  return (
    <article className="post-card">
      {/* Post Header */}
      <div className="post-header">
        <div className="post-user-info">
          <Link to={`/profile/${post.user._id}`} className="user-avatar">
            {getAvatar(post.user.name)}
          </Link>
          <div className="user-details">
            <Link to={`/profile/${post.user._id}`} className="username">
              {post.user.name}
            </Link>
            <span className="post-time">{formatDate(post.createdAt)}</span>
          </div>
        </div>
        <button className="options-btn" onClick={() => setShowOptions(!showOptions)}>
          <FiMoreHorizontal />
        </button>
        {showOptions && (
          <div className="options-menu">
            <button>Report</button>
            {isOwnPost && (
              <button 
                className="delete-btn"
                onClick={() => {
                  setShowDeleteConfirm(true);
                  setShowOptions(false);
                }}
              >
                <FiTrash2 />
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      {/* Post Content */}
      <div className="post-body">
        <p className="post-content">{post.content}</p>
        {post.image && (
          <div className="post-image">
            <img src={post.image} alt="Post content" loading="lazy" />
          </div>
        )}
      </div>

      {/* Post Stats */}
      <div className="post-stats">
        <span className="stat-item">{post.likes?.length || 0} likes</span>
        <span className="stat-item">{post.comments?.length || 0} comments</span>
      </div>

      {/* Post Actions */}
      <div className="post-footer">
        <button 
          className={`action-btn like-btn ${isLiked ? 'liked' : ''}`}
          onClick={() => onLike && onLike(post._id)}
          disabled={!onLike}
          title="Like"
        >
          <FiHeart 
            style={{
              fill: isLiked ? '#e74c3c' : 'none',
              color: isLiked ? '#e74c3c' : '#ffffff',
              strokeWidth: isLiked ? 0 : 2
            }}
          />
          <span>Like</span>
        </button>
        
        <button 
          className="action-btn comment-btn"
          onClick={() => setShowComments(!showComments)}
          title="Comment"
        >
          <FiMessageCircle />
          <span>Comment</span>
        </button>

        {/* <button 
          className="action-btn share-btn"
          title="Share"
        >
          <FiShare2 />
          <span>Share</span>
        </button> */}
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="comments-section">
          {post.comments?.length > 0 ? (
            <div className="comments-list">
              {post.comments.map((comment, index) => (
                <div key={index} className="comment-item">
                  <Link to={`/profile/${comment.user?._id}`} className="comment-avatar">
                    {getAvatar(comment.user?.name)}
                  </Link>
                  <div className="comment-content">
                    <Link to={`/profile/${comment.user?._id}`} className="comment-author">
                      {comment.user?.name}
                    </Link>
                    <p className="comment-text">{comment.text}</p>
                    <span className="comment-time">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-comments">No comments yet</div>
          )}
          
          <form className="add-comment" onSubmit={handleComment}>
            <input
              type="text"
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button type="submit" disabled={!commentText.trim()}>Post</button>
          </form>
        </div>
      )}
    </article>
  );
};

export default Post;