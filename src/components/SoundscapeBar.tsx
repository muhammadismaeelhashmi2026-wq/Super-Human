import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Radio,
  Sliders,
  Sparkles,
  Music,
  Check,
  ChevronDown,
  Layers,
  Wand2,
  Loader2,
} from 'lucide-react';
import { soundscape, SoundscapeMood, SoundscapeState } from '../services/soundscape';

interface SoundscapeBarProps {
  currentSceneSummary: string;
  genre?: string;
  onGenerateLyriaMusic?: () => void;
  isGeneratingLyria?: boolean;
}

export const SoundscapeBar: React.FC<SoundscapeBarProps> = ({
  currentSceneSummary,
  genre = '',
  onGenerateLyriaMusic,
  isGeneratingLyria = false,
}) => {
  const [state, setState] = useState<SoundscapeState>(soundscape.getState());
  const [showMoodMenu, setShowMoodMenu] = useState(false);

  useEffect(() => {
    const unsubscribe = soundscape.subscribe((newState) => {
      setState({ ...newState });
    });
    return unsubscribe;
  }, []);

  // Update soundscape automatically when chapter sceneSummary shifts!
  useEffect(() => {
    if (currentSceneSummary) {
      soundscape.handleSceneChange(currentSceneSummary, genre);
    }
  }, [currentSceneSummary, genre]);

  const moods: Array<{ id: SoundscapeMood; label: string; icon: string }> = [
    { id: 'dungeon_catacombs', label: 'Subterranean Vault & Drips', icon: '🏰' },
    { id: 'cyberpunk_rain', label: 'Neon Rain & Cyber Synth', icon: '🌧' },
    { id: 'cosmic_horror', label: 'Astral Void & Eldritch Drone', icon: '🌌' },
    { id: 'combat_tension', label: 'Combat Pulse & Standoff', icon: '⚔' },
    { id: 'sanctuary_peace', label: 'Sacred Sanctum & Warm Chimes', icon: '🕯' },
    { id: 'wind_wilderness', label: 'Howling Winds & Mountain Mist', icon: '🌪' },
    { id: 'mystic_ruins', label: 'Arcane Runes & Resonances', icon: '🏛' },
  ];

  return (
    <div className="relative border-b border-stone-800 bg-stone-950/80 backdrop-blur-md px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 shadow-inner">
      {/* Left: Playback & Active Mood indicator */}
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          onClick={() => {
            soundscape.togglePlay();
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all shadow-sm cursor-pointer ${
            state.isPlaying
              ? 'bg-amber-500 text-stone-950 hover:bg-amber-400'
              : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700'
          }`}
          title={state.isPlaying ? 'Pause Ambient Soundscape' : 'Play Free Ambient Soundscape'}
        >
          {state.isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Ambient On</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Enable Audio</span>
            </>
          )}
        </button>

        {/* Animated Soundwave bars when playing */}
        {state.isPlaying && (
          <div className="flex items-end gap-0.5 h-4 px-1" title="Real-time Web Audio Synthesizer">
            <span className="w-1 bg-amber-400 rounded-full animate-[bounce_0.8s_infinite_100ms] h-2" />
            <span className="w-1 bg-amber-500 rounded-full animate-[bounce_0.8s_infinite_300ms] h-4" />
            <span className="w-1 bg-amber-300 rounded-full animate-[bounce_0.8s_infinite_200ms] h-3" />
            <span className="w-1 bg-amber-400 rounded-full animate-[bounce_0.8s_infinite_400ms] h-1.5" />
          </div>
        )}

        {/* Current Active Soundscape Mood badge */}
        <div className="relative">
          <button
            onClick={() => setShowMoodMenu(!showMoodMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-800 hover:border-amber-500/40 text-stone-200 font-medium transition-colors"
            title="Click to change or lock soundscape atmosphere"
          >
            <Radio className={`w-3.5 h-3.5 ${state.isPlaying ? 'text-amber-400 animate-pulse' : 'text-stone-500'}`} />
            <span className="text-[11px] truncate max-w-[200px] sm:max-w-xs">
              {state.moodDisplayName}
            </span>
            <ChevronDown className="w-3 h-3 text-stone-500" />
          </button>

          {/* Mood Dropdown Selector */}
          {showMoodMenu && (
            <div className="absolute top-full left-0 mt-1 z-50 w-72 bg-stone-900 border border-stone-800 rounded-xl shadow-2xl p-2 space-y-1 animate-in fade-in">
              <div className="flex items-center justify-between px-2 py-1 border-b border-stone-800 text-[10px] text-stone-400 font-mono-code uppercase font-semibold">
                <span>Ambient Soundscape</span>
                <span className="text-emerald-400">100% Free WebAudio</span>
              </div>

              {/* Auto-shift toggle */}
              <button
                onClick={() => {
                  soundscape.setAutoShift(!state.autoShift);
                  if (!state.autoShift) {
                    soundscape.handleSceneChange(currentSceneSummary, genre);
                  }
                }}
                className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors ${
                  state.autoShift
                    ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30 font-medium'
                    : 'text-stone-400 hover:bg-stone-800 hover:text-stone-200'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Auto-Shift by Scene Summary
                </span>
                {state.autoShift && <Check className="w-3.5 h-3.5 text-amber-400" />}
              </button>

              <div className="pt-1 border-t border-stone-800/80">
                <span className="text-[10px] text-stone-400 px-2 py-0.5 block font-semibold uppercase">
                  Atmosphere Presets:
                </span>
                {moods.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      soundscape.setAutoShift(false);
                      soundscape.setMood(m.id);
                      if (!state.isPlaying) soundscape.start();
                      setShowMoodMenu(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors ${
                      state.currentMood === m.id
                        ? 'bg-amber-600/20 text-amber-300 border border-amber-500/40 font-medium'
                        : 'text-stone-300 hover:bg-stone-800 hover:text-stone-100'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{m.icon}</span>
                      <span>{m.label}</span>
                    </span>
                    {state.currentMood === m.id && (
                      <Check className="w-3.5 h-3.5 text-amber-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Controls: Volume Slider, SFX Toggle, Optional Lyria AI Generator */}
      <div className="flex items-center gap-3">
        {/* Volume & Mute */}
        <div className="flex items-center gap-2 bg-stone-900 px-2.5 py-1 rounded-lg border border-stone-800">
          <button
            onClick={() => soundscape.toggleMute()}
            className="text-stone-400 hover:text-stone-200 transition-colors"
            title={state.isMuted ? 'Unmute' : 'Mute'}
          >
            {state.isMuted || state.volume === 0 ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-amber-400" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={state.isMuted ? 0 : state.volume}
            onChange={(e) => {
              if (state.isMuted) soundscape.toggleMute();
              soundscape.setVolume(parseFloat(e.target.value));
            }}
            className="w-16 sm:w-20 accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
            title={`Volume: ${Math.round(state.volume * 100)}%`}
          />
        </div>

        {/* SFX Toggle */}
        <button
          onClick={() => soundscape.toggleSfx()}
          className={`px-2 py-1 rounded-lg text-[11px] font-mono-code transition-colors border ${
            state.sfxEnabled
              ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
              : 'bg-stone-900 text-stone-500 border-stone-800 hover:text-stone-300'
          }`}
          title="Toggle interactive sound effects (choice clicks, dice rattle, victory chords)"
        >
          SFX {state.sfxEnabled ? 'ON' : 'OFF'}
        </button>

        {/* Optional Lyria AI Music Generator */}
        {onGenerateLyriaMusic && (
          <button
            onClick={onGenerateLyriaMusic}
            disabled={isGeneratingLyria}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-900/40 to-stone-900 hover:from-purple-800/50 text-purple-200 border border-purple-500/30 text-[11px] font-medium transition-all disabled:opacity-50 cursor-pointer"
            title="Generate AI orchestral music clip using Lyria"
          >
            {isGeneratingLyria ? (
              <Loader2 className="w-3.5 h-3.5 text-purple-400 animate-spin" />
            ) : (
              <Music className="w-3.5 h-3.5 text-purple-400" />
            )}
            <span>AI Music (Lyria)</span>
          </button>
        )}
      </div>
    </div>
  );
};
