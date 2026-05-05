import React from 'react';
import { Activity, LogIn } from 'lucide-react';
import { signIn } from '../lib/firebase';

export function Login() {
  const handleLogin = async () => {
    try {
      await signIn();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-sm bg-[#121212] rounded-3xl p-8 border border-gray-800 text-center shadow-[0_0_50px_rgba(57,255,20,0.05)]">
        <div className="w-20 h-20 bg-black rounded-full mx-auto flex items-center justify-center border border-[#39FF14]/30 shadow-lg shadow-[#39FF14]/10 mb-6">
          <Activity className="w-10 h-10 text-[#39FF14]" />
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight mb-2">FitVision <span className="text-[#39FF14]">AI</span></h1>
        <p className="text-gray-400 mb-8 text-sm">Nutrição inteligente e hiperpersonalizada baseada em IA e visão computacional.</p>

        <button 
          onClick={handleLogin}
          className="w-full py-4 bg-white text-black font-bold rounded-2xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 mr-3" />
          Continuar com o Google
        </button>
      </div>
    </div>
  );
}
