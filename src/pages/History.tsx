import React, { useState, useEffect } from 'react';
import { 
  Search, 
  FileText, 
  Download, 
  Edit2, 
  Plus,
  Calendar,
  User,
  ChevronRight,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '../lib/supabase';
import { ClinicalHistory, Patient } from '../types';
import ClinicalHistoryForm from '../components/ClinicalHistoryForm';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export default function History() {
  const [histories, setHistories] = useState<ClinicalHistory[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<any>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: histData } = await supabase
        .from('clinical_notes')
        .select('*, patient:patients(*)')
        .order('created_at', { ascending: false });
      
      const { data: pats } = await supabase.from('patients').select('*');
      
      if (histData) {
        setHistories(histData.map(h => ({
          id: h.id,
          patient_id: h.patient_id,
          doctor_id: h.doctor_id,
          diagnosis: h.extracted_data?.plan?.diagnosis || h.extracted_data?.diagnosis || 'Sin diagnóstico',
          treatment: h.extracted_data?.plan?.treatment_plan || h.extracted_data?.treatment || 'Sin tratamiento',
          medications: h.extracted_data?.medications || '',
          next_appointment: h.extracted_data?.next_appointment || '',
          created_at: h.created_at,
          patient: h.patient,
          extracted_data: h.extracted_data
        })));
      }
      if (pats) setPatients(pats);
    } catch (error) {
      console.error('Error fetching history data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHistory = async (formData: any) => {
    try {
      const payload = {
        patient_id: formData.patient_id,
        extracted_data: formData
      };

      if (selectedHistory.id) {
        await supabase.from('clinical_notes').update(payload).eq('id', selectedHistory.id);
      } else {
        await supabase.from('clinical_notes').insert([payload]);
      }
      
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error('Error saving history:', error);
    }
  };

  const exportToPDF = (history: ClinicalHistory) => {
    const doc = new jsPDF();
    const primaryColor = [150, 0, 1]; // #960001
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('Ortopedia AI - Reporte Clínico', 20, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generado el: ${format(new Date(), 'PPP', { locale: es })}`, 20, 28);
    
    // Patient Info Section
    doc.setFillColor(245, 245, 245);
    doc.rect(20, 35, 170, 25, 'F');
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMACIÓN DEL PACIENTE', 25, 42);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Nombre: ${history.patient?.full_name}`, 25, 48);
    doc.text(`Email: ${history.patient?.email || 'N/A'}`, 25, 53);
    doc.text(`Fecha de Consulta: ${format(new Date(history.created_at), 'PPP', { locale: es })}`, 110, 48);

    // Clinical Details
    const ext = history.extracted_data || {};
    const tableData = [
      ['Ocupación', ext.identification?.occupation || 'N/A'],
      ['Lateralidad', ext.identification?.laterality || 'N/A'],
      ['Deporte', ext.identification?.sport || 'N/A'],
      ['Localización Dolor', ext.consultation?.pain_location || 'N/A'],
      ['Mecanismo Lesión', ext.consultation?.mechanism || 'N/A'],
      ['Escala EVA', ext.consultation?.eva?.toString() || 'N/A'],
      ['Diagnóstico', history.diagnosis],
      ['Plan de Tratamiento', history.treatment],
    ];

    (doc as any).autoTable({
      startY: 70,
      head: [['Campo', 'Detalle']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: primaryColor },
      styles: { fontSize: 9 },
      columnStyles: { 0: { fontStyle: 'bold', width: 40 } }
    });

    doc.save(`Historial_${history.patient?.full_name}_${format(new Date(history.created_at), 'yyyyMMdd')}.pdf`);
  };

  const filteredHistories = histories.filter(h => 
    h.patient?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-full">Cargando historiales...</div>;

  if (showModal) {
    return (
      <div className="-m-4 md:-m-8">
        <ClinicalHistoryForm 
          initialData={selectedHistory.extracted_data}
          patients={patients}
          onSave={handleSaveHistory}
          onCancel={() => setShowModal(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Historial Clínico</h1>
          <p className="text-slate-500">Registro detallado de consultas y diagnósticos</p>
        </div>
        <button 
          onClick={() => {
            setSelectedHistory({});
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-2xl transition-all shadow-lg shadow-primary/20 font-bold"
        >
          <Plus size={20} />
          <span>Nueva Anamnesis</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por paciente o diagnóstico..." 
              className="pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-100 transition-colors">
              <Filter size={16} />
              <span>Filtros</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Paciente</th>
                <th className="px-6 py-4 font-medium">Diagnóstico Principal</th>
                <th className="px-6 py-4 font-medium">Fecha</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHistories.map((h) => (
                <tr key={h.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-light text-primary rounded-xl flex items-center justify-center font-bold">
                        {h.patient?.full_name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{h.patient?.full_name}</p>
                        <p className="text-xs text-slate-500">{h.patient?.occupation || 'Paciente'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <p className="text-sm text-slate-700 font-medium line-clamp-1">{h.diagnosis}</p>
                      <p className="text-xs text-slate-400 line-clamp-1">{h.treatment}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Calendar size={14} />
                      <span className="text-sm">{format(new Date(h.created_at), 'dd MMM yyyy')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => exportToPDF(h)}
                        className="p-2 hover:bg-white text-slate-400 hover:text-primary rounded-lg transition-all shadow-sm border border-transparent hover:border-primary/10"
                        title="Descargar PDF"
                      >
                        <Download size={18} />
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedHistory(h);
                          setShowModal(true);
                        }}
                        className="p-2 hover:bg-white text-slate-400 hover:text-primary rounded-lg transition-all shadow-sm border border-transparent hover:border-primary/10"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button className="p-2 hover:bg-white text-slate-400 hover:text-primary rounded-lg transition-all shadow-sm border border-transparent hover:border-primary/10">
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredHistories.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    <FileText size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No se encontraron historiales clínicos</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
