import React, { useState } from 'react';
import {
  X,
  Palette,
  User,
  Image as ImageIcon,
  Zap,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { ImageResolution, AspectRatio } from '../types/adventure';
import { ART_STYLE_PRESETS } from '../data/presets';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  artStyleAnchor: string;
  onUpdateArtStyle: (style: string) => void;
  characterAppearance: string;
  onUpdateCharacterAppearance: (appearance: string) => void;
  imageResolution: ImageResolution;
  onUpdateResolution: (res: ImageResolution) => void;
  aspectRatio: AspectRatio;
  onUpdateAspectRatio: (ratio: AspectRatio) => void;
  modelSpeed: 'low-latency' | 'balanced' | 'deep';
  onUpdateModelSpeed: (speed: 'low-latency' | 'balanced' | 'deep') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  artStyleAnchor,
  onUpdateArtStyle,
  characterAppearance,
  onUpdateCharacterAppearance,
  imageResolution,
  onUpdateResolution,
  aspectRatio,
  onUpdateAspectRatio,
  modelSpeed,
  onUpdateModelSpeed,
}) => {
  const [tempArtStyle, setTempArtStyle] = useState(artStyleAnchor);
  const [tempAppearance, setTempAppearance] = useState(characterAppearance);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateArtStyle(tempArtStyle);
    onUpdateCharacterAppearance(tempAppearance);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="max-w-2xl w-full bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-stone-800 flex items-center justify-between bg-stone-900/60">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-amber-400" />
            <h3 className="font-cinzel font-bold text-stone-100 text-base">
              Visual Consistency & Engine Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* 1. Consistent Art Style Anchor */}
          <div className="space-y-3">
            <div>
              <label className="font-semibold text-stone-200 text-sm flex items-center gap-2">
                <Palette className="w-4 h-4 text-amber-400" />
                Persistent Art Style Anchor
              </label>
              <p className="text-stone-400 mt-0.5">
                Every generated scene prepends this anchor to ensure art style fidelity across the entire journey.
              </p>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ART_STYLE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setTempArtStyle(preset.prompt)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    tempArtStyle === preset.prompt
                      ? 'bg-amber-600/20 border-amber-500/60 text-amber-200 shadow-sm'
                      : 'bg-stone-900/50 border-stone-800 hover:border-stone-700 text-stone-300'
                  }`}
                >
                  <div className="font-semibold text-stone-100">{preset.name}</div>
                  <div className="text-[11px] text-stone-400 line-clamp-2 mt-0.5">
                    {preset.description}
                  </div>
                </button>
              ))}
            </div>

            <textarea
              value={tempArtStyle}
              onChange={(e) => setTempArtStyle(e.target.value)}
              rows={3}
              className="w-full p-3 rounded-xl bg-stone-900 border border-stone-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-stone-200 outline-none leading-relaxed font-mono-code text-[11px]"
              placeholder="Custom art style description..."
            />
          </div>

          {/* 2. Protagonist Character Appearance Anchor */}
          <div className="space-y-2 pt-4 border-t border-stone-800">
            <div>
              <label className="font-semibold text-stone-200 text-sm flex items-center gap-2">
                <User className="w-4 h-4 text-amber-400" />
                Character Appearance Anchor (Face & Attire)
              </label>
              <p className="text-stone-400 mt-0.5">
                Physical traits, hair, face features, distinctive clothing, and colors. This is injected into every scene prompt so your hero looks identical in every illustration!
              </p>
            </div>
            <textarea
              value={tempAppearance}
              onChange={(e) => setTempAppearance(e.target.value)}
              rows={3}
              className="w-full p-3 rounded-xl bg-stone-900 border border-stone-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-stone-200 outline-none leading-relaxed text-xs"
              placeholder="e.g. Silver-haired rogue in midnight raven leather with glowing amber talisman..."
            />
          </div>

          {/* 3. Image Generation Resolution (Feature requirement: 1K, 2K, 4K) */}
          <div className="space-y-3 pt-4 border-t border-stone-800">
            <div>
              <label className="font-semibold text-stone-200 text-sm flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-400" />
                Default Image Resolution (gemini-3-pro-image-preview)
              </label>
              <p className="text-stone-400 mt-0.5">
                Specify default resolution for real-time scene visualization.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(['1K', '2K', '4K'] as ImageResolution[]).map((res) => (
                <button
                  key={res}
                  onClick={() => onUpdateResolution(res)}
                  className={`py-2.5 px-3 rounded-xl border text-center font-mono-code font-bold transition-all ${
                    imageResolution === res
                      ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md shadow-amber-500/20'
                      : 'bg-stone-900 border-stone-800 hover:bg-stone-800 text-stone-300'
                  }`}
                >
                  <div className="text-base">{res}</div>
                  <div className="text-[10px] opacity-80">
                    {res === '1K' ? '1024 px' : res === '2K' ? '2048 px' : '4096 px High-Def'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Aspect Ratio */}
          <div className="space-y-2 pt-4 border-t border-stone-800">
            <label className="font-semibold text-stone-200 text-xs block">
              Image Aspect Ratio
            </label>
            <div className="flex gap-2">
              {(['16:9', '1:1', '4:3', '3:4'] as AspectRatio[]).map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => onUpdateAspectRatio(ratio)}
                  className={`px-3 py-1.5 rounded-lg border font-mono-code text-xs transition-all ${
                    aspectRatio === ratio
                      ? 'bg-amber-600/20 text-amber-300 border-amber-500/50 font-bold'
                      : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Engine Latency & Storytelling Model */}
          <div className="space-y-2 pt-4 border-t border-stone-800">
            <label className="font-semibold text-stone-200 text-xs flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Story Generation Engine
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={() => onUpdateModelSpeed('low-latency')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  modelSpeed === 'low-latency'
                    ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
                    : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                <div className="font-bold text-xs text-stone-100 flex items-center gap-1">
                  ⚡ Flash Lite
                </div>
                <div className="text-[11px] text-stone-400 mt-1">
                  Low-latency, lightning fast turns using gemini-3.1-flash-lite
                </div>
              </button>

              <button
                onClick={() => onUpdateModelSpeed('balanced')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  modelSpeed === 'balanced'
                    ? 'bg-cyan-950/30 border-cyan-500/50 text-cyan-200'
                    : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                <div className="font-bold text-xs text-stone-100 flex items-center gap-1">
                  ✨ Balanced
                </div>
                <div className="text-[11px] text-stone-400 mt-1">
                  Rich literary prose using gemini-3.5-flash
                </div>
              </button>

              <button
                onClick={() => onUpdateModelSpeed('deep')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  modelSpeed === 'deep'
                    ? 'bg-purple-950/30 border-purple-500/50 text-purple-200'
                    : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                <div className="font-bold text-xs text-stone-100 flex items-center gap-1">
                  🧠 Deep Pro
                </div>
                <div className="text-[11px] text-stone-400 mt-1">
                  Intricate plot logic using gemini-3.1-pro-preview
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-800 bg-stone-900/60 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
