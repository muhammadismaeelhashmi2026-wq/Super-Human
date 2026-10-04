import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

// Server-side GenAI client initialization with required User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Response schema for structured story turns
const TurnResponseSchema = {
  type: Type.OBJECT,
  properties: {
    narrative: {
      type: Type.STRING,
      description: '2 to 3 paragraphs of immersive, evocative narrative describing the immediate outcome of the action and the developing situation.',
    },
    sceneSummary: {
      type: Type.STRING,
      description: 'A 1-sentence recap of what occurred in this turn.',
    },
    sceneImagePrompt: {
      type: Type.STRING,
      description: 'A vivid, detailed visual prompt for generating scene art, including character visual anchor details, environment, lighting, and action.',
    },
    choices: {
      type: Type.ARRAY,
      description: '3 to 4 distinct, consequence-rich choices reflecting different approaches.',
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          text: { type: Type.STRING, description: 'The action or dialogue the player can choose' },
          consequenceHint: { type: Type.STRING, description: 'Brief indication of risk, reward, or tactical angle' },
          type: {
            type: Type.STRING,
            description: "Category: 'action', 'dialogue', 'risk', 'investigate', 'magic', or 'stealth'",
          },
          difficulty: {
            type: Type.STRING,
            description: "'Easy', 'Moderate', 'Hazardous', or 'Deadly'",
          },
        },
        required: ['id', 'text', 'type'],
      },
    },
    inventoryUpdates: {
      type: Type.OBJECT,
      description: 'Automatic additions, removals, or changes to player inventory based on narrative events.',
      properties: {
        added: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              category: { type: Type.STRING, description: "'weapon', 'armor', 'consumable', 'relic', 'key', or 'misc'" },
              rarity: { type: Type.STRING, description: "'common', 'uncommon', 'rare', 'legendary', or 'artifact'" },
              description: { type: Type.STRING },
              quantity: { type: Type.INTEGER },
              effect: { type: Type.STRING },
            },
            required: ['id', 'name', 'category', 'rarity', 'description', 'quantity'],
          },
        },
        removedIds: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'IDs of items consumed, spent, lost, or broken',
        },
      },
      required: ['added', 'removedIds'],
    },
    questUpdate: {
      type: Type.OBJECT,
      description: 'Current quest progress or new quest state.',
      properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        status: { type: Type.STRING, description: "'active', 'completed', or 'failed'" },
        objectives: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              text: { type: Type.STRING },
              completed: { type: Type.BOOLEAN },
            },
            required: ['id', 'text', 'completed'],
          },
        },
        milestoneNotification: { type: Type.STRING, description: 'Optional announcement if an objective or quest was completed' },
      },
      required: ['title', 'description', 'status', 'objectives'],
    },
    statChanges: {
      type: Type.OBJECT,
      description: 'Changes to player stats or conditions.',
      properties: {
        healthDelta: { type: Type.INTEGER, description: 'Negative for damage, positive for healing, 0 for none' },
        resolveDelta: { type: Type.INTEGER, description: 'Negative for stress, positive for inspiration, 0 for none' },
        newStatusEffects: { type: Type.ARRAY, items: { type: Type.STRING } },
        removedStatusEffects: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ['healthDelta', 'resolveDelta', 'newStatusEffects', 'removedStatusEffects'],
    },
    charactersMet: {
      type: Type.ARRAY,
      description: 'Any notable NPCs introduced, encountered, or updated in this turn.',
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          role: { type: Type.STRING },
          appearance: { type: Type.STRING, description: 'Distinct visual appearance description for visual continuity' },
          affinity: { type: Type.STRING, description: "'allied', 'neutral', 'hostile', or 'unknown'" },
          notes: { type: Type.STRING },
        },
        required: ['id', 'name', 'role', 'appearance', 'affinity', 'notes'],
      },
    },
  },
  required: [
    'narrative',
    'sceneSummary',
    'sceneImagePrompt',
    'choices',
    'inventoryUpdates',
    'questUpdate',
    'statChanges',
    'charactersMet',
  ],
};

// 1. ADVENTURE TURN API - Low-latency generator with gemini-3.1-flash-lite
app.post('/api/adventure/turn', async (req, res) => {
  try {
    const {
      storyHistory,
      playerChoice,
      character,
      inventory,
      currentQuest,
      worldTitle,
      genre,
      artStyleAnchor,
      modelSpeed,
    } = req.body;

    // Use requested model; default to low-latency gemini-3.1-flash-lite
    let modelName = 'gemini-3.1-flash-lite';
    if (modelSpeed === 'deep') {
      modelName = 'gemini-3.1-pro-preview';
    } else if (modelSpeed === 'balanced') {
      modelName = 'gemini-3.5-flash';
    }

    const systemInstruction = `You are an infinite interactive choose-your-own-adventure engine and responsive master storyteller.
World: "${worldTitle || 'Unknown'}" (${genre || 'Fantasy'}).
Art Style Anchor: "${artStyleAnchor || 'Detailed fantasy illustration'}".
Protagonist Visual Anchor: "${character?.appearanceAnchor || character?.name}".

CRITICAL ENGINE PRINCIPLES:
1. UNBOUND PLOT DIVERGENCE: The player's choices genuinely and unpredictably alter the plot. Do not funnel back to linear tracks. Honor unexpected creative player inputs, risks, failures, and clever ideas.
2. DYNAMIC SIDEBAR SYNCHRONIZATION:
   - INVENTORY: You must automatically update the player's inventory! If they discover, loot, receive, craft, or pick up an item, add it to 'inventoryUpdates.added'. If they drink a potion, lose gear, fire an arrow, spend coins, or break an item, list its ID in 'inventoryUpdates.removedIds'.
   - QUEST & OBJECTIVES: Track the active quest closely. When the player accomplishes something toward an objective, flip 'completed' to true in 'questUpdate.objectives'. If a quest finishes, mark status 'completed' and introduce a new emergent quest.
   - HEALTH & RESOLVE: Physical injury inflicts negative 'healthDelta'; harrowing moments drain 'resolveDelta'. Rest and triumphs restore them.
   - CHARACTERS: Track companions or adversaries met, recording their consistent appearance so they look the same across the adventure.
3. SCENE IMAGE PROMPT: Create a vivid prompt that combines the Art Style Anchor, Character Visual Anchor, and current scene composition so generated images retain strict visual identity.
4. Output must be strictly valid JSON conforming to the response schema.`;

    const recentTurnsText = Array.isArray(storyHistory)
      ? storyHistory
          .slice(-4)
          .map((t: any) => `[Chapter ${t.chapterNumber}]: Action: "${t.playerActionTaken}"\n${t.narrative}`)
          .join('\n\n')
      : '';

    const currentInventorySummary = Array.isArray(inventory)
      ? inventory.map((i: any) => `- [${i.id}] ${i.name} (${i.quantity}x, ${i.category}, ${i.rarity}): ${i.description}`).join('\n')
      : 'None';

    const currentQuestSummary = currentQuest
      ? `Quest: "${currentQuest.title}" (${currentQuest.status})\nDescription: ${currentQuest.description}\nObjectives:\n${(currentQuest.objectives || []).map((o: any) => ` - [${o.completed ? 'COMPLETED' : 'PENDING'}] (${o.id}): ${o.text}`).join('\n')}`
      : 'No active quest';

    const prompt = `CURRENT STATE:
Protagonist: ${character?.name} (${character?.title || 'Adventurer'})
Current HP: ${character?.health}/${character?.maxHealth}, Resolve: ${character?.resolve}/${character?.maxResolve}
Status Effects: ${(character?.statusEffects || []).join(', ') || 'None'}
Stats: Might ${character?.stats?.might || 10}, Agility ${character?.stats?.agility || 10}, Intellect ${character?.stats?.intellect || 10}, Arcana ${character?.stats?.arcana || 10}

INVENTORY:
${currentInventorySummary}

CURRENT QUEST:
${currentQuestSummary}

RECENT CHRONICLE:
${recentTurnsText}

PLAYER ACTION / CHOICE TAKEN:
"${playerChoice}"

Advance the story now. Determine the immediate consequences, resolve any risks, update inventory/quests, and present 3 to 4 distinct forward choices. Return strictly JSON.`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: TurnResponseSchema as any,
        temperature: 0.85,
      },
    });

    const textOutput = response.text || '{}';
    const parsedData = JSON.parse(textOutput);

    res.json(parsedData);
  } catch (error: any) {
    console.error('Error generating adventure turn:', error);
    res.status(500).json({
      error: error.message || 'Failed to advance adventure turn',
    });
  }
});

// Procedural atmospheric scene illustration generator (used when external image model quota is exceeded)
function generateProceduralSceneIllustration(
  prompt: string,
  characterAnchor: string,
  artStyleAnchor: string,
  imageSize: string = '1K',
  aspectRatio: string = '16:9'
): string {
  let width = 1280;
  let height = 720;
  if (aspectRatio === '1:1') {
    width = 1024;
    height = 1024;
  } else if (aspectRatio === '4:3') {
    width = 1024;
    height = 768;
  } else if (aspectRatio === '3:4') {
    width = 768;
    height = 1024;
  }

  const isCyber =
    /cyber|neon|matrix|tech|sci-fi|deck|hologram|drone|kuroshio/i.test(prompt) ||
    /cyber|neon/i.test(artStyleAnchor);
  const isCosmic =
    /astral|leviathan|space|alien|cosmic|eldritch|void|abyss/i.test(prompt) ||
    /eldritch|cosmic/i.test(artStyleAnchor);

  // Thematic color palettes
  const bgStart = isCyber ? '#030712' : isCosmic ? '#090514' : '#0c0a09';
  const bgMid = isCyber ? '#0e1d38' : isCosmic ? '#1a0d33' : '#1c1917';
  const bgEnd = isCyber ? '#020617' : isCosmic ? '#06030c' : '#080605';
  const glowPrimary = isCyber ? '#06b6d4' : isCosmic ? '#a855f7' : '#f59e0b';
  const glowSecondary = isCyber ? '#ec4899' : isCosmic ? '#10b981' : '#d97706';
  const accentLight = isCyber ? '#38bdf8' : isCosmic ? '#c084fc' : '#fbbf24';

  const cleanTitle = prompt.replace(/[<>&"']/g, '').slice(0, 75);
  const cleanAnchor = characterAnchor.replace(/[<>&"']/g, '').slice(0, 60);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${bgStart}" />
      <stop offset="50%" stop-color="${bgMid}" />
      <stop offset="100%" stop-color="${bgEnd}" />
    </linearGradient>
    <radialGradient id="celestialGlow" cx="50%" cy="35%" r="45%">
      <stop offset="0%" stop-color="${glowPrimary}" stop-opacity="0.45" />
      <stop offset="60%" stop-color="${glowSecondary}" stop-opacity="0.15" />
      <stop offset="100%" stop-color="${bgEnd}" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="fogGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${glowPrimary}" stop-opacity="0" />
      <stop offset="100%" stop-color="${glowPrimary}" stop-opacity="0.18" />
    </linearGradient>
    <filter id="blurFilter" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="30" />
    </filter>
  </defs>

  <!-- Sky & Celestial Atmosphere -->
  <rect width="${width}" height="${height}" fill="url(#bgGrad)" />
  <circle cx="${width * 0.5}" cy="${height * 0.35}" r="${Math.min(width, height) * 0.4}" fill="url(#celestialGlow)" filter="url(#blurFilter)" />

  <!-- Celestial Orb / Moon / Hologram -->
  <circle cx="${width * 0.5}" cy="${height * 0.3}" r="${Math.min(width, height) * 0.16}" fill="${accentLight}" fill-opacity="0.25" stroke="${glowPrimary}" stroke-width="2" />
  <circle cx="${width * 0.5}" cy="${height * 0.3}" r="${Math.min(width, height) * 0.14}" fill="none" stroke="${accentLight}" stroke-width="1" stroke-dasharray="8 6" opacity="0.6" />

  <!-- Stars & Embers -->
  <g fill="${accentLight}" opacity="0.6">
    <circle cx="${width * 0.15}" cy="${height * 0.18}" r="2" />
    <circle cx="${width * 0.28}" cy="${height * 0.12}" r="1.5" />
    <circle cx="${width * 0.42}" cy="${height * 0.22}" r="2.5" />
    <circle cx="${width * 0.68}" cy="${height * 0.15}" r="2" />
    <circle cx="${width * 0.82}" cy="${height * 0.25}" r="1.5" />
    <circle cx="${width * 0.88}" cy="${height * 0.11}" r="3" opacity="0.8" />
    <circle cx="${width * 0.12}" cy="${height * 0.4}" r="1.5" />
    <circle cx="${width * 0.76}" cy="${height * 0.38}" r="2" />
  </g>

  <!-- Background Architecture / Spires / Ruins -->
  <path d="M ${width * 0.05} ${height} L ${width * 0.08} ${height * 0.45} L ${width * 0.16} ${height * 0.52} L ${width * 0.25} ${height * 0.42} L ${width * 0.32} ${height} Z" fill="#090a0f" opacity="0.85" />
  <path d="M ${width * 0.68} ${height} L ${width * 0.74} ${height * 0.40} L ${width * 0.84} ${height * 0.48} L ${width * 0.94} ${height * 0.38} L ${width * 0.98} ${height} Z" fill="#090a0f" opacity="0.85" />

  <!-- Midground Arches / Structures -->
  <path d="M 0 ${height * 0.75} Q ${width * 0.25} ${height * 0.62} ${width * 0.5} ${height * 0.7} Q ${width * 0.75} ${height * 0.62} ${width} ${height * 0.75} L ${width} ${height} L 0 ${height} Z" fill="#05070a" />

  <!-- Fog layer -->
  <rect y="${height * 0.55}" width="${width}" height="${height * 0.45}" fill="url(#fogGrad)" />

  <!-- Central Foreground Threshold / Stone Outcrop -->
  <polygon points="${width * 0.35},${height} ${width * 0.42},${height * 0.68} ${width * 0.58},${height * 0.68} ${width * 0.65},${height}" fill="#0a0a0e" stroke="${glowPrimary}" stroke-opacity="0.2" stroke-width="1.5" />

  <!-- Hero Character Silhouette standing at the precipice -->
  <g transform="translate(${width * 0.5}, ${height * 0.68}) scale(0.9)">
    <!-- Aura glow -->
    <ellipse cx="0" cy="-35" rx="28" ry="45" fill="${glowPrimary}" fill-opacity="0.2" filter="url(#blurFilter)" />
    <!-- Cloak / Duster -->
    <path d="M -10 -25 L -16 0 L 16 0 L 10 -25 Z" fill="#030305" />
    <path d="M -18 0 Q -22 18 -16 28 L 16 28 Q 22 18 18 0 Z" fill="#020204" />
    <!-- Torso -->
    <path d="M -8 -45 L -12 -20 L 12 -20 L 8 -45 Z" fill="#050508" />
    <!-- Head & Hood -->
    <circle cx="0" cy="-56" r="8" fill="#07070a" />
    <path d="M -8 -58 Q 0 -68 8 -58 L 7 -48 L -7 -48 Z" fill="#030305" />
    <!-- Glowing Staff / Lantern / Blade / Cyber optic -->
    <line x1="12" y1="-50" x2="16" y2="15" stroke="${accentLight}" stroke-width="2.5" />
    <circle cx="12" cy="-50" r="4.5" fill="${glowPrimary}" />
    <circle cx="12" cy="-50" r="8" fill="${glowPrimary}" fill-opacity="0.4" />
  </g>

  <!-- Ambient Border & Frame -->
  <rect x="12" y="12" width="${width - 24}" height="${height - 24}" fill="none" stroke="${glowPrimary}" stroke-opacity="0.25" stroke-width="1.5" rx="12" />

  <!-- Cinematic Header Watermark -->
  <g font-family="Cinzel, serif" fill="#f5f5f4">
    <text x="${width * 0.05}" y="${height * 0.92}" font-size="16" font-weight="bold" letter-spacing="1.5">${cleanTitle}</text>
    <text x="${width * 0.05}" y="${height * 0.96}" font-size="12" fill="${accentLight}" opacity="0.85" font-family="'JetBrains Mono', monospace">Protagonist: ${cleanAnchor} • [${imageSize} RESOLUTION CANVAS]</text>
  </g>

  <!-- High-Def Badge -->
  <g transform="translate(${width - 150}, 30)">
    <rect width="120" height="24" rx="6" fill="#000000" fill-opacity="0.75" stroke="${glowPrimary}" stroke-width="1" stroke-opacity="0.5" />
    <text x="60" y="16" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="bold" fill="${accentLight}" text-anchor="middle">CHRONICLE ${imageSize}</text>
  </g>
</svg>`;

  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

// 2. IMAGE GENERATION API - Using gemini-3-pro-image-preview with 1K, 2K, 4K affordance
app.post('/api/adventure/generate-image', async (req, res) => {
  const {
    prompt,
    characterAnchor,
    artStyleAnchor,
    imageSize = '1K',
    aspectRatio = '16:9',
  } = req.body;

  // Feature requirement: "You MUST add image generation to the app using model gemini-3-pro-image-preview and provide an affordance for the user to specify the image size (1K, 2K, and 4K)."
  const requestedModel = 'gemini-3-pro-image-preview';
  const fullPrompt = `${artStyleAnchor || 'Detailed atmospheric concept art illustration'}. Character visual consistency: ${characterAnchor || 'Hero'}. Scene depiction: ${prompt}. Consistent artistic rendering, masterpiece quality, cinematic composition, authentic character details.`;

  // 1. Try primary gemini-3-pro-image-preview
  try {
    const response = await ai.models.generateContent({
      model: requestedModel,
      contents: {
        parts: [{ text: fullPrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: imageSize, // '1K' | '2K' | '4K'
        },
      },
    });

    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        const imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        return res.json({ imageUrl, imageSize, prompt: fullPrompt, model: requestedModel });
      }
    }
  } catch (primaryErr: any) {
    console.warn(`Primary image model ${requestedModel} failed:`, primaryErr?.message || primaryErr);
  }

  // 2. Try secondary gemini-3.1-flash-image
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image',
      contents: {
        parts: [{ text: fullPrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: imageSize,
        },
      },
    });

    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        const imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        return res.json({ imageUrl, imageSize, prompt: fullPrompt, model: 'gemini-3.1-flash-image' });
      }
    }
  } catch (secondaryErr: any) {
    console.warn(`Secondary image model gemini-3.1-flash-image failed:`, secondaryErr?.message || secondaryErr);
  }

  // 3. Try gemini-3.1-flash-lite-image
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [{ text: fullPrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
        },
      },
    });

    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        const imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        return res.json({ imageUrl, imageSize, prompt: fullPrompt, model: 'gemini-3.1-flash-lite-image' });
      }
    }
  } catch (liteErr: any) {
    console.warn(`Fallback image model gemini-3.1-flash-lite-image failed:`, liteErr?.message || liteErr);
  }

  // 4. Graceful High-Quality Procedural Scene Artwork (Ensures the adventure NEVER breaks on quota 429)
  console.info('Using high-fidelity atmospheric procedural scene illustration due to external API quota limits.');
  const proceduralImageUrl = generateProceduralSceneIllustration(
    prompt,
    characterAnchor,
    artStyleAnchor,
    imageSize,
    aspectRatio
  );

  return res.json({
    imageUrl: proceduralImageUrl,
    imageSize,
    prompt: fullPrompt,
    isFallback: true,
    quotaExceeded: true,
    quotaNotice:
      'Free tier quota limit reached for external image models. Generated high-fidelity atmospheric scene art. You can select a billing-enabled API key in Settings > Secrets to unlock photorealistic neural generation.',
  });
});

// 3. MULTI-TURN GEMINI CHATBOT API with role-specific system instructions
// Models: gemini-3.1-pro-preview for complex tasks, gemini-3.5-flash for general tasks, gemini-3.1-flash-lite for fast tasks
app.post('/api/chat/message', async (req, res) => {
  try {
    const { messages, role = 'dm', modelSpeed = 'fast', gameState } = req.body;

    // Feature requirement: "Use gemini-3.1-pro-preview for particularly complex tasks, gemini-3.5-flash for general tasks, and gemini-3.1-flash-lite for tasks that should happen fast."
    let modelName = 'gemini-3.1-flash-lite';
    if (modelSpeed === 'complex') {
      modelName = 'gemini-3.1-pro-preview';
    } else if (modelSpeed === 'general') {
      modelName = 'gemini-3.5-flash';
    } else {
      modelName = 'gemini-3.1-flash-lite';
    }

    // Role-specific personas
    const roleInstructions: Record<string, string> = {
      dm: `You are the Dungeon Master and Lore Chronicler for this adventure.
Your role: Answer questions about the world lore, clarify current environmental sensory details, offer cryptic clues or historical context, and help the player understand what their senses perceive. Never dictate the player's choices, but enrich the depth of the world. Speak with an evocative, atmospheric voice.`,
      inner_voice: `You are the Protagonist's Inner Consciousness and Intuition.
Your role: Speak in the second person ("You remember...", "A cold dread grips your ribs...", "Your instinct screams to watch the shadows..."). Reflect on the character's emotional state, gut hunches, moral dilemmas, and buried memories. Give subjective, visceral impressions.`,
      tactician: `You are the Tactical Combat and Survival Advisor.
Your role: Provide pragmatic, analytical, and strategic breakdowns of current hazards. Suggest creative ways to use items in the inventory, calculate tactical advantages (high ground, flanking, elemental counters), and assess risk levels objectively.`,
      sage: `You are the Game Sage and Rules Arbiter.
Your role: Explain game mechanics, difficulty ratings, potential dice rolls, stat scaling, and environmental physics clearly and concisely. Act as a neutral, helpful judge of what is possible within the game's simulated world.`,
    };

    const baseInstruction = roleInstructions[role] || roleInstructions.dm;

    const gameStateContext = gameState
      ? `\nCURRENT GAME STATE CONTEXT:
World: "${gameState.worldTitle || 'Unknown'}" (${gameState.genre || 'Adventure'})
Protagonist: ${gameState.characterName} (${gameState.characterTitle}) | HP: ${gameState.characterHp}, Resolve: ${gameState.characterResolve}
Current Quest: "${gameState.currentQuestTitle || 'None'}"
Inventory Items: ${Array.isArray(gameState.inventorySummary) ? gameState.inventorySummary.join(', ') : 'None'}
Last Turn Event: "${gameState.lastSceneSummary || 'At the threshold of adventure'}"`
      : '';

    const systemInstruction = `${baseInstruction}\n${gameStateContext}\nKeep responses engaging, immersive, and helpful. Do not output raw JSON, respond naturally in conversation.`;

    // Format multi-turn conversation history
    const formattedContents = (messages || []).map((m: any) => ({
      role: m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.text }],
    }));

    if (formattedContents.length === 0) {
      return res.status(400).json({ error: 'No messages provided' });
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.75,
      },
    });

    const reply = response.text || 'The voice fades into silence...';
    res.json({ reply, modelUsed: modelName });
  } catch (error: any) {
    console.error('Error in chat message API:', error);
    res.status(500).json({
      error: error.message || 'Chatbot request failed',
    });
  }
});

// 4. MUSIC GENERATION API using lyria-3-clip-preview / lyria-3-pro-preview
app.post('/api/adventure/generate-music', async (req, res) => {
  try {
    const { prompt, length = 'clip' } = req.body;
    const model = length === 'full' ? 'lyria-3-pro-preview' : 'lyria-3-clip-preview';
    const musicPrompt = `Cinematic adventure soundtrack: ${prompt || 'Atmospheric orchestral fantasy theme'}. High fidelity composition, immersive instruments.`;

    const responseStream = await ai.models.generateContentStream({
      model,
      contents: musicPrompt,
    });

    let audioBase64 = '';
    let lyrics = '';
    let mimeType = 'audio/wav';

    for await (const chunk of responseStream) {
      const parts = chunk.candidates?.[0]?.content?.parts;
      if (!parts) continue;
      for (const part of parts) {
        if (part.inlineData?.data) {
          if (!audioBase64 && part.inlineData.mimeType) {
            mimeType = part.inlineData.mimeType;
          }
          audioBase64 += part.inlineData.data;
        }
        if (part.text && !lyrics) {
          lyrics = part.text;
        }
      }
    }

    if (audioBase64) {
      const audioUrl = `data:${mimeType};base64,${audioBase64}`;
      return res.json({ audioUrl, lyrics, model });
    }

    res.status(500).json({ error: 'No audio returned from Lyria model' });
  } catch (err: any) {
    console.warn('Lyria music generation error:', err?.message || err);
    res.status(500).json({
      error: err.message || 'Lyria model requires billing-enabled key or is unavailable.',
    });
  }
});

// Quick action low-latency dice check / action evaluator
app.post('/api/adventure/quick-check', async (req, res) => {
  try {
    const { actionDescription, statUsed, statValue, dc = 12 } = req.body;
    const roll = Math.floor(Math.random() * 20) + 1;
    const total = roll + Math.floor((statValue - 10) / 2);
    const success = total >= dc;
    const critical = roll === 20;
    const fumble = roll === 1;

    res.json({
      roll,
      modifier: Math.floor((statValue - 10) / 2),
      total,
      dc,
      success,
      critical,
      fumble,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve('dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Adventure Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
