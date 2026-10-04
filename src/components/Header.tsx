import React from 'react';
import {
  Sparkles,
  BookOpen,
  Image as ImageIcon,
  MessageSquare,
  Settings,
  PlusCircle,
  Save,
  FolderOpen,
  Zap,
  Shield,
  Layers,
} from 'lucide-react';
import { ImageResolution } from '../types/adventure';

interface HeaderProps {
  worldTitle: string;
  genre: string;
  chapterNumber: number;
  imageResolution: ImageResolution;
  onResolutionChange: (res: ImageResolution) => void;
  modelSpeed: 'low-latency' | 'balanced' | 'deep';
  onModelSpeedChange: (speed: 'low-latency' | 'balanced' | 'deep') => void;
  onOpenDMChat: () => void;
  onOpenSettings: () => void;
  onNewAdventure: () => void;
  onSaveGame: () => void;
  onLoadGame: () => void;
  hasSavedGames: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  worldTitle,
  genre,
  chapterNumber,
  imageResolution,
  onResolutionChange,
  modelSpeed,
  onModelSpeedChange,
  onOpenDMChat,
  onOpenSettings,
  onNewAdventure,
  onSaveGame,
  onLoadGame,
  hasSavedGames,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-800 bg-stone-950/90 backdrop-blur-md px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Title & World Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-900 flex items-center justify-center shadow-lg shadow-amber-900/30 border border-amber-500/40">
            <BookOpen className="w-5 h-5 text-amber-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-cinzel text-lg md:text-xl font-bold tracking-wide text-stone-100">
                {worldTitle}
              </h1>
              <span className="text-[11px] font-medium tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                {genre}
              </span>
            </div>
            <p className="text-xs text-stone-400 flex items-center gap-2">
              <span>Chapter {chapterNumber}</span>
              <span className="text-stone-600">•</span>
              <span className="text-amber-400/80 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Infinite Dynamic Engine
              </span>
            </p>
          </div>
        </div>

        {/* Engine Controls & Affordances */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Image Size Affordance: 1K, 2K, 4K (Required Feature) */}
          <div className="flex items-center bg-stone-900 border border-stone-800 rounded-lg p-1 text-xs">
            <span className="px-2 text-stone-400 flex items-center gap-1 font-medium">
              <ImageIcon className="w-3.5 h-3.5 text-stone-300" />
              <span className="hidden sm:inline">Image Size:</span>
            </span>
            {(['1K', '2K', '4K'] as ImageResolution[]).map((res) => (
              <button
                key={res}
                onClick={() => onResolutionChange(res)}
                className={`px-2.5 py-1 rounded font-mono-code font-semibold transition-all ${
                  imageResolution === res
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                }`}
                title={`Generate images at ${res} resolution using gemini-3-pro-image-preview`}
              >
                {res}
              </button>
            ))}
          </div>

          {/* Model / Latency Affordance */}
          <div className="hidden lg:flex items-center bg-stone-900 border border-stone-800 rounded-lg p-1 text-xs">
            <span className="px-2 text-stone-400 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Engine:
            </span>
            <button
              onClick={() => onModelSpeedChange('low-latency')}
              className={`px-2 py-1 rounded transition-all ${
                modelSpeed === 'low-latency'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-medium'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Low-latency story generation with gemini-3.1-flash-lite"
            >
              ⚡ Flash Lite
            </button>
            <button
              onClick={() => onModelSpeedChange('balanced')}
              className={`px-2 py-1 rounded transition-all ${
                modelSpeed === 'balanced'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-medium'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Balanced storytelling with gemini-3.5-flash"
            >
              Balanced
            </button>
            <button
              onClick={() => onModelSpeedChange('deep')}
              className={`px-2 py-1 rounded transition-all ${
                modelSpeed === 'deep'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-medium'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Deep narrative reasoning with gemini-3.1-pro-preview"
            >
              Deep Pro
            </button>
          </div>

          {/* DM Chatbot Button */}
          <button
            onClick={onOpenDMChat}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-600/30 to-amber-700/20 hover:from-amber-600/40 hover:to-amber-700/30 text-amber-200 border border-amber-500/40 rounded-lg text-xs font-semibold shadow-sm transition-all"
            title="Converse with the Dungeon Master, Tactician, or Inner Voice"
          >
            <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Dungeon Master</span>
          </button>

          {/* Quick Actions Menu */}
          <div className="flex items-center gap-1 bg-stone-900 border border-stone-800 rounded-lg p-0.5">
            <button
              onClick={onSaveGame}
              className="p-1.5 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded transition-all"
              title="Save Adventure State to browser storage"
            >
              <Save className="w-4 h-4" />
            </button>
            {hasSavedGames && (
              <button
                onClick={onLoadGame}
                className="p-1.5 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded transition-all"
                title="Load Saved Adventure"
              >
                <FolderOpen className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onOpenSettings}
              className="p-1.5 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded transition-all"
              title="Art Style & Character Consistency Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onNewAdventure}
              className="p-1.5 text-amber-400 hover:text-amber-200 hover:bg-stone-800 rounded transition-all"
              title="Start a New Adventure"
            >
              <PlusCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
