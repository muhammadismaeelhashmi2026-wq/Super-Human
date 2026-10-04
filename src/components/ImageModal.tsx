import React from 'react';
import { X, Download, Sparkles, Copy, Check, Eye } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  prompt?: string;
  imageResolution?: string;
}

export const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  prompt,
  imageResolution = '1K',
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !imageUrl) return null;

  const handleCopyPrompt = () => {
    if (!prompt) return;
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `chronicle-art-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative max-w-5xl w-full max-h-[92vh] flex flex-col bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-3.5 border-b border-stone-800 flex items-center justify-between bg-stone-900/60">
          <div className="flex items-center gap-2">
            <span className="font-cinzel font-bold text-stone-100 text-sm">
              High-Resolution Scene Art
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono-code font-bold">
              {imageResolution} Canvas
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Image Viewport */}
        <div className="flex-1 overflow-auto bg-stone-950 flex items-center justify-center p-2">
          <img
            src={imageUrl}
            alt="Adventure Scene"
            referrerPolicy="no-referrer"
            className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg border border-stone-800/80 shadow-2xl"
          />
        </div>

        {/* Prompt Footer */}
        {prompt && (
          <div className="p-3 border-t border-stone-800 bg-stone-900/40 text-xs space-y-1">
            <div className="flex items-center justify-between text-stone-400 text-[11px]">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Prompt & Consistency Tokens:
              </span>
              <button
                onClick={handleCopyPrompt}
                className="flex items-center gap-1 text-stone-400 hover:text-stone-200 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy Prompt'}</span>
              </button>
            </div>
            <p className="text-[11px] text-stone-300 font-mono-code leading-relaxed line-clamp-2">
              {prompt}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
