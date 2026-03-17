import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Bell, Shield, Database, Mic, Volume2 } from 'lucide-react';

export default function Settings() {
  const [dictationDuration, setDictationDuration] = useState(5); // Default 5 minutes
  const [clinicName, setClinicName] = useState('Clínica Ortopédica Ove');
  const [language, setLanguage] = useState('Español');
  const [alertSound, setAlertSound] = useState(true);
  const [dailyReminders, setDailyReminders] = useState(true);

  useEffect(() => {
    const savedDuration = localStorage.getItem('dictation_duration');
    if (savedDuration) setDictationDuration(parseInt(savedDuration));

    const savedClinicName = localStorage.getItem('clinic_name');
    if (savedClinicName) setClinicName(savedClinicName);

    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) setLanguage(savedLanguage);

    const savedAlertSound = localStorage.getItem('alert_sound');
    if (savedAlertSound) setAlertSound(savedAlertSound === 'true');

    const savedDailyReminders = localStorage.getItem('daily_reminders');
    if (savedDailyReminders) setDailyReminders(savedDailyReminders === 'true');
  }, []);

  const handleSaveDuration = (val: number) => {
    setDictationDuration(val);
    localStorage.setItem('dictation_duration', val.toString());
  };

  const handleSaveClinicName = (val: string) => {
    setClinicName(val);
    localStorage.setItem('clinic_name', val);
  };

  const handleSaveLanguage = (val: string) => {
    setLanguage(val);
    localStorage.setItem('language', val);
  };

  const handleSaveAlertSound = (val: boolean) => {
    setAlertSound(val);
    localStorage.setItem('alert_sound', val.toString());
  };

  const handleSaveDailyReminders = (val: boolean) => {
    setDailyReminders(val);
    localStorage.setItem('daily_reminders', val.toString());
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Configuración</h1>
        <p className="text-slate-500">Administra las preferencias de tu clínica</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* General Settings */}
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
              <input 
                type="text" 
                value={clinicName} 
                onChange={(e) => handleSaveClinicName(e.target.value)}
                className="bg-slate-50 border-none rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary outline-none" 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-800">Idioma</p>
                <p className="text-xs text-slate-500">Interfaz del sistema</p>
              </div>
              <select 
                value={language}
                onChange={(e) => handleSaveLanguage(e.target.value)}
                className="bg-slate-50 border-none rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary outline-none"
              >
                <option>Español</option>
                <option>English</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dictation Settings */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 text-primary">
            <Mic size={20} />
            <h3 className="font-bold">Dictado por Voz</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-slate-800">Tiempo de Activación</p>
                <span className="text-xs font-bold bg-primary-light text-primary px-2 py-1 rounded-full">
                  {dictationDuration} min
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Define cuánto tiempo permanecerá el micrófono activo antes de detenerse automáticamente.
              </p>
              <input 
                type="range" 
                min="1" 
                max="30" 
                step="1"
                value={dictationDuration}
                onChange={(e) => handleSaveDuration(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-medium">
                <span>1 min</span>
                <span>15 min</span>
                <span>30 min</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
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
              <input 
                type="checkbox" 
                checked={alertSound} 
                onChange={(e) => handleSaveAlertSound(e.target.checked)}
                className="w-4 h-4 text-primary rounded focus:ring-primary cursor-pointer" 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-800">Recordatorios Diarios</p>
                <p className="text-xs text-slate-500">Resumen de agenda por la mañana</p>
              </div>
              <input 
                type="checkbox" 
                checked={dailyReminders} 
                onChange={(e) => handleSaveDailyReminders(e.target.checked)}
                className="w-4 h-4 text-primary rounded focus:ring-primary cursor-pointer" 
              />
            </div>
          </div>
        </div>

        {/* Security */}
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

        {/* Data */}
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
