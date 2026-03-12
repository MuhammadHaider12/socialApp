import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FiX, FiUserPlus, FiUserCheck } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import '../styles/FollowingModal.css';

const FollowingModal = ({ userId, onClose, token }) => {
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, updateUser } = useAuth();

  useEffect(() => {
    fetchFollowing();
  }, [userId, token]);

  const fetchFollowing = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/users/${userId}/following`, {
        headers: { 'x-auth-token': token }
      });
      setFollowing(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching following:', err);
      setError('Failed to load following');
      setLoading(false);
    }
  };

  const handleFollow = async (followingId) => {
    try {
      await axios.put(`http://localhost:5000/api/users/follow/${followingId}`, {}, {
        headers: { 'x-auth-token': token }
      });

      if (user) {
        updateUser({
          ...user,
          following: [...(user.following || []), followingId]
        });
      }

      // Update following list UI
      setFollowing(following.map(f => 
        f._id === followingId ? { ...f, isFollowed: true } : f
      ));
    } catch (err) {
      console.error('Error following user:', err);
    }
  };

  const handleUnfollow = async (followingId) => {
    try {
      await axios.put(`http://localhost:5000/api/users/unfollow/${followingId}`, {}, {
        headers: { 'x-auth-token': token }
      });

      if (user) {
        updateUser({
          ...user,
          following: (user.following || []).filter(id => id !== followingId)
        });
      }

      // Update following list UI
      setFollowing(following.map(f => 
        f._id === followingId ? { ...f, isFollowed: false } : f
      ));
    } catch (err) {
      console.error('Error unfollowing user:', err);
    }
  };

  const getAvatar = (name) => {
    return name?.charAt(0).toUpperCase() || 'U';
  };

  const currentUserId = user?._id || user?.id;
  const isCurrentUser = (followingId) => followingId === currentUserId;

  if (loading) {
    return (
      <div className="following-modal-overlay" onClick={onClose}>
        <div className="following-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Following</h2>
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
    <div className="following-modal-overlay" onClick={onClose}>
      <div className="following-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Following ({following.length})</h2>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="modal-content">
          {following.length > 0 ? (
            <div className="users-list">
              {following.map(followingUser => {
                const isFollowing = user?.following?.includes(followingUser._id) || false;
                const isCurrent = isCurrentUser(followingUser._id);

                return (
                  <div key={followingUser._id} className="user-item">
                    <div className="user-avatar">
                      <div className="avatar-circle">
                        {getAvatar(followingUser.name)}
                      </div>
                    </div>

                    <div className="user-info">
                      <Link to={`/profile/${followingUser._id}`} className="username">
                        {followingUser.name}
                        {isCurrent && <span className="you-badge">(You)</span>}
                      </Link>
                      <p className="user-email">{followingUser.email}</p>
                    </div>

                    {!isCurrent && (
                      <button
                        className={`follow-btn ${isFollowing ? 'following' : ''}`}
                        onClick={() => isFollowing ? handleUnfollow(followingUser._id) : handleFollow(followingUser._id)}
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
            <div className="empty-message">Not following anyone yet</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowingModal;
