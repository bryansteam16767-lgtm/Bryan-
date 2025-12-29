
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { VoxelEngine } from './services/VoxelEngine';
import { UIOverlay } from './components/UIOverlay';
import { JsonModal } from './components/JsonModal';
import { PromptModal } from './components/PromptModal';
import { WelcomeScreen } from './components/WelcomeScreen';
import { Generators } from './utils/voxelGenerators';
import { AppState, VoxelData, SavedModel, ThemeType } from './types';
import { GoogleGenAI, Type } from "@google/genai";

const STORAGE_KEY_BUILDS = 'voxel_toy_box_custom_builds';
const STORAGE_KEY_REBUILDS = 'voxel_toy_box_custom_rebuilds';

const App: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<VoxelEngine | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [appState, setAppState] = useState<AppState>(AppState.STABLE);
  const [voxelCount, setVoxelCount] = useState<number>(0);
  
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [jsonModalMode, setJsonModalMode] = useState<'view' | 'import'>('view');
  
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [promptMode, setPromptMode] = useState<'create' | 'morph'>('create');
  
  const [showWelcome, setShowWelcome] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Gemini is sketching ideas...');
  
  const [jsonData, setJsonData] = useState('');
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [currentTheme, setCurrentTheme] = useState<ThemeType>('classic');

  const [currentBaseModel, setCurrentBaseModel] = useState<string>('Eagle');
  
  const [customBuilds, setCustomBuilds] = useState<SavedModel[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BUILDS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [customRebuilds, setCustomRebuilds] = useState<SavedModel[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REBUILDS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_BUILDS, JSON.stringify(customBuilds));
  }, [customBuilds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_REBUILDS, JSON.stringify(customRebuilds));
  }, [customRebuilds]);

  useEffect(() => {
    if (!containerRef.current) return;

    const engine = new VoxelEngine(
      containerRef.current,
      (newState) => setAppState(newState),
      (count) => setVoxelCount(count)
    );

    engineRef.current = engine;
    engine.loadInitialModel(Generators.Eagle());

    const handleResize = () => engine.handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.cleanup();
    };
  }, []);

  const handleDismantle = () => {
    engineRef.current?.dismantle();
  };

  const handleThemeChange = (theme: ThemeType) => {
    setCurrentTheme(theme);
    engineRef.current?.setTheme(theme);
  };

  const handleNewScene = (type: string) => {
    const generator = (Generators as any)[type];
    if (generator && engineRef.current) {
      const data = generator();
      engineRef.current.loadInitialModel(data);
      setVoxelCount(data.length);
      setCurrentBaseModel(type);
    }
  };

  const handleRebuild = (type: string) => {
    const generator = (Generators as any)[type];
    if (generator && engineRef.current) {
      engineRef.current.rebuild(generator());
    }
  };

  const handleSelectCustomBuild = (model: SavedModel) => {
      if (engineRef.current) {
          engineRef.current.loadInitialModel(model.data);
          setVoxelCount(model.data.length);
          setCurrentBaseModel(model.name);
      }
  };

  const handleSelectCustomRebuild = (model: SavedModel) => {
      if (engineRef.current) {
          engineRef.current.rebuild(model.data);
      }
  };

  const handleDeleteBuild = (index: number) => {
    setCustomBuilds(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteRebuild = (index: number) => {
    setCustomRebuilds(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear all saved history?")) {
      setCustomBuilds([]);
      setCustomRebuilds([]);
    }
  };

  const handleShowJson = () => {
    if (engineRef.current) {
      setJsonData(engineRef.current.getJsonData());
      setJsonModalMode('view');
      setIsJsonModalOpen(true);
    }
  };

  const handleImportClick = () => {
      setJsonModalMode('import');
      setIsJsonModalOpen(true);
  };

  const handleMeshImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !engineRef.current) return;

    setLoadingMessage('Voxelizing 3D Mesh...');
    setIsGenerating(true);

    try {
      const voxelData = await engineRef.current.importMeshFile(file);
      if (voxelData && voxelData.length > 0) {
        const name = file.name.split('.')[0] || 'Imported Mesh';
        engineRef.current.loadInitialModel(voxelData);
        
        const newModel: SavedModel = { 
          id: Date.now().toString(), 
          name: name, 
          data: voxelData 
        };
        setCustomBuilds(prev => [newModel, ...prev]);
        setCurrentBaseModel(name);
        setVoxelCount(voxelData.length);
      }
    } catch (err) {
      console.error("Mesh import failed", err);
      alert("Failed to convert 3D model. Ensure it is a valid GLTF/OBJ file.");
    } finally {
      setIsGenerating(false);
      event.target.value = ''; // Reset input
    }
  };

  const handleJsonImport = (jsonStr: string) => {
      try {
          const rawData = JSON.parse(jsonStr);
          if (!Array.isArray(rawData)) throw new Error("JSON must be an array");

          const voxelData: VoxelData[] = rawData.map((v: any) => {
              let colorVal = v.c || v.color;
              let colorInt = 0xCCCCCC;

              if (typeof colorVal === 'string') {
                  if (colorVal.startsWith('#')) colorVal = colorVal.substring(1);
                  colorInt = parseInt(colorVal, 16);
              } else if (typeof colorVal === 'number') {
                  colorInt = colorVal;
              }

              return {
                  x: Number(v.x) || 0,
                  y: Number(v.y) || 0,
                  z: Number(v.z) || 0,
                  color: isNaN(colorInt) ? 0xCCCCCC : colorInt
              };
          });
          
          if (engineRef.current) {
              engineRef.current.loadInitialModel(voxelData);
              setVoxelCount(voxelData.length);
              setCurrentBaseModel('Imported Build');
          }
      } catch (e) {
          console.error("Failed to import JSON", e);
          alert("Failed to import JSON. Please check format.");
      }
  };

  const openPrompt = (mode: 'create' | 'morph') => {
      setPromptMode(mode);
      setIsPromptModalOpen(true);
  }
  
  const handleToggleRotation = () => {
      const newState = !isAutoRotate;
      setIsAutoRotate(newState);
      engineRef.current?.setAutoRotate(newState);
  }

  const handlePromptSubmit = async (prompt: string, isSymmetrical: boolean) => {
    if (!process.env.API_KEY) {
        throw new Error("API Key not found");
    }

    setLoadingMessage('Gemini is sketching ideas...');
    setIsGenerating(true);
    setIsPromptModalOpen(false);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const modelName = 'gemini-3-pro-preview';
        
        let systemContext = "";
        if (promptMode === 'morph' && engineRef.current) {
            const availableColors = engineRef.current.getUniqueColors().join(', ');
            systemContext = `
                CONTEXT: You are RE-ARRANGING a set of approximately ${voxelCount} existing blocks.
                Current colors: [${availableColors}].
                Transform the pile into the new shape using the same total block count.
            `;
        } else {
            systemContext = `
                CONTEXT: You are creating a brand new voxel art model. 
                Use 150-400 voxels.
            `;
        }

        const symmetryInstruction = isSymmetrical 
          ? "CRITICAL: The model MUST be perfectly symmetrical along the X-axis (mirror symmetry)." 
          : "The model can be organic.";

        const response = await ai.models.generateContent({
            model: modelName,
            contents: `
                ${systemContext}
                Task: Generate a 3D voxel art model of: "${prompt}".
                ${symmetryInstruction}
                
                Rules:
                1. Center at x=0, z=0.
                2. Coordinates must be integers.
                3. Return an array of {x, y, z, color}.
            `,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            x: { type: Type.INTEGER },
                            y: { type: Type.INTEGER },
                            z: { type: Type.INTEGER },
                            color: { type: Type.STRING }
                        },
                        required: ["x", "y", "z", "color"]
                    }
                }
            }
        });

        if (response.text) {
            const rawData = JSON.parse(response.text);
            const voxelData: VoxelData[] = rawData.map((v: any) => {
                let colorStr = v.color;
                if (colorStr.startsWith('#')) colorStr = colorStr.substring(1);
                const colorInt = parseInt(colorStr, 16);
                return {
                    x: Math.round(v.x),
                    y: Math.round(v.y),
                    z: Math.round(v.z),
                    color: isNaN(colorInt) ? 0xCCCCCC : colorInt
                };
            });

            if (engineRef.current) {
                if (promptMode === 'create') {
                    engineRef.current.loadInitialModel(voxelData);
                    const newModel: SavedModel = { 
                      id: Date.now().toString(), 
                      name: prompt, 
                      data: voxelData 
                    };
                    setCustomBuilds(prev => [newModel, ...prev]);
                    setCurrentBaseModel(prompt);
                    setVoxelCount(voxelData.length);
                } else {
                    engineRef.current.rebuild(voxelData);
                    const newRebuild: SavedModel = { 
                      id: Date.now().toString(), 
                      name: prompt, 
                      data: voxelData,
                      baseModel: currentBaseModel 
                    };
                    setCustomRebuilds(prev => [newRebuild, ...prev]);
                }
            }
        }
    } catch (err) {
        console.error("Gemini failed", err);
        alert("The imagination engine encountered a glitch. Try a different prompt!");
    } finally {
        setIsGenerating(false);
    }
  };

  const relevantRebuilds = customRebuilds.filter(r => r.baseModel === currentBaseModel);

  return (
    <div className="relative w-full h-screen bg-[#f0f2f5] overflow-hidden">
      <div ref={containerRef} className="absolute inset-0 z-0" />
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".gltf,.glb,.obj" 
        className="hidden" 
      />

      <UIOverlay 
        voxelCount={voxelCount}
        appState={appState}
        currentBaseModel={currentBaseModel}
        customBuilds={customBuilds}
        customRebuilds={relevantRebuilds} 
        isAutoRotate={isAutoRotate}
        isInfoVisible={showWelcome}
        isGenerating={isGenerating}
        loadingMessage={loadingMessage}
        currentTheme={currentTheme}
        onDismantle={handleDismantle}
        onRebuild={handleRebuild}
        onNewScene={handleNewScene}
        onSelectCustomBuild={handleSelectCustomBuild}
        onSelectCustomRebuild={handleSelectCustomRebuild}
        onDeleteBuild={handleDeleteBuild}
        onDeleteRebuild={handleDeleteRebuild}
        onClearHistory={handleClearHistory}
        onPromptCreate={() => openPrompt('create')}
        onPromptMorph={() => openPrompt('morph')}
        onShowJson={handleShowJson}
        onImportJson={handleImportClick}
        onImportMesh={handleMeshImportClick}
        onToggleRotation={handleToggleRotation}
        onToggleInfo={() => setShowWelcome(!showWelcome)}
        onThemeChange={handleThemeChange}
      />

      <WelcomeScreen visible={showWelcome} onDismiss={() => setShowWelcome(false)} />

      <JsonModal 
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        data={jsonData}
        isImport={jsonModalMode === 'import'}
        onImport={handleJsonImport}
      />

      <PromptModal
        isOpen={isPromptModalOpen}
        mode={promptMode}
        onClose={() => setIsPromptModalOpen(false)}
        onSubmit={handlePromptSubmit}
      />
    </div>
  );
};

export default App;
