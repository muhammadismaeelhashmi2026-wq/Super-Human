/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SoundscapeBar } from './components/SoundscapeBar';
import { Sidebar } from './components/Sidebar';
import { StoryViewer } from './components/StoryViewer';
import { ChoicePanel } from './components/ChoicePanel';
import { DMChatDrawer } from './components/DMChatDrawer';
import { SettingsModal } from './components/SettingsModal';
import { NewAdventureModal } from './components/NewAdventureModal';
import { ImageModal } from './components/ImageModal';
import { PRESET_ADVENTURES } from './data/presets';
import { soundscape } from './services/soundscape';
import {
  AdventureState,
  ChapterTurn,
  ImageResolution,
  AspectRatio,
  InventoryItem,
} from './types/adventure';
import {
  advanceAdventureTurn,
  generateSceneImage,
  quickDiceCheck,
  generateLyriaMusic,
} from './services/api';

const STORAGE_KEY = 'chronicle_adventure_save_v1';

export default function App() {
  // Initialize from localStorage or default preset (Eldoria)
  const [adventure, setAdventure] = useState<AdventureState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load saved adventure:', e);
    }

    const defaultPreset = PRESET_ADVENTURES[0];
    return {
      id: 'adv-default',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      worldTitle: defaultPreset.title,
      genre: defaultPreset.genre,
      artStyleAnchor: defaultPreset.artStylePreset,
      imageResolution: '1K',
      imageAspectRatio: '16:9',
      autoGenerateImages: false,
      character: { ...defaultPreset.defaultCharacter },
      inventory: [...defaultPreset.initialItems],
      currentQuest: { ...defaultPreset.initialQuest },
      pastQuests: [],
      companions: [],
      chapters: [
        {
          chapterNumber: 0,
          timestamp: Date.now(),
          playerActionTaken: 'Prologue: Arrival',
          narrative: defaultPreset.startingPrompt,
          sceneSummary: 'The Obsidian Archway of the Sunken Reliquary',
          sceneImagePrompt: `${defaultPreset.artStylePreset}. Scene: Flooded obsidian archway of the Sunken Reliquary. Protagonist ${defaultPreset.defaultCharacter.name}: ${defaultPreset.defaultCharacter.appearanceAnchor}.`,
          choices: [
            {
              id: 'c-1',
              text: 'Inspect the flooded flagstones and pry the brass cylinder from the skeleton.',
              type: 'investigate',
              difficulty: 'Easy',
              consequenceHint: 'Search for maps, keys, or warning notes',
            },
            {
              id: 'c-2',
              text: 'Draw your silvered blade and investigate the corridor echoing with clicking noises.',
              type: 'action',
              difficulty: 'Moderate',
              consequenceHint: 'Confront whatever lurks in the lower damp corridors',
            },
            {
              id: 'c-3',
              text: 'Follow the faint scent of myrrh and burning tallow toward the higher chambers.',
              type: 'stealth',
              difficulty: 'Easy',
              consequenceHint: 'Seek out the inner sanctum and holy altars',
            },
          ],
        },
      ],
      currentTurnIndex: 0,
      isGenerating: false,
      modelSpeed: 'low-latency', // Default low-latency gemini-3.1-flash-lite
    };
  });

  // UI state
  const [isGeneratingTurn, setIsGeneratingTurn] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingLyria, setIsGeneratingLyria] = useState(false);
  const [isDMChatOpen, setIsDMChatOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNewAdventureOpen, setIsNewAdventureOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ url: string; prompt?: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [diceResult, setDiceResult] = useState<any | null>(null);

  // Auto-save adventure to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(adventure));
    } catch (e) {
      console.warn('Could not auto-save state:', e);
    }
  }, [adventure]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const currentChapter = adventure.chapters[adventure.chapters.length - 1];
  const pastChapters = adventure.chapters.slice(0, -1);

  // 1. Advance Turn Handler
  const handleSelectChoice = async (choiceText: string) => {
    if (isGeneratingTurn) return;
    soundscape.playClickSfx();
    setIsGeneratingTurn(true);

    try {
      const response = await advanceAdventureTurn(adventure, choiceText);

      // Trigger turn fanfare
      soundscape.playTurnFanfareSfx();

      // Process inventory updates automatically (Required Feature)
      const updatedInventory: InventoryItem[] = [...adventure.inventory];

      // Remove consumed or lost items
      const removedIds = new Set(response.inventoryUpdates?.removedIds || []);
      const filteredInventory = updatedInventory.filter((item) => !removedIds.has(item.id));

      // Add new items
      const newItems = (response.inventoryUpdates?.added || []).map((item: any) => ({
        ...item,
        acquiredInChapter: adventure.chapters.length,
      }));
      const finalInventory = [...filteredInventory, ...newItems];

      // Process Quest updates automatically (Required Feature)
      let finalCurrentQuest = adventure.currentQuest;
      const finalPastQuests = [...adventure.pastQuests];

      if (response.questUpdate) {
        if (response.questUpdate.status === 'completed') {
          finalPastQuests.push({ ...adventure.currentQuest, status: 'completed' });
        }
        finalCurrentQuest = {
          id: adventure.currentQuest?.id || `quest-${Date.now()}`,
          title: response.questUpdate.title || adventure.currentQuest?.title || 'Current Quest',
          description: response.questUpdate.description || adventure.currentQuest?.description || '',
          status: (response.questUpdate.status as any) || 'active',
          objectives: response.questUpdate.objectives || adventure.currentQuest?.objectives || [],
          reward: adventure.currentQuest?.reward,
        };
      }

      // Process Vitals and Status effects
      const newHealth = Math.max(
        0,
        Math.min(
          adventure.character.maxHealth,
          adventure.character.health + (response.statChanges?.healthDelta || 0)
        )
      );
      const newResolve = Math.max(
        0,
        Math.min(
          adventure.character.maxResolve,
          adventure.character.resolve + (response.statChanges?.resolveDelta || 0)
        )
      );

      // Status effects
      let newStatusEffects = [...adventure.character.statusEffects];
      if (response.statChanges?.removedStatusEffects) {
        const removed = new Set(response.statChanges.removedStatusEffects);
        newStatusEffects = newStatusEffects.filter((e) => !removed.has(e));
      }
      if (response.statChanges?.newStatusEffects) {
        newStatusEffects = Array.from(
          new Set([...newStatusEffects, ...response.statChanges.newStatusEffects])
        );
      }

      // Met Characters
      const updatedCompanions = [...adventure.companions];
      if (response.charactersMet && response.charactersMet.length > 0) {
        for (const npc of response.charactersMet) {
          const existingIdx = updatedCompanions.findIndex((c) => c.name.toLowerCase() === npc.name.toLowerCase());
          if (existingIdx >= 0) {
            updatedCompanions[existingIdx] = { ...updatedCompanions[existingIdx], ...npc };
          } else {
            updatedCompanions.push(npc);
          }
        }
      }

      // Construct new chapter
      const newChapter: ChapterTurn = {
        chapterNumber: adventure.chapters.length,
        timestamp: Date.now(),
        playerActionTaken: choiceText,
        narrative: response.narrative,
        sceneSummary: response.sceneSummary,
        sceneImagePrompt: response.sceneImagePrompt,
        choices: response.choices || [],
        changesSummary: {
          inventoryAdded: newItems.map((i: any) => i.name),
          inventoryRemoved: Array.from(removedIds).map(String),
          questProgress: response.questUpdate?.milestoneNotification,
          healthDelta: response.statChanges?.healthDelta,
          resolveDelta: response.statChanges?.resolveDelta,
          newEffects: response.statChanges?.newStatusEffects,
        },
      };

      setAdventure((prev) => ({
        ...prev,
        updatedAt: Date.now(),
        character: {
          ...prev.character,
          health: newHealth,
          resolve: newResolve,
          statusEffects: newStatusEffects,
        },
        inventory: finalInventory,
        currentQuest: finalCurrentQuest,
        pastQuests: finalPastQuests,
        companions: updatedCompanions,
        chapters: [...prev.chapters, newChapter],
        currentTurnIndex: prev.chapters.length,
      }));

      // Feedback toast
      if (newItems.length > 0) {
        soundscape.playItemAcquireSfx();
        showToast(`✦ Acquired: ${newItems.map((i: any) => i.name).join(', ')}`);
      } else if (response.questUpdate?.milestoneNotification) {
        showToast(`⚔ Quest Update: ${response.questUpdate.milestoneNotification}`);
      }
    } catch (err: any) {
      console.error('Failed to advance turn:', err);
      showToast(`Error: ${err.message || 'Could not advance story'}`);
    } finally {
      setIsGeneratingTurn(false);
    }
  };

  // 2. Real-time Image Generation using gemini-3-pro-image-preview with 1K, 2K, 4K affordance
  const handleGenerateImage = async () => {
    if (isGeneratingImage) return;
    setIsGeneratingImage(true);

    try {
      const promptToUse =
        currentChapter.sceneImagePrompt ||
        `Atmospheric scene in ${adventure.worldTitle}. ${currentChapter.sceneSummary}.`;

      const result = await generateSceneImage(
        promptToUse,
        adventure.character.appearanceAnchor,
        adventure.artStyleAnchor,
        adventure.imageResolution,
        adventure.imageAspectRatio
      );

      // Attach image to current chapter
      setAdventure((prev) => {
        const updatedChapters = [...prev.chapters];
        const lastIdx = updatedChapters.length - 1;
        if (lastIdx >= 0) {
          updatedChapters[lastIdx] = {
            ...updatedChapters[lastIdx],
            imageUrl: result.imageUrl,
            imageResolution: result.imageSize,
            isFallbackImage: result.isFallback,
            quotaNotice: result.quotaNotice,
          };
        }
        return {
          ...prev,
          chapters: updatedChapters,
        };
      });

      if (result.quotaExceeded) {
        showToast(`✦ Atmospheric scene rendered (Free-tier quota limit reached)`);
      } else {
        showToast(`✦ Scene rendered in ${result.imageSize} resolution`);
      }
    } catch (err: any) {
      console.error('Image generation failed:', err);
      showToast(`Image Error: ${err.message || 'Image generation failed'}`);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // 3. Dice Roll Simulator
  const handleDiceRoll = async () => {
    soundscape.playDiceRollSfx();
    try {
      const res = await quickDiceCheck(
        'Fate skill check',
        'intellect',
        adventure.character.stats.intellect,
        12
      );
      setDiceResult(res);
      showToast(
        res.critical
          ? '✦ Natural 20! Fate grants critical success!'
          : res.success
          ? `✦ Roll ${res.total} - Success against DC 12`
          : `✦ Roll ${res.total} - Failed against DC 12`
      );
    } catch (e) {
      // fallback local roll
      const roll = Math.floor(Math.random() * 20) + 1;
      setDiceResult({ roll, modifier: 2, total: roll + 2, dc: 12, success: roll + 2 >= 12, critical: roll === 20 });
    }
  };

  // 4. Optional Lyria Music Generator
  const handleGenerateLyriaMusic = async () => {
    if (isGeneratingLyria) return;
    setIsGeneratingLyria(true);
    showToast('✦ Composing cinematic theme with Lyria...');

    try {
      const prompt = `${adventure.genre} adventure soundtrack for ${adventure.worldTitle}. Scene: ${currentChapter.sceneSummary}`;
      const res = await generateLyriaMusic(prompt, 'clip');
      if (res.audioUrl) {
        const audio = new Audio(res.audioUrl);
        audio.volume = 0.5;
        audio.play();
        showToast('✦ Lyria orchestral theme playing!');
      }
    } catch (err: any) {
      console.warn('Lyria music error:', err);
      showToast(`Music Notice: Free procedural soundscape active. (Lyria requires billing-enabled key).`);
    } finally {
      setIsGeneratingLyria(false);
    }
  };

  // 5. Use Item from sidebar
  const handleUseItem = (item: InventoryItem) => {
    handleSelectChoice(`I reach into my pack and use the ${item.name} (${item.effect || item.description}).`);
  };

  // 6. Toggle Equip Item
  const handleEquipItem = (itemId: string) => {
    setAdventure((prev) => ({
      ...prev,
      inventory: prev.inventory.map((item) =>
        item.id === itemId ? { ...item, equipped: !item.equipped } : item
      ),
    }));
    showToast('Equipment updated');
  };

  // 7. Manual Save & Load
  const handleSaveGame = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(adventure));
    showToast('✦ Adventure chronicle saved to browser memory');
  };

  const handleLoadGame = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setAdventure(JSON.parse(saved));
      showToast('✦ Restored saved chronicle');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-950 text-stone-100 selection:bg-amber-700/30 selection:text-amber-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-4 z-50 p-3 rounded-xl bg-stone-900 border border-amber-500/50 text-xs font-semibold text-amber-200 shadow-2xl animate-in slide-in-from-top duration-200 flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        worldTitle={adventure.worldTitle}
        genre={adventure.genre}
        chapterNumber={currentChapter.chapterNumber}
        imageResolution={adventure.imageResolution}
        onResolutionChange={(res) =>
          setAdventure((prev) => ({ ...prev, imageResolution: res }))
        }
        modelSpeed={adventure.modelSpeed}
        onModelSpeedChange={(speed) =>
          setAdventure((prev) => ({ ...prev, modelSpeed: speed }))
        }
        onOpenDMChat={() => setIsDMChatOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onNewAdventure={() => setIsNewAdventureOpen(true)}
        onSaveGame={handleSaveGame}
        onLoadGame={handleLoadGame}
        hasSavedGames={!!localStorage.getItem(STORAGE_KEY)}
      />

      {/* Free Ambient Soundscape Generator Bar (shifts dynamically based on sceneSummary) */}
      <SoundscapeBar
        currentSceneSummary={currentChapter.sceneSummary}
        genre={adventure.genre}
        onGenerateLyriaMusic={handleGenerateLyriaMusic}
        isGeneratingLyria={isGeneratingLyria}
      />

      {/* Main Content Layout with Dynamic Sidebar & Story Narrative */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Dynamic Sidebar (Inventory & Current Quest tracking) */}
        <Sidebar
          inventory={adventure.inventory}
          currentQuest={adventure.currentQuest}
          pastQuests={adventure.pastQuests}
          character={adventure.character}
          companions={adventure.companions}
          currentChapterNumber={currentChapter.chapterNumber}
          onUseItem={handleUseItem}
          onEquipItem={handleEquipItem}
        />

        {/* Story Viewport & Interactive Choices */}
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-radial from-stone-900/40 via-stone-950 to-stone-950">
          <StoryViewer
            currentChapter={currentChapter}
            pastChapters={pastChapters}
            isGeneratingTurn={isGeneratingTurn}
            isGeneratingImage={isGeneratingImage}
            onGenerateImage={handleGenerateImage}
            imageResolution={adventure.imageResolution}
            onResolutionChange={(res) =>
              setAdventure((prev) => ({ ...prev, imageResolution: res }))
            }
            onOpenImageModal={(url, prompt) =>
              setPreviewImage({ url, prompt })
            }
          />

          <ChoicePanel
            choices={currentChapter.choices}
            onSelectChoice={handleSelectChoice}
            isLoading={isGeneratingTurn}
            onDiceRoll={handleDiceRoll}
            lastDiceResult={diceResult}
          />
        </main>
      </div>

      {/* Multi-Turn Gemini Dungeon Master Chatbot Drawer */}
      <DMChatDrawer
        isOpen={isDMChatOpen}
        onClose={() => setIsDMChatOpen(false)}
        adventure={adventure}
      />

      {/* Visual Consistency & Engine Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        artStyleAnchor={adventure.artStyleAnchor}
        onUpdateArtStyle={(style) =>
          setAdventure((prev) => ({ ...prev, artStyleAnchor: style }))
        }
        characterAppearance={adventure.character.appearanceAnchor}
        onUpdateCharacterAppearance={(appearance) =>
          setAdventure((prev) => ({
            ...prev,
            character: { ...prev.character, appearanceAnchor: appearance },
          }))
        }
        imageResolution={adventure.imageResolution}
        onUpdateResolution={(res) =>
          setAdventure((prev) => ({ ...prev, imageResolution: res }))
        }
        aspectRatio={adventure.imageAspectRatio}
        onUpdateAspectRatio={(ratio) =>
          setAdventure((prev) => ({ ...prev, imageAspectRatio: ratio }))
        }
        modelSpeed={adventure.modelSpeed}
        onUpdateModelSpeed={(speed) =>
          setAdventure((prev) => ({ ...prev, modelSpeed: speed }))
        }
      />

      {/* New Adventure / Universe Builder Modal */}
      <NewAdventureModal
        isOpen={isNewAdventureOpen}
        onClose={() => setIsNewAdventureOpen(false)}
        onStartAdventure={(newAdv) => {
          setAdventure(newAdv);
          showToast(`✦ Welcome to ${newAdv.worldTitle}`);
        }}
      />

      {/* High-Resolution Image Preview Modal */}
      <ImageModal
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
        imageUrl={previewImage?.url || ''}
        prompt={previewImage?.prompt}
        imageResolution={adventure.imageResolution}
      />
    </div>
  );
}
