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
  const manuallyStoppedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use a ref for onResult to avoid it being a dependency in useEffect
  const onResultRef = useRef(onResult);
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition && !recognitionRef.current) {
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
          // If it's the Age field, try to extract just the number
          if (label.toLowerCase().includes('edad')) {
            const numbers = currentSessionText.match(/\d+/);
            if (numbers) {
              onResultRef.current(numbers[0]);
              setInterimText(numbers[0]);
              return;
            }
          }

          // Capitalize the first letter of the new dictation
          currentSessionText = currentSessionText.charAt(0).toUpperCase() + currentSessionText.slice(1);
          
          setInterimText(interimTranscript);

          const separator = initialValueRef.current ? ' ' : '';
          onResultRef.current(initialValueRef.current + separator + currentSessionText);
        }
      };

      recognition.onerror = (event: any) => {
        // Silently handle aborted and no-speech errors as they are common and benign
        if (event.error === 'no-speech' || event.error === 'aborted') {
          console.log(`Recognition ${event.error}, resetting state...`);
          setIsRecording(false);
          setInterimText('');
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          return;
        }

        console.error("Speech recognition error:", event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          alert("Acceso al micrófono denegado. Por favor, permite el uso del micrófono en la configuración de tu navegador.");
        } else if (event.error === 'network') {
          alert("Error de red. El dictado por voz requiere una conexión a internet activa.");
        } else if (event.error === 'audio-capture') {
          alert("No se detectó ningún micrófono. Por favor, conecta uno e intenta de nuevo.");
        } else {
          // Only alert for other errors if we were actually recording
          if (isRecording) {
            alert(`Error de dictado: ${event.error}. Intenta de nuevo o abre la app en una pestaña nueva.`);
          }
        }
        setIsRecording(false);
        setInterimText('');
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };

      recognition.onend = () => {
        if (!manuallyStoppedRef.current && isRecording) {
          try {
            recognition.start();
          } catch (e) {
            setIsRecording(false);
          }
        } else {
          setIsRecording(false);
          setInterimText('');
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      // Only stop if unmounting the entire component
      if (recognitionRef.current) {
        manuallyStoppedRef.current = true;
        recognitionRef.current.stop();
      }
    };
  }, [label]); // Only depend on label, not onResult

  const startRecording = () => {
    if (recognitionRef.current) {
      try {
        // Stop any other active recognition globally
        if ((window as any).stopActiveRecognition && (window as any).stopActiveRecognition !== stopRecording) {
          (window as any).stopActiveRecognition();
        }
        
        // Register this instance's stop function as the active one
        (window as any).stopActiveRecognition = stopRecording;

        manuallyStoppedRef.current = false;
        initialValueRef.current = value || '';
        recognitionRef.current.start();
        setIsRecording(true);

        // Set auto-stop timeout based on settings
        const savedDuration = localStorage.getItem('dictation_duration');
        const durationMin = savedDuration ? parseInt(savedDuration) : 5;
        
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          stopRecording();
          alert(`El dictado se ha detenido automáticamente después de ${durationMin} minutos.`);
        }, durationMin * 60 * 1000);

      } catch (err) {
        console.error("Error starting recognition:", err);
      }
    } else {
      alert("Tu navegador no soporta el dictado por voz en tiempo real. Usa Chrome o Edge.");
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      // Clear the global lock if this instance was the active one
      if ((window as any).stopActiveRecognition === stopRecording) {
        (window as any).stopActiveRecognition = null;
      }

      manuallyStoppedRef.current = true;
      recognitionRef.current.stop();
      setIsRecording(false);
      setInterimText('');
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
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
