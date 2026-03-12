import React, { useState } from 'react';
import VoiceRecorder from '../components/clinical/VoiceRecorder';
import { processMedicalDictation, ClinicalData } from '../lib/gemini';
import { supabase } from '../lib/supabase';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [clinicalData, setClinicalData] = useState<ClinicalData | null>(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleAudioReady = async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      const data = await processMedicalDictation(audioBlob);
      setClinicalData(data);

      // In a real app, you would select a patient and appointment first.
      // For this prototype, we'll just log the data.
      console.log('Datos extraídos:', data);
      
      // Example of how to save to Supabase (commented out until you have patients set up)
      /*
      const { error } = await supabase.from('clinical_notes').insert({
        patient_id: 'UUID_DEL_PACIENTE',
        doctor_id: (await supabase.auth.getUser()).data.user?.id,
        extracted_data: data
      });
      if (error) throw error;
      */

      alert('Nota clínica procesada exitosamente');

    } catch (error) {
      console.error(error);
      alert('Error al procesar el dictado. Revisa la consola para más detalles.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b border-slate-200 px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Panel del Especialista</h1>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <LogOut size={20} />
          <span>Salir</span>
        </button>
      </header>

      <main className="max-w-4xl mx-auto p-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Dictado Clínico Inteligente</h2>
          <p className="text-slate-600">Presiona el micrófono para comenzar a dictar la nota médica. La IA extraerá automáticamente el diagnóstico, medicamentos, dosis y próxima cita.</p>
        </div>

        <VoiceRecorder onAudioReady={handleAudioReady} isProcessing={isProcessing} />
        
        {clinicalData && (
          <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="font-bold text-lg text-slate-800 mb-4 border-b pb-2">Datos Extraídos Estructurados</h3>
            
            <div className="space-y-4">
              <div>
                <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">Diagnóstico</span>
                <p className="text-slate-800 mt-1">{clinicalData.diagnosis}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">Medicamento</span>
                  <p className="text-slate-800 mt-1">{clinicalData.medication}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">Dosis</span>
                  <p className="text-slate-800 mt-1">{clinicalData.dose}</p>
                </div>
              </div>
              
              <div>
                <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">Próxima Cita</span>
                <p className="text-slate-800 mt-1">{clinicalData.next_appointment}</p>
              </div>
              
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <span className="text-sm font-semibold text-indigo-800 uppercase tracking-wider">Resumen Clínico</span>
                <p className="text-indigo-950 mt-1">{clinicalData.summary}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
