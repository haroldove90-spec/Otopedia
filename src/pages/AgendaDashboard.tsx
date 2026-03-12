import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogOut, Calendar, Users } from 'lucide-react';

export default function AgendaDashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b border-slate-200 px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Panel de Asistente</h1>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <LogOut size={20} />
          <span>Salir</span>
        </button>
      </header>

      <main className="max-w-6xl mx-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center text-center hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <Calendar size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Agenda del Día</h2>
            <p className="text-slate-500 mt-2">Gestionar citas, confirmaciones y estatus de llegada.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center text-center hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <Users size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Directorio de Pacientes</h2>
            <p className="text-slate-500 mt-2">Dar de alta nuevos pacientes y actualizar datos demográficos.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
