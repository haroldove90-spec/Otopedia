import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  Mail,
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X
} from 'lucide-react';
import { format, addDays, startOfToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '../lib/supabase';
import { Appointment, Patient, UserRole } from '../types';
import SmartDictation from '../components/SmartDictation';
import confetti from 'canvas-confetti';

interface AgendaDashboardProps {
  role: UserRole;
}

export default function AgendaDashboard({ role }: AgendaDashboardProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isNewPatient, setIsNewPatient] = useState(false);
  const [newPatientData, setNewPatientData] = useState({
    full_name: '',
    phone: '',
    email: '',
    dob: ''
  });
  const [newAppt, setNewAppt] = useState<Partial<Appointment>>({
    appointment_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    status: 'scheduled',
    price: 500
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: appts } = await supabase
        .from('appointments')
        .select('*, patient:patients(*)')
        .order('appointment_date', { ascending: true });
      
      const { data: pats } = await supabase.from('patients').select('*');
      
      if (appts) setAppointments(appts);
      if (pats) setPatients(pats);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let patientId = newAppt.patient_id;

      if (isNewPatient) {
        const { data: patient, error: pError } = await supabase
          .from('patients')
          .insert([newPatientData])
          .select()
          .single();
        
        if (pError) throw pError;
        patientId = patient.id;
      }

      if (!patientId) throw new Error('Debe seleccionar o registrar un paciente');

      const { data, error } = await supabase
        .from('appointments')
        .insert([{ ...newAppt, patient_id: patientId }])
        .select();
      
      if (error) throw error;
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#960001', '#c40001', '#ff4d4d']
      });

      setShowModal(false);
      setIsNewPatient(false);
      setNewPatientData({ full_name: '', phone: '', email: '', dob: '' });
      fetchData();
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Error al crear la cita. Por favor verifique los datos.');
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await supabase.from('appointments').update({ status }).eq('id', id);
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full">Cargando agenda...</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Agenda Médica</h1>
          <p className="text-slate-500">Gestión de citas y pacientes</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-2xl transition-all shadow-lg shadow-primary/20 font-bold"
        >
          <Plus size={20} />
          <span>Nueva Cita</span>
        </button>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-primary-light text-primary rounded-2xl">
            <CalendarIcon size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Citas Hoy</p>
            <p className="text-xl font-bold text-slate-800">{appointments.filter(a => format(new Date(a.appointment_date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')).length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Completadas</p>
            <p className="text-xl font-bold text-slate-800">{appointments.filter(a => a.status === 'completed').length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Pendientes</p>
            <p className="text-xl font-bold text-slate-800">{appointments.filter(a => a.status === 'scheduled').length}</p>
          </div>
        </div>
      </div>

      {/* Agenda List */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">Citas Programadas</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar cita..." 
                className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none w-64"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Paciente</th>
                <th className="px-6 py-4 font-medium">Fecha y Hora</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium">Precio</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {appointments.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-light text-primary rounded-full flex items-center justify-center font-bold">
                        {a.patient?.full_name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{a.patient?.full_name}</p>
                        <p className="text-xs text-slate-500">{a.patient?.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-700">
                        {format(new Date(a.appointment_date), 'dd MMM yyyy', { locale: es })}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock size={12} /> {format(new Date(a.appointment_date), 'HH:mm')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      a.status === 'scheduled' ? 'bg-primary-light text-primary' :
                      a.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {a.status === 'scheduled' ? 'Programada' : a.status === 'completed' ? 'Completada' : a.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-700">${a.price || 0}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => updateStatus(a.id, 'completed')}
                        className="p-2 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-lg transition-colors"
                        title="Marcar como completada"
                      >
                        <CheckCircle2 size={18} />
                      </button>
                      <button 
                        onClick={() => updateStatus(a.id, 'cancelled')}
                        className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                        title="Cancelar cita"
                      >
                        <XCircle size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Appointment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-primary text-white flex items-center justify-between">
              <h3 className="text-xl font-bold">Nueva Cita</h3>
              <div className="flex items-center gap-4">
                <SmartDictation 
                  context="appointment scheduling"
                  onDataExtracted={(data) => {
                    setNewAppt(prev => ({ ...prev, ...data }));
                  }} 
                />
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-full">
                  <X size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateAppointment} className="p-8 space-y-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-700">Paciente</label>
                <button 
                  type="button"
                  onClick={() => setIsNewPatient(!isNewPatient)}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  {isNewPatient ? 'Seleccionar existente' : '+ Registrar nuevo'}
                </button>
              </div>

              {isNewPatient ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text"
                      placeholder="Nombre completo del paciente"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                      value={newPatientData.full_name}
                      onChange={(e) => setNewPatientData({...newPatientData, full_name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="tel"
                        placeholder="Teléfono"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                        value={newPatientData.phone}
                        onChange={(e) => setNewPatientData({...newPatientData, phone: e.target.value})}
                        required
                      />
                    </div>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="date"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                        value={newPatientData.dob}
                        onChange={(e) => setNewPatientData({...newPatientData, dob: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <select 
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                    value={newAppt.patient_id || ''}
                    onChange={(e) => setNewAppt({...newAppt, patient_id: e.target.value})}
                    required
                  >
                    <option value="">Seleccionar Paciente</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.full_name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Fecha y Hora</label>
                  <input 
                    type="datetime-local" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                    value={newAppt.appointment_date || ''}
                    onChange={(e) => setNewAppt({...newAppt, appointment_date: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Precio Consulta</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    <input 
                      type="number" 
                      className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                      value={newAppt.price || ''}
                      onChange={(e) => setNewAppt({...newAppt, price: Number(e.target.value)})}
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Notas / Motivo</label>
                <textarea 
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Ej: Dolor en rodilla izquierda..."
                  value={newAppt.notes || ''}
                  onChange={(e) => setNewAppt({...newAppt, notes: e.target.value})}
                />
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
                  className="flex-1 py-3 bg-primary text-white font-bold rounded-2xl hover:bg-primary-hover transition-all shadow-lg shadow-primary/20"
                >
                  Agendar Cita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
