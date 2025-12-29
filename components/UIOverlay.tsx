
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useState, useEffect, useRef } from 'react';
import { AppState, SavedModel, ThemeType } from '../types';
import { 
  Box, Bird, Cat, Rabbit, Users, Code2, Wand2, Hammer, 
  FolderOpen, ChevronUp, FileJson, History, Play, Pause, 
  Info, Wrench, Loader2, Palette, Sun, Moon, Zap, Cloud,
  LifeBuoy, ChevronRight, MessageSquare, Lightbulb, Trash2,
  Edit2, Check, Castle, Bot, Rocket, Flower2, BoxSelect
} from 'lucide-react';

interface UIOverlayProps {
  voxelCount: number;
  appState: AppState;
  currentBaseModel: string;
  customBuilds: SavedModel[];
  customRebuilds: SavedModel[];
  isAutoRotate: boolean;
  isInfoVisible: boolean;
  isGenerating: boolean;
  loadingMessage?: string;
  currentTheme: ThemeType;
  onDismantle: () => void;
  onRebuild: (type: string) => void;
  onNewScene: (type: string) => void;
  onSelectCustomBuild: (model: SavedModel) => void;
  onSelectCustomRebuild: (model: SavedModel) => void;
  onDeleteBuild: (index: number) => void;
  onDeleteRebuild: (index: number) => void;
  onClearHistory: () => void;
  onPromptCreate: () => void;
  onPromptMorph: () => void;
  onShowJson: () => void;
  onImportJson: () => void;
  onImportMesh: () => void;
  onToggleRotation: () => void;
  onToggleInfo: () => void;
  onThemeChange: (theme: ThemeType) => void;
}

const LOADING_MESSAGES = [
    "Gemini is sketching ideas...",
    "Aligning voxel blocks...",
    "Drying the digital paint...",
    "Finalizing structural integrity...",
    "Adding magical touches...",
    "Almost there..."
];

export const UIOverlay: React.FC<UIOverlayProps> = ({
  voxelCount,
  appState,
  currentBaseModel,
  customBuilds,
  customRebuilds,
  isAutoRotate,
  isInfoVisible,
  isGenerating,
  loadingMessage,
  currentTheme,
  onDismantle,
  onRebuild,
  onNewScene,
  onSelectCustomBuild,
  onSelectCustomRebuild,
  onDeleteBuild,
  onDeleteRebuild,
  onClearHistory,
  onPromptCreate,
  onPromptMorph,
  onShowJson,
  onImportJson,
  onImportMesh,
  onToggleRotation,
  onToggleInfo,
  onThemeChange
}) => {
  const isStable = appState === AppState.STABLE;
  const isDismantling = appState === AppState.DISMANTLING;
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  useEffect(() => {
    if (isGenerating) {
        const interval = setInterval(() => {
            setLoadingMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
        }, 2500);
        return () => clearInterval(interval);
    }
  }, [isGenerating]);
  
  const isOriginal = ['Eagle', 'Cat', 'Rabbit', 'Twins', 'Castle', 'Robot', 'Spaceship', 'Flower'].includes(currentBaseModel);

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none select-none overflow-hidden font-sans">
      
      {/* --- Top Left: Inventory & Builds --- */}
      <div className="absolute top-6 left-6 flex flex-col gap-4 pointer-events-auto">
        <DropdownMenu 
            icon={<FolderOpen size={20} />}
            label="Toy Box"
            color="indigo"
        >
            <div className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">ORIGINALS</div>
            <div className="grid grid-cols-2 gap-1 p-1">
                <DropdownItem onClick={() => onNewScene('Eagle')} icon={<Bird size={14}/>} label="Eagle" compact />
                <DropdownItem onClick={() => onNewScene('Cat')} icon={<Cat size={14}/>} label="Cat" compact />
                <DropdownItem onClick={() => onNewScene('Rabbit')} icon={<Rabbit size={14}/>} label="Rabbit" compact />
                <DropdownItem onClick={() => onNewScene('Twins')} icon={<Users size={14}/>} label="Twins" compact />
                <DropdownItem onClick={() => onNewScene('Castle')} icon={<Castle size={14}/>} label="Castle" compact />
                <DropdownItem onClick={() => onNewScene('Robot')} icon={<Bot size={14}/>} label="Robot" compact />
                <DropdownItem onClick={() => onNewScene('Spaceship')} icon={<Rocket size={14}/>} label="Space" compact />
                <DropdownItem onClick={() => onNewScene('Flower')} icon={<Flower2 size={14}/>} label="Flower" compact />
            </div>
            
            <div className="h-px bg-slate-100 mx-2 my-1" />
            
            <div className="px-3 py-2 text-[10px] font-black text-sky-400 uppercase tracking-[0.2em]">MAGIC</div>
            <DropdownItem onClick={onPromptCreate} icon={<Wand2 size={16}/>} label="Dream a Build..." highlight />
            <DropdownItem onClick={onImportMesh} icon={<BoxSelect size={16}/>} label="Import 3D Mesh" />
            
            {customBuilds.length > 0 && (
                <>
                    <div className="h-px bg-slate-100 mx-2 my-1" />
                    <div className="px-3 py-2 flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">YOUR HISTORY</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onClearHistory(); }}
                        className="text-[9px] font-black text-rose-400 hover:text-rose-600 uppercase tracking-tighter"
                      >
                        Clear All
                      </button>
                    </div>
                    {customBuilds.map((model, idx) => (
                        <DropdownItem 
                            key={`build-${model.id || idx}`} 
                            onClick={() => onSelectCustomBuild(model)} 
                            onDelete={() => onDeleteBuild(idx)}
                            icon={<History size={16}/>} 
                            label={model.name} 
                            truncate
                        />
                    ))}
                </>
            )}
            <div className="h-px bg-slate-100 mx-2 my-1" />
            <DropdownItem onClick={onImportJson} icon={<FileJson size={16}/>} label="Import Blueprint" />
        </DropdownMenu>

        <div className="flex items-center gap-3 px-4 py-3 bg-white/95 backdrop-blur-md shadow-lg rounded-2xl border border-slate-100 text-slate-500 font-bold w-fit animate-in slide-in-from-left-4 duration-500">
            <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600">
                <Box size={20} strokeWidth={3} />
            </div>
            <div className="flex flex-col leading-none pr-2">
                <span className="text-[10px] uppercase tracking-widest opacity-50 mb-1">Blocks Used</span>
                <span className="text-xl text-slate-800 font-black font-mono tracking-tighter">{voxelCount}</span>
            </div>
        </div>
      </div>

      {/* --- Top Right: Utility & Themes --- */}
      <div className="absolute top-6 right-6 flex flex-col items-end gap-3 pointer-events-auto">
        <div className="flex gap-2">
            <TactileButton
                onClick={() => setIsSupportOpen(true)}
                color="white"
                icon={<LifeBuoy size={20} strokeWidth={2.5} />}
                label="Help"
                compact
            />
            <TactileButton
                onClick={onToggleRotation}
                color={isAutoRotate ? 'sky' : 'white'}
                icon={isAutoRotate ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                label="Cam"
                compact
            />
            <TactileButton
                onClick={onShowJson}
                color="white"
                icon={<Code2 size={20} strokeWidth={2.5} />}
                label="Share"
            />
        </div>

        <DropdownMenu 
            icon={<Palette size={20} />}
            label="Theme"
            color="white"
            align="right"
        >
            <DropdownItem onClick={() => onThemeChange('classic')} icon={<Cloud size={16}/>} label="Soft Day" active={currentTheme === 'classic'} />
            <DropdownItem onClick={() => onThemeChange('midnight')} icon={<Moon size={16}/>} label="Midnight" active={currentTheme === 'midnight'} />
            <DropdownItem onClick={() => onThemeChange('neon')} icon={<Zap size={16}/>} label="Neon Night" active={currentTheme === 'neon'} />
            <DropdownItem onClick={() => onThemeChange('pastel')} icon={<Sun size={16}/>} label="Candy" active={currentTheme === 'pastel'} />
        </DropdownMenu>
      </div>

      {/* --- Side Panel: Support & AI Tips --- */}
      {isSupportOpen && (
        <div className="absolute inset-y-0 right-0 w-80 bg-white/90 backdrop-blur-2xl shadow-2xl border-l border-white p-8 pointer-events-auto animate-in slide-in-from-right duration-500 flex flex-col gap-6 z-50">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-800">AI Support</h3>
                <button onClick={() => setIsSupportOpen(false)} className="p-2 bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600">
                    <ChevronRight size={20} strokeWidth={3} />
                </button>
            </div>

            <div className="space-y-4">
                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex gap-3 items-start">
                    <Lightbulb className="text-indigo-500 shrink-0" size={20} />
                    <div className="space-y-1">
                        <p className="font-black text-xs text-indigo-600 uppercase">Design Tip</p>
                        <p className="text-xs text-indigo-900 leading-relaxed font-bold">Use words like "vibrant colors", "symmetric" or "pixel art style" for better results.</p>
                    </div>
                </div>

                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex gap-3 items-start">
                    <Wrench className="text-emerald-500 shrink-0" size={20} />
                    <div className="space-y-1">
                        <p className="font-black text-xs text-emerald-600 uppercase">Mechanics</p>
                        <p className="text-xs text-emerald-900 leading-relaxed font-bold">Explode your model to release the blocks. Only then can you "Morph" to rebuild them.</p>
                    </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex gap-3 items-start">
                    <MessageSquare className="text-slate-500 shrink-0" size={20} />
                    <div className="space-y-1">
                        <p className="font-black text-xs text-slate-500 uppercase">Limitations</p>
                        <p className="text-xs text-slate-600 leading-relaxed font-bold italic">Gemini imagines connected shapes best. Avoid asking for multiple separate objects.</p>
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-6 border-t border-slate-100 text-[10px] text-center font-black text-slate-300 uppercase tracking-widest">
                Voxel Engine v2.5.0
            </div>
        </div>
      )}

      {/* --- Center: AI Thinking State --- */}
      {isGenerating && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/10 backdrop-blur-[2px] pointer-events-auto">
              <div className="bg-white/95 backdrop-blur-xl border border-white p-10 rounded-[40px] shadow-2xl flex flex-col items-center gap-6 min-w-[320px] animate-in fade-in zoom-in duration-300">
                  <div className="relative">
                      <div className="absolute inset-0 bg-indigo-400 rounded-full animate-ping opacity-20 scale-150"></div>
                      <div className="relative w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center">
                          <Loader2 size={40} className="text-indigo-500 animate-spin" strokeWidth={3} />
                      </div>
                  </div>
                  <div className="text-center space-y-2">
                      <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                        {loadingMessage?.includes('Voxelizing') ? 'Voxelizing Mesh' : 'Gemini is Imagining'}
                      </h3>
                      <p className="text-indigo-600 font-bold text-sm h-5 transition-all duration-500">
                          {loadingMessage || LOADING_MESSAGES[loadingMsgIndex]}
                      </p>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full animate-progress-indefinite"></div>
                  </div>
              </div>
          </div>
      )}

      {/* --- Bottom: Core Action Center --- */}
      <div className="absolute bottom-10 left-0 w-full flex justify-center items-end pointer-events-none px-6">
        
        <div className="pointer-events-auto transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]">
            {isStable && !isGenerating && (
                 <div className="animate-in slide-in-from-bottom-20 fade-in duration-500">
                     <BigActionButton 
                        onClick={onDismantle} 
                        icon={<Hammer size={40} strokeWidth={2.5} />} 
                        label="EXPLODE PILE" 
                        color="rose" 
                     />
                 </div>
            )}

            {isDismantling && !isGenerating && (
                <div className="flex items-end gap-6 animate-in slide-in-from-bottom-20 fade-in duration-500">
                     <DropdownMenu 
                        icon={<Wrench size={24} />}
                        label="REBUILD AS..."
                        color="emerald"
                        direction="up"
                        big
                     >
                        <div className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">QUICK REBUILDS</div>
                        <div className="grid grid-cols-2 gap-1 p-1">
                            <DropdownItem onClick={() => onRebuild('Eagle')} icon={<Bird size={14}/>} label="Eagle" compact />
                            <DropdownItem onClick={() => onRebuild('Cat')} icon={<Cat size={14}/>} label="Cat" compact />
                            <DropdownItem onClick={() => onRebuild('Rabbit')} icon={<Rabbit size={14}/>} label="Rabbit" compact />
                            <DropdownItem onClick={() => onRebuild('Twins')} icon={<Users size={14}/>} label="Twins" compact />
                            <DropdownItem onClick={() => onRebuild('Castle')} icon={<Castle size={14}/>} label="Castle" compact />
                            <DropdownItem onClick={() => onRebuild('Robot')} icon={<Bot size={14}/>} label="Robot" compact />
                            <DropdownItem onClick={() => onRebuild('Spaceship')} icon={<Rocket size={14}/>} label="Space" compact />
                            <DropdownItem onClick={() => onRebuild('Flower')} icon={<Flower2 size={14}/>} label="Flower" compact />
                        </div>

                        {customRebuilds.length > 0 && (
                            <>
                                <div className="h-px bg-slate-100 mx-2 my-1" />
                                <div className="px-3 py-2 flex items-center justify-between">
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">YOUR REBUILDS</span>
                                </div>
                                {customRebuilds.map((model, idx) => (
                                    <DropdownItem 
                                        key={`rebuild-${model.id || idx}`} 
                                        onClick={() => onSelectCustomRebuild(model)} 
                                        onDelete={() => onDeleteRebuild(idx)}
                                        icon={<History size={18}/>} 
                                        label={model.name}
                                        truncate 
                                    />
                                ))}
                            </>
                        )}

                        <div className="h-px bg-slate-100 mx-2 my-1" />
                        <DropdownItem onClick={onPromptMorph} icon={<Wand2 size={18}/>} label="Dream a Rebuild..." highlight />
                     </DropdownMenu>
                </div>
            )}
        </div>
      </div>

    </div>
  );
};

// --- Atomic Components ---

interface TactileButtonProps {
  onClick: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
  color: 'white' | 'rose' | 'sky' | 'emerald' | 'indigo';
  compact?: boolean;
}

const TactileButton: React.FC<TactileButtonProps> = ({ onClick, disabled, icon, label, color, compact }) => {
  const colorStyles = {
    white:   'bg-white text-slate-600 border-slate-200 shadow-slate-200 hover:bg-slate-50',
    rose:    'bg-rose-500 text-white border-rose-700 shadow-rose-900/20 hover:bg-rose-600',
    sky:     'bg-sky-500 text-white border-sky-700 shadow-sky-900/20 hover:bg-sky-600',
    emerald: 'bg-emerald-500 text-white border-emerald-700 shadow-emerald-900/20 hover:bg-emerald-600',
    indigo:  'bg-indigo-600 text-white border-indigo-800 shadow-indigo-900/20 hover:bg-indigo-700',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        group relative flex items-center justify-center gap-2 rounded-2xl font-bold text-sm transition-all duration-75
        border-b-[4px] active:border-b-0 active:translate-y-[4px]
        ${compact ? 'p-3' : 'px-5 py-3'}
        ${disabled 
          ? 'opacity-50 grayscale cursor-not-allowed' 
          : `${colorStyles[color]} shadow-lg`}
      `}
    >
      {icon}
      {!compact && <span>{label}</span>}
    </button>
  );
};

const BigActionButton: React.FC<{onClick: () => void, icon: React.ReactNode, label: string, color: 'rose'}> = ({ onClick, icon, label, color }) => {
    return (
        <button 
            onClick={onClick}
            className="group relative flex flex-col items-center justify-center w-40 h-40 rounded-[40px] bg-rose-500 hover:bg-rose-600 text-white shadow-2xl shadow-rose-900/40 border-b-[10px] border-rose-800 active:border-b-0 active:translate-y-[10px] transition-all duration-150"
        >
            <div className="mb-3 transform group-hover:scale-110 transition-transform">{icon}</div>
            <div className="text-xs font-black tracking-[0.2em]">{label}</div>
        </button>
    )
}

interface DropdownProps {
    icon: React.ReactNode;
    label: string;
    children: React.ReactNode;
    color: 'indigo' | 'emerald' | 'white';
    direction?: 'up' | 'down';
    align?: 'left' | 'right';
    big?: boolean;
}

const DropdownMenu: React.FC<DropdownProps> = ({ icon, label, children, color, direction = 'down', align = 'left', big }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const btnStyles = {
        indigo: 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-900',
        emerald: 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-900',
        white: 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
    };

    return (
        <div className="relative" ref={menuRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    flex items-center gap-3 font-extrabold shadow-xl rounded-2xl transition-all active:scale-95 border-b-[4px] active:border-b-0 active:translate-y-[4px]
                    ${btnStyles[color]}
                    ${big ? 'px-10 py-5 text-xl' : 'px-5 py-3 text-sm'}
                `}
            >
                {icon}
                <span className="tracking-tight">{label}</span>
                <ChevronUp size={big ? 20 : 16} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} ${direction === 'down' ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className={`
                    absolute ${align === 'left' ? 'left-0' : 'right-0'} 
                    ${direction === 'up' ? 'bottom-full mb-4' : 'top-full mt-4'} 
                    w-64 max-h-[70vh] overflow-y-auto bg-white/98 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 p-2 flex flex-col gap-1 animate-in fade-in zoom-in duration-200 z-50
                `}>
                    {children}
                </div>
            )}
        </div>
    )
}

const DropdownItem: React.FC<{ 
  onClick: () => void, 
  onDelete?: () => void,
  icon: React.ReactNode, 
  label: string, 
  highlight?: boolean, 
  truncate?: boolean, 
  active?: boolean,
  compact?: boolean
}> = ({ onClick, onDelete, icon, label, highlight, truncate, active, compact }) => {
    return (
        <div className="group/item relative flex items-center w-full">
          <button 
              onClick={onClick}
              className={`
                  w-full flex items-center gap-3 rounded-2xl text-sm font-bold transition-all text-left
                  ${compact ? 'px-2 py-2 gap-2 text-[11px]' : 'px-4 py-3'}
                  ${active ? 'bg-indigo-50 text-indigo-700' : ''}
                  ${highlight 
                      ? 'bg-gradient-to-r from-sky-500 to-blue-500 text-white hover:from-sky-600 hover:to-blue-600 shadow-md shadow-sky-500/20' 
                      : active ? 'hover:bg-indigo-100' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}
              `}
          >
              <div className="shrink-0">{icon}</div>
              <span className={truncate ? "truncate w-full pr-6" : "w-full"}>{label}</span>
              {active && <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />}
          </button>
          
          {onDelete && (
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="absolute right-2 p-1.5 opacity-0 group-hover/item:opacity-100 text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all rounded-lg"
              title="Delete build"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
    )
}
