import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Sparkles,
  Maximize2,
  RefreshCw,
  History,
  ChevronDown,
  ChevronUp,
  Download,
  AlertCircle,
  CheckCircle2,
  Briefcase,
  Layers,
} from 'lucide-react';
import { ChapterTurn, ImageResolution } from '../types/adventure';

interface StoryViewerProps {
  currentChapter: ChapterTurn;
  pastChapters: ChapterTurn[];
  isGeneratingTurn: boolean;
  isGeneratingImage: boolean;
  onGenerateImage: () => void;
  imageResolution: ImageResolution;
  onResolutionChange: (res: ImageResolution) => void;
  onOpenImageModal: (imageUrl: string, prompt?: string) => void;
}

export const StoryViewer: React.FC<StoryViewerProps> = ({
  currentChapter,
  pastChapters,
  isGeneratingTurn,
  isGeneratingImage,
  onGenerateImage,
  imageResolution,
  onResolutionChange,
  onOpenImageModal,
}) => {
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto w-full">
      {/* ================= HERO SCENE ARTWORK ================= */}
      <div className="relative rounded-2xl overflow-hidden border border-stone-800 bg-stone-900/80 shadow-2xl shadow-black/80">
        {currentChapter.imageUrl ? (
          <div className="relative group aspect-[16/9] w-full bg-stone-950 overflow-hidden">
            <img
              src={currentChapter.imageUrl}
              alt={currentChapter.sceneSummary || 'Scene Illustration'}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Ambient Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent pointer-events-none" />

            {/* Top Toolbar overlay */}
            <div className="absolute top-3 right-3 flex items-center gap-2">
              {/* Image Resolution Tag */}
              <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md border border-stone-700/80 text-[11px] font-mono-code font-bold text-amber-300">
                {currentChapter.imageResolution || imageResolution} Res
              </span>

              {/* Zoom Button */}
              <button
                onClick={() => onOpenImageModal(currentChapter.imageUrl!, currentChapter.sceneImagePrompt)}
                className="p-1.5 rounded-lg bg-black/70 hover:bg-black/90 text-stone-200 border border-stone-700/80 backdrop-blur-md transition-colors"
                title="View High-Resolution Image"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Regenerate Button */}
              <button
                onClick={onGenerateImage}
                disabled={isGeneratingImage}
                className="p-1.5 rounded-lg bg-black/70 hover:bg-black/90 text-stone-200 border border-stone-700/80 backdrop-blur-md transition-colors disabled:opacity-50"
                title="Regenerate Scene Art"
              >
                <RefreshCw className={`w-4 h-4 ${isGeneratingImage ? 'animate-spin text-amber-400' : ''}`} />
              </button>
            </div>

            {/* Bottom Caption */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-stone-300/90 pointer-events-none">
              <span className="font-medium bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-stone-800/80 line-clamp-1">
                {currentChapter.sceneSummary}
              </span>
              <span className="text-[10px] hidden sm:inline bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-stone-800/80 text-stone-400">
                {currentChapter.isFallbackImage
                  ? 'Atmospheric Story Rendering • Free-tier Quota Active'
                  : 'Model: gemini-3-pro-image-preview'}
              </span>
            </div>
          </div>
        ) : (
          /* Placeholder container when image is not yet generated or is generating */
          <div className="relative aspect-[16/9] w-full bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 flex flex-col items-center justify-center p-6 text-center">
            {isGeneratingImage ? (
              <div className="space-y-3 flex flex-col items-center">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
                  <Sparkles className="w-6 h-6 text-amber-400 absolute inset-0 m-auto animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-cinzel text-sm font-bold text-amber-300">
                    Conjuring Visual Scene...
                  </h4>
                  <p className="text-xs text-stone-400 font-mono-code">
                    Model: gemini-3-pro-image-preview ({imageResolution} resolution)
                  </p>
                  <p className="text-[11px] text-stone-500 italic max-w-md">
                    Applying consistent art style and protagonist visual features
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-w-md">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-cinzel text-base font-bold text-stone-200">
                    Scene Illustration
                  </h4>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    Render this chapter's key visual moment with consistent character appearance and art style.
                  </p>
                </div>

                {/* Resolution Selector Affordance right on the card */}
                <div className="flex items-center justify-center gap-2 pt-1">
                  <span className="text-xs text-stone-400">Resolution:</span>
                  {(['1K', '2K', '4K'] as ImageResolution[]).map((res) => (
                    <button
                      key={res}
                      onClick={() => onResolutionChange(res)}
                      className={`px-2.5 py-1 text-xs rounded-lg font-mono-code font-bold transition-all ${
                        imageResolution === res
                          ? 'bg-amber-500 text-stone-950 shadow-md'
                          : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                      }`}
                    >
                      {res}
                    </button>
                  ))}
                </div>

                <div>
                  <button
                    onClick={onGenerateImage}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-bold text-xs shadow-lg shadow-amber-900/40 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Scene Art ({imageResolution})</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================= CHAPTER NARRATIVE PROSE ================= */}
      <div className="bg-stone-900/40 border border-stone-800/80 rounded-2xl p-6 md:p-8 backdrop-blur-sm space-y-6 shadow-xl">
        {/* Chapter Header */}
        <div className="border-b border-stone-800 pb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-[11px] font-mono-code tracking-wider uppercase text-amber-400 font-semibold">
              Chapter {currentChapter.chapterNumber}
            </span>
            <h2 className="font-cinzel text-xl md:text-2xl font-bold text-stone-100 mt-0.5">
              {currentChapter.sceneSummary || 'The Adventure Continues'}
            </h2>
          </div>
        </div>

        {/* Player's chosen action quote */}
        {currentChapter.playerActionTaken && currentChapter.chapterNumber > 0 && (
          <div className="p-3.5 rounded-xl bg-stone-950/70 border-l-4 border-amber-500 border border-stone-800/60 text-xs md:text-sm text-stone-300 italic">
            <span className="font-semibold text-amber-400 not-italic block mb-0.5 text-xs uppercase tracking-wider font-mono-code">
              Your Choice:
            </span>
            "{currentChapter.playerActionTaken}"
          </div>
        )}

        {/* Narrative Text */}
        <div className="font-prose-serif text-base md:text-lg text-stone-200 leading-relaxed md:leading-loose space-y-4 tracking-wide">
          {currentChapter.narrative.split('\n\n').map((paragraph, idx) => (
            <p key={idx} className="first-letter:text-2xl first-letter:font-cinzel first-letter:text-amber-400 first-letter:mr-1">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Changes Summary Banner (Dynamic changes made by AI in this chapter) */}
        {currentChapter.changesSummary && (
          <div className="pt-4 border-t border-stone-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {currentChapter.changesSummary.inventoryAdded &&
              currentChapter.changesSummary.inventoryAdded.length > 0 && (
                <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-800/40 text-emerald-300 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 flex-shrink-0" />
                  <span>
                    Acquired:{' '}
                    <strong>{currentChapter.changesSummary.inventoryAdded.join(', ')}</strong>
                  </span>
                </div>
              )}

            {currentChapter.changesSummary.inventoryRemoved &&
              currentChapter.changesSummary.inventoryRemoved.length > 0 && (
                <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-800/40 text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>
                    Lost/Used:{' '}
                    <strong>{currentChapter.changesSummary.inventoryRemoved.join(', ')}</strong>
                  </span>
                </div>
              )}

            {currentChapter.changesSummary.questProgress && (
              <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-800/40 text-amber-300 flex items-center gap-2 sm:col-span-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>
                  Quest Progress: <strong>{currentChapter.changesSummary.questProgress}</strong>
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================= PAST CHRONICLE ACCORDION ================= */}
      {pastChapters.length > 0 && (
        <div className="border border-stone-800 rounded-2xl overflow-hidden bg-stone-900/30">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between p-4 text-xs font-semibold uppercase tracking-wider text-stone-300 hover:text-stone-100 hover:bg-stone-800/40 transition-colors"
          >
            <span className="flex items-center gap-2">
              <History className="w-4 h-4 text-amber-400" />
              Chronicle Archives ({pastChapters.length} Previous Chapters)
            </span>
            {showHistory ? (
              <ChevronUp className="w-4 h-4 text-stone-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-stone-400" />
            )}
          </button>

          {showHistory && (
            <div className="p-4 pt-0 space-y-4 border-t border-stone-800">
              {pastChapters.map((ch) => (
                <div
                  key={ch.chapterNumber}
                  className="p-4 rounded-xl bg-stone-950/60 border border-stone-800/60 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono-code font-bold text-amber-400">
                      Chapter {ch.chapterNumber}
                    </span>
                    <span className="text-stone-400">{ch.sceneSummary}</span>
                  </div>

                  {ch.imageUrl && (
                    <div className="relative aspect-[21/9] w-full rounded-lg overflow-hidden border border-stone-800/80 my-2">
                      <img
                        src={ch.imageUrl}
                        alt={`Chapter ${ch.chapterNumber}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <p className="font-prose-serif text-stone-300 line-clamp-3 text-sm leading-relaxed">
                    {ch.narrative}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
