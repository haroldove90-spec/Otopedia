import { GoogleGenAI, Type } from '@google/genai';

// Initialize the Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface ClinicalData {
  diagnosis: string;
  medication: string;
  dose: string;
  next_appointment: string;
  summary: string;
}

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export async function processMedicalDictation(audioBlob: Blob): Promise<ClinicalData> {
  try {
    const base64Audio = await blobToBase64(audioBlob);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          parts: [
            {
              inlineData: {
                data: base64Audio,
                mimeType: audioBlob.type || 'audio/webm',
              },
            },
            {
              text: `Eres un asistente médico experto. Escucha el siguiente dictado de un especialista en ortopedia.
              Extrae la información y devuélvela estrictamente en el formato JSON solicitado.
              Si algún dato no se menciona, escribe "No especificado".`,
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            diagnosis: { type: Type.STRING, description: 'Diagnóstico principal' },
            medication: { type: Type.STRING, description: 'Medicamentos recetados' },
            dose: { type: Type.STRING, description: 'Dosis e indicaciones' },
            next_appointment: { type: Type.STRING, description: 'Próxima cita' },
            summary: { type: Type.STRING, description: 'Resumen clínico breve' },
          },
          required: ['diagnosis', 'medication', 'dose', 'next_appointment', 'summary'],
        },
      },
    });

    if (!response.text) throw new Error('No se recibió respuesta de Gemini');
    
    const extractedData = JSON.parse(response.text) as ClinicalData;
    return extractedData;

  } catch (error) {
    console.error('Error procesando el dictado:', error);
    throw error;
  }
}
