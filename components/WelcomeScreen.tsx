
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React from 'react';
import { X } from 'lucide-react';

interface WelcomeScreenProps {
  visible: boolean;
  onDismiss: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ visible, onDismiss }) => {
  return (
    <div className={`
        absolute inset-0 pointer-events-none flex items-center justify-center z-40 select-none p-6
        transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] font-sans
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12 pointer-events-none'}
    `}>
      <div className="relative max-w-lg w-full text-center flex flex-col items-center gap-8 bg-white/95 backdrop-blur-2xl p-12 rounded-[50px] border border-white shadow-[0_30px_100px_rgba(0,0,0,0.1)] pointer-events-auto">
        <button 
            onClick={onDismiss}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-300 hover:text-slate-600 transition-all"
        >
            <X size={24} strokeWidth={3} />
        </button>

        <div className="space-y-4">
            <div className="inline-block bg-indigo-50 px-4 py-1.5 rounded-full text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-2">
                The Imagination Playground
            </div>
            <h1 className="text-5xl font-black text-slate-800 tracking-tighter leading-tight">
                Voxel Toy Box
            </h1>
            <p className="text-slate-500 font-bold text-lg max-w-xs mx-auto">
                Break blocks apart and rebuild them into anything you can imagine.
            </p>
        </div>
        
        <div className="grid grid-cols-1 gap-4 w-full text-left">
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-100">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500 flex items-center justify-center text-white font-black">1</div>
                <p className="font-bold text-slate-700 text-sm">Build models using natural language</p>
            </div>
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-100">
                <div className="w-10 h-10 rounded-2xl bg-rose-500 flex items-center justify-center text-white font-black">2</div>
                <p className="font-bold text-slate-700 text-sm">Explode your creations into loose pieces</p>
            </div>
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-100">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white font-black">3</div>
                <p className="font-bold text-slate-700 text-sm">Morph the same blocks into new shapes</p>
            </div>
        </div>

        <button 
            onClick={onDismiss}
            className="w-full py-5 bg-slate-900 text-white rounded-[25px] font-black text-lg hover:bg-indigo-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
        >
            Start Playing
        </button>
      </div>
    </div>
  );
};
