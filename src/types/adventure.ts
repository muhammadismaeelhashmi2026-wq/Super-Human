export type ImageResolution = '1K' | '2K' | '4K';
export type AspectRatio = '16:9' | '1:1' | '4:3' | '3:4';

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'legendary' | 'artifact';
export type ItemCategory = 'weapon' | 'armor' | 'consumable' | 'relic' | 'key' | 'misc';

export interface InventoryItem {
  id: string;
  name: string;
  category: ItemCategory;
  rarity: ItemRarity;
  description: string;
  quantity: number;
  effect?: string;
  equipped?: boolean;
  acquiredInChapter?: number;
}

export interface QuestObjective {
  id: string;
  text: string;
  completed: boolean;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'failed';
  objectives: QuestObjective[];
  reward?: string;
}

export interface NPCCharacter {
  id: string;
  name: string;
  role: string;
  appearance: string;
  affinity: 'allied' | 'neutral' | 'hostile' | 'unknown';
  notes: string;
}

export interface CharacterProfile {
  name: string;
  title: string;
  appearanceAnchor: string; // Detailed visual description for consistent image generation
  health: number;
  maxHealth: number;
  resolve: number;
  maxResolve: number;
  statusEffects: string[];
  stats: {
    might: number;
    agility: number;
    intellect: number;
    arcana: number;
  };
}

export interface ChoiceOption {
  id: string;
  text: string;
  consequenceHint?: string;
  type: 'action' | 'dialogue' | 'risk' | 'investigate' | 'magic' | 'stealth';
  difficulty?: 'Easy' | 'Moderate' | 'Hazardous' | 'Deadly';
}

export interface ChapterTurn {
  chapterNumber: number;
  timestamp: number;
  playerActionTaken: string;
  narrative: string;
  sceneSummary: string;
  sceneImagePrompt?: string;
  imageUrl?: string;
  imageResolution?: ImageResolution;
  isFallbackImage?: boolean;
  quotaNotice?: string;
  choices: ChoiceOption[];
  changesSummary?: {
    inventoryAdded?: string[];
    inventoryRemoved?: string[];
    questProgress?: string;
    healthDelta?: number;
    resolveDelta?: number;
    newEffects?: string[];
  };
}

export interface AdventureWorld {
  id: string;
  title: string;
  genre: string;
  synopsis: string;
  artStylePreset: string; // The persistent art style anchor prompt
  startingPrompt: string;
  initialQuest: Quest;
  initialItems: InventoryItem[];
  defaultCharacter: CharacterProfile;
}

export interface AdventureState {
  id: string;
  createdAt: number;
  updatedAt: number;
  worldTitle: string;
  genre: string;
  artStyleAnchor: string;
  imageResolution: ImageResolution;
  imageAspectRatio: AspectRatio;
  autoGenerateImages: boolean;
  character: CharacterProfile;
  inventory: InventoryItem[];
  currentQuest: Quest;
  pastQuests: Quest[];
  companions: NPCCharacter[];
  chapters: ChapterTurn[];
  currentTurnIndex: number;
  isGenerating: boolean;
  modelSpeed: 'low-latency' | 'balanced' | 'deep'; // gemini-3.1-flash-lite vs gemini-3.5-flash vs gemini-3.1-pro-preview
}

export type ChatRole = 'dm' | 'inner_voice' | 'tactician' | 'sage';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  senderRole?: ChatRole;
  text: string;
  timestamp: number;
  modelUsed?: string;
}
