import React, { useState, useRef } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface VoiceInputProps {
  onResult: (text: string) => void;
  label: string;
}

export default function VoiceInput({ onResult, label }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
        await processAudio(audioBlob, mimeType);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("No se pudo acceder al micrófono. Por favor, verifica los permisos.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const processAudio = async (blob: Blob, mimeType: string) => {
    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
        
        const prompt = `Transcribe este dictado médico para el campo "${label}". 
        Limpia el texto, corrige la gramática y asegúrate de que sea profesional. 
        Solo devuelve el texto transcrito, nada más.`;

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [
            {
              parts: [
                { text: prompt },
                { inlineData: { mimeType: mimeType, data: base64Audio } }
              ]
            }
          ]
        });

        if (response.text) {
          onResult(response.text.trim());
        }
      };
    } catch (error) {
      console.error("Error processing audio:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button
      type="button"
      onClick={isRecording ? stopRecording : startRecording}
      disabled={isProcessing}
      className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
        isRecording 
          ? 'bg-red-100 text-red-600 animate-pulse' 
          : 'text-slate-400 hover:text-primary hover:bg-slate-100'
      } disabled:opacity-50`}
      title={isRecording ? "Detener grabación" : `Dictar para ${label}`}
    >
      {isProcessing ? (
        <Loader2 className="animate-spin" size={16} />
      ) : isRecording ? (
        <Square size={16} fill="currentColor" />
      ) : (
        <Mic size={16} />
      )}
    </button>
  );
}
