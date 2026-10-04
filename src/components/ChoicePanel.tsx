import React, { useState } from 'react';
import {
  Send,
  Dices,
  Sparkles,
  Sword,
  Eye,
  MessageCircle,
  Footprints,
  Wand2,
  ShieldAlert,
  Loader2,
  CornerDownLeft,
} from 'lucide-react';
import { ChoiceOption } from '../types/adventure';

interface ChoicePanelProps {
  choices: ChoiceOption[];
  onSelectChoice: (choiceText: string) => void;
  isLoading: boolean;
  onDiceRoll?: () => void;
  lastDiceResult?: {
    roll: number;
    modifier: number;
    total: number;
    dc: number;
    success: boolean;
    critical: boolean;
  } | null;
}

export const ChoicePanel: React.FC<ChoicePanelProps> = ({
  choices,
  onSelectChoice,
  isLoading,
  onDiceRoll,
  lastDiceResult,
}) => {
  const [customAction, setCustomAction] = useState('');
  const [showDicePanel, setShowDicePanel] = useState(false);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAction.trim() || isLoading) return;
    onSelectChoice(customAction.trim());
    setCustomAction('');
  };

  const getChoiceIcon = (type: ChoiceOption['type']) => {
    switch (type) {
      case 'action':
      case 'risk':
        return <Sword className="w-4 h-4 text-rose-400" />;
      case 'dialogue':
        return <MessageCircle className="w-4 h-4 text-cyan-400" />;
      case 'stealth':
        return <Footprints className="w-4 h-4 text-emerald-400" />;
      case 'magic':
        return <Wand2 className="w-4 h-4 text-purple-400" />;
      case 'investigate':
      default:
        return <Eye className="w-4 h-4 text-amber-400" />;
    }
  };

  const getDifficultyBadge = (difficulty?: string) => {
    switch (difficulty) {
      case 'Deadly':
        return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
      case 'Hazardous':
        return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      case 'Moderate':
        return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
      default:
        return 'text-stone-400 border-stone-700 bg-stone-800/40';
    }
  };

  return (
    <div className="sticky bottom-0 z-20 border-t border-stone-800 bg-stone-950/95 backdrop-blur-md p-4 md:p-5 shadow-2xl">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Choices Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 font-mono-code">
              <Sparkles className="w-3.5 h-3.5" /> What do you do?
            </span>
            <span className="text-[11px] text-stone-400 hidden sm:inline">
              Choices genuinely reshape the upcoming plot
            </span>
          </div>

          {/* Dice Check Affordance */}
          {onDiceRoll && (
            <button
              onClick={() => {
                setShowDicePanel(!showDicePanel);
                onDiceRoll();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 text-xs transition-colors"
              title="Roll a d20 skill check against fate"
            >
              <Dices className="w-3.5 h-3.5 text-amber-400" />
              <span>Roll Fate (d20)</span>
            </button>
          )}
        </div>

        {/* Dice Result Display */}
        {showDicePanel && lastDiceResult && (
          <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-between text-xs animate-in fade-in">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center font-mono-code font-bold text-sm border ${
                  lastDiceResult.critical
                    ? 'bg-amber-500 text-stone-950 border-amber-300'
                    : lastDiceResult.success
                    ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50'
                    : 'bg-rose-600/30 text-rose-300 border-rose-500/50'
                }`}
              >
                {lastDiceResult.roll}
              </div>
              <div>
                <span className="font-semibold text-stone-200">
                  {lastDiceResult.critical
                    ? 'Natural 20! Critical Triumph'
                    : lastDiceResult.success
                    ? 'Fate Favors You (Success)'
                    : 'The Odds Betray You (Failure)'}
                </span>
                <p className="text-[11px] text-stone-400 font-mono-code">
                  Roll ({lastDiceResult.roll}) + Mod ({lastDiceResult.modifier}) = Total {lastDiceResult.total} vs DC {lastDiceResult.dc}
                </p>
              </div>
            </div>
            <button
              onClick={onDiceRoll}
              className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] transition-colors"
            >
              Re-roll
            </button>
          </div>
        )}

        {/* Dynamic AI-Generated Choice Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {choices.map((choice, idx) => (
            <button
              key={choice.id || idx}
              onClick={() => onSelectChoice(choice.text)}
              disabled={isLoading}
              className="group text-left p-3.5 rounded-xl border border-stone-800/90 bg-stone-900/60 hover:bg-stone-900 hover:border-amber-500/50 transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-amber-950/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-start gap-3"
            >
              <div className="p-2 rounded-lg bg-stone-950 border border-stone-800 group-hover:border-amber-500/40 transition-colors flex-shrink-0 mt-0.5">
                {getChoiceIcon(choice.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-mono-code text-stone-400 group-hover:text-amber-400 uppercase font-semibold">
                    Choice {idx + 1}
                  </span>
                  {choice.difficulty && (
                    <span
                      className={`text-[9px] uppercase font-mono-code px-1.5 py-0.2 rounded border ${getDifficultyBadge(
                        choice.difficulty
                      )}`}
                    >
                      {choice.difficulty}
                    </span>
                  )}
                </div>
                <div className="text-xs md:text-sm font-medium text-stone-200 group-hover:text-amber-200 transition-colors leading-snug">
                  {choice.text}
                </div>
                {choice.consequenceHint && (
                  <div className="text-[11px] text-stone-400 mt-1 italic line-clamp-1 group-hover:text-stone-300">
                    ↳ {choice.consequenceHint}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Custom Player Input Field ("Or forge your own path...") */}
        <form onSubmit={handleCustomSubmit} className="relative flex items-center">
          <input
            type="text"
            value={customAction}
            onChange={(e) => setCustomAction(e.target.value)}
            disabled={isLoading}
            placeholder="Or forge your own path... Describe your action, spell, or dialogue..."
            className="w-full pl-4 pr-24 py-3 rounded-xl bg-stone-900 border border-stone-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs md:text-sm text-stone-100 placeholder-stone-500 outline-none transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!customAction.trim() || isLoading}
            className="absolute right-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Weaving...</span>
              </>
            ) : (
              <>
                <span>Act</span>
                <CornerDownLeft className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
