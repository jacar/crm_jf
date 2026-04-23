import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';
import { getMessages, sendMessage } from '../services/api';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const currentUser = (() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : { id: 1, name: 'Administrador' };
    } catch (e) {
      return { id: 1, name: 'Administrador' };
    }
  })();

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 4000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const fetchMessages = async () => {
    try {
      const res = await getMessages();
      if (Array.isArray(res.data)) {
        setMessages(res.data);
      }
      setError(null);
    } catch (err) {
      console.error("Chat fetch error:", err);
      setError('No se pudieron cargar los mensajes');
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const text = newMessage.trim();
    if (!text || loading) return;

    // Optimistic update - show message immediately
    const tempMsg = {
      id: Date.now(),
      user_id: currentUser.id,
      user_name: currentUser.name,
      user_cargo: 'Equipo',
      contenido: text,
      created_at: new Date().toISOString(),
      _pending: true
    };
    
    setMessages(prev => [...prev, tempMsg]);
    setNewMessage('');
    setLoading(true);

    try {
      await sendMessage(text);
      // Refresh to get server-confirmed messages
      await fetchMessages();
    } catch (err) {
      console.error("Error sending:", err);
      // Remove the optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
      setNewMessage(text); // Restore the text
      setError('Error al enviar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '80px', right: '20px', zIndex: 1000 }}>
      {/* Floating Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          style={{ 
            width: '56px', height: '56px', borderRadius: '50%', background: 'var(--primary)', 
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(3, 89, 198, 0.4)', border: 'none', cursor: 'pointer',
            transition: 'transform 0.2s'
          }}
        >
          <MessageSquare size={26} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="card" style={{ 
          width: '320px', maxWidth: 'calc(100vw - 40px)', height: '420px', 
          display: 'flex', flexDirection: 'column', 
          padding: 0, overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
          borderRadius: '16px'
        }}>
          {/* Header */}
          <div style={{ 
            background: 'var(--primary)', color: 'white', padding: '0.85rem 1rem', 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={18} />
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Chat Corporación JF</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '4px' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div 
            ref={scrollRef}
            style={{ 
              flex: 1, overflowY: 'auto', padding: '0.75rem', background: '#f1f5f9',
              display: 'flex', flexDirection: 'column', gap: '0.5rem'
            }}
          >
            {messages.length === 0 && !error && (
              <div style={{ 
                textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 1rem',
                fontSize: '0.85rem'
              }}>
                No hay mensajes aún. ¡Escribe el primero!
              </div>
            )}

            {error && (
              <div style={{ 
                textAlign: 'center', color: 'var(--error)', padding: '1rem',
                fontSize: '0.8rem', background: '#fef2f2', borderRadius: '8px'
              }}>
                {error}
              </div>
            )}

            {messages.map((m, i) => {
              const isMine = m.user_id === currentUser.id || m.user_id === 1;
              return (
                <div key={m.id || i} style={{ 
                  alignSelf: isMine ? 'flex-end' : 'flex-start',
                  maxWidth: '85%'
                }}>
                  {!isMine && (
                    <div style={{ 
                      fontSize: '0.65rem', color: '#94a3b8', marginBottom: '2px', 
                      paddingLeft: '4px'
                    }}>
                      {m.user_name || 'Usuario'}
                    </div>
                  )}
                  <div style={{ 
                    padding: '0.6rem 0.85rem', 
                    borderRadius: isMine ? '12px 12px 4px 12px' : '12px 12px 12px 4px', 
                    background: isMine ? 'var(--primary)' : 'white',
                    color: isMine ? 'white' : 'var(--text)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    fontSize: '0.85rem',
                    lineHeight: '1.4',
                    opacity: m._pending ? 0.7 : 1,
                    wordBreak: 'break-word'
                  }}>
                    {m.contenido}
                    <div style={{ 
                      fontSize: '0.6rem', 
                      opacity: 0.6, 
                      textAlign: 'right', 
                      marginTop: '4px' 
                    }}>
                      {m._pending ? 'Enviando...' : formatTime(m.created_at)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer / Input */}
          <form 
            onSubmit={handleSend} 
            style={{ 
              padding: '0.6rem 0.75rem', borderTop: '1px solid var(--border)', 
              display: 'flex', gap: '0.5rem', alignItems: 'center',
              background: 'white'
            }}
          >
            <input 
              ref={inputRef}
              type="text" 
              placeholder="Escribe un mensaje..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              maxLength={1000}
              style={{ 
                flex: 1, padding: '0.6rem 0.75rem', border: '1px solid #e2e8f0', 
                borderRadius: '20px', outline: 'none', fontSize: '0.85rem',
                background: '#f8fafc'
              }}
            />
            <button 
              type="submit" 
              disabled={loading || !newMessage.trim()}
              style={{ 
                background: newMessage.trim() ? 'var(--primary)' : '#e2e8f0', 
                border: 'none', color: newMessage.trim() ? 'white' : '#94a3b8', 
                cursor: newMessage.trim() ? 'pointer' : 'default',
                padding: '0.5rem', borderRadius: '50%',
                width: '36px', height: '36px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s'
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
