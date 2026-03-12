import React, { useState, useRef } from 'react';
import { Mic, Square, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI, Type } from "@google/genai";

interface SmartDictationProps {
  onDataExtracted: (data: any) => void;
  context?: string;
}

export default function SmartDictation({ onDataExtracted, context = "medical record" }: SmartDictationProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("Browser does not support audio recording");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : 'audio/mp4';
      
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
    } catch (err: any) {
      console.error("Error accessing microphone:", err);
      if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        // Handle case where no microphone is found
      }
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
        
        const prompt = `Analiza este dictado médico (${context}) y extrae la información estructurada en formato JSON. 
        Si es una cita: extrae fecha, hora, motivo. 
        Si es un historial: extrae diagnóstico, tratamiento, medicamentos y próxima cita.
        Dictado: `;

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [
            {
              parts: [
                { text: prompt },
                { inlineData: { mimeType: mimeType, data: base64Audio } }
              ]
            }
          ],
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                diagnosis: { type: Type.STRING },
                treatment: { type: Type.STRING },
                medications: { type: Type.STRING },
                next_appointment: { type: Type.STRING },
                patient_name: { type: Type.STRING },
                date: { type: Type.STRING },
                time: { type: Type.STRING },
                reason: { type: Type.STRING }
              }
            }
          }
        });

        if (response.text) {
          const extractedData = JSON.parse(response.text);
          onDataExtracted(extractedData);
        }
      };
    } catch (error) {
      console.error("Error processing audio with Gemini:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <AnimatePresence>
        {isRecording && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-full border border-red-100"
          >
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium">Grabando...</span>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
        className={`p-2.5 rounded-full transition-all flex items-center justify-center ${
          isRecording 
            ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-200' 
            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
        } disabled:opacity-50`}
      >
        {isProcessing ? (
          <Loader2 className="animate-spin" size={20} />
        ) : isRecording ? (
          <Square size={20} fill="currentColor" />
        ) : (
          <Mic size={20} />
        )}
      </button>

      {isProcessing && (
        <div className="flex items-center gap-2 text-indigo-600 animate-pulse">
          <Sparkles size={16} />
          <span className="text-xs font-medium">IA Procesando...</span>
        </div>
      )}
    </div>
  );
}
