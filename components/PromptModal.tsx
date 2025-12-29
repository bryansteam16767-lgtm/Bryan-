
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useState, useEffect } from 'react';
import { Sparkles, X, Loader2, Wand2, Hammer, Lightbulb, Scale } from 'lucide-react';

interface PromptModalProps {
  isOpen: boolean;
  mode: 'create' | 'morph';
  onClose: () => void;
  onSubmit: (prompt: string, isSymmetrical: boolean) => Promise<void>;
}

const SUGGESTIONS = {
    create: [
        "A giant redwood tree with a treehouse",
        "A cyberpunk racing car",
        "A floating castle in the clouds",
        "A friendly orange robot",
        "A detailed fruit basket"
    ],
    morph: [
        "Transform into a space rocket",
        "Make it look like a scary monster",
        "Turn it into a sleek modern house",
        "Rebuild as a pirate ship",
        "Convert to a cute puppy"
    ]
}

export const PromptModal: React.FC<PromptModalProps> = ({ isOpen, mode, onClose, onSubmit }) => {
  const [prompt, setPrompt] = useState('');
  const [isSymmetrical, setIsSymmetrical] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPrompt('');
      setIsSymmetrical(true);
      setError('');
      setIsLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!prompt.trim() || isLoading) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      await onSubmit(prompt, isSymmetrical);
      onClose();
    } catch (err) {
      setError('The magic engine had a hiccup! Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isCreate = mode === 'create';
  const themeText = isCreate ? 'text-indigo-600' : 'text-emerald-600';
  const themeBg = isCreate ? 'bg-indigo-600' : 'bg-emerald-600';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6 font-sans">
      <div className={`bg-white rounded-[40px] shadow-2xl w-full max-w-xl flex flex-col border border-white animate-in fade-in zoom-in duration-300 scale-95 sm:scale-100 overflow-hidden`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between p-8 border-b border-slate-50`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${isCreate ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                {isCreate ? <Wand2 size={28} strokeWidth={2.5} /> : <Hammer size={28} strokeWidth={2.5} />}
            </div>
            <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                    {isCreate ? 'Create Something New' : 'Morph Existing Blocks'}
                </h2>
                <p className="text-xs font-black uppercase tracking-[0.2em] opacity-40">
                    POWERED BY GEMINI 3 FLASH
                </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
            disabled={isLoading}
          >
            <X size={24} strokeWidth={3} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 bg-white space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={isCreate 
                    ? "What should we imagine into existence?" 
                    : "How should these blocks be rearranged?"}
                  disabled={isLoading}
                  className={`w-full h-40 resize-none bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 font-bold text-lg text-slate-700 focus:outline-none focus:ring-8 focus:ring-indigo-500/5 transition-all placeholder:text-slate-300 ${isCreate ? 'focus:border-indigo-200' : 'focus:border-emerald-200'}`}
                  autoFocus
                />
            </div>

            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isSymmetrical ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>
                        <Scale size={20} />
                    </div>
                    <div>
                        <p className="font-black text-xs text-slate-700 uppercase tracking-wider leading-none mb-1">Mirror Symmetry</p>
                        <p className="text-[10px] text-slate-400 font-bold">Perfectly balanced along the X-axis</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setIsSymmetrical(!isSymmetrical)}
                    disabled={isLoading}
                    className={`
                        relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                        ${isSymmetrical ? themeBg : 'bg-slate-200'}
                    `}
                >
                    <span
                        className={`
                            pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                            ${isSymmetrical ? 'translate-x-5' : 'translate-x-0'}
                        `}
                    />
                </button>
            </div>

            <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest">
                    <Lightbulb size={12} />
                    Try these:
                </div>
                <div className="flex flex-wrap gap-2">
                    {SUGGESTIONS[mode].map((s, idx) => (
                        <button 
                            key={idx}
                            type="button"
                            onClick={() => setPrompt(s)}
                            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 text-xs font-bold rounded-full transition-colors border border-slate-100"
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 text-rose-600 text-sm font-bold flex items-center gap-3 animate-in shake">
                <X size={20} /> {error}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button 
                type="submit"
                disabled={!prompt.trim() || isLoading}
                className={`
                  flex items-center gap-3 px-10 py-4 rounded-2xl font-black text-white text-base transition-all
                  ${isLoading 
                    ? 'bg-slate-200 text-slate-400 cursor-wait' 
                    : `${themeBg} hover:opacity-90 shadow-xl shadow-indigo-500/20 active:scale-95`}
                `}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Thinking...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} fill="currentColor" />
                    Generate Magic
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
