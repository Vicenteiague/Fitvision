import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Activity, Camera, Calendar, Flame } from 'lucide-react';
import type { UserProfile, FoodItem } from '../types';

interface Props {
  profile: UserProfile;
  foodHistory: FoodItem[];
  onOpenTracker: () => void;
  onOpenDiet: () => void;
}

export function Dashboard({ profile, foodHistory, onOpenTracker, onOpenDiet }: Props) {
  const getTodayStart = () => new Date().setHours(0,0,0,0);
  
  const todayFoods = foodHistory.filter(f => f.timestamp >= getTodayStart());
  
  const consumed = todayFoods.reduce((acc, curr) => ({
    calories: acc.calories + curr.calories,
    carbs: acc.carbs + curr.macros.carbs,
    protein: acc.protein + curr.macros.protein,
    fat: acc.fat + curr.macros.fat
  }), { calories: 0, carbs: 0, protein: 0, fat: 0 });

  // Data for the Donut Chart. Green for protein.
  const macrosData = [
    { name: 'Carboidratos', value: profile.targetMacros.carbs, consumed: consumed.carbs, color: '#3b82f6' }, // Blue
    { name: 'Proteínas', value: profile.targetMacros.protein, consumed: consumed.protein, color: '#39FF14' }, // Neon Green
    { name: 'Gorduras', value: profile.targetMacros.fat, consumed: consumed.fat, color: '#f59e0b' },    // Yellow/Orange
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6 font-sans">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Activity className="w-8 h-8 text-[#39FF14]" />
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#121212] border border-gray-800 flex items-center justify-center">
            <span className="font-bold text-[#39FF14]">{profile.gender === 'masculino' ? 'M' : 'F'}</span>
          </div>
        </div>

        {/* Energy Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#121212] p-4 rounded-2xl border border-gray-800">
            <div className="text-gray-400 text-sm mb-1">TMB</div>
            <div className="text-xl font-bold">{Math.round(profile.bmr)} <span className="text-sm font-normal text-gray-500">kcal</span></div>
          </div>
          <div className="bg-[#121212] p-4 rounded-2xl border border-gray-800">
            <div className="text-gray-400 text-sm mb-1">GET</div>
            <div className="text-xl font-bold">{Math.round(profile.tdee)} <span className="text-sm font-normal text-gray-500">kcal</span></div>
          </div>
        </div>

        {/* Daily Goal & Macros */}
        <div className="bg-[#121212] p-6 rounded-2xl border border-gray-800 relative">
          <h2 className="text-lg font-bold mb-4 flex items-center">
            <Flame className="w-5 h-5 mr-2 text-[#39FF14]" />
            Meta Diária
          </h2>
          
          <div className="flex flex-col items-center">
            <div className="w-48 h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={macrosData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {macrosData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.2} />
                    ))}
                  </Pie>
                  <Pie
                    data={macrosData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="consumed"
                    stroke="none"
                    cornerRadius={5}
                  >
                    {macrosData.map((entry, index) => (
                      <Cell key={`cell-consumed-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#121212', border: '1px solid #1f2937', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-white">{Math.max(0, Math.round(profile.targetCalories - consumed.calories))}</span>
                <span className="text-xs text-gray-400">kcal restantes</span>
              </div>
            </div>
            
            <div className="flex justify-between w-full mt-4 text-sm">
               {macrosData.map(m => (
                 <div key={m.name} className="flex flex-col items-center">
                   <div className="flex items-center mb-1">
                     <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: m.color }}></div>
                     <span className="text-gray-400">{m.name}</span>
                   </div>
                   <span className="font-bold">{Math.round(m.consumed)} / {Math.round(m.value)}g</span>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 pt-4">
          <button 
            onClick={onOpenTracker}
            className="flex flex-col items-center justify-center p-6 bg-[#121212] hover:bg-[#1a1a1a] border border-gray-800 rounded-2xl transition-colors group"
          >
            <div className="w-12 h-12 bg-[#39FF14]/10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Camera className="w-6 h-6 text-[#39FF14]" />
            </div>
            <span className="font-medium">Vision Tracker</span>
          </button>

          <button 
            onClick={onOpenDiet}
            className="flex flex-col items-center justify-center p-6 bg-[#121212] hover:bg-[#1a1a1a] border border-gray-800 rounded-2xl transition-colors group"
          >
            <div className="w-12 h-12 bg-[#39FF14]/10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6 text-[#39FF14]" />
            </div>
            <span className="font-medium">Cardápio IA</span>
          </button>
        </div>

        {/* Today's Log */}
        {todayFoods.length > 0 && (
          <div className="bg-[#121212] p-6 rounded-2xl border border-gray-800 mt-6">
            <h3 className="font-bold mb-4">Registro de Hoje</h3>
            <div className="space-y-4">
              {todayFoods.map(food => (
                <div key={food.id} className="flex justify-between items-center pb-4 border-b border-gray-800 last:border-0 last:pb-0">
                  <div>
                    <div className="font-medium capitalize">{food.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      P: {food.macros.protein}g • C: {food.macros.carbs}g • G: {food.macros.fat}g
                    </div>
                  </div>
                  <div className="font-bold text-[#39FF14]">{food.calories} kcal</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
