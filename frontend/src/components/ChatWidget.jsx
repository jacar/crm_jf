import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, User } from 'lucide-react';
import { getMessages, sendMessage } from '../services/api';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('user');
    try {
      return saved ? JSON.parse(saved) : { id: 0, name: 'Usuario' };
    } catch (e) {
      return { id: 0, name: 'Usuario' };
    }
  });

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000); // Poll every 5s
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await getMessages();
      setMessages(res.data);
    } catch (err) {
      console.error("Chat error:", err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      setLoading(true);
      await sendMessage(newMessage);
      setNewMessage('');
      fetchMessages();
    } catch (err) {
      console.error("Error sending:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '80px', right: '20px', zIndex: 1000 }}>
      {/* Floating Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          style={{ 
            width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary)', 
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(3, 89, 198, 0.4)', border: 'none', cursor: 'pointer'
          }}
        >
          <MessageSquare size={28} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="card" style={{ 
          width: '320px', height: '450px', display: 'flex', flexDirection: 'column', 
          padding: 0, overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.2)'
        }}>
          {/* Header */}
          <div style={{ 
            background: 'var(--primary)', color: 'white', padding: '1rem', 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={20} />
              <span style={{ fontWeight: 600 }}>Chat Corporación JF</span>
            </div>
            <X size={20} style={{ cursor: 'pointer' }} onClick={() => setIsOpen(false)} />
          </div>

          {/* Messages */}
          <div 
            ref={scrollRef}
            style={{ 
              flex: 1, overflowY: 'auto', padding: '1rem', background: '#f8fafc',
              display: 'flex', flexDirection: 'column', gap: '1rem'
            }}
          >
            {messages.map((m, i) => {
              const isMine = m.user_id === currentUser.id;
              return (
                <div key={i} style={{ 
                  alignSelf: isMine ? 'flex-end' : 'flex-start',
                  maxWidth: '80%'
                }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '2px', textAlign: isMine ? 'right' : 'left' }}>
                    {m.user_name} <span style={{ opacity: 0.6 }}>({m.user_cargo || 'Personal'})</span>
                  </div>
                  <div style={{ 
                    padding: '0.75rem', borderRadius: '12px', 
                    background: isMine ? 'var(--primary)' : 'white',
                    color: isMine ? 'white' : 'var(--text)',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                    fontSize: '0.875rem'
                  }}>
                    {m.contenido}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <form onSubmit={handleSend} style={{ padding: '0.75rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              placeholder="Escribe un mensaje..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              style={{ flex: 1, padding: '0.5rem', border: 'none', outline: 'none', background: 'transparent' }}
            />
            <button 
              type="submit" 
              disabled={loading}
              style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
