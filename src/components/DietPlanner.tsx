import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Loader2, Calendar } from 'lucide-react';
import { generateDietPlan } from '../services/geminiService';
import type { UserProfile, FoodItem, DietPlan } from '../types';

interface Props {
  profile: UserProfile;
  foodHistory: FoodItem[];
  plan: DietPlan | null;
  setPlan: (plan: DietPlan | null) => void;
  onBack: () => void;
}

export function DietPlanner({ profile, foodHistory, plan, setPlan, onBack }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const generatedPlan = await generateDietPlan(profile, foodHistory);
      setPlan(generatedPlan);
    } catch (err) {
      console.error(err);
      setError("Falha ao gerar cardápio. Tente novamente.");
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
          <h1 className="text-xl font-bold">Smart Diet AI</h1>
        </div>

        {!plan && !loading && (
           <div className="mt-20 flex flex-col items-center justify-center space-y-6 text-center">
             <div className="relative w-24 h-24 bg-[#121212] rounded-full flex items-center justify-center border border-[#39FF14]/20 shadow-[0_0_50px_rgba(57,255,20,0.15)]">
               <Sparkles className="w-10 h-10 text-[#39FF14]" />
             </div>
             
             <div>
               <h2 className="text-2xl font-bold mb-2">Cardápio Ultra Personalizado</h2>
               <p className="text-gray-400 text-sm max-w-[280px] mx-auto">
                 Nossa IA avalia seu objetivo de {profile.goal.replace('_', ' ')}, TMB e histórico de alimentos para gerar 7 dias de refeições perfeitas.
               </p>
             </div>

             <div className="flex gap-4 mb-4 text-xs font-mono text-gray-500">
               <span>Meta: {Math.round(profile.targetCalories)} kcal</span>
               <span>•</span>
               <span>Prot: ~{Math.round(profile.targetMacros.protein)}g</span>
             </div>

             <button 
               onClick={handleGenerate}
               className="px-8 py-4 bg-[#39FF14] text-black font-bold rounded-2xl hover:bg-[#32e011] transition-transform active:scale-95 flex items-center shadow-lg shadow-[#39FF14]/20"
             >
               <Sparkles className="w-5 h-5 mr-2" />
               Gerar Cardápio IA
             </button>
           </div>
        )}

        {loading && (
          <div className="mt-32 flex flex-col items-center justify-center space-y-6">
            <Loader2 className="w-12 h-12 text-[#39FF14] animate-spin" />
            <div className="text-center">
              <p className="font-bold text-lg animate-pulse text-[#39FF14]">Calculando macros perfeitos...</p>
              <p className="text-gray-500 text-sm mt-2">Adaptando aos seus padrões alimentares</p>
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
                Seu Plano Semanal
              </h2>
              <p className="text-sm text-gray-400">Criado com base em metas de {Math.round(profile.targetCalories)} kcal/dia ajustado para {profile.goal.replace('_', ' ')}.</p>
            </div>

            <div className="space-y-6">
              {plan.days.map((dayPlan, i) => (
                <div key={i} className="bg-[#121212] rounded-2xl border border-gray-800 overflow-hidden">
                  <div className="bg-[#1a1a1a] px-5 py-3 border-b border-gray-800 font-bold text-lg capitalize">
                    {dayPlan.day}
                  </div>
                  <div className="p-5 space-y-5">
                    {dayPlan.meals.map((meal, j) => (
                      <div key={j} className="border-l-2 border-[#39FF14] pl-4">
                        <h4 className="font-semibold text-gray-200 mb-2 uppercase tracking-wider text-xs">{meal.type}</h4>
                        <ul className="space-y-1.5">
                          {meal.suggestions.map((item, k) => (
                            <li key={k} className="text-gray-400 text-sm flex items-start">
                              <span className="text-[#39FF14] mr-2 text-[10px] mt-1.5">●</span>
                              {item}
                            </li>
                          ))}
                        </ul>
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
              Gerar novo cardápio
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
