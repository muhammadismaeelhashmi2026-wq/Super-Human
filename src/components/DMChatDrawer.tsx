import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  MessageSquare,
  Sparkles,
  Bot,
  User,
  Zap,
  Brain,
  Shield,
  Scroll,
  Trash2,
  Loader2,
  ChevronRight,
  Info,
} from 'lucide-react';
import { ChatMessage, ChatRole, AdventureState } from '../types/adventure';
import { sendChatMessage } from '../services/api';

interface DMChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  adventure: AdventureState;
}

export const DMChatDrawer: React.FC<DMChatDrawerProps> = ({
  isOpen,
  onClose,
  adventure,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'model',
      senderRole: 'dm',
      text: `Greetings, traveler. I am your Dungeon Master and Lore Chronicler. Whether you seek ancient world history, tactical advice on your inventory, or a deeper sense of what your senses perceive, speak freely.`,
      timestamp: Date.now(),
      modelUsed: 'gemini-3.5-flash',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [currentRole, setCurrentRole] = useState<ChatRole>('dm');
  const [modelSpeed, setModelSpeed] = useState<'fast' | 'general' | 'complex'>('general');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: query.trim(),
      timestamp: Date.now(),
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    try {
      const res = await sendChatMessage(updated, currentRole, modelSpeed, adventure);
      const modelMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        senderRole: currentRole,
        text: res.reply,
        timestamp: Date.now(),
        modelUsed: res.modelUsed,
      };
      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        senderRole: currentRole,
        text: `The mystic connection faltered: ${err.message || 'Please try again.'}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearHistory = () => {
    setMessages([
      {
        id: 'reset-1',
        role: 'model',
        senderRole: currentRole,
        text: 'The slate is cleared. What knowledge or guidance do you seek now?',
        timestamp: Date.now(),
      },
    ]);
  };

  const getRoleIcon = (role?: ChatRole) => {
    switch (role) {
      case 'inner_voice':
        return <Brain className="w-4 h-4 text-purple-400" />;
      case 'tactician':
        return <Shield className="w-4 h-4 text-rose-400" />;
      case 'sage':
        return <Scroll className="w-4 h-4 text-cyan-400" />;
      case 'dm':
      default:
        return <Sparkles className="w-4 h-4 text-amber-400" />;
    }
  };

  const getRoleName = (role?: ChatRole) => {
    switch (role) {
      case 'inner_voice':
        return 'Inner Consciousness';
      case 'tactician':
        return 'Tactical Advisor';
      case 'sage':
        return 'Game Sage (Rules)';
      case 'dm':
      default:
        return 'Dungeon Master';
    }
  };

  // Quick suggestions based on role
  const quickSuggestions = [
    { role: 'dm', text: 'Clarify what my senses perceive right now' },
    { role: 'tactician', text: 'How can I best use my items in this situation?' },
    { role: 'inner_voice', text: 'What does my intuition warn me about?' },
    { role: 'sage', text: 'What are the difficulty odds of attempting a risky maneuver?' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg h-full bg-stone-950 border-l border-stone-800 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-stone-800 flex items-center justify-between bg-stone-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-cinzel font-bold text-stone-100 text-sm">
                Gemini Oracle Chatbot
              </h3>
              <p className="text-[11px] text-stone-400">
                Multi-Turn Companion & DM Assistant
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={clearHistory}
              className="p-1.5 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded transition-colors"
              title="Clear Conversation History"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded transition-colors"
              title="Close Drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Persona Role Switcher */}
        <div className="p-2 border-b border-stone-800 bg-stone-900/30">
          <div className="text-[10px] uppercase font-semibold text-stone-400 px-2 py-0.5 mb-1">
            Select Chatbot Persona:
          </div>
          <div className="grid grid-cols-4 gap-1 text-xs">
            <button
              onClick={() => setCurrentRole('dm')}
              className={`p-1.5 rounded-lg flex flex-col items-center gap-1 transition-all ${
                currentRole === 'dm'
                  ? 'bg-amber-600/20 text-amber-300 border border-amber-500/40 font-medium'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px]">DM / Lore</span>
            </button>
            <button
              onClick={() => setCurrentRole('inner_voice')}
              className={`p-1.5 rounded-lg flex flex-col items-center gap-1 transition-all ${
                currentRole === 'inner_voice'
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 font-medium'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              <Brain className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-[10px]">Inner Voice</span>
            </button>
            <button
              onClick={() => setCurrentRole('tactician')}
              className={`p-1.5 rounded-lg flex flex-col items-center gap-1 transition-all ${
                currentRole === 'tactician'
                  ? 'bg-rose-600/20 text-rose-300 border border-rose-500/40 font-medium'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              <Shield className="w-4 h-4 text-rose-400" />
              <span className="text-[10px]">Tactician</span>
            </button>
            <button
              onClick={() => setCurrentRole('sage')}
              className={`p-1.5 rounded-lg flex flex-col items-center gap-1 transition-all ${
                currentRole === 'sage'
                  ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 font-medium'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              <Scroll className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[10px]">Game Sage</span>
            </button>
          </div>
        </div>

        {/* Model Complexity Selector (Required Feature) */}
        <div className="px-4 py-2 border-b border-stone-800/80 bg-stone-950 flex items-center justify-between text-xs">
          <span className="text-[11px] text-stone-400 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Model:
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setModelSpeed('fast')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono-code transition-colors ${
                modelSpeed === 'fast'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Low-latency speed using gemini-3.1-flash-lite"
            >
              ⚡ Flash Lite
            </button>
            <button
              onClick={() => setModelSpeed('general')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono-code transition-colors ${
                modelSpeed === 'general'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="General tasks using gemini-3.5-flash"
            >
              General 3.5
            </button>
            <button
              onClick={() => setModelSpeed('complex')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono-code transition-colors ${
                modelSpeed === 'complex'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-semibold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Complex reasoning using gemini-3.1-pro-preview"
            >
              Complex Pro
            </button>
          </div>
        </div>

        {/* Scrollable Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => {
            const isModel = m.role === 'model';
            return (
              <div
                key={m.id}
                className={`flex gap-3 ${isModel ? 'items-start' : 'items-start flex-row-reverse'}`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isModel
                      ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30'
                      : 'bg-stone-800 text-stone-200 border border-stone-700'
                  }`}
                >
                  {isModel ? getRoleIcon(m.senderRole) : <User className="w-3.5 h-3.5" />}
                </div>

                <div
                  className={`max-w-[82%] rounded-2xl p-3 text-xs leading-relaxed ${
                    isModel
                      ? 'bg-stone-900 border border-stone-800 text-stone-200 shadow-sm'
                      : 'bg-amber-600 text-stone-950 font-medium'
                  }`}
                >
                  {isModel && (
                    <div className="flex items-center justify-between gap-2 mb-1 pb-1 border-b border-stone-800/80">
                      <span className="font-semibold text-amber-400 text-[10px]">
                        {getRoleName(m.senderRole)}
                      </span>
                      {m.modelUsed && (
                        <span className="text-[9px] font-mono-code text-stone-500">
                          {m.modelUsed}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="whitespace-pre-wrap">{m.text}</div>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-3 items-center">
              <div className="w-7 h-7 rounded-lg bg-amber-600/20 text-amber-300 border border-amber-500/30 flex items-center justify-center">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="p-3 rounded-2xl bg-stone-900 border border-stone-800 text-xs text-stone-400 italic">
                {getRoleName(currentRole)} is contemplating...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-stone-900/40 border-t border-stone-800/60 overflow-x-auto flex gap-1.5 no-scrollbar">
          {quickSuggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(s.text)}
              disabled={isTyping}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-amber-300 transition-colors flex-shrink-0 cursor-pointer disabled:opacity-50"
            >
              {s.text}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-stone-800 bg-stone-950">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="relative flex items-center"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isTyping}
              placeholder={`Ask the ${getRoleName(currentRole)}...`}
              className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-stone-900 border border-stone-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs text-stone-100 placeholder-stone-500 outline-none transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="absolute right-1.5 p-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
