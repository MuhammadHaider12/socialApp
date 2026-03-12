import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../styles/MessagesPage.css';

const MessagesPage = () => {
  const { token, user } = useAuth();
  const [selectedUser, setSelectedUser] = useState(null);
  const [followedUsers, setFollowedUsers] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    if (token) fetchFollowedUsers();
  }, [token]);

  useEffect(() => {
    if (token && selectedUser) fetchConversation(selectedUser._id);
  }, [token, selectedUser]);

  const fetchFollowedUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users/me', {
        headers: { 'x-auth-token': token }
      });
      // Show users you follow
      const followedIds = res.data.following || [];
      const usersRes = await axios.get('http://localhost:5000/api/users', {
        headers: { 'x-auth-token': token }
      });
      setFollowedUsers(usersRes.data.filter(u => followedIds.includes(u._id)));
    } catch {}
  };

  const fetchConversation = async (userId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/conversations/${userId}`, {
        headers: { 'x-auth-token': token }
      });
      setConversation(res.data);
    } catch {}
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedUser) return;
    try {
      await axios.post(`http://localhost:5000/api/conversations/${selectedUser._id}`, {
        text: messageText
      }, {
        headers: { 'x-auth-token': token }
      });
      setMessageText('');
      fetchConversation(selectedUser._id);
    } catch {}
  };

  return (
    <div className="messages-page">
      <h2>Messages</h2>
      <div className="messages-layout">
        <aside className="messages-users">
          <h3>Followed Users</h3>
          <ul>
            {followedUsers.map(u => (
              <li key={u._id} onClick={() => setSelectedUser(u)} className={selectedUser?._id === u._id ? 'active' : ''}>
                <img src={u.profilePicture && u.profilePicture.startsWith('http') ? u.profilePicture : '/assets/react.svg'} alt="avatar" className="user-avatar" />
                <span className="user-name">{u.name}</span>
              </li>
            ))}
          </ul>
        </aside>
        <section className="messages-chat">
          {selectedUser ? (
            <>
              <h3>Chat with {selectedUser.name}</h3>
              <div className="messages-list">
                {conversation && conversation.messages.length > 0 ? (
                  conversation.messages.map((m, i) => (
                    <div key={i} className={`message-item ${m.sender === user._id ? 'sent' : 'received'}`}>
                      <div className="bubble">
                        <span>{m.text}</span>
                        <div className="timestamp">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="messages-empty">No messages yet.</div>
                )}
              </div>
              <div className="messages-input">
                <input
                  type="text"
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  placeholder="Type a message..."
                />
                <button onClick={sendMessage}>Send</button>
              </div>
            </>
          ) : (
            <div className="messages-empty">Select a user to start chatting.</div>
          )}
        </section>
      </div>
    </div>
  );
};

export default MessagesPage;
