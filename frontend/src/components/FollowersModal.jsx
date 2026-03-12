import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FiX, FiUserPlus, FiUserCheck } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import '../styles/FollowersModal.css';

const FollowersModal = ({ userId, onClose, token }) => {
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, updateUser } = useAuth();

  useEffect(() => {
    fetchFollowers();
  }, [userId, token]);

  const fetchFollowers = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/users/${userId}/followers`, {
        headers: { 'x-auth-token': token }
      });
      setFollowers(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching followers:', err);
      setError('Failed to load followers');
      setLoading(false);
    }
  };

  const handleFollow = async (followerId) => {
    try {
      await axios.put(`http://localhost:5000/api/users/follow/${followerId}`, {}, {
        headers: { 'x-auth-token': token }
      });

      if (user) {
        updateUser({
          ...user,
          following: [...(user.following || []), followerId]
        });
      }

      // Update followers list UI
      setFollowers(followers.map(f => 
        f._id === followerId ? { ...f, isFollowed: true } : f
      ));
    } catch (err) {
      console.error('Error following user:', err);
    }
  };

  const handleUnfollow = async (followerId) => {
    try {
      await axios.put(`http://localhost:5000/api/users/unfollow/${followerId}`, {}, {
        headers: { 'x-auth-token': token }
      });

      if (user) {
        updateUser({
          ...user,
          following: (user.following || []).filter(id => id !== followerId)
        });
      }

      // Update followers list UI
      setFollowers(followers.map(f => 
        f._id === followerId ? { ...f, isFollowed: false } : f
      ));
    } catch (err) {
      console.error('Error unfollowing user:', err);
    }
  };

  const getAvatar = (name) => {
    return name?.charAt(0).toUpperCase() || 'U';
  };

  const currentUserId = user?._id || user?.id;
  const isCurrentUser = (followerId) => followerId === currentUserId;

  if (loading) {
    return (
      <div className="followers-modal-overlay" onClick={onClose}>
        <div className="followers-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Followers</h2>
            <button className="close-btn" onClick={onClose}>
              <FiX />
            </button>
          </div>
          <div className="modal-content loading">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="followers-modal-overlay" onClick={onClose}>
      <div className="followers-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Followers ({followers.length})</h2>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="modal-content">
          {followers.length > 0 ? (
            <div className="users-list">
              {followers.map(follower => {
                const isFollowing = user?.following?.includes(follower._id) || false;
                const isCurrent = isCurrentUser(follower._id);

                return (
                  <div key={follower._id} className="user-item">
                    <div className="user-avatar">
                      <div className="avatar-circle">
                        {getAvatar(follower.name)}
                      </div>
                    </div>

                    <div className="user-info">
                      <Link to={`/profile/${follower._id}`} className="username">
                        {follower.name}
                        {isCurrent && <span className="you-badge">(You)</span>}
                      </Link>
                      <p className="user-email">{follower.email}</p>
                    </div>

                    {!isCurrent && (
                      <button
                        className={`follow-btn ${isFollowing ? 'following' : ''}`}
                        onClick={() => isFollowing ? handleUnfollow(follower._id) : handleFollow(follower._id)}
                      >
                        {isFollowing ? (
                          <>
                            <FiUserCheck />
                            Following
                          </>
                        ) : (
                          <>
                            <FiUserPlus />
                            Follow
                          </>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-message">No followers yet</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowersModal;
