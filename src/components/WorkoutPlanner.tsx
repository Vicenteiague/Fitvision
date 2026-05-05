import React, { useState } from 'react';
import { ArrowLeft, Dumbbell, Loader2, Calendar } from 'lucide-react';
import { generateWorkoutPlan } from '../services/geminiService';
import type { UserProfile, WorkoutPlan } from '../types';

interface Props {
  profile: UserProfile;
  onBack: () => void;
}

export function WorkoutPlanner({ profile, onBack }: Props) {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const generatedPlan = await generateWorkoutPlan(profile);
      setPlan(generatedPlan);
    } catch (err) {
      console.error(err);
      setError("Falha ao gerar treino. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 font-sans">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button onClick={onBack} className="p-2 bg-[#121212] rounded-full hover:bg-gray-800 transition-colors">
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-xl font-bold">Smart Workout AI</h1>
        </div>

        {!plan && !loading && (
           <div className="mt-20 flex flex-col items-center justify-center space-y-6 text-center">
             <div className="relative w-24 h-24 bg-[#121212] rounded-full flex items-center justify-center border border-[#39FF14]/20 shadow-[0_0_50px_rgba(57,255,20,0.15)]">
               <Dumbbell className="w-10 h-10 text-[#39FF14]" />
             </div>
             
             <div>
               <h2 className="text-2xl font-bold mb-2">Treinos Personalizados</h2>
               <p className="text-gray-400 text-sm max-w-[300px] mx-auto">
                 Deixe a IA criar a sua prescrição de treino semanal baseada no seu nível e focado em {profile.goal.replace('_', ' ')}.
               </p>
             </div>

             <div className="flex gap-4 mb-4 text-xs font-mono text-gray-500">
               <span>Público: Personalizado</span>
               <span>•</span>
               <span>Duração: 7 Dias</span>
             </div>

             <button 
               onClick={handleGenerate}
               className="px-8 py-4 bg-[#39FF14] text-black font-bold rounded-2xl hover:bg-[#32e011] transition-transform active:scale-95 flex items-center shadow-lg shadow-[#39FF14]/20"
             >
               <Dumbbell className="w-5 h-5 mr-2" />
               Gerar Treino IA
             </button>
           </div>
        )}

        {loading && (
          <div className="mt-32 flex flex-col items-center justify-center space-y-6">
            <Loader2 className="w-12 h-12 text-[#39FF14] animate-spin" />
            <div className="text-center">
              <p className="font-bold text-lg animate-pulse text-[#39FF14]">Montando ficha de treino...</p>
              <p className="text-gray-500 text-sm mt-2">Calculando volume adequado para o seu corpo</p>
            </div>
          </div>
        )}

        {error && !loading && (
           <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-center">
             {error}
             <button 
               onClick={handleGenerate}
               className="block w-full mt-3 py-2 bg-red-500/20 text-red-300 rounded-lg"
             >
               Tentar novamente
             </button>
           </div>
        )}

        {plan && !loading && (
          <div className="space-y-6 pb-12 animate-in fade-in duration-500">
            <div className="bg-[#121212] p-5 rounded-2xl border border-[#39FF14]/30 shadow-[0_0_20px_rgba(57,255,20,0.05)]">
              <h2 className="text-lg font-bold text-[#39FF14] flex items-center mb-2">
                <Calendar className="w-5 h-5 mr-2" />
                Seu Cronograma
              </h2>
              <p className="text-sm text-gray-400">Rotina programada para otimização do {profile.goal.replace('_', ' ')}.</p>
            </div>

            <div className="space-y-6">
              {plan.days.map((dayPlan, i) => (
                <div key={i} className="bg-[#121212] rounded-2xl border border-gray-800 overflow-hidden">
                  <div className="bg-[#1a1a1a] px-5 py-3 border-b border-gray-800 flex justify-between items-center">
                    <span className="font-bold text-lg capitalize">{dayPlan.day}</span>
                    <span className="text-xs bg-[#39FF14]/10 text-[#39FF14] px-2 py-1 rounded-md font-mono border border-[#39FF14]/20">{dayPlan.focus}</span>
                  </div>
                  <div className="p-0">
                    {dayPlan.exercises.length === 0 && (
                      <div className="p-5 text-gray-500 italic text-center">Nenhum exercício programado.</div>
                    )}
                    {dayPlan.exercises.map((exercise, j) => (
                      <div key={j} className="p-4 border-b border-gray-800/50 last:border-0 hover:bg-white/[0.02] transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-200 text-base">{exercise.name}</h4>
                        </div>
                        <div className="flex gap-4 text-sm font-mono mt-1 w-full justify-between pr-4">
                          <div className="text-gray-400">
                            <span className="text-gray-600 uppercase text-[10px] block">Séries</span>
                            <span className="text-[#39FF14] font-bold">{exercise.sets}</span>
                          </div>
                          <div className="text-gray-400">
                            <span className="text-gray-600 uppercase text-[10px] block">Reps</span>
                            <span className="text-white font-bold">{exercise.reps}</span>
                          </div>
                          <div className="text-gray-400">
                            <span className="text-gray-600 uppercase text-[10px] block">Pausa</span>
                            <span className="text-gray-300 font-bold">{exercise.rest || '-'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => setPlan(null)}
              className="w-full py-4 text-gray-400 font-medium hover:text-white transition-colors"
            >
              Gerar novo treino
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
