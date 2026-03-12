import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FiUserPlus, FiUserCheck } from 'react-icons/fi';
import '../styles/Explore.css';

const Explore = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token, user, updateUser } = useAuth();

  useEffect(() => {
    console.log('Explore component mounted');
    console.log('Token exists:', !!token);
    console.log('User exists:', !!user);
    if (token && user) {
      fetchAllUsers();
    } else {
      console.log('No token or user, skipping fetch');
      setLoading(false);
    }
  }, [token, user]);

  const fetchAllUsers = async () => {
    try {
      console.log('Fetching users with token:', token);
      console.log('Current user:', user);
      const res = await axios.get('http://localhost:5000/api/users', {
        headers: { 'x-auth-token': token }
      });
      console.log('API response:', res.data);
      // Filter out current user from suggestions
      const filteredUsers = res.data.filter(u => u._id !== user?._id && u._id !== user?.id);
      console.log('Current user id:', user?.id);
      console.log('All users before filtering:', res.data.map(u => ({ id: u._id, name: u.name })));
      console.log('Filtered users:', filteredUsers);
      setUsers(filteredUsers);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      console.error('Error response:', err.response);
      console.error('Error status:', err.response?.status);
      console.error('Error data:', err.response?.data);
      setError(err.response?.data?.msg || 'Failed to fetch users');
      setLoading(false);
      // Show error state
      setUsers([]);
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

      // Update the users list to reflect the follow - increment followers count
      setUsers(users.map(u =>
        u._id === userId ? { 
          ...u, 
          followers: [...(u.followers || []), user.id]
        } : u
      ));
    } catch (err) {
      console.error('Error following user:', err);
      alert('Failed to follow user. Please try again.');
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      await axios.put(`http://localhost:5000/api/users/unfollow/${userId}`, {}, {
        headers: { 'x-auth-token': token }
      });

      // Update user data in context
      if (user) {
        updateUser({
          ...user,
          following: (user.following || []).filter(followId => followId !== userId)
        });
      }

      // Update the users list to reflect the unfollow - decrement followers count
      setUsers(users.map(u =>
        u._id === userId ? { 
          ...u, 
          followers: (u.followers || []).filter(followerId => followerId !== user.id)
        } : u
      ));
    } catch (err) {
      console.error('Error unfollowing user:', err);
      alert('Failed to unfollow user. Please try again.');
    }
  };

  const getAvatar = (name) => {
    return name?.charAt(0).toUpperCase() || 'U';
  };

  if (loading) {
    return (
      <div className="explore-container">
        <div className="explore-header">
          <h1>Explore</h1>
          <p>Discover and follow other users</p>
        </div>
        <div className="loading">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="explore-container">
      <div className="explore-header">
        <h1>Explore</h1>
        <p>Discover and follow other users</p>
        {!loading && (
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            {users.length} user{users.length !== 1 ? 's' : ''} found
          </p>
        )}
      </div>

      <>
        <div className="users-grid">
          {users.length > 0 ? (
            users.map(userData => {
              const isFollowing = user?.following?.includes(userData._id) || false;
              const currentUserId = user?._id || user?.id;
              const isCurrentUser = userData._id === currentUserId;

              return (
                <div key={userData._id} className={`user-card ${isCurrentUser ? 'current-user' : ''}`}>
                  <div className="user-avatar">
                    <div className="avatar-circle">
                      {userData.profilePicture ? (
                        <img
                          src={userData.profilePicture}
                          alt={userData.name + " profile"}
                          className="avatar-img"
                        />
                      ) : (
                        <span className="avatar-initial">{getAvatar(userData.name)}</span>
                      )}
                    </div>
                  </div>

                  <div className="user-info">
                    <h3 className="user-name">
                      {userData.name}
                      {isCurrentUser && <span className="current-user-badge">(You)</span>}
                    </h3>
                    <p className="user-email">{userData.email}</p>
                    <div className="user-stats">
                      <span>{userData.followers?.length || 0} followers</span>
                      <span>{userData.following?.length || 0} following</span>
                    </div>
                  </div>

                  {!isCurrentUser && (
                    <button
                      className={`follow-btn ${isFollowing ? 'following' : ''}`}
                      onClick={() => isFollowing ? handleUnfollow(userData._id) : handleFollow(userData._id)}
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
                  {isCurrentUser && (
                    <div className="current-user-indicator">
                      <span>Your Profile</span>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="no-users-message">
              <p>No users found in the database.</p>
            </div>
          )}
        </div>

        {users.length === 0 && (
          <div className="no-users">
            <p>No other users found. Be the first to invite friends!</p>
            <div style={{ marginTop: '1rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px', fontSize: '0.9rem' }}>
              <p><strong>Debug Information:</strong></p>
              <p>Users array length: {users.length}</p>
              <p>Token exists: {!!token ? 'Yes' : 'No'}</p>
              <p>User exists: {!!user ? 'Yes' : 'No'}</p>
              <p>Current user ID: {user?.id || 'None'}</p>
              <p>Loading state: {loading ? 'Loading' : 'Loaded'}</p>
              {error && <p style={{ color: 'red' }}>Error: {error}</p>}
              <p style={{ marginTop: '0.5rem', color: '#666' }}>
                Check browser console for more detailed logs.
              </p>
            </div>
          </div>
        )}
      </>
    </div>
  );
};

export default Explore;