import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  FileText, 
  Settings, 
  LogOut, 
  Bell,
  Menu,
  X,
  UserCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  role: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export default function Layout({ children, role, onRoleChange }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard, 
      path: '/admin', 
      roles: ['doctor'] 
    },
    { 
      id: 'agenda', 
      label: 'Agenda', 
      icon: Calendar, 
      path: role === 'doctor' ? '/admin/agenda' : '/agenda', 
      roles: ['doctor', 'assistant'] 
    },
    { 
      id: 'patients', 
      label: 'Pacientes', 
      icon: Users, 
      path: '/patients', 
      roles: ['doctor', 'assistant'] 
    },
    { 
      id: 'history', 
      label: 'Historial Clínico', 
      icon: FileText, 
      path: '/history', 
      roles: ['doctor'] 
    },
    { 
      id: 'settings', 
      label: 'Configuración', 
      icon: Settings, 
      path: '/settings', 
      roles: ['doctor', 'assistant'] 
    },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(role));

  const playNotificationSound = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play().catch(e => console.log('Audio play blocked'));
  };

  // Simulate a new appointment notification for demo
  useEffect(() => {
    if (role === 'doctor') {
      const timer = setTimeout(() => {
        const newNotif = {
          id: Date.now(),
          title: 'Nueva Cita Agendada',
          message: 'La asistente ha agendado a Juan Pérez para las 16:00',
          time: 'Ahora'
        };
        setNotifications(prev => [newNotif, ...prev]);
        playNotificationSound();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [role]);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-slate-200 transition-all duration-300 flex flex-col z-30`}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
            O
          </div>
          {isSidebarOpen && <span className="font-bold text-xl text-slate-800">OrthoDash</span>}
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {filteredMenu.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-600 font-medium' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <item.icon size={20} />
                {isSidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={() => navigate('/login')}
            className="w-full flex items-center gap-3 p-3 text-slate-500 hover:text-red-600 transition-colors"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white border-bottom border-slate-200 px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-full">
              <button 
                onClick={() => onRoleChange('doctor')}
                className={`px-4 py-1 rounded-full text-xs font-medium transition-all ${
                  role === 'doctor' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'
                }`}
              >
                Ortopedista
              </button>
              <button 
                onClick={() => onRoleChange('assistant')}
                className={`px-4 py-1 rounded-full text-xs font-medium transition-all ${
                  role === 'assistant' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'
                }`}
              >
                Asistente
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-500 relative"
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>
              
              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50"
                  >
                    <h3 className="font-bold text-slate-800 mb-4">Notificaciones</h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-4">No hay notificaciones</p>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                            <p className="text-sm font-bold text-indigo-900">{n.title}</p>
                            <p className="text-xs text-indigo-700">{n.message}</p>
                            <span className="text-[10px] text-indigo-400 mt-1 block">{n.time}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800">
                  {role === 'doctor' ? 'Dr. Harold Ove' : 'Asistente Clínica'}
                </p>
                <p className="text-xs text-slate-500 capitalize">{role}</p>
              </div>
              <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500">
                <UserCircle size={24} />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
