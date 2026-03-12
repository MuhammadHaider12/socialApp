import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FiImage, FiX, FiSmile } from 'react-icons/fi';

const CreatePost = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const { token, user } = useAuth();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !image) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('content', content);
    if (image) {
      formData.append('image', image);
    }

    try {
      const res = await axios.post('http://localhost:5000/api/posts', formData, {
        headers: { 
          'x-auth-token': token,
          'Content-Type': 'multipart/form-data'
        }
      });
      onPostCreated(res.data);
      setContent('');
      setImage(null);
      setImagePreview(null);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const getAvatar = (name) => {
    return name?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <div className="create-post-card">
      <div className="create-post-header">
        <div className="create-avatar">
          {getAvatar(user?.name)}
        </div>
        <form onSubmit={handleSubmit} className="create-post-form">
          <textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength="500"
            className="create-post-input"
          />
          
          {imagePreview && (
            <div className="create-image-preview">
              <img src={imagePreview} alt="Preview" />
              <button 
                type="button" 
                className="remove-image-btn"
                onClick={removeImage}
              >
                <FiX />
              </button>
            </div>
          )}

          <div className="create-post-actions">
            <div className="create-post-tools">
              <label htmlFor="image-upload" className="image-upload-btn" title="Add photo">
                <FiImage />
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              <button type="button" className="emoji-btn" title="Add emoji">
                <FiSmile />
              </button>
            </div>
            <button 
              type="submit" 
              className="post-btn"
              disabled={loading || (!content.trim() && !image)}
            >
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;