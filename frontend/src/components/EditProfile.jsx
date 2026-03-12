import React, { useState } from 'react';
import axios from 'axios';
import { FiX } from 'react-icons/fi';
import '../styles/EditProfile.css';

const EditProfile = ({ user, onClose, onUpdate, token }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    profilePicture: user?.profilePicture || '', // url to image
    backgroundPicture: user?.backgroundPicture || '' // url to image
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const form = new FormData();
      form.append('image', file);
      const res = await axios.post(
        'http://localhost:5000/api/users/upload',
        form,
        {
          headers: {
            'x-auth-token': token,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      setFormData(prev => ({
        ...prev,
        [field]: res.data.url
      }));
      setLoading(false);
    } catch (err) {
      setError('Image upload failed');
      setLoading(false);
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.put(
        'http://localhost:5000/api/users/update/profile',
        {
          name: formData.name,
          bio: formData.bio,
          profilePicture: formData.profilePicture,
          backgroundPicture: formData.backgroundPicture
        },
        {
          headers: { 'x-auth-token': token }
        }
      );

      onUpdate(res.data.user);
      setLoading(false);
      alert('Profile updated successfully!');
      onClose();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update profile');
      setLoading(false);
    }
  };

  return (
    <div className="edit-profile-modal-overlay" onClick={onClose}>
      <div className="edit-profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="edit-profile-header">
          <h2>Edit Profile</h2>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="edit-profile-form">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself"
              rows="4"
              maxLength="160"
            />
            <small>{formData.bio.length}/160</small>
          </div>

          <div className="form-group">
            <label htmlFor="profilePicture">Profile Picture URL or upload</label>
            <input
              type="text"
              id="profilePicture"
              name="profilePicture"
              placeholder="https://example.com/photo.jpg"
              value={formData.profilePicture}
              onChange={handleChange}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, 'profilePicture')}
            />
            {formData.profilePicture && (
              <div className="image-preview">
                <img src={formData.profilePicture} alt="Profile Preview" />
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="backgroundPicture">Background Picture URL or upload</label>
            <input
              type="text"
              id="backgroundPicture"
              name="backgroundPicture"
              placeholder="https://example.com/bg.jpg"
              value={formData.backgroundPicture}
              onChange={handleChange}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, 'backgroundPicture')}
            />
            {formData.backgroundPicture && (
              <div className="image-preview">
                <img src={formData.backgroundPicture} alt="Background Preview" />
              </div>
            )}
          </div>

          <div className="form-buttons">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
