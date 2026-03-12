import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  Calendar, 
  MoreVertical,
  Edit2,
  Trash2,
  FileText,
  X
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Patient, UserRole } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newPatient, setNewPatient] = useState<Partial<Patient>>({});

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('full_name', { ascending: true });
      if (data) setPatients(data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('patients').insert([newPatient]);
      if (error) throw error;
      setShowModal(false);
      fetchPatients();
    } catch (error) {
      console.error('Error creating patient:', error);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full">Cargando pacientes...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Directorio de Pacientes</h1>
          <p className="text-slate-500">Administra la base de datos de tu clínica</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl transition-all shadow-lg shadow-indigo-200 font-bold"
        >
          <Plus size={20} />
          <span>Nuevo Paciente</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">Todos los Pacientes</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nombre o email..." 
              className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-80"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {patients.map((p) => (
            <div key={p.id} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 hover:border-indigo-200 transition-all group relative">
              <button className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600">
                <MoreVertical size={18} />
              </button>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-xl font-bold">
                  {p.full_name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{p.full_name}</h4>
                  <p className="text-xs text-slate-500">ID: {p.id.slice(0, 8)}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Mail size={16} className="text-slate-400" />
                  <span>{p.email || 'Sin email'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Phone size={16} className="text-slate-400" />
                  <span>{p.phone || 'Sin teléfono'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Calendar size={16} className="text-slate-400" />
                  <span>Nacido: {p.dob ? format(new Date(p.dob), 'dd MMM yyyy', { locale: es }) : 'N/A'}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200 flex items-center gap-2">
                <button className="flex-1 py-2 bg-white text-indigo-600 text-xs font-bold rounded-xl border border-indigo-100 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2">
                  <FileText size={14} /> Historial
                </button>
                <button className="flex-1 py-2 bg-white text-slate-600 text-xs font-bold rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                  <Edit2 size={14} /> Editar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Patient Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-indigo-600 text-white flex items-center justify-between">
              <h3 className="text-xl font-bold">Nuevo Paciente</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-full">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreatePatient} className="p-8 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nombre Completo</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ej: Juan Pérez"
                  onChange={(e) => setNewPatient({...newPatient, full_name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="juan@ejemplo.com"
                  onChange={(e) => setNewPatient({...newPatient, email: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Teléfono</label>
                  <input 
                    type="tel" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="555-0123"
                    onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">F. Nacimiento</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
                    onChange={(e) => setNewPatient({...newPatient, dob: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                >
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
