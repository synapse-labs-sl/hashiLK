import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FiSend, FiArrowLeft, FiMessageCircle, FiImage } from 'react-icons/fi';

function Messages() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchConversations();
    
    // Check if starting new conversation
    const recipientId = searchParams.get('to');
    const productId = searchParams.get('product');
    const serviceId = searchParams.get('service');
    
    if (recipientId) {
      startConversation(recipientId, productId, serviceId);
    }
  }, [user, searchParams]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const { data } = await api.get('/messages/conversations');
      setConversations(data);
    } catch (error) {
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const startConversation = async (recipientId, productId, serviceId) => {
    try {
      const { data } = await api.post('/messages/conversations', {
        recipientId,
        productId,
        serviceId
      });
      setActiveConversation(data);
      fetchMessages(data._id);
    } catch (error) {
      toast.error('Failed to start conversation');
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const { data } = await api.get(`/messages/conversations/${conversationId}`);
      setMessages(data.messages);
      setActiveConversation(data.conversation);
      
      // Update conversation list to reflect read status
      setConversations(prev => prev.map(c => 
        c._id === conversationId ? { ...c, unreadCount: 0 } : c
      ));
    } catch (error) {
      toast.error('Failed to load messages');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    setSending(true);
    try {
      const { data } = await api.post(`/messages/conversations/${activeConversation._id}/messages`, {
        content: newMessage
      });
      setMessages(prev => [...prev, data]);
      setNewMessage('');
      
      // Update conversation list
      setConversations(prev => prev.map(c => 
        c._id === activeConversation._id 
          ? { ...c, lastMessage: { content: newMessage, createdAt: new Date() } }
          : c
      ));
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const getOtherParticipant = (conversation) => {
    return conversation.participants?.find(p => p._id !== user?.id);
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-4">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 140px)' }}>
          <div className="flex h-full">
            {/* Conversation List */}
            <div className={`w-full md:w-1/3 border-r ${activeConversation ? 'hidden md:block' : ''}`}>
              <div className="p-4 border-b">
                <h2 className="text-xl font-bold flex items-center">
                  <FiMessageCircle className="mr-2" /> Messages
                </h2>
              </div>
              
              <div className="overflow-y-auto" style={{ height: 'calc(100% - 65px)' }}>
                {conversations.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <FiMessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No conversations yet</p>
                  </div>
                ) : (
                  conversations.map(conv => {
                    const other = getOtherParticipant(conv);
                    return (
                      <div
                        key={conv._id}
                        onClick={() => fetchMessages(conv._id)}
                        className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition ${
                          activeConversation?._id === conv._id ? 'bg-primary/5' : ''
                        }`}
                      >
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold mr-3">
                            {other?.name?.charAt(0) || '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <p className="font-semibold truncate">{other?.name || 'Unknown'}</p>
                              {conv.unreadCount > 0 && (
                                <span className="bg-accent text-white text-xs px-2 py-0.5 rounded-full">
                                  {conv.unreadCount}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 truncate">
                              {conv.lastMessage?.content || 'No messages yet'}
                            </p>
                            {conv.relatedTo?.product && (
                              <p className="text-xs text-primary truncate">
                                Re: {conv.relatedTo.product.title}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Message Area */}
            <div className={`flex-1 flex flex-col ${!activeConversation ? 'hidden md:flex' : ''}`}>
              {activeConversation ? (
                <>
                  {/* Header */}
                  <div className="p-4 border-b flex items-center">
                    <button
                      onClick={() => setActiveConversation(null)}
                      className="md:hidden mr-3 p-2 hover:bg-gray-100 rounded-full"
                    >
                      <FiArrowLeft />
                    </button>
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold mr-3">
                      {getOtherParticipant(activeConversation)?.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold">{getOtherParticipant(activeConversation)?.name}</p>
                      {activeConversation.relatedTo?.product && (
                        <p className="text-xs text-gray-500">
                          About: {activeConversation.relatedTo.product.title}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, idx) => {
                      const isOwn = msg.sender?._id === user?.id;
                      return (
                        <div key={msg._id || idx} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] ${isOwn ? 'order-2' : ''}`}>
                            <div className={`px-4 py-2 rounded-2xl ${
                              isOwn 
                                ? 'bg-primary text-white rounded-br-sm' 
                                : 'bg-gray-100 rounded-bl-sm'
                            }`}>
                              <p>{msg.content}</p>
                            </div>
                            <p className={`text-xs text-gray-400 mt-1 ${isOwn ? 'text-right' : ''}`}>
                              {formatTime(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-3 border rounded-full focus:ring-2 focus:ring-primary focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="p-3 bg-primary text-white rounded-full hover:bg-primary-light transition disabled:opacity-50"
                      >
                        <FiSend />
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <FiMessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Select a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Messages;
