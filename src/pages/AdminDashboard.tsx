import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Plus, 
  Search, 
  FileText, 
  Download,
  Edit2,
  Trash2,
  ChevronRight,
  X
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '../lib/supabase';
import { Appointment, Patient, ClinicalHistory, DashboardMetrics, UserRole } from '../types';
import SmartDictation from '../components/SmartDictation';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface AdminDashboardProps {
  role: UserRole;
}

export default function AdminDashboard({ role }: AdminDashboardProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalPatients: 0,
    consultationsDay: 0,
    consultationsWeek: 0,
    consultationsMonth: 0,
    incomeDay: 0,
    incomeWeek: 0,
    incomeMonth: 0
  });
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [histories, setHistories] = useState<ClinicalHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<Partial<ClinicalHistory>>({});

  useEffect(() => {
    fetchData();
  }, [role]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const now = new Date();
      
      // Fetch Patients Count
      const { count: patientCount } = await supabase.from('patients').select('*', { count: 'exact', head: true });
      
      // Fetch Appointments for Metrics
      const { data: appts } = await supabase.from('appointments').select('*, patient:patients(*)').order('appointment_date', { ascending: true });
      
      if (appts) {
        const typedAppts = appts as Appointment[];
        setAppointments(typedAppts);

        // Calculate Metrics
        const dayStart = startOfDay(now);
        const weekStart = startOfWeek(now);
        const monthStart = startOfMonth(now);

        const dayAppts = typedAppts.filter(a => new Date(a.appointment_date) >= dayStart);
        const weekAppts = typedAppts.filter(a => new Date(a.appointment_date) >= weekStart);
        const monthAppts = typedAppts.filter(a => new Date(a.appointment_date) >= monthStart);

        setMetrics({
          totalPatients: patientCount || 0,
          consultationsDay: dayAppts.length,
          consultationsWeek: weekAppts.length,
          consultationsMonth: monthAppts.length,
          incomeDay: dayAppts.reduce((sum, a) => sum + (a.price || 0), 0),
          incomeWeek: weekAppts.reduce((sum, a) => sum + (a.price || 0), 0),
          incomeMonth: monthAppts.reduce((sum, a) => sum + (a.price || 0), 0)
        });
      }

      // Fetch Clinical Histories
      const { data: histData } = await supabase.from('clinical_notes').select('*, patient:patients(*)').order('created_at', { ascending: false });
      if (histData) {
        setHistories(histData.map(h => ({
          id: h.id,
          patient_id: h.patient_id,
          doctor_id: h.doctor_id,
          diagnosis: h.extracted_data?.diagnosis || '',
          treatment: h.extracted_data?.treatment || '',
          medications: h.extracted_data?.medications || '',
          next_appointment: h.extracted_data?.next_appointment || '',
          created_at: h.created_at,
          patient: h.patient
        })));
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = (history: ClinicalHistory) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(79, 70, 229); // Indigo-600
    doc.text('OrthoDash - Reporte Clínico', 20, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Fecha: ${format(new Date(history.created_at), 'PPP', { locale: es })}`, 20, 30);
    
    // Patient Info
    doc.setDrawColor(200);
    doc.line(20, 35, 190, 35);
    
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Información del Paciente', 20, 45);
    doc.setFontSize(11);
    doc.text(`Nombre: ${history.patient?.full_name}`, 20, 52);
    doc.text(`Email: ${history.patient?.email}`, 20, 59);
    
    // Clinical Data
    doc.setFontSize(14);
    doc.text('Detalles de la Consulta', 20, 75);
    
    const data = [
      ['Diagnóstico', history.diagnosis],
      ['Tratamiento', history.treatment],
      ['Medicamentos', history.medications],
      ['Próxima Cita', history.next_appointment || 'No programada']
    ];

    (doc as any).autoTable({
      startY: 80,
      head: [['Campo', 'Descripción']],
      body: data,
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] }
    });

    doc.save(`Historial_${history.patient?.full_name}_${format(new Date(), 'yyyyMMdd')}.pdf`);
  };

  const handleSaveHistory = async () => {
    try {
      const payload = {
        patient_id: selectedHistory.patient_id,
        extracted_data: {
          diagnosis: selectedHistory.diagnosis,
          treatment: selectedHistory.treatment,
          medications: selectedHistory.medications,
          next_appointment: selectedHistory.next_appointment
        }
      };

      if (selectedHistory.id) {
        await supabase.from('clinical_notes').update(payload).eq('id', selectedHistory.id);
      } else {
        await supabase.from('clinical_notes').insert([payload]);
      }
      
      setShowHistoryModal(false);
      fetchData();
    } catch (error) {
      console.error('Error saving history:', error);
    }
  };

  const chartData = [
    { name: 'Lun', ingresos: 400, pacientes: 12 },
    { name: 'Mar', ingresos: 300, pacientes: 8 },
    { name: 'Mie', ingresos: 600, pacientes: 15 },
    { name: 'Jue', ingresos: 800, pacientes: 20 },
    { name: 'Vie', ingresos: 500, pacientes: 14 },
    { name: 'Sab', ingresos: 200, pacientes: 5 },
  ];

  if (loading) return <div className="flex items-center justify-center h-full">Cargando dashboard...</div>;

  return (
    <div className="space-y-8">
      {/* Header with Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Panel del Ortopedista</h1>
          <p className="text-slate-500">Bienvenido de nuevo, Dr. Harold</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              setSelectedHistory({});
              setShowHistoryModal(true);
            }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-200"
          >
            <Plus size={20} />
            <span>Nueva Nota Clínica</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Pacientes Totales" 
          value={metrics.totalPatients} 
          icon={Users} 
          color="blue" 
          trend="+5% vs mes pasado"
        />
        <MetricCard 
          title="Consultas (Mes)" 
          value={metrics.consultationsMonth} 
          icon={Calendar} 
          color="indigo" 
          trend="+12% vs mes pasado"
        />
        <MetricCard 
          title="Ingresos (Semana)" 
          value={`$${metrics.incomeWeek.toLocaleString()}`} 
          icon={DollarSign} 
          color="emerald" 
          trend="+8% vs semana pasada"
        />
        <MetricCard 
          title="Ingresos (Mes)" 
          value={`$${metrics.incomeMonth.toLocaleString()}`} 
          icon={TrendingUp} 
          color="amber" 
          trend="+15% vs mes pasado"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 min-h-[400px]">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Ingresos Semanales</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%" minHeight={250}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Area type="monotone" dataKey="ingresos" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorIngresos)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 min-h-[400px]">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Volumen de Pacientes</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%" minHeight={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="pacientes" fill="#818cf8" radius={[6, 6, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Historial Clínico List */}
        <div className="xl:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">Historiales Clínicos Recientes</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar paciente..." 
                className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">Paciente</th>
                  <th className="px-6 py-4 font-medium">Diagnóstico</th>
                  <th className="px-6 py-4 font-medium">Fecha</th>
                  <th className="px-6 py-4 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {histories.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xs">
                          {h.patient?.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{h.patient?.full_name}</p>
                          <p className="text-xs text-slate-500">{h.patient?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600 line-clamp-1">{h.diagnosis}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-500">{format(new Date(h.created_at), 'dd MMM yyyy')}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => exportToPDF(h)}
                          className="p-2 hover:bg-white hover:text-indigo-600 rounded-lg text-slate-400 transition-all"
                          title="Exportar PDF"
                        >
                          <Download size={18} />
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedHistory(h);
                            setShowHistoryModal(true);
                          }}
                          className="p-2 hover:bg-white hover:text-indigo-600 rounded-lg text-slate-400 transition-all"
                        >
                          <Edit2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Agenda */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-800">Citas Pendientes</h3>
          </div>
          <div className="p-6 space-y-4">
            {appointments.filter(a => a.status === 'scheduled').slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-indigo-50 transition-colors cursor-pointer group">
                <div className="text-center min-w-[50px]">
                  <p className="text-xs font-bold text-indigo-600 uppercase">{format(new Date(a.appointment_date), 'EEE')}</p>
                  <p className="text-lg font-bold text-slate-800">{format(new Date(a.appointment_date), 'HH:mm')}</p>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800">{a.patient?.full_name}</p>
                  <p className="text-xs text-slate-500 line-clamp-1">{a.notes || 'Consulta General'}</p>
                </div>
                <ChevronRight className="text-slate-300 group-hover:text-indigo-400 transition-colors" size={20} />
              </div>
            ))}
            <button className="w-full py-3 text-sm font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
              Ver Agenda Completa
            </button>
          </div>
        </div>
      </div>

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-indigo-600 text-white">
              <h3 className="text-xl font-bold">Nueva Nota Clínica</h3>
              <div className="flex items-center gap-4">
                <SmartDictation 
                  context="clinical history"
                  onDataExtracted={(data) => {
                    setSelectedHistory(prev => ({ ...prev, ...data }));
                  }} 
                />
                <button onClick={() => setShowHistoryModal(false)} className="p-2 hover:bg-white/10 rounded-full">
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-8 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Paciente</label>
                  <select 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    value={selectedHistory.patient_id || ''}
                    onChange={(e) => setSelectedHistory({...selectedHistory, patient_id: e.target.value})}
                  >
                    <option value="">Seleccionar Paciente</option>
                    {/* Map patients here */}
                    <option value="demo">Juan Pérez</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Próxima Cita</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    value={selectedHistory.next_appointment || ''}
                    onChange={(e) => setSelectedHistory({...selectedHistory, next_appointment: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Diagnóstico</label>
                <textarea 
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Escribe o dicta el diagnóstico..."
                  value={selectedHistory.diagnosis || ''}
                  onChange={(e) => setSelectedHistory({...selectedHistory, diagnosis: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tratamiento</label>
                <textarea 
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Escribe o dicta el tratamiento..."
                  value={selectedHistory.treatment || ''}
                  onChange={(e) => setSelectedHistory({...selectedHistory, treatment: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Medicamentos</label>
                <textarea 
                  rows={2}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Escribe o dicta los medicamentos..."
                  value={selectedHistory.medications || ''}
                  onChange={(e) => setSelectedHistory({...selectedHistory, medications: e.target.value})}
                />
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setShowHistoryModal(false)}
                className="px-6 py-2.5 text-slate-600 font-medium hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveHistory}
                className="px-8 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
              >
                Guardar Historial
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, color, trend }: any) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl ${colors[color]} group-hover:scale-110 transition-transform`}>
          <Icon size={24} />
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estadística</span>
      </div>
      <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-slate-800 mb-2">{value}</p>
      <p className="text-xs font-medium text-emerald-500">{trend}</p>
    </div>
  );
}
