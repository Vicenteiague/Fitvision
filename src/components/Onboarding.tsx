import React, { useState } from 'react';
import type { UserProfile, Goal, Gender } from '../types';
import { cn } from '../lib/utils';
import { ChevronRight, Activity } from 'lucide-react';

interface Props {
  onComplete: (profile: Omit<UserProfile, 'uid' | 'createdAt'>) => void;
}

export function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState(1);
  const [gender, setGender] = useState<Gender>('masculino');
  const [goal, setGoal] = useState<Goal>('ganho_massa');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [timeline, setTimeline] = useState('3');

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      calculateAndFinish();
    }
  };

  const calculateAndFinish = () => {
    const w = parseFloat(weight) || 70;
    const h = parseFloat(height) || 170;
    const a = parseFloat(age) || 30;
    const t = parseInt(timeline, 10) || 3;

    // Mifflin-St Jeor
    let bmr = 10 * w + 6.25 * h - 5 * a;
    bmr += gender === 'masculino' ? 5 : -161;

    // TDEE (Assume moderate activity)
    const tdee = bmr * 1.45;

    let targetCalories = tdee;
    if (goal === 'perda_peso') {
      targetCalories -= 500;
      if (targetCalories < 1200) targetCalories = 1200;
    } else if (goal === 'ganho_massa' || goal === 'hipertrofia') {
      targetCalories += 300;
    }

    // Macros distribution
    let protein = 0, fat = 0, carbs = 0;
    if (goal === 'perda_peso') {
      protein = (w * 2.2); // ~2.2g per kg
      fat = (targetCalories * 0.30) / 9; // 30% fat
      carbs = (targetCalories - (protein * 4) - (fat * 9)) / 4;
    } else {
      protein = (w * 2.0); // 2g per kg
      fat = (targetCalories * 0.25) / 9; // 25% fat
      carbs = (targetCalories - (protein * 4) - (fat * 9)) / 4;
    }

    onComplete({
      gender,
      goal,
      weight: w,
      height: h,
      age: a,
      timelineMonths: t,
      bmr,
      tdee,
      targetCalories,
      targetMacros: { carbs, protein, fat }
    });
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-[#121212] rounded-2xl p-8 shadow-2xl border border-gray-800">
        <div className="flex items-center space-x-3 mb-8">
          <Activity className="w-8 h-8 text-[#39FF14]" />
          <h1 className="text-2xl font-bold tracking-tight">FitVision <span className="text-[#39FF14]">AI</span></h1>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-between mb-8 relative">
          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gray-800 -z-10 -translate-y-1/2"></div>
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={cn(
               "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
               step >= s ? "bg-[#39FF14] text-black" : "bg-gray-900 text-gray-500 border border-gray-800"
            )}>
              {s}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-6">
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-semibold mb-4">Qual é o seu gênero?</h2>
              <div className="flex gap-4">
                {(['masculino', 'feminino'] as Gender[]).map(g => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={cn(
                      "flex-1 py-4 rounded-xl border text-lg font-medium capitalize transition-all",
                      gender === g 
                        ? "border-[#39FF14] bg-[#39FF14]/10 text-[#39FF14]" 
                        : "border-gray-800 bg-black text-gray-400 hover:border-gray-600"
                    )}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-semibold mb-4">Qual é o seu objetivo principal?</h2>
              <div className="space-y-3">
                {[
                  { id: 'ganho_massa', label: 'Ganho de Massa Muscular' },
                  { id: 'hipertrofia', label: 'Hipertrofia' },
                  { id: 'perda_peso', label: 'Perda de Peso' }
                ].map(g => (
                  <button
                    key={g.id}
                    onClick={() => setGoal(g.id as Goal)}
                    className={cn(
                      "w-full py-4 px-6 rounded-xl border text-lg font-medium text-left transition-all",
                      goal === g.id 
                        ? "border-[#39FF14] bg-[#39FF14]/10 text-[#39FF14]" 
                        : "border-gray-800 bg-black text-gray-400 hover:border-gray-600"
                    )}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-semibold mb-4">Suas Bioestatísticas</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Peso (kg)</label>
                  <input 
                    type="number" 
                    value={weight}
                    onChange={e => setWeight(e.target.value)}
                    placeholder="Ex: 75"
                    className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Altura (cm)</label>
                  <input 
                    type="number" 
                    value={height}
                    onChange={e => setHeight(e.target.value)}
                    placeholder="Ex: 175"
                    className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Idade</label>
                  <input 
                    type="number" 
                    value={age}
                    onChange={e => setAge(e.target.value)}
                    placeholder="Ex: 30"
                    className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14] transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-semibold mb-4">Timeline</h2>
              <p className="text-gray-400 text-sm mb-4">Em quanto tempo você espera alcançar seus resultados?</p>
              <div className="space-y-3">
                {[
                  { id: '1', label: '1 Mês (Agressivo)' },
                  { id: '3', label: '3 Meses (Recomendado)' },
                  { id: '6', label: '6 Meses (Sustentável)' }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTimeline(t.id)}
                    className={cn(
                      "w-full py-4 px-6 rounded-xl border text-lg font-medium text-left transition-all",
                      timeline === t.id 
                        ? "border-[#39FF14] bg-[#39FF14]/10 text-[#39FF14]" 
                        : "border-gray-800 bg-black text-gray-400 hover:border-gray-600"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8">
          <button
            onClick={handleNext}
            disabled={(step === 3 && (!weight || !height || !age))}
            className="w-full flex justify-center items-center py-4 bg-[#39FF14] hover:bg-[#32e011] text-black font-bold text-lg rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step === 4 ? 'Gerar Planejamento' : 'Próximo'}
            <ChevronRight className="w-5 h-5 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
