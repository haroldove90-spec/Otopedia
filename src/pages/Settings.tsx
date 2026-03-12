import React from 'react';
import { Settings as SettingsIcon, Bell, Shield, Database, Globe, Moon } from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Configuración</h1>
        <p className="text-slate-500">Administra las preferencias de tu clínica</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 text-primary">
            <SettingsIcon size={20} />
            <h3 className="font-bold">General</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-800">Nombre de la Clínica</p>
                <p className="text-xs text-slate-500">Aparecerá en los reportes PDF</p>
              </div>
              <input type="text" defaultValue="Clínica Ortopédica Ove" className="bg-slate-50 border-none rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary outline-none" />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-800">Idioma</p>
                <p className="text-xs text-slate-500">Interfaz del sistema</p>
              </div>
              <select className="bg-slate-50 border-none rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary outline-none">
                <option>Español</option>
                <option>English</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 text-primary">
            <Bell size={20} />
            <h3 className="font-bold">Notificaciones</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-800">Sonido de Alerta</p>
                <p className="text-xs text-slate-500">Para nuevas citas agendadas</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-primary rounded focus:ring-primary" />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-800">Recordatorios Diarios</p>
                <p className="text-xs text-slate-500">Resumen de agenda por la mañana</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-primary rounded focus:ring-primary" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 text-primary">
            <Shield size={20} />
            <h3 className="font-bold">Seguridad</h3>
          </div>
          
          <div className="space-y-4">
            <button className="w-full py-2 bg-slate-50 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-100 transition-colors">
              Cambiar Contraseña
            </button>
            <button className="w-full py-2 bg-slate-50 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-100 transition-colors">
              Gestionar Accesos
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 text-primary">
            <Database size={20} />
            <h3 className="font-bold">Datos</h3>
          </div>
          
          <div className="space-y-4">
            <button className="w-full py-2 bg-primary-light text-primary text-sm font-bold rounded-xl hover:bg-primary/10 transition-colors">
              Exportar Base de Datos
            </button>
            <button className="w-full py-2 bg-red-50 text-red-600 text-sm font-bold rounded-xl hover:bg-red-100 transition-colors">
              Limpiar Caché
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
