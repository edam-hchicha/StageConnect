import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { socket } from '../socket';

export default function ChatPage() {
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const currentUserId = storedUser?.id || localStorage.getItem('userId');

  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Initialisation Socket & Chargement des conversations
  useEffect(() => {
    if (currentUserId) {
      socket.emit('join_user_room', currentUserId);
    }
    fetchConversations();
  }, [currentUserId]);

  // 2. Prise en compte immédiate de l'utilisateur transmis par le bouton "Contacter"
  useEffect(() => {
    if (location.state?.receiverId) {
      const targetId = Number(location.state.receiverId);
      // 🟢 Récupération prioritaire du Nom/Prénom
      const targetName = location.state.receiverName || location.state.receiverEmail || `Utilisateur #${targetId}`;

      const targetPartner = {
        partner_id: targetId,
        partner_name: targetName, // 🟢 Enregistre le nom
        partner_email: location.state.receiverEmail || '',
        last_message: 'Nouvelle conversation'
      };

      // Activer la fenêtre de chat
      setActivePartner(targetPartner);

      // Ajouter l'interlocuteur dans la liste de gauche s'il n'y figure pas encore
      setConversations((prev) => {
        const exists = prev.some((c) => Number(c.partner_id) === targetId);
        return exists ? prev : [targetPartner, ...prev];
      });
    }
  }, [location.state]);

  // 3. Écoute des messages en temps réel
  useEffect(() => {
    const handleReceiveMessage = (msg) => {
      if (activePartner && (msg.sender_id === activePartner.partner_id || msg.receiver_id === activePartner.partner_id)) {
        setMessages((prev) => [...prev, msg]);
      }
      fetchConversations();
    };

    socket.on('receive_message', handleReceiveMessage);
    return () => socket.off('receive_message', handleReceiveMessage);
  }, [activePartner]);

  // 4. Chargement des messages au clic sur une conversation
  useEffect(() => {
    if (activePartner?.partner_id) {
      fetchMessages(activePartner.partner_id);
    }
  }, [activePartner]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/messages/conversations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(res.data);
    } catch (err) {
      console.error("Erreur chargement conversations :", err);
    }
  };

  const fetchMessages = async (partnerId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/messages/${partnerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
    } catch (err) {
      console.error("Erreur chargement messages :", err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activePartner) return;

    try {
      const res = await axios.post(
        'http://localhost:5000/api/messages',
        { receiverId: activePartner.partner_id, content: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages((prev) => [...prev, res.data]);
      setNewMessage('');
      fetchConversations();
    } catch (err) {
      console.error("Erreur envoi message :", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 h-[calc(100vh-5rem)]">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-full flex overflow-hidden">
        
        {/* LISTE DES CONVERSATIONS */}
        <div className="w-1/3 border-r border-slate-200 flex flex-col bg-slate-50/50">
          <div className="p-4 border-b border-slate-200 bg-white">
            <h2 className="text-lg font-bold text-slate-800">💬 Discussions</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {conversations.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Aucune discussion pour le moment.</p>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.partner_id}
                  onClick={() => setActivePartner(conv)}
                  className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                    activePartner?.partner_id === conv.partner_id
                      ? 'bg-emerald-800 text-white shadow-sm'
                      : 'hover:bg-white text-slate-700'
                  }`}
                >
                  <div className="overflow-hidden">
                    {/* 🟢 Affichage prioritaire du Nom/Prénom puis de l'email */}
                    <p className={`font-semibold text-sm truncate ${activePartner?.partner_id === conv.partner_id ? 'text-white' : 'text-slate-900'}`}>
                      {conv.partner_name || conv.partner_email}
                    </p>
                    <p className={`text-xs truncate ${activePartner?.partner_id === conv.partner_id ? 'text-emerald-100' : 'text-slate-500'}`}>
                      {conv.last_message || 'Nouvelle conversation'}
                    </p>
                  </div>

                  {conv.unread_count > 0 && activePartner?.partner_id !== conv.partner_id && (
                    <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {conv.unread_count}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* FENÊTRE DU CHAT */}
        <div className="flex-1 flex flex-col bg-white">
          {activePartner ? (
            <>
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
                <div>
                  {/* 🟢 Affichage du nom dans l'entête du tchat */}
                  <h3 className="font-bold text-slate-900">
                    {activePartner.partner_name || activePartner.partner_email}
                  </h3>
                  <span className="text-xs text-emerald-600 font-medium">● En ligne</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
                {messages.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-10">Envoyez votre premier message !</p>
                ) : (
                  messages.map((msg) => {
                    const isMe = Number(msg.sender_id) === Number(currentUserId);
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs md:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                          isMe 
                            ? 'bg-emerald-800 text-white rounded-br-none shadow-sm' 
                            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-xs'
                        }`}>
                          <p>{msg.content}</p>
                          <span className={`text-[10px] block mt-1 text-right ${isMe ? 'text-emerald-200' : 'text-slate-400'}`}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSend} className="p-3 border-t border-slate-200 flex gap-2 bg-white">
                <input
                  type="text"
                  placeholder="Écrivez votre message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Envoyer
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <span className="text-4xl mb-2">💬</span>
              <p className="text-sm font-medium">Sélectionnez une discussion pour commencer à discuter</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}