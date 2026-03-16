import React from 'react';

interface HumanBodyGraphicProps {
  onPartSelect: (part: string) => void;
  selectedPart?: string;
}

export default function HumanBodyGraphic({ onPartSelect, selectedPart }: HumanBodyGraphicProps) {
  const bodyParts = [
    { id: 'head', name: 'Cabeza', cx: 50, cy: 10, r: 8 },
    { id: 'neck', name: 'Cuello', cx: 50, cy: 20, r: 4 },
    { id: 'shoulder_r', name: 'Hombro Derecho', cx: 35, cy: 25, r: 5 },
    { id: 'shoulder_l', name: 'Hombro Izquierdo', cx: 65, cy: 25, r: 5 },
    { id: 'elbow_r', name: 'Codo Derecho', cx: 30, cy: 40, r: 4 },
    { id: 'elbow_l', name: 'Codo Izquierdo', cx: 70, cy: 40, r: 4 },
    { id: 'wrist_r', name: 'Muñeca Derecha', cx: 25, cy: 55, r: 3 },
    { id: 'wrist_l', name: 'Muñeca Izquierda', cx: 75, cy: 55, r: 3 },
    { id: 'chest', name: 'Pecho', cx: 50, cy: 35, r: 10 },
    { id: 'abdomen', name: 'Abdomen', cx: 50, cy: 50, r: 10 },
    { id: 'hip_r', name: 'Cadera Derecha', cx: 40, cy: 65, r: 6 },
    { id: 'hip_l', name: 'Cadera Izquierda', cx: 60, cy: 65, r: 6 },
    { id: 'knee_r', name: 'Rodilla Derecha', cx: 40, cy: 85, r: 5 },
    { id: 'knee_l', name: 'Rodilla Izquierda', cx: 60, cy: 85, r: 5 },
    { id: 'ankle_r', name: 'Tobillo Derecho', cx: 40, cy: 95, r: 3 },
    { id: 'ankle_l', name: 'Tobillo Izquierdo', cx: 60, cy: 95, r: 3 },
    { id: 'back_upper', name: 'Espalda Alta', cx: 50, cy: 30, r: 8, isBack: true },
    { id: 'back_lower', name: 'Espalda Baja', cx: 50, cy: 60, r: 8, isBack: true },
  ];

  return (
    <div className="flex flex-col items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Mapa de Dolor</p>
      <div className="relative w-48 h-64">
        <svg viewBox="0 0 100 110" className="w-full h-full drop-shadow-sm">
          {/* Human Outline */}
          <path 
            d="M50,2 C55,2 58,5 58,10 C58,15 55,18 50,18 C45,18 42,15 42,10 C42,5 45,2 50,2 M50,18 L50,22 M35,25 L65,25 M35,25 L30,40 L25,55 M65,25 L70,40 L75,55 M35,25 L40,65 L40,95 L38,105 M65,25 L60,65 L60,95 L62,105 M40,65 L60,65 M40,65 L50,65 L60,65" 
            stroke="#cbd5e1" 
            strokeWidth="2" 
            fill="none" 
            strokeLinecap="round"
          />
          
          {/* Clickable Parts */}
          {bodyParts.map((part) => (
            <circle
              key={part.id}
              cx={part.cx}
              cy={part.cy}
              r={part.r}
              className={`cursor-pointer transition-all duration-300 ${
                selectedPart?.toLowerCase().includes(part.name.toLowerCase())
                  ? 'fill-primary stroke-primary/30 stroke-[4px]'
                  : 'fill-slate-200 hover:fill-primary/40 stroke-white stroke-1'
              }`}
              onClick={() => onPartSelect(part.name)}
            >
              <title>{part.name}</title>
            </circle>
          ))}
        </svg>
      </div>
      <div className="flex flex-wrap justify-center gap-1">
        {['Rodilla', 'Hombro', 'Espalda', 'Cadera', 'Tobillo', 'Codo', 'Muñeca'].map(p => (
          <button
            key={p}
            onClick={() => onPartSelect(p)}
            className={`text-[10px] px-2 py-1 rounded-full border transition-all ${
              selectedPart?.toLowerCase().includes(p.toLowerCase())
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-slate-600 border-slate-200 hover:border-primary'
            }`}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
