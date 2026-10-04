import {
  AdventureState,
  ChapterTurn,
  ChatMessage,
  ChatRole,
  ImageResolution,
  AspectRatio,
} from '../types/adventure';

export interface TurnResponse {
  narrative: string;
  sceneSummary: string;
  sceneImagePrompt: string;
  choices: {
    id: string;
    text: string;
    consequenceHint?: string;
    type: 'action' | 'dialogue' | 'risk' | 'investigate' | 'magic' | 'stealth';
    difficulty?: 'Easy' | 'Moderate' | 'Hazardous' | 'Deadly';
  }[];
  inventoryUpdates: {
    added: any[];
    removedIds: string[];
    updated?: any[];
  };
  questUpdate: {
    title: string;
    description: string;
    status: 'active' | 'completed' | 'failed';
    objectives: { id: string; text: string; completed: boolean }[];
    milestoneNotification?: string;
  };
  statChanges: {
    healthDelta: number;
    resolveDelta: number;
    newStatusEffects: string[];
    removedStatusEffects: string[];
  };
  charactersMet: {
    id: string;
    name: string;
    role: string;
    appearance: string;
    affinity: 'allied' | 'neutral' | 'hostile' | 'unknown';
    notes: string;
  }[];
}

export async function advanceAdventureTurn(
  adventure: AdventureState,
  playerChoice: string
): Promise<TurnResponse> {
  const payload = {
    storyHistory: adventure.chapters.map((ch) => ({
      chapterNumber: ch.chapterNumber,
      playerActionTaken: ch.playerActionTaken,
      narrative: ch.narrative,
      sceneSummary: ch.sceneSummary,
    })),
    playerChoice,
    character: adventure.character,
    inventory: adventure.inventory,
    currentQuest: adventure.currentQuest,
    worldTitle: adventure.worldTitle,
    genre: adventure.genre,
    artStyleAnchor: adventure.artStyleAnchor,
    modelSpeed: adventure.modelSpeed,
  };

  const res = await fetch('/api/adventure/turn', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Turn generation failed' }));
    throw new Error(err.error || `Server responded with ${res.status}`);
  }

  return res.json();
}

export async function generateSceneImage(
  prompt: string,
  characterAnchor: string,
  artStyleAnchor: string,
  imageSize: ImageResolution = '1K',
  aspectRatio: AspectRatio = '16:9'
): Promise<{
  imageUrl: string;
  imageSize: ImageResolution;
  prompt: string;
  isFallback?: boolean;
  quotaExceeded?: boolean;
  quotaNotice?: string;
}> {
  const res = await fetch('/api/adventure/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      characterAnchor,
      artStyleAnchor,
      imageSize,
      aspectRatio,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Image generation failed' }));
    throw new Error(err.error || `Server responded with ${res.status}`);
  }

  return res.json();
}

export async function sendChatMessage(
  messages: ChatMessage[],
  role: ChatRole,
  modelSpeed: 'fast' | 'general' | 'complex',
  adventure?: AdventureState
): Promise<{ reply: string; modelUsed: string }> {
  const gameState = adventure
    ? {
        worldTitle: adventure.worldTitle,
        genre: adventure.genre,
        characterName: adventure.character.name,
        characterTitle: adventure.character.title,
        characterHp: `${adventure.character.health}/${adventure.character.maxHealth}`,
        characterResolve: `${adventure.character.resolve}/${adventure.character.maxResolve}`,
        currentQuestTitle: adventure.currentQuest?.title,
        inventorySummary: adventure.inventory.map((i) => `${i.name} (${i.quantity})`),
        lastSceneSummary: adventure.chapters[adventure.chapters.length - 1]?.sceneSummary,
      }
    : undefined;

  const res = await fetch('/api/chat/message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: messages.map((m) => ({ role: m.role, text: m.text })),
      role,
      modelSpeed,
      gameState,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Chatbot request failed' }));
    throw new Error(err.error || `Server responded with ${res.status}`);
  }

  return res.json();
}

export async function quickDiceCheck(
  actionDescription: string,
  statUsed: string,
  statValue: number,
  dc: number = 12
): Promise<{
  roll: number;
  modifier: number;
  total: number;
  dc: number;
  success: boolean;
  critical: boolean;
  fumble: boolean;
}> {
  const res = await fetch('/api/adventure/quick-check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ actionDescription, statUsed, statValue, dc }),
  });

  if (!res.ok) {
    throw new Error('Dice check failed');
  }

  return res.json();
}

export async function generateLyriaMusic(
  prompt: string,
  length: 'clip' | 'full' = 'clip'
): Promise<{ audioUrl: string; lyrics?: string; model: string }> {
  const res = await fetch('/api/adventure/generate-music', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, length }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Music generation failed' }));
    throw new Error(err.error || `Server responded with ${res.status}`);
  }

  return res.json();
}
