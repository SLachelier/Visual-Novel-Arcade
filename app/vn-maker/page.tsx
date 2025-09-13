"use client";
import "../../app/globals.css";
import React, {
  useState,
  FormEvent,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

// Type definitions for the VN engine
interface Scene {
  id: string;
  name: string;
  background: string;
  character: string;
  dialogue: string;
  choices: Choice[];
  position: { x: number; y: number };
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
}

interface Asset {
  id: string;
  name: string;
  url: string;
  type: "background" | "character" | "music" | "sound";
}

interface ProjectData {
  name: string;
  scenes: Scene[];
  characters: Character[];
  assets: Asset[];
  startSceneId: string;
  lastModified: string;
}

export default function VNmaker() {
  // Basic state
  const [name, setName] = useState<string>("");
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  // Engine state
  const [activeTab, setActiveTab] = useState<string>("scenes");
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null
  );
  const [isAutosaving, setIsAutosaving] = useState<boolean>(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Auto-save functionality
  useEffect(() => {
    if (name && (scenes.length > 0 || characters.length > 0)) {
      const autoSaveTimer = setTimeout(() => {
        setIsAutosaving(true);
        saveToLocalStorage();
        setTimeout(() => setIsAutosaving(false), 2000);
      }, 30000); // Auto-save every 30 seconds

      return () => clearTimeout(autoSaveTimer);
    }
  }, [name, scenes, characters, assets]);

  // Drag and drop setup
  useEffect(() => {
    const cleanup = monitorForElements({
      onDrop({ source, location }) {
        const destination = location.current.dropTargets[0];
        if (!destination) return;

        const sourceId = source.data.id as string;
        const sourceType = source.data.type as string;

        if (sourceType === "scene") {
          // Handle scene reordering
          const sourceIndex = scenes.findIndex((s) => s.id === sourceId);
          const destIndex = parseInt(destination.data.index as string);

          if (sourceIndex !== -1 && destIndex !== -1) {
            const newScenes = [...scenes];
            const [movedScene] = newScenes.splice(sourceIndex, 1);
            newScenes.splice(destIndex, 0, movedScene);
            setScenes(newScenes);
          }
        }
      },
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
      assets,
      startSceneId: scenes[0]?.id || "",
      lastModified: new Date().toISOString(),
    };
    localStorage.setItem(`vn-project-${name}`, JSON.stringify(projectData));
  };

  const saveProject = () => {
    saveToLocalStorage();
    alert("Project saved successfully!");
  };

  const exportProject = () => {
    const projectData: ProjectData = {
      name,
      scenes,
      characters,
      assets,
      startSceneId: scenes[0]?.id || "",
      lastModified: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(projectData, null, 2)], {
      type: "application/json",
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
    if (file && file.name.endsWith(".vnproj")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const projectData: ProjectData = JSON.parse(
            e.target?.result as string
          );
          setName(projectData.name);
          setScenes(projectData.scenes || []);
          setCharacters(projectData.characters || []);
          setAssets(projectData.assets || []);
          setIsSaved(true);
          alert("Project imported successfully!");
        } catch (error) {
          alert("Error importing project file. Please check the file format.");
          console.error("Import error:", error);
        }
      };
      reader.readAsText(file);
    } else {
      alert("Please select a valid .vnproj file");
    }
  };

  const publishProject = () => {
    if (scenes.length === 0) {
      alert("Please add at least one scene before publishing.");
      return;
    }

    // Create a simple HTML player for the visual novel
    const htmlContent = generateHTMLPlayer();
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${name || "visual-novel"}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    alert("Visual Novel published as HTML file!");
  };

  const generateHTMLPlayer = () => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name}</title>
    <style>
        body { margin: 0; padding: 0; background: #0a0a0a; color: white; font-family: Arial, sans-serif; }
        .game-container { width: 100%; height: 100vh; position: relative; }
        .dialogue-box { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.8); padding: 20px; }
        .choices { margin-top: 10px; }
        .choice-btn { background: #f59e0b; color: white; border: none; padding: 10px 20px; margin: 5px; cursor: pointer; border-radius: 5px; }
        .choice-btn:hover { background: #d97706; }
    </style>
</head>
<body>
    <div class="game-container" id="game">
        <div class="dialogue-box" id="dialogue">
            <div id="character-name"></div>
            <div id="dialogue-text"></div>
            <div class="choices" id="choices"></div>
        </div>
    </div>
    <script>
        const gameData = ${JSON.stringify({ name, scenes, characters })};
        let currentSceneId = "${scenes[0]?.id || ""}";

        function showScene(sceneId) {
            const scene = gameData.scenes.find(s => s.id === sceneId);
            if (!scene) return;

            document.getElementById('character-name').textContent = scene.character;
            document.getElementById('dialogue-text').textContent = scene.dialogue;

            const choicesDiv = document.getElementById('choices');
            choicesDiv.innerHTML = '';

            scene.choices.forEach(choice => {
                const btn = document.createElement('button');
                btn.className = 'choice-btn';
                btn.textContent = choice.text;
                btn.onclick = () => showScene(choice.nextSceneId);
                choicesDiv.appendChild(btn);
            });

            if (scene.background) {
                document.getElementById('game').style.backgroundImage = \`url(\${scene.background})\`;
                document.getElementById('game').style.backgroundSize = 'cover';
            }
        }

        showScene(currentSceneId);
    </script>
</body>
</html>`;
  };

  const addNewScene = () => {
    const newScene: Scene = {
      id: `scene-${Date.now()}`,
      name: `Scene ${scenes.length + 1}`,
      background: "",
      character: "",
      dialogue: "",
      choices: [],
      position: { x: 50 + scenes.length * 200, y: 50 },
    };
    setScenes([...scenes, newScene]);
    setSelectedScene(newScene);
  };

  const addNewCharacter = () => {
    const newCharacter: Character = {
      id: `char-${Date.now()}`,
      name: `Character ${characters.length + 1}`,
      avatar: "",
      color: "#f59e0b",
    };
    setCharacters([...characters, newCharacter]);
    setSelectedCharacter(newCharacter);
  };

  const addChoice = (sceneId: string) => {
    const newChoice: Choice = {
      id: `choice-${Date.now()}`,
      text: "New Choice",
      nextSceneId: "",
    };

    setScenes(
      scenes.map((scene) =>
        scene.id === sceneId
          ? { ...scene, choices: [...scene.choices, newChoice] }
          : scene
      )
    );
  };

  const deleteScene = (sceneId: string) => {
    if (confirm("Are you sure you want to delete this scene?")) {
      setScenes(scenes.filter((s) => s.id !== sceneId));
      if (selectedScene?.id === sceneId) {
        setSelectedScene(null);
      }
    }
  };

  const deleteCharacter = (characterId: string) => {
    if (confirm("Are you sure you want to delete this character?")) {
      setCharacters(characters.filter((c) => c.id !== characterId));
      if (selectedCharacter?.id === characterId) {
        setSelectedCharacter(null);
      }
    }
  };

  return (
    <section className="lg:text-8xl text-center mt-10 sm:text-6xl xs:text-6xl text-6xl py-[3rem] text-gradient stroke-gold-shine">
      <div>
        <h1 className="mb-10">Visual Novel Studio</h1>
      </div>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl mx-auto px-4"
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
            className={`flex-1 max-w-md h-12 border border-amber-500 rounded-md hover:bg-neutral-950 hover:bg-opacity-50 focus:border-amber-500 outline-none text-white cursor-text box-border transition-colors duration-300 ${
              !isSaved && isFocused
                ? "bg-neutral-950 bg-opacity-50"
                : "bg-transparent border-opacity-0"
            }`}
            placeholder="My Visual Novel"
            required
          />
          <button
            type="submit"
            className="box-border text-yellow-600 text-2xl hover:text-yellow-500 rounded-md transition-colors duration-300 whitespace-nowrap"
          >
            <span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                className="w-10 h-10 p-1"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                />
              </svg>
            </span>
          </button>
        </form>
        <div
          id="vn-editor-container"
          className="relative bg-neutral-900 bg-opacity-90 backdrop-blur-sm rounded-xl w-full min-h-[700px] border border-amber-500 border-opacity-30 shadow-2xl overflow-hidden"
        >
          {/* Top Navigation Bar */}
          <div className="flex justify-between items-center p-6 bg-gradient-to-r from-neutral-800 to-neutral-700 border-b border-amber-500 border-opacity-20">
            {/* Tab Navigation */}
            <div className="flex gap-1">
              {["scenes", "characters", "assets"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                    activeTab === tab
                      ? "bg-amber-600 text-white shadow-lg"
                      : "bg-neutral-700 text-amber-200 hover:bg-neutral-600"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={saveProject}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                title="Save Project"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Save
              </button>
              
              <button
                onClick={exportProject}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                title="Export Project"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export
              </button>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                title="Import Project"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                Import
              </button>
              
              <button
                onClick={publishProject}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                title="Publish Game"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Publish
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

          {/* Main Content Area */}
          <div className="flex h-[600px]">
            {/* Scenes Tab */}
            {activeTab === "scenes" && (
              <>
                {/* Scenes Sidebar */}
                <div className="w-80 bg-neutral-800 bg-opacity-50 border-r border-amber-500 border-opacity-20 overflow-y-auto">
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-amber-200 font-semibold text-lg">Scenes</h3>
                      <button
                        onClick={addNewScene}
                        className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm transition-all duration-300 shadow-md hover:shadow-lg"
                      >
                        + Add Scene
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      {scenes.map((scene, index) => (
                        <motion.div
                          key={scene.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`group relative p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                            selectedScene?.id === scene.id
                              ? "bg-amber-600 text-white shadow-lg"
                              : "bg-neutral-700 hover:bg-neutral-600 text-amber-100 hover:shadow-md"
                          }`}
                          onClick={() => setSelectedScene(scene)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-medium text-sm mb-1">{scene.name}</div>
                              <div className="text-xs opacity-70">Scene #{index + 1}</div>
                              {scene.dialogue && (
                                <div className="text-xs mt-2 opacity-80 line-clamp-2">
                                  {scene.dialogue.substring(0, 60)}...
                                </div>
                              )}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteScene(scene.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-300 transition-all duration-200"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </motion.div>
                      ))}
                      
                      {scenes.length === 0 && (
                        <div className="text-center py-12 text-amber-200 opacity-60">
                          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          <p className="mb-2 font-medium">No scenes yet</p>
                          <p className="text-sm">Create your first scene to start building your visual novel</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Scene Editor */}
                <div className="flex-1 p-6 overflow-y-auto">
                  {selectedScene ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="text-amber-200 font-semibold text-xl">
                          Edit Scene
                        </h3>
                        <div className="text-sm text-amber-300 opacity-70">
                          ID: {selectedScene.id}
                        </div>
                      </div>
                      
                      {/* Scene Name */}
                      <div className="space-y-2">
                        <label className="block text-amber-200 text-sm font-medium">
                          Scene Name
                        </label>
                        <input
                          type="text"
                          value={selectedScene.name}
                          onChange={(e) => {
                            const updatedScene = { ...selectedScene, name: e.target.value };
                            setSelectedScene(updatedScene);
                            setScenes(scenes.map(s => s.id === selectedScene.id ? updatedScene : s));
                          }}
                          className="w-full p-3 bg-neutral-800 bg-opacity-50 border border-amber-500 border-opacity-30 rounded-lg text-white focus:border-amber-400 focus:bg-opacity-70 outline-none transition-all duration-300"
                          placeholder="Enter scene name"
                        />
                      </div>

                      {/* Character Selection */}
                      <div className="space-y-2">
                        <label className="block text-amber-200 text-sm font-medium">
                          Character
                        </label>
                        <div className="flex gap-2">
                          <select
                            value={selectedScene.character}
                            onChange={(e) => {
                              const updatedScene = { ...selectedScene, character: e.target.value };
                              setSelectedScene(updatedScene);
                              setScenes(scenes.map(s => s.id === selectedScene.id ? updatedScene : s));
                            }}
                            className="flex-1 p-3 bg-neutral-800 bg-opacity-50 border border-amber-500 border-opacity-30 rounded-lg text-white focus:border-amber-400 outline-none transition-all duration-300"
                          >
                            <option value="">Select Character</option>
                            {characters.map(char => (
                              <option key={char.id} value={char.name}>
                                {char.name}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={selectedScene.character}
                            onChange={(e) => {
                              const updatedScene = { ...selectedScene, character: e.target.value };
                              setSelectedScene(updatedScene);
                              setScenes(scenes.map(s => s.id === selectedScene.id ? updatedScene : s));
                            }}
                            placeholder="Or type character name"
                            className="flex-1 p-3 bg-neutral-800 bg-opacity-50 border border-amber-500 border-opacity-30 rounded-lg text-white focus:border-amber-400 outline-none transition-all duration-300"
                          />
                        </div>
                      </div>

                      {/* Background */}
                      <div className="space-y-2">
                        <label className="block text-amber-200 text-sm font-medium">
                          Background Image URL
                        </label>
                        <input
                          type="text"
                          value={selectedScene.background}
                          onChange={(e) => {
                            const updatedScene = { ...selectedScene, background: e.target.value };
                            setSelectedScene(updatedScene);
                            setScenes(scenes.map(s => s.id === selectedScene.id ? updatedScene : s));
                          }}
                          placeholder="https://example.com/background.jpg"
                          className="w-full p-3 bg-neutral-800 bg-opacity-50 border border-amber-500 border-opacity-30 rounded-lg text-white focus:border-amber-400 outline-none transition-all duration-300"
                        />
                        {selectedScene.background && (
                          <div className="mt-2 rounded-lg overflow-hidden border border-amber-500 border-opacity-30">
                            <img 
                              src={selectedScene.background} 
                              alt="Background preview"
                              className="w-full h-32 object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Dialogue */}
                      <div className="space-y-2">
                        <label className="block text-amber-200 text-sm font-medium">
                          Dialogue
                        </label>
                        <textarea
                          value={selectedScene.dialogue}
                          onChange={(e) => {
                            const updatedScene = { ...selectedScene, dialogue: e.target.value };
                            setSelectedScene(updatedScene);
                            setScenes(scenes.map(s => s.id === selectedScene.id ? updatedScene : s));
                          }}
                          placeholder="What does the character say in this scene?"
                          rows={4}
                          className="w-full p-3 bg-neutral-800 bg-opacity-50 border border-amber-500 border-opacity-30 rounded-lg text-white focus:border-amber-400 outline-none transition-all duration-300 resize-vertical"
                        />
                      </div>

                      {/* Choices */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <label className="block text-amber-200 text-sm font-medium">
                            Player Choices
                          </label>
                          <button
                            onClick={() => addChoice(selectedScene.id)}
                            className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm transition-all duration-300"
                          >
                            + Add Choice
                          </button>
                        </div>
                        
                        <div className="space-y-3">
                          {selectedScene.choices.map((choice, index) => (
                            <motion.div
                              key={choice.id}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="p-4 bg-neutral-800 bg-opacity-30 rounded-lg border border-amber-500 border-opacity-20"
                            >
                              <div className="flex gap-3 items-start">
                                <div className="flex-1 space-y-2">
                                  <input
                                    type="text"
                                    value={choice.text}
                                    onChange={(e) => {
                                      const updatedChoices = selectedScene.choices.map(c =>
                                        c.id === choice.id ? { ...c, text: e.target.value } : c
                                      );
                                      const updatedScene = { ...selectedScene, choices: updatedChoices };
                                      setSelectedScene(updatedScene);
                                      setScenes(scenes.map(s => s.id === selectedScene.id ? updatedScene : s));
                                    }}
                                    placeholder={`Choice ${index + 1} text`}
                                    className="w-full p-2 bg-neutral-900 border border-amber-500 border-opacity-30 rounded text-white text-sm focus:border-amber-400 outline-none transition-all duration-300"
                                  />
                                  <select
                                    value={choice.nextSceneId}
                                    onChange={(e) => {
                                      const updatedChoices = selectedScene.choices.map(c =>
                                        c.id === choice.id ? { ...c, nextSceneId: e.target.value } : c
                                      );
                                      const updatedScene = { ...selectedScene, choices: updatedChoices };
                                      setSelectedScene(updatedScene);
                                      setScenes(scenes.map(s => s.id === selectedScene.id ? updatedScene : s));
                                    }}
                                    className="w-full p-2 bg-neutral-900 border border-amber-500 border-opacity-30 rounded text-white text-sm focus:border-amber-400 outline-none transition-all duration-300"
                                  >
                                    <option value="">Select next scene</option>
                                    {scenes.filter(s => s.id !== selectedScene.id).map(scene => (
                                      <option key={scene.id} value={scene.id}>
                                        {scene.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <button
                                  onClick={() => {
                                    const updatedChoices = selectedScene.choices.filter(c => c.id !== choice.id);
                                    const updatedScene = { ...selectedScene, choices: updatedChoices };
                                    setSelectedScene(updatedScene);
                                    setScenes(scenes.map(s => s.id === selectedScene.id ? updatedScene : s));
                                  }}
                                  className="p-2 bg-red-600 hover:bg-red-500 text-white rounded transition-all duration-300"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-amber-200 opacity-60">
                      <div className="text-center">
                        <svg className="w-20 h-20 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <p className="text-xl mb-2 font-medium">Select a scene to edit</p>
                        <p className="text-sm">Choose a scene from the left panel or create a new one to get started</p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Characters Tab */}
            {activeTab === "characters" && (
              <>
                <div className="w-80 bg-neutral-800 bg-opacity-50 border-r border-amber-500 border-opacity-20 overflow-y-auto">
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-amber-200 font-semibold text-lg">Characters</h3>
                      <button
                        onClick={addNewCharacter}
                        className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm transition-all duration-300"
                      >
                        + Add Character
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      {characters.map((character, index) => (
                        <motion.div
                          key={character.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`group relative p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                            selectedCharacter?.id === character.id
                              ? "bg-amber-600 text-white"
                              : "bg-neutral-700 hover:bg-neutral-600 text-amber-100"
                          }`}
                          onClick={() => setSelectedCharacter(character)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-medium text-sm mb-1">{character.name}</div>
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: character.color }}></div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteCharacter(character.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-300 transition-all duration-200"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </motion.div>
                      ))}
                      
                      {characters.length === 0 && (
                        <div className="text-center py-12 text-amber-200 opacity-60">
                          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <p className="mb-2 font-medium">No characters yet</p>
                          <p className="text-sm">Add characters to your visual novel</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1 p-6 overflow-y-auto">
                  {selectedCharacter ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <h3 className="text-amber-200 font-semibold text-xl">Edit Character</h3>
                      
                      <div className="space-y-2">
                        <label className="block text-amber-200 text-sm font-medium">Character Name</label>
                        <input
                          type="text"
                          value={selectedCharacter.name}
                          onChange={(e) => {
                            const updated = { ...selectedCharacter, name: e.target.value };
                            setSelectedCharacter(updated);
                            setCharacters(characters.map(c => c.id === selectedCharacter.id ? updated : c));
                          }}
                          className="w-full p-3 bg-neutral-800 bg-opacity-50 border border-amber-500 border-opacity-30 rounded-lg text-white focus:border-amber-400 outline-none transition-all duration-300"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-amber-200 text-sm font-medium">Avatar URL</label>
                        <input
                          type="text"
                          value={selectedCharacter.avatar}
                          onChange={(e) => {
                            const updated = { ...selectedCharacter, avatar: e.target.value };
                            setSelectedCharacter(updated);
                            setCharacters(characters.map(c => c.id === selectedCharacter.id ? updated : c));
                          }}
                          placeholder="https://example.com/avatar.jpg"
                          className="w-full p-3 bg-neutral-800 bg-opacity-50 border border-amber-500 border-opacity-30 rounded-lg text-white focus:border-amber-400 outline-none transition-all duration-300"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-amber-200 text-sm font-medium">Character Color</label>
                        <input
                          type="color"
                          value={selectedCharacter.color}
                          onChange={(e) => {
                            const updated = { ...selectedCharacter, color: e.target.value };
                            setSelectedCharacter(updated);
                            setCharacters(characters.map(c => c.id === selectedCharacter.id ? updated : c));
                          }}
                          className="w-20 h-12 bg-neutral-800 border border-amber-500 border-opacity-30 rounded-lg"
                        />
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-amber-200 opacity-60">
                      <div className="text-center">
                        <svg className="w-20 h-20 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <p className="text-xl mb-2 font-medium">Select a character to edit</p>
                        <p className="text-sm">Choose a character from the left panel or create a new one</p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Assets Tab */}
            {activeTab === "assets" && (
              <div className="flex-1 p-6">
                <div className="text-center py-12 text-amber-200 opacity-60">
                  <svg className="w-20 h-20 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <p className="text-xl mb-2 font-medium">Asset Management</p>
                  <p className="text-sm">Coming soon - Manage backgrounds, music, and sound effects</p>
                </div>
              </div>
            )}
          </div>

          {/* Autosave Indicator */}
          <AnimatePresence>
            {isAutosaving && (
              <motion.div
                initial={{ opacity: 0, y: 20, x: 20 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                exit={{ opacity: 0, y: 20, x: 20 }}
                className="absolute bottom-6 right-6 bg-green-600 bg-opacity-90 backdrop-blur-sm text-white px-4 py-3 rounded-lg shadow-xl border border-green-500 border-opacity-30"
              >
                <div className="flex items-center gap-3">
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
