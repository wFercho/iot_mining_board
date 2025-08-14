import { useState } from 'react';
import { Bell, Menu, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../Context/NotificationsContext';

interface NavbarProps {
  toggleSidebar: () => void;
}

export const Navbar = ({ toggleSidebar }: NavbarProps) => {
  const { alerts, markAsRead, unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const handleNotificationClick = (sensorId: string) => {
    console.log(sensorId, "sensorId");
    // Navegar a la página de dispositivos con el sensor como parámetro
    navigate(`/home?alert=${sensorId}&showAlerts=true`);
    setShowNotifications(false);
  };

  const handleMarkAllAsRead = () => {
    markAsRead();
    setShowNotifications(false);
  };

  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center w-full relative">
      <button 
        onClick={toggleSidebar} 
        className="p-2 text-gray-600 hover:bg-gray-200 rounded transition duration-200 cursor-pointer"
        aria-label="Toggle Sidebar"
      >
        <Menu size={24} />
      </button>
      
      <h1 className="text-xl font-bold">Sistema de Monitoreo</h1>
      
      <div className="flex items-center space-x-4">
        <div className="relative">
          <button 
            className="p-2 text-gray-600 hover:bg-gray-200 rounded transition duration-200 cursor-pointer relative"
            aria-label="Notifications"
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (showNotifications && unreadCount > 0) {
                markAsRead();
              }
            }}
          >
            <Bell size={24} />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          
          {/* Tooltip de notificaciones */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 border border-gray-200">
              <div className="p-3 border-b border-gray-200 bg-gray-50 rounded-t-md flex justify-between items-center">
                <h3 className="font-medium text-gray-700">Notificaciones</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Marcar todas como leídas
                  </button>
                )}
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {alerts.length > 0 ? (
                  alerts.map((alert) => (
                    console.log(alert, "alert"),
                    <div 
                      key={alert.id}
                      className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                        alert.type === 'DANGER' || alert.type === 'ERROR' 
                          ? 'bg-red-50' 
                          : 'bg-yellow-50'
                      }`}
                      onClick={() => handleNotificationClick(alert.sensorId)}
                    >
                      <div className="flex justify-between items-start">
                        <span className={`text-sm font-medium ${
                          alert.type === 'DANGER' || alert.type === 'ERROR' 
                            ? 'text-red-700' 
                            : 'text-yellow-700'
                        }`}>
                          {alert.message}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          alert.type === 'DANGER' || alert.type === 'ERROR'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {alert.type}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {alert.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {' • '}
                        {alert.timestamp.toLocaleDateString([], { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No hay notificaciones nuevas
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <button 
          className="p-2 text-gray-600 hover:bg-gray-200 rounded transition duration-200 cursor-pointer"
          aria-label="User Profile"
        >
          <User size={24} />
        </button>
      </div>
    </nav>
  );
};