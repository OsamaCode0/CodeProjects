import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useWebSocket } from "../hooks/useWebSocket";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import "../styles/chats.css";

const API = import.meta.env.VITE_API_BASE_URL;

type Connection = {
  id: string;
  name: string;
  photoUrl: string;
  unreadCount?: number;
  userId?: string;
}

type Message = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export default function Chats() {
  const location = useLocation();
  const state = location.state as { selectedChatId?: string } | null;
  
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selected, setSelectedChat] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string>("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const token = localStorage.getItem("token");
  const myUserId = localStorage.getItem("userId");
  
  const { isConnected, on } = useWebSocket();
  const isOnline = useOnlineStatus(selectedUserId);

  useEffect(() => {
    loadConnections();
  }, []);

  useEffect(() => {
    if (state?.selectedChatId && connections.length > 0) {
      const connection = connections.find(c => c.id === state.selectedChatId);
      if (connection) {
        setSelectedChat(state.selectedChatId);
        setSelectedName(connection.name);
        setSelectedUserId(connection.userId || null);
        loadMessages(state.selectedChatId);
      }
    }
  }, [state?.selectedChatId, connections]);

  useEffect(() => {
    const unsubscribe = on('new_message', (msg) => {
      console.log('Received new message:', msg);
      
      if (selected === msg.chat_id) {
        setMessages(prev => [...prev, {
          id: msg.message_id!,
          sender_id: msg.sender_id!,
          content: msg.content!,
          created_at: msg.created_at!
        }]);
        markAsRead(msg.chat_id!);
      } else {
        setConnections(prev => prev.map(conn => 
          conn.id === msg.chat_id 
            ? { ...conn, unreadCount: (conn.unreadCount || 0) + 1 }
            : conn
        ));
      }
      loadConnections();
    });
    return unsubscribe;
  }, [selected, on]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConnections = async () => {
    try {
      const res = await fetch(`${API}/api/chats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await res.json();
      const chatsData = data.chats || [];
      const myId = localStorage.getItem('userId');
      
      const connectionsData = await Promise.all(
        chatsData.map(async (chat: any) => {
          const otherUserId = chat.user1_id === myId ? chat.user2_id : chat.user1_id;
          
          const userRes = await fetch(`${API}/users/${otherUserId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const userData = await userRes.json();
          
          return {
            id: chat.id,
            name: userData.name || 'User',
            photoUrl: userData.photo_url || '',
            unreadCount: chat.unread_count || 0,
            userId: otherUserId
          };
        })
      );
      
      setConnections(connectionsData);
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      const res = await fetch(`${API}/api/chats/${chatId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setMessages(data.messages || []);
      await markAsRead(chatId);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const markAsRead = async (chatId: string) => {
    try {
      await fetch(`${API}/api/chats/${chatId}/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      setConnections(prev => prev.map(conn => 
        conn.id === chatId ? { ...conn, unreadCount: 0 } : conn
      ));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!selected || !newMessage.trim()) return;
    try {
      await fetch(`${API}/api/chats/${selected}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ content: newMessage })
      });
      setNewMessage("");
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const totalUnread = connections.reduce((sum, conn) => sum + (conn.unreadCount || 0), 0);

  return (
    <div className="chat-page">
      <div className="chat-container">
        <div className="connections-sidebar">
          <div className="sidebar-header">
            <h2>
              💬 Chats 
              {totalUnread > 0 && <span className="total-unread-badge">{totalUnread}</span>}
            </h2>
            <div className="ws-status">
              <span className={`status-dot ${isConnected ? 'online' : 'offline'}`}></span>
              {isConnected ? 'Connected' : 'Connecting...'}
            </div>
          </div>
          <div className="connections-list">
            {connections.length === 0 ? (
              <div className="empty-state">
                <p>No chats yet</p>
                <small>Match with someone to start chatting!</small>
              </div>
            ) : (
              connections.map(conn => (
                <div 
                  key={conn.id}
                  className={`connection-item ${selected === conn.id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedChat(conn.id);
                    setSelectedName(conn.name);
                    setSelectedUserId(conn.userId || null);
                    loadMessages(conn.id);
                  }}
                >
                  <div className="connection-avatar">
                    {conn.photoUrl ? (
                      <img src={conn.photoUrl} alt={conn.name} />
                    ) : (
                      <div className="avatar-placeholder">
                        {conn.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="connection-info">
                    <div className="connection-name">{conn.name}</div>
                    {conn.unreadCount && conn.unreadCount > 0 && (
                      <span className="unread-badge">{conn.unreadCount}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="messages-container">
          {selected ? (
            <>
              <div className="chat-header">
                <div className="chat-header-content">
                  <h3>{selectedName}</h3>
                  <div className="online-indicator">
                    <span className={`status-dot ${isOnline ? 'online' : 'offline'}`}></span>
                    <span className="status-text">{isOnline ? 'Online' : 'Offline'}</span>
                  </div>
                </div>
              </div>

              <div className="messages-area">
                {messages.length === 0 ? (
                  <div className="empty-messages">
                    <p>👋 Start the conversation!</p>
                  </div>
                ) : (
                  messages.map(msg => (
                    <div 
                      key={msg.id}
                      className={`message ${msg.sender_id === myUserId ? 'mine' : 'theirs'}`}
                    >
                      <div className="message-content">
                        {msg.content}
                      </div>
                      <div className="message-time">
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="message-input-container">
                <input 
                  type="text"
                  className="message-input"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                />
                <button 
                  className="send-button"
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="no-chat-selected">
              <div className="empty-state-large">
                <span className="empty-icon">💬</span>
                <h3>Select a chat to start messaging</h3>
                <p>Choose a conversation from the list</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}