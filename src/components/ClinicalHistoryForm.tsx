import React, { useState } from 'react';
import { 
  User, 
  Activity, 
  History, 
  Stethoscope, 
  Beaker, 
  ClipboardList,
  Mic,
  MicOff,
  Save,
  X
} from 'lucide-react';
import SmartDictation from './SmartDictation';
import VoiceInput from './VoiceInput';

interface ClinicalHistoryFormProps {
  initialData?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  patients: any[];
}

export default function ClinicalHistoryForm({ initialData, onSave, onCancel, patients }: ClinicalHistoryFormProps) {
  const defaultData = {
    patient_id: '',
    identification: {
      occupation: '',
      laterality: 'diestro',
      sport: ''
    },
    consultation: {
      pain_location: '',
      mechanism: '',
      pain_type: '',
      eva: 5,
      evolution: ''
    },
    background: {
      traumatic: '',
      surgical: '',
      systemic: ''
    },
    physical_exam: {
      inspection: '',
      palpation: '',
      mobility: '',
      special_maneuvers: '',
      neurovascular: ''
    },
    diagnostics: {
      imaging: '',
      laboratory: ''
    },
    plan: {
      diagnosis: '',
      treatment_plan: '',
      prognosis: ''
    }
  };

  // Merge initialData with defaultData
  const getInitialState = () => {
    if (!initialData) return defaultData;
    
    // If it's a full history object from DB, it might have patient_id at top level
    // and the rest in extracted_data, but History.tsx passes extracted_data as initialData
    // OR it passes { patient_id: '...' } for new notes.
    
    return {
      ...defaultData,
      ...initialData,
      identification: { ...defaultData.identification, ...(initialData.identification || {}) },
      consultation: { ...defaultData.consultation, ...(initialData.consultation || {}) },
      background: { ...defaultData.background, ...(initialData.background || {}) },
      physical_exam: { ...defaultData.physical_exam, ...(initialData.physical_exam || {}) },
      diagnostics: { ...defaultData.diagnostics, ...(initialData.diagnostics || {}) },
      plan: { ...defaultData.plan, ...(initialData.plan || {}) },
    };
  };

  const [formData, setFormData] = useState(getInitialState());

  const [activeTab, setActiveTab] = useState('identification');

  const tabs = [
    { id: 'identification', label: 'Identificación', icon: User },
    { id: 'consultation', label: 'Consulta', icon: Activity },
    { id: 'background', label: 'Antecedentes', icon: History },
    { id: 'physical', label: 'Exploración', icon: Stethoscope },
    { id: 'diagnostics', label: 'Estudios', icon: Beaker },
    { id: 'plan', label: 'Diagnóstico y Plan', icon: ClipboardList },
  ];

  const handleDictation = (data: any) => {
    // Deep merge extracted data into form data to avoid overwriting nested objects
    setFormData((prev: any) => {
      const newData = { ...prev };
      
      Object.keys(data).forEach(section => {
        if (typeof data[section] === 'object' && data[section] !== null && !Array.isArray(data[section])) {
          newData[section] = {
            ...(prev[section] || {}),
            ...data[section]
          };
        } else {
          newData[section] = data[section];
        }
      });
      
      return newData;
    });
  };

  const updateField = (section: string, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  return (
    <div className="flex flex-col bg-white min-h-screen lg:min-h-0">
      {/* Header */}
      <div className="p-4 lg:p-6 bg-primary text-white flex items-center justify-between sticky top-0 z-30">
        <div>
          <h3 className="text-lg lg:text-xl font-bold">Anamnesis Ortopédica</h3>
          <p className="text-white/70 text-xs lg:text-sm">Historial Clínico Detallado</p>
        </div>
        <div className="flex items-center gap-2 lg:gap-4">
          <SmartDictation 
            context="full orthopedic anamnesis"
            onDataExtracted={handleDictation} 
          />
          <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Sidebar Tabs - Horizontal on mobile, Vertical on desktop */}
        <div className="lg:w-64 bg-slate-50 border-b lg:border-b-0 lg:border-r border-slate-100 p-2 lg:p-6 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible no-scrollbar sticky top-[72px] lg:top-[120px] z-20">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap lg:whitespace-normal ${
                activeTab === tab.id 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <tab.icon size={18} className="shrink-0" />
              <span>{tab.label}</span>
            </button>
          ))}
          
          <div className="hidden lg:block mt-auto pt-4 border-t border-slate-200">
            <button 
              onClick={() => onSave(formData)}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-200"
            >
              <Save size={18} />
              <span>Guardar Registro</span>
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 p-4 md:p-8 bg-white">
          <div className="max-w-4xl mx-auto">
            {activeTab === 'identification' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h4 className="text-lg font-bold text-slate-800 border-b pb-2">1. Ficha de Identificación</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Paciente</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                    value={formData.patient_id}
                    onChange={(e) => setFormData({...formData, patient_id: e.target.value})}
                  >
                    <option value="">Seleccionar Paciente</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.full_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700">Ocupación</label>
                    <VoiceInput 
                      label="Ocupación" 
                      value={formData.identification.occupation}
                      onResult={(text) => updateField('identification', 'occupation', text)} 
                    />
                  </div>
                  <input 
                    type="text"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Ej: Oficinista, Albañil..."
                    value={formData.identification.occupation}
                    onChange={(e) => updateField('identification', 'occupation', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Lateralidad</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                    value={formData.identification.laterality}
                    onChange={(e) => updateField('identification', 'laterality', e.target.value)}
                  >
                    <option value="diestro">Diestro</option>
                    <option value="zurdo">Zurdo</option>
                    <option value="ambidiestro">Ambidiestro</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700">Deporte / Actividad Física</label>
                    <VoiceInput 
                      label="Deporte" 
                      value={formData.identification.sport}
                      onResult={(text) => updateField('identification', 'sport', text)} 
                    />
                  </div>
                  <input 
                    type="text"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Tipo, frecuencia e intensidad..."
                    value={formData.identification.sport}
                    onChange={(e) => updateField('identification', 'sport', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'consultation' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h4 className="text-lg font-bold text-slate-800 border-b pb-2">2. Motivo de Consulta</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700">Localización del Dolor</label>
                    <VoiceInput 
                      label="Localización del Dolor" 
                      value={formData.consultation.pain_location}
                      onResult={(text) => updateField('consultation', 'pain_location', text)} 
                    />
                  </div>
                  <input 
                    type="text"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Ej: Rodilla derecha, cara interna..."
                    value={formData.consultation.pain_location}
                    onChange={(e) => updateField('consultation', 'pain_location', e.target.value)}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700">Mecanismo de Lesión</label>
                    <VoiceInput 
                      label="Mecanismo de Lesión" 
                      value={formData.consultation.mechanism}
                      onResult={(text) => updateField('consultation', 'mechanism', text)} 
                    />
                  </div>
                  <textarea 
                    rows={2}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                    placeholder="¿Cómo ocurrió? (Caída, torcedura...)"
                    value={formData.consultation.mechanism}
                    onChange={(e) => updateField('consultation', 'mechanism', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Dolor</label>
                    <select 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                      value={formData.consultation.pain_type}
                      onChange={(e) => updateField('consultation', 'pain_type', e.target.value)}
                    >
                      <option value="">Seleccionar...</option>
                      <option value="punzante">Punzante</option>
                      <option value="sordo">Sordo</option>
                      <option value="electrico">Eléctrico (Quemante)</option>
                      <option value="mecanico">Mecánico</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Escala EVA (1-10): {formData.consultation.eva}</label>
                    <input 
                      type="range"
                      min="1"
                      max="10"
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                      value={formData.consultation.eva}
                      onChange={(e) => updateField('consultation', 'eva', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700">Tiempo de Evolución</label>
                    <VoiceInput 
                      label="Evolución" 
                      value={formData.consultation.evolution}
                      onResult={(text) => updateField('consultation', 'evolution', text)} 
                    />
                  </div>
                  <input 
                    type="text"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                    placeholder="¿Agudo o crónico? Tiempo transcurrido..."
                    value={formData.consultation.evolution}
                    onChange={(e) => updateField('consultation', 'evolution', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'background' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h4 className="text-lg font-bold text-slate-800 border-b pb-2">3. Antecedentes Específicos</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700">Antecedentes Traumáticos</label>
                    <VoiceInput 
                      label="Traumáticos" 
                      value={formData.background.traumatic}
                      onResult={(text) => updateField('background', 'traumatic', text)} 
                    />
                  </div>
                  <textarea 
                    rows={2}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Fracturas, esguinces, luxaciones previas..."
                    value={formData.background.traumatic}
                    onChange={(e) => updateField('background', 'traumatic', e.target.value)}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700">Antecedentes Quirúrgicos</label>
                    <VoiceInput 
                      label="Quirúrgicos" 
                      value={formData.background.surgical}
                      onResult={(text) => updateField('background', 'surgical', text)} 
                    />
                  </div>
                  <textarea 
                    rows={2}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Cirugías de columna, articulaciones, implantes..."
                    value={formData.background.surgical}
                    onChange={(e) => updateField('background', 'surgical', e.target.value)}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700">Enfermedades Sistémicas</label>
                    <VoiceInput 
                      label="Sistémicas" 
                      value={formData.background.systemic}
                      onResult={(text) => updateField('background', 'systemic', text)} 
                    />
                  </div>
                  <textarea 
                    rows={2}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Diabetes, Artritis, etc."
                    value={formData.background.systemic}
                    onChange={(e) => updateField('background', 'systemic', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'physical' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h4 className="text-lg font-bold text-slate-800 border-b pb-2">4. Exploración Física Ortopédica</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700">Inspección</label>
                    <VoiceInput 
                      label="Inspección" 
                      value={formData.physical_exam.inspection}
                      onResult={(text) => updateField('physical_exam', 'inspection', text)} 
                    />
                  </div>
                  <textarea 
                    rows={2}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Deformidades, inflamación, hematomas, cicatrices..."
                    value={formData.physical_exam.inspection}
                    onChange={(e) => updateField('physical_exam', 'inspection', e.target.value)}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700">Palpación</label>
                    <VoiceInput 
                      label="Palpación" 
                      value={formData.physical_exam.palpation}
                      onResult={(text) => updateField('physical_exam', 'palpation', text)} 
                    />
                  </div>
                  <textarea 
                    rows={2}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Puntos dolorosos específicos..."
                    value={formData.physical_exam.palpation}
                    onChange={(e) => updateField('physical_exam', 'palpation', e.target.value)}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700">Arcos de Movilidad</label>
                    <VoiceInput 
                      label="Movilidad" 
                      value={formData.physical_exam.mobility}
                      onResult={(text) => updateField('physical_exam', 'mobility', text)} 
                    />
                  </div>
                  <textarea 
                    rows={2}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Grados de movimiento (flexión, extensión...)"
                    value={formData.physical_exam.mobility}
                    onChange={(e) => updateField('physical_exam', 'mobility', e.target.value)}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700">Maniobras Especiales</label>
                    <VoiceInput 
                      label="Maniobras" 
                      value={formData.physical_exam.special_maneuvers}
                      onResult={(text) => updateField('physical_exam', 'special_maneuvers', text)} 
                    />
                  </div>
                  <textarea 
                    rows={2}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Pruebas específicas (Lachman, etc.)"
                    value={formData.physical_exam.special_maneuvers}
                    onChange={(e) => updateField('physical_exam', 'special_maneuvers', e.target.value)}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700">Examen Neurovascular</label>
                    <VoiceInput 
                      label="Neurovascular" 
                      value={formData.physical_exam.neurovascular}
                      onResult={(text) => updateField('physical_exam', 'neurovascular', text)} 
                    />
                  </div>
                  <textarea 
                    rows={2}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Pulso, sensibilidad, fuerza (Daniels)..."
                    value={formData.physical_exam.neurovascular}
                    onChange={(e) => updateField('physical_exam', 'neurovascular', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'diagnostics' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h4 className="text-lg font-bold text-slate-800 border-b pb-2">5. Auxiliares de Diagnóstico</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700">Interpretación de Imagen</label>
                    <VoiceInput 
                      label="Imagen" 
                      value={formData.diagnostics.imaging}
                      onResult={(text) => updateField('diagnostics', 'imaging', text)} 
                    />
                  </div>
                  <textarea 
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Rayos X, RM, TC, Ultrasonido..."
                    value={formData.diagnostics.imaging}
                    onChange={(e) => updateField('diagnostics', 'imaging', e.target.value)}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700">Laboratorio</label>
                    <VoiceInput 
                      label="Laboratorio" 
                      value={formData.diagnostics.laboratory}
                      onResult={(text) => updateField('diagnostics', 'laboratory', text)} 
                    />
                  </div>
                  <textarea 
                    rows={2}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Ácido úrico, factor reumatoide, etc."
                    value={formData.diagnostics.laboratory}
                    onChange={(e) => updateField('diagnostics', 'laboratory', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'plan' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h4 className="text-lg font-bold text-slate-800 border-b pb-2">6. Diagnóstico y Plan</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700">Impresión Diagnóstica</label>
                    <VoiceInput 
                      label="Diagnóstico" 
                      value={formData.plan.diagnosis}
                      onResult={(text) => updateField('plan', 'diagnosis', text)} 
                    />
                  </div>
                  <textarea 
                    rows={2}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Nombre de la patología o lesión..."
                    value={formData.plan.diagnosis}
                    onChange={(e) => updateField('plan', 'diagnosis', e.target.value)}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700">Plan de Tratamiento</label>
                    <VoiceInput 
                      label="Tratamiento" 
                      value={formData.plan.treatment_plan}
                      onResult={(text) => updateField('plan', 'treatment_plan', text)} 
                    />
                  </div>
                  <textarea 
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Conservador o quirúrgico..."
                    value={formData.plan.treatment_plan}
                    onChange={(e) => updateField('plan', 'treatment_plan', e.target.value)}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700">Pronóstico</label>
                    <VoiceInput 
                      label="Pronóstico" 
                      value={formData.plan.prognosis}
                      onResult={(text) => updateField('plan', 'prognosis', text)} 
                    />
                  </div>
                  <textarea 
                    rows={2}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Tiempo estimado de recuperación..."
                    value={formData.plan.prognosis}
                    onChange={(e) => updateField('plan', 'prognosis', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Mobile Save Button */}
          <div className="lg:hidden mt-8 pt-6 border-t border-slate-100">
            <button 
              onClick={() => onSave(formData)}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white p-4 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-200"
            >
              <Save size={20} />
              <span>Guardar Registro</span>
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
