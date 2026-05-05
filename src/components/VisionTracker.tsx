import React, { useState, useRef } from 'react';
import { Camera, ArrowLeft, Loader2, Plus, Image as ImageIcon } from 'lucide-react';
import { analyzeFoodImage } from '../services/geminiService';
import type { FoodItem } from '../types';

interface Props {
  onBack: () => void;
  onAddFood: (food: FoodItem) => void;
}

export function VisionTracker({ onBack, onAddFood }: Props) {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setResult(null);
    setLoading(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Url = event.target?.result as string;
      setImagePreview(base64Url);

      // Extract base64 payload 
      const base64Data = base64Url.split(',')[1];
      const mimeType = file.type;

      try {
        const analysis = await analyzeFoodImage(base64Data, mimeType);
        setResult(analysis);
      } catch (err) {
        console.error(err);
        setError("Erro ao analisar a imagem. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!result) return;
    const foodItem: FoodItem = {
      id: crypto.randomUUID(),
      name: result.name,
      calories: result.calories,
      macros: {
        carbs: result.carbs,
        protein: result.protein,
        fat: result.fat
      },
      timestamp: Date.now(),
      imageUrl: imagePreview || undefined
    };
    onAddFood(foodItem);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 font-sans">
      <div className="max-w-md mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6">
          <button onClick={onBack} className="p-2 bg-[#121212] rounded-full hover:bg-gray-800 transition-colors">
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-xl font-bold">Vision Tracker</h1>
        </div>

        {/* Content */}
        {!imagePreview && !loading && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6 mt-12">
            <div className="w-32 h-32 rounded-full bg-[#121212] border border-[#39FF14]/30 flex items-center justify-center shadow-[0_0_40px_rgba(57,255,20,0.1)]">
              <Camera className="w-12 h-12 text-[#39FF14]" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">Escaneie sua comida</h2>
              <p className="text-gray-400 text-sm">Tire uma foto do seu prato para análise nutricional inteligente.</p>
            </div>
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleCapture}
            />
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={galleryInputRef}
              onChange={handleCapture}
            />
            <div className="flex flex-col space-y-4 w-full max-w-[240px]">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-6 py-4 bg-[#39FF14] text-black font-bold rounded-xl hover:bg-[#32e011] transition-transform active:scale-95 flex items-center justify-center"
              >
                <Camera className="w-5 h-5 mr-2" />
                Abrir Câmera
              </button>
              <button 
                onClick={() => galleryInputRef.current?.click()}
                className="w-full px-6 py-4 bg-transparent border-2 border-[#39FF14] text-[#39FF14] font-bold rounded-xl hover:bg-[#39FF14]/10 transition-transform active:scale-95 flex items-center justify-center"
              >
                <ImageIcon className="w-5 h-5 mr-2" />
                Buscar da Galeria
              </button>
            </div>
          </div>
        )}

        {(imagePreview || loading) && (
          <div className="flex flex-col flex-1">
             <div className="relative w-full h-64 rounded-2xl overflow-hidden border border-gray-800 bg-[#121212]">
                {imagePreview && (
                  <img src={imagePreview} alt="Comida capturada" className="w-full h-full object-cover" />
                )}
                {loading && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center backdrop-blur-sm">
                    <Loader2 className="w-8 h-8 text-[#39FF14] animate-spin mb-4" />
                    <span className="font-semibold text-[#39FF14] animate-pulse">Analisando nutrientes...</span>
                  </div>
                )}
             </div>

             {error && (
               <div className="mt-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-center">
                 {error}
                 <button 
                   onClick={() => fileInputRef.current?.click()}
                   className="block text-[#39FF14] mt-2 underline"
                 >
                   Tentar novamente
                 </button>
               </div>
             )}

             {result && !loading && (
               <div className="mt-6 flex-1 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-[#121212] p-6 rounded-2xl border border-gray-800 shadow-2xl">
                    <h2 className="text-2xl font-bold mb-1 capitalize text-[#39FF14]">{result.name}</h2>
                    <p className="text-gray-400 text-sm mb-6">Valores nutricionais estimados</p>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="p-4 bg-black rounded-xl border border-gray-800/50 flex flex-col items-center">
                        <span className="text-gray-400 text-xs uppercase tracking-wider mb-1">Calorias</span>
                        <span className="text-2xl font-bold">{Math.round(result.calories)}</span>
                      </div>
                      <div className="p-4 bg-black rounded-xl border border-gray-800/50 flex flex-col items-center relative overflow-hidden">
                        <div className="absolute top-0 w-full h-1 bg-[#39FF14]"></div>
                        <span className="text-gray-400 text-xs uppercase tracking-wider mb-1">Proteínas</span>
                        <span className="text-2xl font-bold">{Math.round(result.protein)}g</span>
                      </div>
                      <div className="p-4 bg-black rounded-xl border border-gray-800/50 flex flex-col items-center relative overflow-hidden">
                        <div className="absolute top-0 w-full h-1 bg-[#3b82f6]"></div>
                        <span className="text-gray-400 text-xs uppercase tracking-wider mb-1">Carbos</span>
                        <span className="text-2xl font-bold">{Math.round(result.carbs)}g</span>
                      </div>
                      <div className="p-4 bg-black rounded-xl border border-gray-800/50 flex flex-col items-center relative overflow-hidden">
                        <div className="absolute top-0 w-full h-1 bg-[#f59e0b]"></div>
                        <span className="text-gray-400 text-xs uppercase tracking-wider mb-1">Gorduras</span>
                        <span className="text-2xl font-bold">{Math.round(result.fat)}g</span>
                      </div>
                    </div>

                    <button 
                      onClick={handleSave}
                      className="w-full flex justify-center items-center py-4 bg-[#39FF14] hover:bg-[#32e011] text-black font-bold text-lg rounded-xl transition-colors"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Adicionar ao Diário
                    </button>
                    
                    <button 
                      onClick={() => {
                        setImagePreview(null);
                        setResult(null);
                      }}
                      className="w-full mt-3 py-3 text-gray-400 text-sm hover:text-white transition-colors"
                    >
                      Descartar e tirar outra foto
                    </button>
                  </div>
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
}
