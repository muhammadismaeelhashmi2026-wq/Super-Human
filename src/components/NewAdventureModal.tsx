import React, { useState } from 'react';
import {
  X,
  Compass,
  Sparkles,
  BookOpen,
  User,
  Palette,
  Sword,
  Shield,
  ArrowRight,
} from 'lucide-react';
import { AdventureWorld, AdventureState } from '../types/adventure';
import { PRESET_ADVENTURES, ART_STYLE_PRESETS } from '../data/presets';

interface NewAdventureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartAdventure: (adventure: AdventureState) => void;
}

export const NewAdventureModal: React.FC<NewAdventureModalProps> = ({
  isOpen,
  onClose,
  onStartAdventure,
}) => {
  const [mode, setMode] = useState<'preset' | 'custom'>('preset');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('eldoria');

  // Custom world fields
  const [customTitle, setCustomTitle] = useState('');
  const [customGenre, setCustomGenre] = useState('');
  const [customHeroName, setCustomHeroName] = useState('');
  const [customHeroTitle, setCustomHeroTitle] = useState('');
  const [customHeroAppearance, setCustomHeroAppearance] = useState('');
  const [customArtStyle, setCustomArtStyle] = useState(ART_STYLE_PRESETS[0].prompt);
  const [customHook, setCustomHook] = useState('');

  if (!isOpen) return null;

  const handleLaunchPreset = (preset: AdventureWorld) => {
    const newAdventure: AdventureState = {
      id: `adv-${Date.now()}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      worldTitle: preset.title,
      genre: preset.genre,
      artStyleAnchor: preset.artStylePreset,
      imageResolution: '1K',
      imageAspectRatio: '16:9',
      autoGenerateImages: false,
      character: { ...preset.defaultCharacter },
      inventory: [...preset.initialItems],
      currentQuest: { ...preset.initialQuest },
      pastQuests: [],
      companions: [],
      chapters: [
        {
          chapterNumber: 0,
          timestamp: Date.now(),
          playerActionTaken: 'Begin the journey',
          narrative: preset.startingPrompt,
          sceneSummary: `Arrival at ${preset.title}`,
          sceneImagePrompt: `${preset.artStylePreset}. Scene: The opening moment of ${preset.title}. Hero ${preset.defaultCharacter.name} stands ready: ${preset.defaultCharacter.appearanceAnchor}.`,
          choices: [
            {
              id: 'c-1',
              text: 'Examine your surroundings and inspect the nearest anomaly with caution.',
              type: 'investigate',
              difficulty: 'Easy',
              consequenceHint: 'Gain situational awareness and clues',
            },
            {
              id: 'c-2',
              text: 'Press boldly forward along the main path with weapon drawn.',
              type: 'action',
              difficulty: 'Moderate',
              consequenceHint: 'Face immediate hazards head-on',
            },
            {
              id: 'c-3',
              text: 'Search for a concealed vantage point or bypass to survey unseen dangers.',
              type: 'stealth',
              difficulty: 'Moderate',
              consequenceHint: 'Avoid detection and discover alternate routes',
            },
          ],
        },
      ],
      currentTurnIndex: 0,
      isGenerating: false,
      modelSpeed: 'low-latency',
    };

    onStartAdventure(newAdventure);
    onClose();
  };

  const handleLaunchCustom = () => {
    if (!customTitle.trim() || !customHook.trim()) return;

    const heroName = customHeroName.trim() || 'The Wanderer';
    const heroAppearance =
      customHeroAppearance.trim() ||
      `${heroName}, a determined adventurer dressed in travel-stained attire with keen observant eyes.`;

    const newAdventure: AdventureState = {
      id: `adv-custom-${Date.now()}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      worldTitle: customTitle.trim(),
      genre: customGenre.trim() || 'Adventure',
      artStyleAnchor: customArtStyle,
      imageResolution: '1K',
      imageAspectRatio: '16:9',
      autoGenerateImages: false,
      character: {
        name: heroName,
        title: customHeroTitle.trim() || 'Wayfarer',
        appearanceAnchor: heroAppearance,
        health: 100,
        maxHealth: 100,
        resolve: 100,
        maxResolve: 100,
        statusEffects: ['Ready'],
        stats: {
          might: 12,
          agility: 12,
          intellect: 12,
          arcana: 12,
        },
      },
      inventory: [
        {
          id: 'item-custom-starter-1',
          name: 'Traveler Blade',
          category: 'weapon',
          rarity: 'common',
          description: 'A trusty forged edge carried across long miles.',
          quantity: 1,
          equipped: true,
          acquiredInChapter: 0,
        },
        {
          id: 'item-custom-starter-2',
          name: 'Restorative Salve',
          category: 'consumable',
          rarity: 'common',
          description: 'Soothing ointment that mends scrapes and light burns.',
          quantity: 2,
          equipped: false,
          acquiredInChapter: 0,
        },
      ],
      currentQuest: {
        id: 'quest-custom-init',
        title: `The Mystery of ${customTitle.trim()}`,
        description: 'Explore the newly entered realm and unravel its deep secrets.',
        status: 'active',
        objectives: [
          { id: 'obj-init-1', text: 'Survey the initial situation and survive first contact', completed: false },
          { id: 'obj-init-2', text: 'Uncover the primary antagonist or threat', completed: false },
        ],
      },
      pastQuests: [],
      companions: [],
      chapters: [
        {
          chapterNumber: 0,
          timestamp: Date.now(),
          playerActionTaken: 'Prologue begins',
          narrative: customHook.trim(),
          sceneSummary: `Prologue: Entering ${customTitle.trim()}`,
          sceneImagePrompt: `${customArtStyle}. Scene: Opening of ${customTitle.trim()}. Hero ${heroName}: ${heroAppearance}. Atmospheric cinematic vista.`,
          choices: [
            {
              id: 'c-1',
              text: 'Scout ahead cautiously and assess the terrain.',
              type: 'investigate',
              difficulty: 'Easy',
            },
            {
              id: 'c-2',
              text: 'Advance directly toward the most prominent landmark.',
              type: 'action',
              difficulty: 'Moderate',
            },
            {
              id: 'c-3',
              text: 'Prepare your equipment and examine your surroundings for concealed threats.',
              type: 'stealth',
              difficulty: 'Easy',
            },
          ],
        },
      ],
      currentTurnIndex: 0,
      isGenerating: false,
      modelSpeed: 'low-latency',
    };

    onStartAdventure(newAdventure);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="max-w-3xl w-full bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-stone-800 flex items-center justify-between bg-stone-900/60">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-400" />
            <h3 className="font-cinzel font-bold text-stone-100 text-base">
              Embark Upon a New Adventure
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="grid grid-cols-2 p-2 border-b border-stone-800 bg-stone-900/30 gap-2">
          <button
            onClick={() => setMode('preset')}
            className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
              mode === 'preset'
                ? 'bg-amber-600/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Curated Worlds
          </button>
          <button
            onClick={() => setMode('custom')}
            className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
              mode === 'custom'
                ? 'bg-amber-600/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Forge Custom Universe
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {mode === 'preset' ? (
            <div className="space-y-3">
              {PRESET_ADVENTURES.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => setSelectedPresetId(preset.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-stone-900 border-amber-500/60 shadow-lg ring-1 ring-amber-500/30'
                        : 'bg-stone-900/40 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-cinzel text-base font-bold text-stone-100">
                            {preset.title}
                          </h4>
                          <span className="text-[10px] uppercase font-mono-code px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                            {preset.genre}
                          </span>
                        </div>
                        <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                          {preset.synopsis}
                        </p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLaunchPreset(preset);
                        }}
                        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs shadow-md transition-colors"
                      >
                        <span>Launch</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-stone-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-stone-400">
                      <div>
                        <span className="text-stone-300 font-semibold">Hero:</span>{' '}
                        {preset.defaultCharacter.name} ({preset.defaultCharacter.title})
                      </div>
                      <div>
                        <span className="text-stone-300 font-semibold">Initial Quest:</span>{' '}
                        {preset.initialQuest.title}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-300 block mb-1">
                    World Title *
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="e.g. The Clockwork Necropolis"
                    className="w-full p-2.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-100 placeholder-stone-600 outline-none focus:border-amber-500 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-300 block mb-1">
                    Genre / Theme
                  </label>
                  <input
                    type="text"
                    value={customGenre}
                    onChange={(e) => setCustomGenre(e.target.value)}
                    placeholder="e.g. Steampunk Gothic"
                    className="w-full p-2.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-100 placeholder-stone-600 outline-none focus:border-amber-500 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-300 block mb-1">
                    Hero Name
                  </label>
                  <input
                    type="text"
                    value={customHeroName}
                    onChange={(e) => setCustomHeroName(e.target.value)}
                    placeholder="e.g. Morgan Drake"
                    className="w-full p-2.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-100 placeholder-stone-600 outline-none focus:border-amber-500 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-300 block mb-1">
                    Hero Title / Profession
                  </label>
                  <input
                    type="text"
                    value={customHeroTitle}
                    onChange={(e) => setCustomHeroTitle(e.target.value)}
                    placeholder="e.g. Master Clocksmith"
                    className="w-full p-2.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-100 placeholder-stone-600 outline-none focus:border-amber-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-300 block mb-1">
                  Protagonist Appearance Anchor (For Consistent Images)
                </label>
                <textarea
                  value={customHeroAppearance}
                  onChange={(e) => setCustomHeroAppearance(e.target.value)}
                  rows={2}
                  placeholder="Describe your character's face, hair, clothing, signature gear and colors..."
                  className="w-full p-2.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-100 placeholder-stone-600 outline-none focus:border-amber-500 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-300 block mb-1">
                  Persistent Art Style Anchor
                </label>
                <select
                  value={customArtStyle}
                  onChange={(e) => setCustomArtStyle(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-100 outline-none focus:border-amber-500 text-xs mb-2"
                >
                  {ART_STYLE_PRESETS.map((p) => (
                    <option key={p.id} value={p.prompt}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <textarea
                  value={customArtStyle}
                  onChange={(e) => setCustomArtStyle(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-300 text-[11px] font-mono-code outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-300 block mb-1">
                  Opening Hook / Prologue Text *
                </label>
                <textarea
                  value={customHook}
                  onChange={(e) => setCustomHook(e.target.value)}
                  rows={3}
                  placeholder="Where does the story start? What immediate dilemma or threshold do you face?"
                  className="w-full p-2.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-100 placeholder-stone-600 outline-none focus:border-amber-500 text-xs"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={handleLaunchCustom}
                  disabled={!customTitle.trim() || !customHook.trim()}
                  className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-stone-950 font-bold text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Forge Universe & Launch Adventure</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
