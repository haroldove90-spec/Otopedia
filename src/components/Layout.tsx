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
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle window resize for sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden bg-primary p-4 flex items-center justify-between text-white sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-3">
          <img 
            src="https://appdesignproyectos.com/ortopediaicono.png" 
            alt="Logo" 
            className="w-8 h-8 object-contain bg-white rounded-lg p-1"
            referrerPolicy="no-referrer"
          />
          <span className="font-bold text-lg">Ortopedia AI</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-white/10 rounded-lg"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 lg:w-20'
        } bg-primary fixed lg:static inset-y-0 left-0 transition-all duration-300 flex flex-col z-50 shadow-xl lg:shadow-none`}
      >
        <div className="p-6 flex items-center gap-3">
          <img 
            src="https://appdesignproyectos.com/ortopediaicono.png" 
            alt="Logo" 
            className="w-10 h-10 object-contain bg-white rounded-xl p-1.5"
            referrerPolicy="no-referrer"
          />
          {isSidebarOpen && <span className="font-bold text-xl text-white">Ortopedia AI</span>}
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {filteredMenu.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.path);
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-white/20 text-white font-bold shadow-inner' 
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon size={20} />
                {isSidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <p className="text-[10px] text-white/40 text-center uppercase tracking-widest">
            Modo Demo Activo
          </p>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Header */}
        <header className="hidden lg:flex h-16 bg-white border-b border-slate-200 px-8 items-center justify-between sticky top-0 z-20">
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
                  role === 'doctor' ? 'bg-white shadow-sm text-primary' : 'text-slate-500'
                }`}
              >
                Ortopedista
              </button>
              <button 
                onClick={() => onRoleChange('assistant')}
                className={`px-4 py-1 rounded-full text-xs font-medium transition-all ${
                  role === 'assistant' ? 'bg-white shadow-sm text-primary' : 'text-slate-500'
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
                          <div key={n.id} className="p-3 bg-primary-light rounded-xl border border-primary/10">
                            <p className="text-sm font-bold text-primary">{n.title}</p>
                            <p className="text-xs text-slate-600">{n.message}</p>
                            <span className="text-[10px] text-primary/60 mt-1 block">{n.time}</span>
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
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
