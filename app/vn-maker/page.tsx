"use client";
import "../../app/globals.css";
import React, { useState, FormEvent, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  draggable,
  dropTargetForElements,
  monitorForElements
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

// Type definitions
interface SceneNode {
  id: string;
  name: string;
  x: number;
  y: number;
  dialogue: string;
  character: string;
  background: string;
  choices: Choice[];
  connections: string[];
}

interface Choice {
  id: string;
  text: string;
  nextSceneId: string;
}

interface Character {
  id: string;
  name: string;
  avatar: string;
  color: string;
  description: string;
}

interface GameComponent {
  id: string;
  type: 'dialogue' | 'choice' | 'background' | 'character' | 'sound';
  name: string;
  icon: string;
  data?: any;
}

interface ProjectData {
  name: string;
  scenes: SceneNode[];
  characters: Character[];
  startSceneId: string;
  lastModified: string;
}

export default function VNmaker() {
  // Basic state
  const [name, setName] = useState<string>("");
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  // Engine state
  const [activeTab, setActiveTab] = useState<string>("Scene Editor");
  const [scenes, setScenes] = useState<SceneNode[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedScene, setSelectedScene] = useState<SceneNode | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isAutosaving, setIsAutosaving] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentPlayScene, setCurrentPlayScene] = useState<string>("");
  const [storyMapZoom, setStoryMapZoom] = useState<number>(1);
  const [storyMapOffset, setStoryMapOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [gameVariables, setGameVariables] = useState<Record<string, any>>({});

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const storyMapRef = useRef<HTMLDivElement>(null);
  const gamePreviewRef = useRef<HTMLDivElement>(null);

  // Game components for drag and drop
  const gameComponents: GameComponent[] = [
    { id: 'dialogue', type: 'dialogue', name: 'Dialogue Box', icon: '�' },
    { id: 'choice', type: 'choice', name: 'Player Choice', icon: '🎯' },
    { id: 'background', type: 'background', name: 'Background Image', icon: '🖼️' },
    { id: 'character', type: 'character', name: 'Character Sprite', icon: '�' },
    { id: 'sound', type: 'sound', name: 'Sound Effect', icon: '🔊' },
  ];

  // Story elements for sidebar
  const storyElements = [
    { category: 'Hooks', items: ['Character Introduction', 'Scene Transition', 'Dialogue Branch'] },
    { category: 'Conditions', items: ['If/Then Logic', 'Variable Check', 'Character State'] },
    { category: 'Functions', items: ['Play Sound', 'Change Background', 'Set Variable'] },
    { category: 'Screen Templates', items: ['Choice Dialog', 'Narration Box', 'Menu Screen'] },
    { category: 'My Content', items: ['Custom Element 1', 'Custom Element 2'] },
  ];

  // Auto-save functionality
  useEffect(() => {
    if (name && scenes.length > 0) {
      const autoSaveTimer = setTimeout(() => {
        setIsAutosaving(true);
        saveToLocalStorage();
        setTimeout(() => setIsAutosaving(false), 2000);
      }, 30000);
      return () => clearTimeout(autoSaveTimer);
    }
  }, [name, scenes, characters]);

  // Drag and drop setup
  useEffect(() => {
    const cleanup = monitorForElements({
      onDrop({ source, location }) {
        const destination = location.current.dropTargets[0];
        if (!destination) return;

        const sourceData = source.data;
        const destData = destination.data;

        if (sourceData.type === 'story-element' && destData.area === 'story-map') {
          addSceneFromElement(sourceData, (destData.x as number) || 100, (destData.y as number) || 100);
        } else if (sourceData.type === 'scene-node') {
          moveSceneNode(sourceData.id as string, (destData.x as number) || 0, (destData.y as number) || 0);
        } else if (sourceData.type === 'game-component' && destData.area === 'game-window') {
          addComponentToScene(sourceData);
        }
      }
    });
    return cleanup;
  }, [scenes]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    console.log("Game name set to:", name);
    setIsSaved(true);
    setIsFocused(false);
  };

  const saveToLocalStorage = () => {
    const projectData: ProjectData = {
      name,
      scenes,
      characters,
      startSceneId: scenes[0]?.id || "",
      lastModified: new Date().toISOString()
    };
    localStorage.setItem(`vn-project-${name}`, JSON.stringify(projectData));
  };

  const saveProject = () => {
    saveToLocalStorage();
    setIsAutosaving(true);
    setTimeout(() => {
      setIsAutosaving(false);
    }, 1500);
  };

  const exportProject = () => {
    const projectData: ProjectData = {
      name,
      scenes,
      characters,
      startSceneId: scenes[0]?.id || "",
      lastModified: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(projectData, null, 2)], {
      type: "application/json"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${name || "visual-novel"}.vnproj`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importProject = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith('.vnproj')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const projectData: ProjectData = JSON.parse(e.target?.result as string);
          setName(projectData.name);
          setScenes(projectData.scenes || []);
          setCharacters(projectData.characters || []);
          setIsSaved(true);
        } catch (error) {
          console.error("Import error:", error);
        }
      };
      reader.readAsText(file);
    }
  };

  const publishGame = () => {
    if (scenes.length === 0) {
      alert("Please add at least one scene before publishing.");
      return;
    }

    const htmlContent = generateGameHTML();
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${name || "visual-novel"}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateGameHTML = () => {
    return `<!DOCTYPE html>
<html><head><title>${name}</title><style>
body{margin:0;background:#0a0a0a;color:#fff;font-family:Arial,sans-serif}
.game{width:100%;height:100vh;position:relative;background-size:cover}
.dialogue{position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,0.8);padding:20px}
.character-name{color:#f59e0b;font-weight:bold;margin-bottom:10px}
.choices{margin-top:15px}.choice{background:#f59e0b;border:none;padding:10px 20px;margin:5px;cursor:pointer;border-radius:5px;color:white}
.choice:hover{background:#d97706}
</style></head><body>
<div class="game" id="game"><div class="dialogue" id="dialogue">
<div class="character-name" id="character"></div><div id="text"></div><div class="choices" id="choices"></div>
</div></div><script>
const data=${JSON.stringify({ name, scenes, characters })};
let current="${scenes[0]?.id||''}";
function show(id){const s=data.scenes.find(x=>x.id===id);if(!s)return;
document.getElementById('character').textContent=s.character;
document.getElementById('text').textContent=s.dialogue;
const c=document.getElementById('choices');c.innerHTML='';
s.choices.forEach(ch=>{const b=document.createElement('button');b.className='choice';
b.textContent=ch.text;b.onclick=()=>show(ch.nextSceneId);c.appendChild(b)});
if(s.background)document.getElementById('game').style.backgroundImage='url('+s.background+')';}
show(current);
</script></body></html>`;
  };

  const addSceneFromElement = (elementData: any, x: number, y: number) => {
    const newScene: SceneNode = {
      id: `scene-${Date.now()}`,
      name: elementData.name || `Scene ${scenes.length + 1}`,
      x: x,
      y: y,
      dialogue: "Enter dialogue here...",
      character: "",
      background: "",
      choices: [],
      connections: []
    };
    setScenes([...scenes, newScene]);
  };

  const addSceneNode = () => {
    const newScene: SceneNode = {
      id: `scene-${Date.now()}`,
      name: `Scene ${scenes.length + 1}`,
      x: 100 + scenes.length * 200,
      y: 100,
      dialogue: "Enter dialogue here...",
      character: "",
      background: "",
      choices: [],
      connections: []
    };
    setScenes([...scenes, newScene]);
    setSelectedScene(newScene);
  };

  const moveSceneNode = (sceneId: string, x: number, y: number) => {
    setScenes(scenes.map(scene =>
      scene.id === sceneId
        ? { ...scene, x, y }
        : scene
    ));
  };

  const addComponentToScene = (componentData: any) => {
    if (!selectedScene) return;

    // Add component logic based on type
    console.log('Adding component to scene:', componentData);
  };

  const connectScenes = (fromId: string, toId: string) => {
    setScenes(scenes.map(scene =>
      scene.id === fromId
        ? { ...scene, connections: [...scene.connections, toId] }
        : scene
    ));
  };

  const playTestGame = () => {
    if (scenes.length === 0) {
      alert("Please add at least one scene to playtest.");
      return;
    }
    setIsPlaying(true);
    setCurrentPlayScene(scenes[0].id);
  };

  const stopPlayTest = () => {
    setIsPlaying(false);
    setCurrentPlayScene("");
  };

  const addNewCharacter = () => {
    const newCharacter: Character = {
      id: `char-${Date.now()}`,
      name: `Character ${characters.length + 1}`,
      avatar: "",
      color: "#f59e0b",
      description: ""
    };
    setCharacters([...characters, newCharacter]);
    setSelectedCharacter(newCharacter);
  };

  return (
    <section className="lg:text-8xl text-center mt-10 sm:text-6xl xs:text-6xl text-6xl py-[3rem] text-gradient stroke-gold-shine">
      <div>
        <h1 className="mb-10">Visual Novel Studio</h1>
      </div>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-7xl mx-auto px-4"
      >
        <form
          className="flex items-center justify-start gap-4 mb-6"
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            id="vn-setname"
            name="VN Game Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`flex-1 max-w-md h-12 border border-amber-500 rounded-md hover:bg-neutral-950 hover:bg-opacity-50 focus:border-amber-500 outline-none text-white cursor-text box-border transition-colors duration-300 px-4 ${
              !isSaved && isFocused
                ? "bg-neutral-950 bg-opacity-50"
                : "bg-transparent border-opacity-50"
            }`}
            placeholder="My Visual Novel"
            required
          />
          <button
            type="submit"
            className="box-border text-yellow-600 text-2xl hover:text-yellow-500 rounded-md transition-colors duration-300 whitespace-nowrap"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-10 h-10 p-1"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
              />
            </svg>
          </button>
        </form>

        {/* Playtest Modal */}
        <AnimatePresence>
          {isPlaying && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center"
            >
              <div className="bg-neutral-900 rounded-lg p-6 w-full max-w-4xl mx-4 h-96 relative">
                <button
                  onClick={stopPlayTest}
                  className="absolute top-4 right-4 text-white hover:text-amber-400 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="h-full flex flex-col">
                  <h3 className="text-amber-400 text-xl mb-4">Playtest Mode</h3>
                  <div className="flex-1 bg-black rounded-lg p-4">
                    {scenes.find(s => s.id === currentPlayScene) && (
                      <div>
                        <div className="text-amber-400 font-bold mb-2">
                          {scenes.find(s => s.id === currentPlayScene)?.character}
                        </div>
                        <div className="text-white mb-4">
                          {scenes.find(s => s.id === currentPlayScene)?.dialogue}
                        </div>
                        <div className="space-y-2">
                          {scenes.find(s => s.id === currentPlayScene)?.choices.map(choice => (
                            <button
                              key={choice.id}
                              onClick={() => setCurrentPlayScene(choice.nextSceneId)}
                              className="block w-full text-left p-3 bg-amber-600 hover:bg-amber-500 text-white rounded transition-colors"
                            >
                              {choice.text}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
  </AnimatePresence>

        {/* Playtest Modal */}
        <AnimatePresence>
          {isPlaying && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center"
            >
              <div className="bg-neutral-900 rounded-lg p-6 w-full max-w-4xl mx-4 h-96 relative">
                <button
                  onClick={stopPlayTest}
                  className="absolute top-4 right-4 text-white hover:text-amber-400 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="h-full flex flex-col">
                  <h3 className="text-amber-400 text-xl mb-4">Playtest Mode</h3>
                  <div className="flex-1 bg-black rounded-lg p-4">
                    {scenes.find(s => s.id === currentPlayScene) && (
                      <div>
                        <div className="text-amber-400 font-bold mb-2">
                          {scenes.find(s => s.id === currentPlayScene)?.character}
                        </div>
                        <div className="text-white mb-4">
                          {scenes.find(s => s.id === currentPlayScene)?.dialogue}
                        </div>
                        <div className="space-y-2">
                          {scenes.find(s => s.id === currentPlayScene)?.choices.map(choice => (
                            <button
                              key={choice.id}
                              onClick={() => setCurrentPlayScene(choice.nextSceneId)}
                              className="block w-full text-left p-3 bg-amber-600 hover:bg-amber-500 text-white rounded transition-colors"
                            >
                              {choice.text}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Editor Container */}
        <div
          id="vn-editor-container"
          className="relative bg-neutral-900 bg-opacity-95 backdrop-blur-sm rounded-xl w-full min-h-[700px] border border-amber-500 border-opacity-30 shadow-2xl overflow-hidden"
        >
          {/* Top Toolbar */}
          <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-neutral-800 to-neutral-700 border-b border-amber-500 border-opacity-20">
            {/* Left Side - Tools */}
            <div className="flex items-center gap-4">
              <div className="text-amber-200 font-semibold text-lg">Tools</div>
              <div className="flex gap-1">
                <button className="p-2 bg-neutral-700 hover:bg-amber-600 text-amber-200 hover:text-white rounded transition-all duration-300" title="Favorites">
                  ⭐
                </button>
                <button className="p-2 bg-neutral-700 hover:bg-amber-600 text-amber-200 hover:text-white rounded transition-all duration-300" title="Love">
                  ❤️
                </button>
                <button className="p-2 bg-neutral-700 hover:bg-amber-600 text-amber-200 hover:text-white rounded transition-all duration-300" title="People">
                  👥
                </button>
                <button className="p-2 bg-neutral-700 hover:bg-amber-600 text-amber-200 hover:text-white rounded transition-all duration-300" title="Grid">
                  ⊞
                </button>
                <button className="p-2 bg-neutral-700 hover:bg-amber-600 text-amber-200 hover:text-white rounded transition-all duration-300" title="Menu">
                  ☰
                </button>
                <button className="p-2 bg-neutral-700 hover:bg-amber-600 text-amber-200 hover:text-white rounded transition-all duration-300" title="Settings">
                  ⚙️
                </button>
                <button className="p-2 bg-neutral-700 hover:bg-amber-600 text-amber-200 hover:text-white rounded transition-all duration-300" title="Tools">
                  🔧
                </button>
                <div className="bg-amber-600 text-white px-2 py-1 rounded text-sm font-medium">3+</div>
              </div>
            </div>

            {/* Center - Project Name */}
            <div className="flex items-center gap-4">
              <input
                type="text"
                value={name || "Project Name"}
                onChange={(e) => setName(e.target.value)}
                className="bg-transparent border-none text-amber-200 text-lg font-medium text-center focus:outline-none focus:bg-neutral-800 focus:px-2 focus:rounded transition-all"
                onFocus={(e) => e.target.select()}
              />
              <button className="p-2 text-amber-200 hover:text-amber-400 transition-colors">
                ✏️
              </button>
              <button className="p-2 text-amber-200 hover:text-amber-400 transition-colors">
                📁
              </button>
            </div>

            {/* Right Side - Publish Button */}
            <div className="flex gap-2">
              <button
                onClick={playTestGame}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg transition-all duration-300"
              >
                ▶️ Playtest
              </button>
              <button
                onClick={publishGame}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-medium rounded-lg transition-all duration-300 shadow-lg"
              >
                Publish Game 🚀
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-amber-500 border-opacity-20 bg-neutral-800">
            {["Scene Editor", "Story Map", "Characters", "Data"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium transition-all duration-300 border-b-2 ${
                  activeTab === tab
                    ? "text-amber-400 border-amber-400 bg-neutral-700"
                    : "text-amber-200 border-transparent hover:text-amber-300 hover:bg-neutral-700 hover:bg-opacity-50"
                }`}
              >
                {tab}
              </button>
            ))}
            <button
              onClick={() => setActiveTab("Settings")}
              className={`px-4 py-3 font-medium transition-all duration-300 border-b-2 ${
                activeTab === "Settings"
                  ? "text-amber-400 border-amber-400 bg-neutral-700"
                  : "text-amber-200 border-transparent hover:text-amber-300 hover:bg-neutral-700 hover:bg-opacity-50"
              }`}
            >
              ⚙️
            </button>
          </div>

          {/* Main Content Area */}
          <div className="flex h-[600px]">
            {/* Scene Editor Tab */}
            {activeTab === "Scene Editor" && (
              <div className="flex w-full">
                {/* Left Sidebar - Components */}
                <div className="w-80 bg-neutral-800 bg-opacity-50 border-r border-amber-500 border-opacity-20 overflow-y-auto">
                  <div className="p-4">
                    <h3 className="text-amber-200 font-semibold mb-4">Component Library</h3>

                    <div className="mb-4">
                      <input
                        type="text"
                        placeholder="Search..."
                        className="w-full p-2 bg-neutral-900 border border-amber-500 border-opacity-30 rounded text-white text-sm focus:border-amber-400 outline-none"
                      />
                    </div>

                    <div className="space-y-4">
                      {['Backgrounds', 'Characters', 'Features', 'Sounds', 'My Components'].map((category) => (
                        <div key={category} className="mb-4">
                          <div className="flex items-center justify-between p-2 bg-neutral-700 rounded cursor-pointer">
                            <span className="text-amber-200 font-medium text-sm">{category}</span>
                            <span className="text-amber-200">▼</span>
                          </div>

                          {category === 'Features' && (
                            <div className="mt-2 space-y-1">
                              {gameComponents.map((component) => (
                                <div
                                  key={component.id}
                                  draggable
                                  className="p-2 bg-neutral-900 hover:bg-neutral-800 rounded cursor-move text-amber-100 text-sm flex items-center gap-2 transition-colors"
                                  onDragStart={(e: React.DragEvent) => {
                                    e.dataTransfer.setData('application/json', JSON.stringify({
                                      id: component.id,
                                      name: component.name,
                                      icon: component.icon
                                    }));
                                  }}
                                >
                                  <span>{component.icon}</span>
                                  <span>{component.name}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <button className="w-full p-2 bg-amber-600 hover:bg-amber-500 text-white rounded transition-colors">
                      Upload Custom Component
                    </button>
                  </div>
                </div>

                {/* Game Window */}
                <div className="flex-1 p-6">
                  <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg h-full relative overflow-hidden border border-amber-500 border-opacity-30">
                    <div
                      ref={gamePreviewRef}
                      className="w-full h-full relative"
                      onDrop={(e) => {
                        e.preventDefault();
                        const data = JSON.parse(e.dataTransfer.getData('application/json'));
                        addComponentToScene(data);
                      }}
                      onDragOver={(e) => e.preventDefault()}
                    >
                      {selectedScene && selectedScene.background && (
                        <img
                          src={selectedScene.background}
                          alt="Background"
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      )}

                      {/* Game Preview Content */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-white text-center">
                          <div className="text-6xl mb-4">🎮</div>
                          <p className="text-lg mb-2">Game Preview Window</p>
                          <p className="text-sm opacity-80">Drag components here to build your scene</p>
                          {selectedScene && (
                            <div className="mt-4 p-4 bg-black bg-opacity-60 rounded-lg">
                              <div className="text-amber-400 font-bold">{selectedScene.character}</div>
                              <div className="mt-2">{selectedScene.dialogue}</div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Drop zone indicator */}
                      <div className="absolute bottom-4 left-4 text-amber-200 text-sm opacity-60">
                        Drop components here to add them to your scene
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Sidebar - Scene Properties */}
                <div className="w-80 bg-neutral-800 bg-opacity-50 border-l border-amber-500 border-opacity-20 overflow-y-auto">
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-amber-200 font-semibold">Scenes</h3>
                      <button
                        onClick={addSceneNode}
                        className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-sm transition-colors"
                      >
                        + Add
                      </button>
                    </div>

                    <div className="space-y-2 mb-6">
                      {scenes.map((scene, index) => (
                        <motion.div
                          key={scene.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`p-3 rounded-lg cursor-pointer transition-all ${
                            selectedScene?.id === scene.id
                              ? "bg-amber-600 text-white"
                              : "bg-neutral-700 hover:bg-neutral-600 text-amber-100"
                          }`}
                          onClick={() => setSelectedScene(scene)}
                        >
                          <div className="font-medium text-sm">{scene.name}</div>
                          <div className="text-xs opacity-70">Scene #{index + 1}</div>
                        </motion.div>
                      ))}
                    </div>

                    {selectedScene && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <h4 className="text-amber-200 font-medium">Scene Properties</h4>

                        <div>
                          <label className="block text-amber-200 text-sm mb-1">Scene Name</label>
                          <input
                            type="text"
                            value={selectedScene.name}
                            onChange={(e) => {
                              const updated = { ...selectedScene, name: e.target.value };
                              setSelectedScene(updated);
                              setScenes(scenes.map(s => s.id === selectedScene.id ? updated : s));
                            }}
                            className="w-full p-2 bg-neutral-900 border border-amber-500 border-opacity-30 rounded text-white text-sm focus:border-amber-400 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-amber-200 text-sm mb-1">Character</label>
                          <select
                            value={selectedScene.character}
                            onChange={(e) => {
                              const updated = { ...selectedScene, character: e.target.value };
                              setSelectedScene(updated);
                              setScenes(scenes.map(s => s.id === selectedScene.id ? updated : s));
                            }}
                            className="w-full p-2 bg-neutral-900 border border-amber-500 border-opacity-30 rounded text-white text-sm focus:border-amber-400 outline-none"
                          >
                            <option value="">Select Character</option>
                            {characters.map(char => (
                              <option key={char.id} value={char.name}>{char.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-amber-200 text-sm mb-1">Background URL</label>
                          <input
                            type="text"
                            value={selectedScene.background}
                            onChange={(e) => {
                              const updated = { ...selectedScene, background: e.target.value };
                              setSelectedScene(updated);
                              setScenes(scenes.map(s => s.id === selectedScene.id ? updated : s));
                            }}
                            placeholder="https://example.com/bg.jpg"
                            className="w-full p-2 bg-neutral-900 border border-amber-500 border-opacity-30 rounded text-white text-sm focus:border-amber-400 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-amber-200 text-sm mb-1">Dialogue</label>
                          <textarea
                            value={selectedScene.dialogue}
                            onChange={(e) => {
                              const updated = { ...selectedScene, dialogue: e.target.value };
                              setSelectedScene(updated);
                              setScenes(scenes.map(s => s.id === selectedScene.id ? updated : s));
                            }}
                            rows={3}
                            className="w-full p-2 bg-neutral-900 border border-amber-500 border-opacity-30 rounded text-white text-sm focus:border-amber-400 outline-none resize-vertical"
                            placeholder="Character dialogue..."
                          />
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <label className="block text-amber-200 text-sm">Choices</label>
                            <button
                              onClick={() => {
                                const newChoice = {
                                  id: `choice-${Date.now()}`,
                                  text: "New Choice",
                                  nextSceneId: ""
                                };
                                const updated = { ...selectedScene, choices: [...selectedScene.choices, newChoice] };
                                setSelectedScene(updated);
                                setScenes(scenes.map(s => s.id === selectedScene.id ? updated : s));
                              }}
                              className="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs"
                            >
                              + Add
                            </button>
                          </div>

                          <div className="space-y-2">
                            {selectedScene.choices.map((choice) => (
                              <div key={choice.id} className="flex gap-1">
                                <input
                                  type="text"
                                  value={choice.text}
                                  onChange={(e) => {
                                    const updatedChoices = selectedScene.choices.map(c =>
                                      c.id === choice.id ? { ...c, text: e.target.value } : c
                                    );
                                    const updated = { ...selectedScene, choices: updatedChoices };
                                    setSelectedScene(updated);
                                    setScenes(scenes.map(s => s.id === selectedScene.id ? updated : s));
                                  }}
                                  className="flex-1 p-1 bg-neutral-900 border border-amber-500 border-opacity-30 rounded text-white text-xs focus:border-amber-400 outline-none"
                                />
                                <select
                                  value={choice.nextSceneId}
                                  onChange={(e) => {
                                    const updatedChoices = selectedScene.choices.map(c =>
                                      c.id === choice.id ? { ...c, nextSceneId: e.target.value } : c
                                    );
                                    const updated = { ...selectedScene, choices: updatedChoices };
                                    setSelectedScene(updated);
                                    setScenes(scenes.map(s => s.id === selectedScene.id ? updated : s));
                                  }}
                                  className="p-1 bg-neutral-900 border border-amber-500 border-opacity-30 rounded text-white text-xs focus:border-amber-400 outline-none"
                                >
                                  <option value="">→</option>
                                  {scenes.filter(s => s.id !== selectedScene.id).map(scene => (
                                    <option key={scene.id} value={scene.id}>{scene.name}</option>
                                  ))}
                                </select>
                                <button
                                  onClick={() => {
                                    const updatedChoices = selectedScene.choices.filter(c => c.id !== choice.id);
                                    const updated = { ...selectedScene, choices: updatedChoices };
                                    setSelectedScene(updated);
                                    setScenes(scenes.map(s => s.id === selectedScene.id ? updated : s));
                                  }}
                                  className="p-1 bg-red-600 hover:bg-red-500 text-white rounded text-xs"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Story Map Tab */}
            {activeTab === "Story Map" && (
              <div className="flex w-full">
                {/* Left Sidebar - Story Elements */}
                <div className="w-80 bg-neutral-800 bg-opacity-50 border-r border-amber-500 border-opacity-20">
                  <div className="p-4">
                    <h3 className="text-amber-200 font-semibold mb-4">Story Elements</h3>

                    <div className="mb-4">
                      <input
                        type="text"
                        placeholder="Search..."
                        className="w-full p-2 bg-neutral-900 border border-amber-500 border-opacity-30 rounded text-white text-sm focus:border-amber-400 outline-none"
                      />
                    </div>

                    {storyElements.map((categoryData) => (
                      <div key={categoryData.category} className="mb-4">
                        <div className="flex items-center justify-between p-2 bg-neutral-700 rounded cursor-pointer">
                          <span className="text-amber-200 font-medium text-sm">{categoryData.category}</span>
                          <span className="text-amber-200">▼</span>
                        </div>

                        <div className="mt-2 space-y-1">
                          {categoryData.items.map((item, index) => (
                            <div
                              key={index}
                              draggable
                              className="p-2 bg-neutral-900 hover:bg-neutral-800 rounded cursor-move text-amber-100 text-sm transition-colors"
                              onDragStart={(e: React.DragEvent) => {
                                e.dataTransfer.setData('application/json', JSON.stringify({
                                  type: 'story-element',
                                  name: item,
                                  category: categoryData.category
                                }));
                              }}
                            >
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    <button className="w-full p-2 bg-amber-600 hover:bg-amber-500 text-white rounded transition-colors">
                      Upload Custom Element
                    </button>
                  </div>
                </div>

                {/* Story Map Canvas */}
                <div className="flex-1 relative bg-gradient-to-br from-purple-900 via-blue-900 to-purple-800 overflow-hidden">
                  <div
                    ref={storyMapRef}
                    className="w-full h-full relative"
                    style={{
                      backgroundImage: `
                        radial-gradient(circle at 20px 20px, rgba(255,255,255,0.1) 1px, transparent 0),
                        linear-gradient(45deg, transparent 24%, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.05) 26%, transparent 27%)
                      `,
                      backgroundSize: '40px 40px'
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const y = e.clientY - rect.top;
                      const data = JSON.parse(e.dataTransfer.getData('application/json'));
                      if (data.type === 'story-element') {
                        addSceneFromElement(data, x, y);
                      }
                    }}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    {/* Scene Nodes */}
                    {scenes.map((scene) => (
                      <div
                        key={scene.id}
                        className="absolute bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-all min-w-[140px] border border-purple-400"
                        style={{
                          left: scene.x,
                          top: scene.y,
                        }}
                        onClick={() => setSelectedScene(scene)}
                        draggable
                        onDragStart={(e: React.DragEvent) => {
                          e.dataTransfer.setData('application/json', JSON.stringify({
                            type: 'scene-node',
                            id: scene.id
                          }));
                        }}
                      >
                        <div className="font-medium text-sm text-center mb-1">{scene.name}</div>
                        <div className="text-xs text-center opacity-80">Scene Node</div>
                        {scene.dialogue && (
                          <div className="text-xs mt-2 opacity-70 truncate">
                            {scene.dialogue.substring(0, 30)}...
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Connection Lines */}
                    <svg className="absolute inset-0 pointer-events-none">
                      {scenes.flatMap(scene =>
                        scene.connections.map(connectionId => {
                          const targetScene = scenes.find(s => s.id === connectionId);
                          if (!targetScene) return null;

                          return (
                            <line
                              key={`${scene.id}-${connectionId}`}
                              x1={scene.x + 70}
                              y1={scene.y + 40}
                              x2={targetScene.x + 70}
                              y2={targetScene.y + 40}
                              stroke="#f59e0b"
                              strokeWidth="2"
                              strokeDasharray="5,5"
                            />
                          );
                        }).filter(Boolean)
                      )}
                    </svg>

                    {/* Add Scene Button */}
                    <button
                      onClick={addSceneNode}
                      className="absolute top-4 left-4 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg shadow-lg transition-colors"
                    >
                      + Add Scene Node
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Characters Tab */}
            {activeTab === "Characters" && (
              <div className="flex w-full">
                <div className="w-80 bg-neutral-800 bg-opacity-50 border-r border-amber-500 border-opacity-20">
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-amber-200 font-semibold">Characters</h3>
                      <button
                        onClick={addNewCharacter}
                        className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-sm"
                      >
                        + Add
                      </button>
                    </div>

                    <div className="space-y-2">
                      {characters.map((character) => (
                        <div
                          key={character.id}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedCharacter?.id === character.id
                              ? "bg-amber-600 text-white"
                              : "bg-neutral-700 hover:bg-neutral-600 text-amber-100"
                          }`}
                          onClick={() => setSelectedCharacter(character)}
                        >
                          <div className="font-medium text-sm">{character.name}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: character.color }}></div>
                            <span className="text-xs opacity-70">Character</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex-1 p-6">
                  {selectedCharacter ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <h3 className="text-amber-200 font-semibold text-xl">Edit Character</h3>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-amber-200 text-sm font-medium mb-2">Character Name</label>
                          <input
                            type="text"
                            value={selectedCharacter.name}
                            onChange={(e) => {
                              const updated = { ...selectedCharacter, name: e.target.value };
                              setSelectedCharacter(updated);
                              setCharacters(characters.map(c => c.id === selectedCharacter.id ? updated : c));
                            }}
                            className="w-full p-3 bg-neutral-800 border border-amber-500 border-opacity-30 rounded-lg text-white focus:border-amber-400 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-amber-200 text-sm font-medium mb-2">Character Color</label>
                          <input
                            type="color"
                            value={selectedCharacter.color}
                            onChange={(e) => {
                              const updated = { ...selectedCharacter, color: e.target.value };
                              setSelectedCharacter(updated);
                              setCharacters(characters.map(c => c.id === selectedCharacter.id ? updated : c));
                            }}
                            className="w-full h-12 bg-neutral-800 border border-amber-500 border-opacity-30 rounded-lg"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-amber-200 text-sm font-medium mb-2">Avatar URL</label>
                        <input
                          type="text"
                          value={selectedCharacter.avatar}
                          onChange={(e) => {
                            const updated = { ...selectedCharacter, avatar: e.target.value };
                            setSelectedCharacter(updated);
                            setCharacters(characters.map(c => c.id === selectedCharacter.id ? updated : c));
                          }}
                          placeholder="https://example.com/avatar.jpg"
                          className="w-full p-3 bg-neutral-800 border border-amber-500 border-opacity-30 rounded-lg text-white focus:border-amber-400 outline-none"
                        />
                        {selectedCharacter.avatar && (
                          <div className="mt-2 w-32 h-32 border border-amber-500 border-opacity-30 rounded-lg overflow-hidden">
                            <img
                              src={selectedCharacter.avatar}
                              alt="Character Avatar"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-amber-200 text-sm font-medium mb-2">Description</label>
                        <textarea
                          value={selectedCharacter.description}
                          onChange={(e) => {
                            const updated = { ...selectedCharacter, description: e.target.value };
                            setSelectedCharacter(updated);
                            setCharacters(characters.map(c => c.id === selectedCharacter.id ? updated : c));
                          }}
                          rows={4}
                          placeholder="Character background and personality..."
                          className="w-full p-3 bg-neutral-800 border border-amber-500 border-opacity-30 rounded-lg text-white focus:border-amber-400 outline-none resize-vertical"
                        />
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-amber-200 opacity-60">
                      <div className="text-center">
                        <div className="text-6xl mb-4">👥</div>
                        <p className="text-lg mb-2">Select a character to edit</p>
                        <p className="text-sm">Choose a character from the left panel or create a new one</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Data Tab */}
            {activeTab === "Data" && (
              <div className="flex-1 p-6">
                <div className="space-y-6">
                  <h3 className="text-amber-200 font-semibold text-xl">Game Data Management</h3>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-neutral-800 bg-opacity-50 rounded-lg p-4">
                      <h4 className="text-amber-200 font-medium mb-3">Variables</h4>
                      <div className="space-y-2">
                        <button className="w-full p-2 bg-amber-600 hover:bg-amber-500 text-white rounded text-sm">
                          + Add Variable
                        </button>
                        <div className="text-center py-8 text-amber-200 opacity-60">
                          <div className="text-4xl mb-2">📊</div>
                          <p className="text-sm">No variables defined</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-neutral-800 bg-opacity-50 rounded-lg p-4">
                      <h4 className="text-amber-200 font-medium mb-3">Flags</h4>
                      <div className="space-y-2">
                        <button className="w-full p-2 bg-amber-600 hover:bg-amber-500 text-white rounded text-sm">
                          + Add Flag
                        </button>
                        <div className="text-center py-8 text-amber-200 opacity-60">
                          <div className="text-4xl mb-2">🚩</div>
                          <p className="text-sm">No flags defined</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "Settings" && (
              <div className="flex-1 p-6">
                <div className="space-y-6">
                  <h3 className="text-amber-200 font-semibold text-xl">Project Settings</h3>

                  <div className="grid grid-cols-1 gap-6">
                    <div className="bg-neutral-800 bg-opacity-50 rounded-lg p-4">
                      <h4 className="text-amber-200 font-medium mb-3">General Settings</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-amber-200 text-sm mb-2">Game Title</label>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-3 bg-neutral-900 border border-amber-500 border-opacity-30 rounded text-white focus:border-amber-400 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-amber-200 text-sm mb-2">Default Text Speed</label>
                          <select className="w-full p-3 bg-neutral-900 border border-amber-500 border-opacity-30 rounded text-white focus:border-amber-400 outline-none">
                            <option>Slow</option>
                            <option>Normal</option>
                            <option>Fast</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-amber-200 text-sm mb-2">Resolution</label>
                          <select className="w-full p-3 bg-neutral-900 border border-amber-500 border-opacity-30 rounded text-white focus:border-amber-400 outline-none">
                            <option>1920x1080</option>
                            <option>1280x720</option>
                            <option>800x600</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action Bar */}
          <div className="flex justify-between items-center px-6 py-3 bg-neutral-800 border-t border-amber-500 border-opacity-20">
            <div className="flex gap-2 items-center">
              <button
                onClick={saveProject}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded transition-colors text-sm"
              >
                Save
              </button>
              {isAutosaving && (
                <span className="text-green-400 text-sm">Autosaving...</span>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors text-sm"
              >
                Import
              </button>
              <button
                onClick={exportProject}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded transition-colors text-sm"
              >
                Export
              </button>
            </div>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".vnproj,.json"
            onChange={importProject}
            className="hidden"
          />

          {/* Autosave Indicator */}
          <AnimatePresence>
            {isAutosaving && (
              <motion.div
                initial={{ opacity: 0, y: 20, x: 20 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                exit={{ opacity: 0, y: 20, x: 20 }}
                className="absolute bottom-6 right-6 bg-green-600 bg-opacity-90 backdrop-blur-sm text-white px-4 py-3 rounded-lg shadow-xl"
              >
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span className="text-sm font-medium">Autosaving...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
}
