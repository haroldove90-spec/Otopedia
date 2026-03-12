import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';

interface VoiceInputProps {
  onResult: (text: string) => void;
  label: string;
  value: string;
}

// Extend Window interface for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function VoiceInput({ onResult, label, value }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef<any>(null);
  const initialValueRef = useRef('');

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'es-MX';

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        let currentSessionText = (finalTranscript + interimTranscript).trim();
        
        if (currentSessionText) {
          // Capitalize the first letter of the new dictation
          currentSessionText = currentSessionText.charAt(0).toUpperCase() + currentSessionText.slice(1);
          
          setInterimText(interimTranscript);

          const separator = initialValueRef.current ? ' ' : '';
          onResult(initialValueRef.current + separator + currentSessionText);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
        setInterimText('');
      };

      recognition.onend = () => {
        setIsRecording(false);
        setInterimText('');
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onResult]);

  const startRecording = () => {
    if (recognitionRef.current) {
      try {
        initialValueRef.current = value || '';
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Error starting recognition:", err);
      }
    } else {
      alert("Tu navegador no soporta el dictado por voz en tiempo real. Usa Chrome o Edge.");
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      setInterimText('');
    }
  };

  return (
    <div className="relative flex items-center">
      {isRecording && (
        <div className="absolute right-full mr-3 whitespace-nowrap bg-primary text-white text-xs py-1 px-2 rounded-lg shadow-lg animate-in fade-in slide-in-from-right-2">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-white rounded-full animate-ping" />
            Habla ahora... {interimText && <span className="opacity-70 italic">"{interimText}"</span>}
          </span>
        </div>
      )}
      <button
        type="button"
        onClick={isRecording ? stopRecording : startRecording}
        className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
          isRecording 
            ? 'bg-red-100 text-red-600 ring-2 ring-red-500 ring-offset-1' 
            : 'text-slate-400 hover:text-primary hover:bg-slate-100'
        }`}
        title={isRecording ? "Detener dictado" : `Dictar para ${label}`}
      >
        {isRecording ? (
          <Square size={16} fill="currentColor" />
        ) : (
          <Mic size={16} />
        )}
      </button>
    </div>
  );
}
