import React, { useState } from 'react';
import {
  Briefcase,
  Compass,
  User,
  Heart,
  Brain,
  Shield,
  Sparkles,
  CheckCircle2,
  Circle,
  Sword,
  Wand2,
  Key,
  FlaskConical,
  Package,
  Layers,
  ChevronDown,
  ChevronUp,
  Tag,
  Users,
  Eye,
  AlertCircle,
} from 'lucide-react';
import {
  InventoryItem,
  Quest,
  CharacterProfile,
  NPCCharacter,
  ItemCategory,
  ItemRarity,
} from '../types/adventure';

interface SidebarProps {
  inventory: InventoryItem[];
  currentQuest: Quest;
  pastQuests: Quest[];
  character: CharacterProfile;
  companions: NPCCharacter[];
  currentChapterNumber: number;
  onUseItem?: (item: InventoryItem) => void;
  onEquipItem?: (itemId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  inventory,
  currentQuest,
  pastQuests,
  character,
  companions,
  currentChapterNumber,
  onUseItem,
  onEquipItem,
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'quest' | 'character'>('quest');
  const [inventoryFilter, setInventoryFilter] = useState<string>('all');
  const [showPastQuests, setShowPastQuests] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Category Icon helper
  const getCategoryIcon = (category: ItemCategory) => {
    switch (category) {
      case 'weapon':
        return <Sword className="w-4 h-4 text-rose-400" />;
      case 'armor':
        return <Shield className="w-4 h-4 text-blue-400" />;
      case 'consumable':
        return <FlaskConical className="w-4 h-4 text-emerald-400" />;
      case 'relic':
        return <Wand2 className="w-4 h-4 text-purple-400" />;
      case 'key':
        return <Key className="w-4 h-4 text-amber-400" />;
      default:
        return <Package className="w-4 h-4 text-stone-400" />;
    }
  };

  // Rarity styling helper
  const getRarityBadge = (rarity: ItemRarity) => {
    switch (rarity) {
      case 'legendary':
      case 'artifact':
        return 'text-amber-300 border-amber-500/40 bg-amber-500/10 shadow-sm shadow-amber-500/20';
      case 'rare':
        return 'text-purple-300 border-purple-500/40 bg-purple-500/10';
      case 'uncommon':
        return 'text-blue-300 border-blue-500/40 bg-blue-500/10';
      default:
        return 'text-stone-400 border-stone-700 bg-stone-800/40';
    }
  };

  const filteredInventory = inventory.filter((item) => {
    if (inventoryFilter === 'all') return true;
    return item.category === inventoryFilter;
  });

  return (
    <aside className="w-full lg:w-84 xl:w-96 flex-shrink-0 flex flex-col h-full bg-stone-950/70 border-r border-stone-800 backdrop-blur-sm overflow-hidden">
      {/* Sidebar Navigation Tabs */}
      <div className="grid grid-cols-3 border-b border-stone-800 bg-stone-900/60 p-1.5 gap-1 text-xs">
        <button
          onClick={() => setActiveTab('quest')}
          className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg font-medium transition-all ${
            activeTab === 'quest'
              ? 'bg-amber-600/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span>Quest</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg font-medium transition-all ${
            activeTab === 'inventory'
              ? 'bg-amber-600/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5 text-amber-400" />
          <span>Inventory ({inventory.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('character')}
          className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg font-medium transition-all ${
            activeTab === 'character'
              ? 'bg-amber-600/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
          }`}
        >
          <User className="w-3.5 h-3.5 text-amber-400" />
          <span>Status</span>
        </button>
      </div>

      {/* Main Tab Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ================= TAB 1: CURRENT QUEST ================= */}
        {activeTab === 'quest' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" /> Active Objective
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase border ${
                  currentQuest?.status === 'completed'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                }`}
              >
                {currentQuest?.status || 'In Progress'}
              </span>
            </div>

            {currentQuest ? (
              <div className="bg-stone-900/80 border border-stone-800/90 rounded-xl p-3.5 space-y-3 shadow-md">
                <div>
                  <h3 className="font-cinzel text-base font-bold text-stone-100 leading-snug">
                    {currentQuest.title}
                  </h3>
                  <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                    {currentQuest.description}
                  </p>
                </div>

                {/* Sub-objectives with completion checkboxes */}
                <div className="space-y-2 pt-2 border-t border-stone-800/80">
                  <h4 className="text-[11px] font-semibold text-stone-400 uppercase tracking-wide">
                    Directives
                  </h4>
                  <div className="space-y-1.5">
                    {currentQuest.objectives?.map((obj) => (
                      <div
                        key={obj.id}
                        className={`flex items-start gap-2.5 p-2 rounded-lg text-xs transition-colors ${
                          obj.completed
                            ? 'bg-emerald-950/20 border border-emerald-800/30 text-stone-400'
                            : 'bg-stone-950/40 border border-stone-800/50 text-stone-200'
                        }`}
                      >
                        {obj.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="w-4 h-4 text-amber-500/70 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={obj.completed ? 'line-through text-stone-400' : 'font-medium'}>
                          {obj.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {currentQuest.reward && (
                  <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-xs">
                    <span className="text-stone-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Reward:
                    </span>
                    <span className="text-amber-300 font-medium">{currentQuest.reward}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-stone-800 bg-stone-900/40 text-center text-xs text-stone-400">
                No active quest. Advance the story to receive new goals.
              </div>
            )}

            {/* AI Lore Tracker & Past Quests Accordion */}
            {pastQuests.length > 0 && (
              <div className="border border-stone-800/80 rounded-xl overflow-hidden bg-stone-900/40">
                <button
                  onClick={() => setShowPastQuests(!showPastQuests)}
                  className="w-full flex items-center justify-between p-3 text-xs font-semibold text-stone-300 hover:text-stone-100 hover:bg-stone-800/40 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Completed Quests (
                    {pastQuests.length})
                  </span>
                  {showPastQuests ? (
                    <ChevronUp className="w-4 h-4 text-stone-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-stone-400" />
                  )}
                </button>

                {showPastQuests && (
                  <div className="p-3 pt-0 space-y-2 border-t border-stone-800">
                    {pastQuests.map((q) => (
                      <div
                        key={q.id}
                        className="p-2.5 rounded-lg bg-stone-950/60 border border-stone-800/50 text-xs space-y-1"
                      >
                        <div className="font-semibold text-stone-200 line-through">{q.title}</div>
                        <p className="text-[11px] text-stone-400">{q.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quick Lore tip */}
            <div className="p-3 rounded-xl bg-amber-950/10 border border-amber-900/30 text-xs text-amber-200/80 space-y-1">
              <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Living World AI
              </div>
              <p className="text-[11px] leading-relaxed text-amber-200/70">
                The story reacts dynamically to your choices. Quests update automatically as you explore, converse, or discover relics.
              </p>
            </div>
          </div>
        )}

        {/* ================= TAB 2: INVENTORY ================= */}
        {activeTab === 'inventory' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" /> Carried Belongings
              </span>
              <span className="text-[11px] font-mono-code text-stone-400 bg-stone-900 px-2 py-0.5 rounded border border-stone-800">
                {inventory.length} items
              </span>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1 text-[11px]">
              {['all', 'weapon', 'armor', 'consumable', 'relic', 'key'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setInventoryFilter(cat)}
                  className={`px-2 py-1 rounded-md capitalize transition-colors ${
                    inventoryFilter === cat
                      ? 'bg-amber-600 text-stone-950 font-semibold'
                      : 'bg-stone-900 text-stone-400 hover:text-stone-200 hover:bg-stone-800 border border-stone-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Inventory Item List */}
            {filteredInventory.length === 0 ? (
              <div className="p-6 text-center text-xs text-stone-400 border border-dashed border-stone-800 rounded-xl bg-stone-900/20">
                No items in this category. As you uncover items in the narrative, the AI will automatically add them here.
              </div>
            ) : (
              <div className="space-y-2">
                {filteredInventory.map((item) => {
                  const isNew = item.acquiredInChapter === currentChapterNumber;
                  const isSelected = selectedItem?.id === item.id;

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(isSelected ? null : item)}
                      className={`group p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-amber-500/60 bg-stone-900/90 shadow-md ring-1 ring-amber-500/20'
                          : 'border-stone-800/80 bg-stone-900/40 hover:bg-stone-900/70 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <div className="p-2 rounded-lg bg-stone-950 border border-stone-800 group-hover:border-stone-700 transition-colors">
                            {getCategoryIcon(item.category)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-semibold text-stone-100 group-hover:text-amber-300 transition-colors">
                                {item.name}
                              </h4>
                              {item.quantity > 1 && (
                                <span className="text-[10px] font-mono-code px-1.5 py-0.2 rounded bg-stone-800 text-stone-300">
                                  ×{item.quantity}
                                </span>
                              )}
                              {isNew && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500 text-stone-950 animate-pulse">
                                  NEW
                                </span>
                              )}
                              {item.equipped && (
                                <span className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  Equipped
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span
                                className={`text-[10px] uppercase font-mono-code px-1.5 py-0.2 rounded border ${getRarityBadge(
                                  item.rarity
                                )}`}
                              >
                                {item.rarity}
                              </span>
                              {item.effect && (
                                <span className="text-[11px] text-amber-400/90 font-medium">
                                  {item.effect}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="text-[11px] text-stone-400 mt-2 leading-relaxed">
                        {item.description}
                      </p>

                      {/* Item Actions */}
                      {isSelected && (
                        <div className="mt-3 pt-2 border-t border-stone-800/80 flex items-center justify-end gap-2 text-xs">
                          {onEquipItem && (item.category === 'weapon' || item.category === 'armor') && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEquipItem(item.id);
                              }}
                              className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-colors text-[11px]"
                            >
                              {item.equipped ? 'Unequip' : 'Equip'}
                            </button>
                          )}
                          {onUseItem && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onUseItem(item);
                              }}
                              className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-stone-950 font-semibold transition-colors text-[11px] flex items-center gap-1"
                            >
                              <Sparkles className="w-3 h-3" />
                              Use in Choice
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: CHARACTER & STATUS ================= */}
        {activeTab === 'character' && (
          <div className="space-y-4">
            {/* Protagonist Card */}
            <div className="bg-stone-900/80 border border-stone-800 rounded-xl p-3.5 space-y-3 shadow-md">
              <div>
                <h3 className="font-cinzel text-base font-bold text-stone-100">
                  {character.name}
                </h3>
                <p className="text-xs text-amber-400/90">{character.title}</p>
              </div>

              {/* Vitals: Health & Resolve */}
              <div className="space-y-2.5 pt-1">
                {/* Health Bar */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="flex items-center gap-1 font-medium text-rose-300">
                      <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> Vitality
                    </span>
                    <span className="font-mono-code text-[11px] text-stone-300">
                      {character.health} / {character.maxHealth}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-stone-950 rounded-full overflow-hidden border border-stone-800">
                    <div
                      className="h-full bg-gradient-to-r from-rose-600 to-rose-400 transition-all duration-500 rounded-full"
                      style={{
                        width: `${Math.max(0, Math.min(100, (character.health / character.maxHealth) * 100))}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Resolve Bar */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="flex items-center gap-1 font-medium text-cyan-300">
                      <Brain className="w-3.5 h-3.5 text-cyan-400" /> Resolve / Sanity
                    </span>
                    <span className="font-mono-code text-[11px] text-stone-300">
                      {character.resolve} / {character.maxResolve}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-stone-950 rounded-full overflow-hidden border border-stone-800">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-500 rounded-full"
                      style={{
                        width: `${Math.max(0, Math.min(100, (character.resolve / character.maxResolve) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Status Effects */}
              {character.statusEffects.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-stone-800/80">
                  <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wide">
                    Conditions & Boons
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {character.statusEffects.map((eff, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1"
                      >
                        <AlertCircle className="w-3 h-3 text-amber-400" />
                        {eff}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Attributes Matrix */}
              <div className="pt-2 border-t border-stone-800/80">
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wide block mb-2">
                  Attributes
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-stone-950/60 border border-stone-800 flex items-center justify-between">
                    <span className="text-stone-400">Might</span>
                    <span className="font-mono-code font-bold text-amber-300">
                      {character.stats.might}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-stone-950/60 border border-stone-800 flex items-center justify-between">
                    <span className="text-stone-400">Agility</span>
                    <span className="font-mono-code font-bold text-amber-300">
                      {character.stats.agility}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-stone-950/60 border border-stone-800 flex items-center justify-between">
                    <span className="text-stone-400">Intellect</span>
                    <span className="font-mono-code font-bold text-amber-300">
                      {character.stats.intellect}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-stone-950/60 border border-stone-800 flex items-center justify-between">
                    <span className="text-stone-400">Arcana</span>
                    <span className="font-mono-code font-bold text-amber-300">
                      {character.stats.arcana}
                    </span>
                  </div>
                </div>
              </div>

              {/* Visual Appearance Anchor (The prompt that keeps character look consistent!) */}
              <div className="pt-2 border-t border-stone-800/80">
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wide flex items-center gap-1 mb-1">
                  <Eye className="w-3.5 h-3.5 text-amber-400" /> Visual Identity Anchor
                </span>
                <p className="text-[11px] text-stone-400 bg-stone-950/80 p-2.5 rounded-lg border border-stone-800/70 italic leading-relaxed">
                  "{character.appearanceAnchor}"
                </p>
              </div>
            </div>

            {/* Met Characters / Companions Codex */}
            {companions.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-400" /> Characters Encountered ({companions.length})
                </span>
                <div className="space-y-2">
                  {companions.map((npc) => (
                    <div
                      key={npc.id}
                      className="p-2.5 rounded-xl bg-stone-900/60 border border-stone-800 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-stone-200">{npc.name}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${
                            npc.affinity === 'allied'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : npc.affinity === 'hostile'
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-stone-800 text-stone-400'
                          }`}
                        >
                          {npc.affinity}
                        </span>
                      </div>
                      <div className="text-[11px] text-amber-400/80">{npc.role}</div>
                      <p className="text-[11px] text-stone-400 leading-relaxed">{npc.notes}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
