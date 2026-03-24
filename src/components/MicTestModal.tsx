import React, { useState, useEffect, useRef } from 'react';
import { Mic, CheckCircle2, AlertCircle, Volume2, X } from 'lucide-react';

interface MicTestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MicTestModal({ isOpen, onClose }: MicTestModalProps) {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);

  const startTest = async () => {
    try {
      setStatus('testing');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / bufferLength;
        setAudioLevel(average);
        
        if (average > 10) {
          setStatus('success');
        }
        
        animationRef.current = requestAnimationFrame(updateLevel);
      };

      updateLevel();
    } catch (err: any) {
      console.error("Microphone test error:", err);
      setStatus('error');
      
      // Check if any audio input devices exist at all
      let hasHardware = false;
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        hasHardware = devices.some(device => device.kind === 'audioinput');
      } catch (e) {
        console.error("Error enumerating devices:", e);
      }

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('El acceso al micrófono fue denegado. Por favor, haz clic en el candado junto a la URL y permite el acceso.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError' || !hasHardware) {
        setErrorMessage('No se detectó ningún micrófono físico. Por favor, conecta uno o verifica que no esté deshabilitado en la configuración de Windows.');
      } else {
        setErrorMessage(`Error de hardware o permisos (${err.name || 'Desconocido'}). Intenta abrir la app en una pestaña nueva o reiniciar el navegador.`);
      }
    }
  };

  const stopTest = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setStatus('idle');
    setAudioLevel(0);
  };

  useEffect(() => {
    if (!isOpen) {
      stopTest();
    }
    return () => stopTest();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Mic className="text-primary" />
            Configuración de Micrófono
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="p-8 flex flex-col items-center text-center space-y-6">
          <div className="relative">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
              status === 'success' ? 'bg-emerald-100 text-emerald-600' :
              status === 'error' ? 'bg-red-100 text-red-600' :
              status === 'testing' ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-400'
            }`}>
              {status === 'success' ? <CheckCircle2 size={48} /> :
               status === 'error' ? <AlertCircle size={48} /> :
               <Mic size={48} className={status === 'testing' ? 'animate-pulse' : ''} />}
            </div>
            
            {status === 'testing' && (
              <div 
                className="absolute inset-0 rounded-full border-4 border-primary/30 animate-ping"
                style={{ transform: `scale(${1 + audioLevel / 100})` }}
              />
            )}
          </div>

          <div className="space-y-2">
            <p className="font-bold text-slate-800">
              {status === 'idle' && '¿Listo para probar tu micrófono?'}
              {status === 'testing' && 'Escuchando... Di algo ahora'}
              {status === 'success' && '¡Excelente! Tu micrófono funciona'}
              {status === 'error' && 'Hubo un problema'}
            </p>
            <p className="text-sm text-slate-500 px-4">
              {status === 'idle' && 'Haz clic en el botón de abajo para verificar que la computadora reciba tu voz correctamente.'}
              {status === 'testing' && 'Si ves que el círculo se mueve, significa que estamos recibiendo audio.'}
              {status === 'success' && 'Todo está listo para que comiences el dictado de la anamnesis.'}
              {status === 'error' && errorMessage}
            </p>
            {status === 'error' && (
              <button 
                onClick={async () => {
                  const devices = await navigator.mediaDevices.enumerateDevices();
                  const audioDevices = devices.filter(d => d.kind === 'audioinput');
                  alert(audioDevices.length > 0 
                    ? `Dispositivos encontrados: ${audioDevices.map(d => d.label || 'Sin nombre').join(', ')}` 
                    : "No se encontró NINGÚN dispositivo de audio en el sistema.");
                }}
                className="text-[10px] text-primary underline mt-2 block"
              >
                Ver dispositivos detectados por el sistema
              </button>
            )}
          </div>

          {status === 'testing' && (
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-75"
                style={{ width: `${Math.min(100, audioLevel * 2)}%` }}
              />
            </div>
          )}

          <div className="w-full pt-4">
            {status === 'idle' || status === 'error' ? (
              <button
                onClick={startTest}
                className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
              >
                Iniciar Prueba
              </button>
            ) : (
              <button
                onClick={onClose}
                className="w-full bg-slate-800 text-white py-4 rounded-2xl font-bold hover:bg-slate-900 transition-all"
              >
                Cerrar y Continuar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
