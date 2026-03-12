import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Post from '../components/Post';
import CreatePost from '../components/CreatePost';
import Stories from '../components/Stories';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token, user, updateUser } = useAuth();

  useEffect(() => {
    fetchPosts();
    fetchSuggestions();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/posts', {
        headers: { 'x-auth-token': token }
      });
      setPosts(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching posts:', err);
      if (err.response?.status === 401) {
        console.log('Token might be expired');
      }
      setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users', {
        headers: { 'x-auth-token': token }
      });
      // Filter out current user and already-followed users
      const filteredSuggestions = res.data.filter(u =>
        u._id !== user?._id &&
        u._id !== user?.id &&
        !(user.following && user.following.includes(u._id))
      );
      setSuggestions(filteredSuggestions);
    } catch (err) {
      console.error('Error fetching suggestions:', err);
    }
  };

  const handleNewPost = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const handleLike = async (postId) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/posts/like/${postId}`, {}, {
        headers: { 'x-auth-token': token }
      });
      
      setPosts(posts.map(post => 
        post._id === postId ? { ...post, likes: res.data } : post
      ));
    } catch (err) {
      console.error('Error liking post:', err);
      alert('Failed to like post. Please try again.');
    }
  };

  const handleComment = async (postId, text) => {
    try {
      const res = await axios.post(`http://localhost:5000/api/posts/comment/${postId}`, 
        { text },
        { headers: { 'x-auth-token': token } }
      );
      
      setPosts(posts.map(post => 
        post._id === postId ? { ...post, comments: res.data } : post
      ));
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('Failed to add comment. Please try again.');
    }
  };

  const handleDelete = async (postId) => {
    try {
      await axios.delete(`http://localhost:5000/api/posts/${postId}`, {
        headers: { 'x-auth-token': token }
      });
      
      // Remove the post from the posts array
      setPosts(posts.filter(post => post._id !== postId));
    } catch (err) {
      console.error('Error deleting post:', err);
      throw err; // Re-throw so the Post component can handle the error
    }
  };

  const handleFollow = async (userId) => {
    try {
      await axios.put(`http://localhost:5000/api/users/follow/${userId}`, {}, {
        headers: { 'x-auth-token': token }
      });

      // Update user data in context
      if (user) {
        updateUser({
          ...user,
          following: [...(user.following || []), userId]
        });
      }

      // Update suggestions to remove followed user
      setSuggestions(suggestions.filter(u => u._id !== userId));

      // Refresh posts to include new followed user's posts
      fetchPosts();
    } catch (err) {
      console.error('Error following user:', err);
      alert('Failed to follow user. Please try again.');
    }
  };

  if (loading) return (
    <div className="loading">
      <div className="spinner"></div>
    </div>
  );

  return (
    <div className="feed">
      <div className="feed-main">
        {/* <Stories /> */}
        <CreatePost onPostCreated={handleNewPost} />
        <div className="posts-container">
          {posts.length > 0 ? (
            posts.map(post => (
              <Post 
                key={post._id} 
                post={post} 
                onLike={handleLike}
                onComment={handleComment}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <div className="no-posts">
              <p>No posts yet. Follow people to see their posts!</p>
            </div>
          )}
        </div>
      </div>
      <aside className="feed-sidebar">
        <div className="suggestions">
          <h3>Suggestions for you</h3>
          <div className="suggestions-list">
            {suggestions.length > 0 ? (
              suggestions.slice(0, 5).map(suggestion => (
                <div key={suggestion._id} className="suggestion-item">
                  <div className="suggestion-avatar">
                    {suggestion.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="suggestion-info">
                    <p className="suggestion-name">{suggestion.name}</p>
                    <p className="suggestion-email">{suggestion.email}</p>
                  </div>
                  <button
                    className="follow-btn-small"
                    onClick={() => handleFollow(suggestion._id)}
                  >
                    Follow
                  </button>
                </div>
              ))
            ) : (
              <p className="no-suggestions">No suggestions at this time</p>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Feed;