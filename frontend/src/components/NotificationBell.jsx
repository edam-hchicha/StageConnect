import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Import de useNavigate
import axios from 'axios';
import { socket } from '../socket';

export default function NotificationBell({ companyUserId, token }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate(); // 2. Initialisation de la navigation

  useEffect(() => {
    if (!token) return;

    // Charger les notifications existantes
    const fetchNotifications = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(res.data);
      } catch (err) {
        console.error("Erreur chargement notifications :", err);
      }
    };

    fetchNotifications();

    if (companyUserId) {
      socket.emit('join_company_room', companyUserId);
    }

    const handleNewNotif = (newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
    };

    socket.on('new_notification', handleNewNotif);

    return () => {
      socket.off('new_notification', handleNewNotif);
    };
  }, [companyUserId, token]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleToggle = () => {
    setIsOpen(!isOpen);
    
    if (!isOpen && unreadCount > 0) {
      axios.put('http://localhost:5000/api/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(() => {
        setNotifications((prev) => prev.map(n => ({ ...n, is_read: 1 })));
      })
      .catch((err) => console.error("Erreur mark-as-read :", err));
    }
  };

  // 3. Fonction déclenchée lors du clic sur une notification
  const handleNotificationClick = (notif) => {
    setIsOpen(false); // Fermer le menu déroulant
    
    // Rediriger vers la page des candidatures
    // On passe l'ID de la candidature dans le `state` si vous voulez la filtrer ou la surligner
    navigate('/company/applications', { 
      state: { 
        selectedApplicationId: notif.application_id, 
        jobId: notif.job_id 
      } 
    });
  };

  return (
    <div className="relative inline-block">
      {/* Bouton Cloche */}
      <button 
        onClick={handleToggle} 
        className="relative p-2 text-slate-600 hover:text-emerald-800 transition-colors text-xl cursor-pointer"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Menu Déroulant */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-4">
          <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-100">
            <h4 className="font-semibold text-slate-800 text-sm">Notifications</h4>
            <span className="text-xs text-slate-400">{notifications.length} total</span>
          </div>

          <div className="max-h-72 overflow-y-auto space-y-2">
            {notifications.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">
                Aucune notification pour le moment.
              </p>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n.id} 
                  onClick={() => handleNotificationClick(n)} // 4. Rendre la carte cliquable
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer hover:scale-[1.01] ${
                    n.is_read 
                      ? 'bg-white border-slate-100 hover:bg-slate-50' 
                      : 'bg-emerald-50/60 border-emerald-100 hover:bg-emerald-100/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="font-semibold text-slate-900 text-xs">{n.title}</p>
                    <span className="text-[10px] text-emerald-700 font-medium bg-emerald-100/80 px-1.5 py-0.5 rounded">
                      Voir ➔
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs mb-1.5 line-clamp-2">{n.message}</p>
                  <span className="text-[10px] text-slate-400 block">
                    {new Date(n.created_at).toLocaleString('fr-FR')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}