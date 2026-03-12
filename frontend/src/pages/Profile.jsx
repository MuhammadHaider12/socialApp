import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FiUserCheck, FiUserPlus, FiSend, FiEdit2 } from 'react-icons/fi';
import EditProfile from '../components/EditProfile';
import FollowersModal from '../components/FollowersModal';
import FollowingModal from '../components/FollowingModal';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const { id } = useParams();
  const { token, user, updateUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const isOwnProfile = user && (user._id === id || user.id === id);

  useEffect(() => {
    fetchProfile();
    fetchUserPosts();
  }, [id, token]);

  useEffect(() => {
    // Check if current user is following this profile
    if (profile && user && !isOwnProfile) {
      setIsFollowing(user.following?.includes(id) || false);
    }
  }, [profile, user, id, isOwnProfile]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/users/${id}`, {
        headers: { 'x-auth-token': token }
      });
      setProfile(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/posts', {
        headers: { 'x-auth-token': token }
      });
      // Filter posts by user
      const userPosts = res.data.filter(post => post.user._id === id);
      setPosts(userPosts);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await axios.put(`http://localhost:5000/api/users/unfollow/${id}`, {}, {
          headers: { 'x-auth-token': token }
        });
        setIsFollowing(false);
        
        // Update user data in context - remove from following
        if (user) {
          updateUser({
            ...user,
            following: (user.following || []).filter(followId => followId !== id)
          });
        }
      } else {
        await axios.put(`http://localhost:5000/api/users/follow/${id}`, {}, {
          headers: { 'x-auth-token': token }
        });
        setIsFollowing(true);
        
        // Update user data in context - add to following
        if (user) {
          updateUser({
            ...user,
            following: [...(user.following || []), id]
          });
        }
      }
    } catch (err) {
      console.error('Error updating follow status:', err);
      alert('Failed to update follow status. Please try again.');
    }
  };

  const getAvatar = (name) => {
    return name?.charAt(0).toUpperCase() || 'U';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  if (loading) return (
    <div className="loading">
      <div className="spinner"></div>
    </div>
  );

  if (!profile) return (
    <div className="error-container">
      <p>User not found</p>
      <button onClick={() => navigate('/')}>Back to Feed</button>
    </div>
  );

  return (
    <div className="profile-page">
      {/* Profile Header */}
      <div className="profile-header-card">
        <div className="profile-cover">
          {profile.backgroundPicture ? (
            <img src={profile.backgroundPicture} alt="Profile background" className="profile-bg-image" />
          ) : (
            <div className="profile-cover-gradient" />
          )}
        </div>
        
        <div className="profile-header-content">
          <div className="profile-avatar-large">
            {profile.profilePicture ? (
              <img src={profile.profilePicture} alt="Profile" className="profile-avatar-image" />
            ) : (
              getAvatar(profile.name)
            )}
          </div>
          
          <div className="profile-header-info">
            <div className="profile-title-section">
              <h1 className="profile-name">{profile.name}</h1>
              {authLoading ? (
                <div className="button-placeholder">
                  <div className="spinner-small"></div>
                </div>
              ) : isOwnProfile ? (
                <button className="edit-profile-btn" onClick={() => setShowEditProfile(true)}>
                  <FiEdit2 /> Edit Profile
                </button>
              ) : (
                <>
                  <button className={`follow-btn ${isFollowing ? 'following' : ''}`} onClick={handleFollow}>
                    {isFollowing ? (
                      <>
                        <FiUserCheck /> Following
                      </>
                    ) : (
                      <>
                        <FiUserPlus /> Follow
                      </>
                    )}
                  </button>
                  <button className="message-btn" onClick={handleMessage}>
                    <FiSend /> Message
                  </button>
                </>
              )}
            </div>
            
            <p className="profile-email">{profile.email}</p>
            
            {profile.bio && (
              <p className="profile-bio-text">{profile.bio}</p>
            )}
            
            <div className="profile-stats">
              <div className="stat">
                <span className="stat-value">{posts.length}</span>
                <span className="stat-label">posts</span>
              </div>
              <button className="stat stat-btn" onClick={() => setShowFollowersModal(true)}>
                <span className="stat-value">{profile.followers?.length || 0}</span>
                <span className="stat-label">followers</span>
              </button>
              <button className="stat stat-btn" onClick={() => setShowFollowingModal(true)}>
                <span className="stat-value">{profile.following?.length || 0}</span>
                <span className="stat-label">following</span>
              </button>
            </div>
            
            <p className="profile-bio">
              Member since {formatDate(profile.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="profile-content">
        <div className="posts-grid-section">
          <div className="grid-header">
            <h2>Posts</h2>
          </div>
          
          {posts.length > 0 ? (
            <div className="posts-grid">
              {posts.map(post => (
                <div key={post._id} className="grid-post">
                  {post.image ? (
                    <img src={post.image} alt="Post" />
                  ) : (
                    <div className="post-placeholder">
                      <p>{post.content.substring(0, 20)}...</p>
                    </div>
                  )}
                  <div className="post-overlay">
                    <div className="post-stats">
                      <span>❤️ {post.likes?.length || 0}</span>
                      <span>💬 {post.comments?.length || 0}</span>
                    </div>
                    {isOwnProfile && (
                      <button className="delete-post-btn" onClick={async () => {
                        if (window.confirm('Are you sure you want to delete this post?')) {
                          try {
                            await axios.delete(`http://localhost:5000/api/posts/${post._id}`, {
                              headers: { 'x-auth-token': token }
                            });
                            setPosts(posts.filter(p => p._id !== post._id));
                          } catch (err) {
                            alert('Failed to delete post.');
                          }
                        }
                      }}>
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-posts-grid">
              <p>No posts yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <EditProfile
          user={profile}
          onClose={() => setShowEditProfile(false)}
          onUpdate={(updatedUser) => {
            setProfile(updatedUser);
            updateUser(updatedUser);
          }}
          token={token}
        />
      )}

      {/* Followers Modal */}
      {showFollowersModal && (
        <FollowersModal
          userId={id}
          onClose={() => setShowFollowersModal(false)}
          token={token}
        />
      )}

      {/* Following Modal */}
      {showFollowingModal && (
        <FollowingModal
          userId={id}
          onClose={() => setShowFollowingModal(false)}
          token={token}
        />
      )}
    </div>
  );
};

export default Profile;