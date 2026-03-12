import React, { useState, useRef } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';

interface VoiceRecorderProps {
  onAudioReady: (audioBlob: Blob) => void;
  isProcessing?: boolean;
}

export default function VoiceRecorder({ onAudioReady, isProcessing = false }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        onAudioReady(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error al acceder al micrófono:', error);
      alert('Por favor, permite el acceso al micrófono para usar el dictado.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
      <div className="relative">
        {isRecording && (
          <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-75"></div>
        )}
        
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`relative z-10 flex items-center justify-center w-20 h-20 rounded-full text-white transition-all shadow-lg ${
            isRecording 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-indigo-600 hover:bg-indigo-700'
          } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isProcessing ? (
            <Loader2 size={32} className="animate-spin" />
          ) : isRecording ? (
            <Square size={32} className="fill-current" />
          ) : (
            <Mic size={32} />
          )}
        </button>
      </div>
      
      <p className="mt-4 text-sm font-medium text-slate-600">
        {isProcessing 
          ? 'Procesando con IA...' 
          : isRecording 
            ? 'Escuchando... (Click para detener)' 
            : 'Click para iniciar dictado'}
      </p>
    </div>
  );
}
