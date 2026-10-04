import { AdventureWorld } from '../types/adventure';

export const ART_STYLE_PRESETS = [
  {
    id: 'dark-fantasy',
    name: 'Grimoire Dark Fantasy',
    description: 'Detailed classical oil painting, dramatic candlelight, rich chiaroscuro, gothic fantasy concept art.',
    prompt: 'Masterpiece dark fantasy oil painting, dramatic atmospheric chiaroscuro lighting, textured painterly brushstrokes, intricate gothic detailing, muted earthy palette with luminous ember highlights, concept art style.'
  },
  {
    id: 'cyberpunk-noir',
    name: 'Cyberpunk Neon Noir',
    description: 'Rain-slicked reflections, vivid holographic neon, moody dystopian shadows, cinematic film grain.',
    prompt: 'Cinematic cyberpunk neo-noir aesthetic, volumetric rain-soaked street lighting, glowing neon cyan and magenta reflections, high-tech dystopian detailing, anamorphic lens flare, sharp cinematic concept illustration.'
  },
  {
    id: 'eldritch-horror',
    name: 'Cosmic Eldritch Horror',
    description: 'Surreal astral mists, bioluminescent horrors, eerie geometric architecture, vintage pulp horror.',
    prompt: 'Atmospheric cosmic horror illustration, eerie viridian and violet spectral glow, swirling otherworldly nebulas, unsettling ancient stone architecture, dark romanticism style, ominous mood.'
  },
  {
    id: 'watercolor-myth',
    name: 'Mythic Storybook Watercolor',
    description: 'Soft luminous washes, ink line detailing, whimsical yet grand epic fairy tale atmosphere.',
    prompt: 'Ethereal storybook watercolor and fine ink illustration, luminous washes of gold and lapis lazuli, hand-drawn detailing, soft mythical sunlight, poetic adventure aesthetic.'
  },
  {
    id: 'retro-pixel',
    name: 'Vintage 16-Bit Masterwork',
    description: 'Hyper-detailed retro pixel art painting, isometric depth, vibrant nostalgic palette.',
    prompt: 'Hyper-detailed masterclass pixel art aesthetic, vibrant nostalgic 16-bit color gradation, atmospheric lighting, crisp dithered shadows, classic adventure game cinematic still.'
  }
];

export const PRESET_ADVENTURES: AdventureWorld[] = [
  {
    id: 'eldoria',
    title: 'Eldoria: The Sunken Reliquary',
    genre: 'Gothic Dark Fantasy',
    synopsis: 'Deep beneath the weeping weeping crags of the Mournwood lies the Sunken Reliquary of Saint Valerius. Legends claim the Vault of the Pale Flame houses an artifact capable of binding the encroaching Hollow Night.',
    artStylePreset: 'Masterpiece dark fantasy oil painting, dramatic atmospheric chiaroscuro lighting, textured painterly brushstrokes, intricate gothic detailing, muted earthy palette with luminous ember highlights, concept art style.',
    startingPrompt: 'You stand before the obsidian archway of the Sunken Reliquary. Cold, brine-scented water trickles down the ancient bas-relief carvings of forgotten saints. Your lantern flickers against the encroaching gloom, casting long shadows against the flooded flagstones. Beside the shattered iron portcullis, a half-submerged skeleton clutches a sealed brass cylinder. Ahead, two arched corridors disappear into absolute blackness: one echoing with rhythmic subterranean clicking, the other carrying the faint, intoxicating scent of ancient myrrh and burning tallow.',
    defaultCharacter: {
      name: 'Vaelen Vance',
      title: 'Disgraced Inquisitor of the Sunken Order',
      appearanceAnchor: 'Vaelen Vance, a lean 32-year-old inquisitor with shoulder-length silver-streaked raven hair, a thin surgical scar over the left eyebrow, piercing slate-gray eyes, wearing a weather-worn hooded charcoal leather trench coat with tarnished silver buckles, high collar, and a faintly glowing pale amber talisman resting over his chest.',
      health: 100,
      maxHealth: 100,
      resolve: 80,
      maxResolve: 100,
      statusEffects: ['Alert', 'Chilled to the Bone'],
      stats: {
        might: 14,
        agility: 12,
        intellect: 16,
        arcana: 11
      }
    },
    initialQuest: {
      id: 'quest-vault-pale-flame',
      title: 'The Vault of the Pale Flame',
      description: 'Breach the sanctum of the Sunken Reliquary and retrieve the Censor of Saint Valerius before the Hollow Tide crests at midnight.',
      status: 'active',
      objectives: [
        { id: 'obj-1', text: 'Inspect the flooded threshold and bypass the inner seals', completed: false },
        { id: 'obj-2', text: 'Locate the Key of the Weeping Martyr', completed: false },
        { id: 'obj-3', text: 'Survive whatever stalks the subterranean catacombs', completed: false }
      ],
      reward: 'The Pale Flame Relic & 500 Guild Marks'
    },
    initialItems: [
      {
        id: 'item-silver-rapier',
        name: 'Silver-Plated Inquisitor Blade',
        category: 'weapon',
        rarity: 'uncommon',
        description: 'Forged with blessed quicksilver along the fuller. Highly effective against nocturnal abominations.',
        quantity: 1,
        effect: '+4 Slashing / Silvered',
        equipped: true,
        acquiredInChapter: 0
      },
      {
        id: 'item-lantern',
        name: 'Abyssal Oil Lantern',
        category: 'relic',
        rarity: 'common',
        description: 'Emits a warm amber beam that cuts through unnatural miasmas and darkness.',
        quantity: 1,
        effect: 'Reveals hidden runes in darkness',
        equipped: true,
        acquiredInChapter: 0
      },
      {
        id: 'item-dampener-draught',
        name: 'Draught of Clear Blood',
        category: 'consumable',
        rarity: 'uncommon',
        description: 'Bitter herbal tincture that purges low-level venom and steadies trembling nerves.',
        quantity: 2,
        effect: 'Restores 25 Health and +15 Resolve',
        equipped: false,
        acquiredInChapter: 0
      },
      {
        id: 'item-tallow-seal',
        name: 'Broken Order Seal',
        category: 'key',
        rarity: 'rare',
        description: 'Half of a bronze sigil depicting a blindfolded seraph. Emits a faint hum near warding gates.',
        quantity: 1,
        effect: 'Key item for Reliquary sanctum',
        equipped: false,
        acquiredInChapter: 0
      }
    ]
  },
  {
    id: 'neon-veil',
    title: 'Neon Veil 2189: The Kuroshio Syndicate',
    genre: 'Cyberpunk Noir Heist',
    synopsis: 'In the vertical metropolis of New Neo-Kobe, you are a freelance net-infiltrator who just intercepted an encrypted biomorphic memory shard stolen from the omnipotent Arasaka-Soma bio-pharmaceutical orbital station.',
    artStylePreset: 'Cinematic cyberpunk neo-noir aesthetic, volumetric rain-soaked street lighting, glowing neon cyan and magenta reflections, high-tech dystopian detailing, anamorphic lens flare, sharp cinematic concept illustration.',
    startingPrompt: 'Acid rain spatters against the fractured carbon-fiber window of your safehouse on Level 84. In your cybernetic right palm, the stolen quantum biomorphic shard pulses with an erratic, bioluminescent amethyst cadence. Down in the alley below, twin chrome-plated hover-cruisers bearing the unmarked insignia of the Kuroshio Syndicate have just sealed off the pedestrian catwalks. The siren of an automated tactical drone wails in the mist. Your neural deck alerts you: "Counter-intrusion trace at 78%. Signal purge or immediate extraction required."',
    defaultCharacter: {
      name: 'Kira "Null" Thorne',
      title: 'Renegade Code-Weaver',
      appearanceAnchor: 'Kira Thorne, a sharp-featured female cyborg operative in her late 20s with asymmetric undercut jet-black hair with electric blue tips, glowing golden cyber-optic left eye with HUD telemetry lines, dressed in a high-collar iridescent matte-black techwear duster coat, neural interface jacks along her neck, and carbon-composite finger prosthetics.',
      health: 90,
      maxHealth: 100,
      resolve: 95,
      maxResolve: 100,
      statusEffects: ['Adrenaline High', 'Signal Traced (78%)'],
      stats: {
        might: 10,
        agility: 15,
        intellect: 18,
        arcana: 8
      }
    },
    initialQuest: {
      id: 'quest-kuroshio-shard',
      title: 'Decryption & Evacuation',
      description: 'Break through the Kuroshio lockdown on Level 84 and reach the underground mag-lev terminal to deliver the shard to your broker.',
      status: 'active',
      objectives: [
        { id: 'obj-1', text: 'Evade or neutralize the syndicate drone sweep on Level 84', completed: false },
        { id: 'obj-2', text: 'Decrypt the second tier of the bio-shard partition', completed: false },
        { id: 'obj-3', text: 'Meet the mysterious informant "Zero-Nine" at the neon pagoda', completed: false }
      ],
      reward: '25,000 Cred-Chips & Clean Identity Wipe'
    },
    initialItems: [
      {
        id: 'item-monowire',
        name: 'Thermal Monowire Whip',
        category: 'weapon',
        rarity: 'rare',
        description: 'Sub-dermal spool weapon capable of slicing through military-grade ballistic alloys at molecular levels.',
        quantity: 1,
        effect: '+6 Energy Slashing / Armor Piercing',
        equipped: true,
        acquiredInChapter: 0
      },
      {
        id: 'item-icepick',
        name: 'Military-Grade ICE-Pick Deck',
        category: 'relic',
        rarity: 'rare',
        description: 'Custom neural rig overclocked with experimental counter-intrusion routines.',
        quantity: 1,
        effect: 'Bypasses security doors and camera feeds',
        equipped: true,
        acquiredInChapter: 0
      },
      {
        id: 'item-stim',
        name: 'Reflex Booster Auto-Injector',
        category: 'consumable',
        rarity: 'uncommon',
        description: 'Emergency combat cocktail that dilates perceived time by 300% for brief moments.',
        quantity: 2,
        effect: 'Guarantees dodge or critical hit in urgent crisis',
        equipped: false,
        acquiredInChapter: 0
      }
    ]
  },
  {
    id: 'astral-leviathan',
    title: 'The Astral Leviathan: Derelict Echoes',
    genre: 'Cosmic Sci-Fi Horror',
    synopsis: 'You awake from cryo-stasis aboard the derelict deep-space research vessel USSC Prometheus. The warp core is dormant, eerie crystalline flora crawls over the bulkhead corridors, and the ship\'s AI speaks in fragmented tongues.',
    artStylePreset: 'Atmospheric cosmic horror illustration, eerie viridian and violet spectral glow, swirling otherworldly nebulas, unsettling ancient stone and metal architecture, dark romanticism style, ominous mood.',
    startingPrompt: 'The cryo-pod hisses open, spitting frigid coolant across the grated steel deck. Emergency red strobes bathe the hibernation bay in bloody pulses. Every other pod in the row is either smashed from the inside or choked with calcified purple tendrils that hum with low sonic vibrations. The life support display reads: "OXYGEN: 4 hours remaining. MAIN POWER: Offline. BIOMASS DETECTED: Upper Arboretum." You find your standard utility sidearm with three charge cells remaining beside the terminal.',
    defaultCharacter: {
      name: 'Dr. Ethan Cross',
      title: 'Chief Xenobiologist',
      appearanceAnchor: 'Dr. Ethan Cross, a tall, gaunt 38-year-old xenobiologist with disheveled dark brown hair, tired hazel eyes behind rectangular reinforced biosafety spectacles, wearing a white and teal armored pressure suit with copper conduits, bearing the worn USSC emblem on the chest plate, and an anomalous crystalline puncture scar on his left collarbone.',
      health: 85,
      maxHealth: 100,
      resolve: 70,
      maxResolve: 100,
      statusEffects: ['Cryo Sickness', 'Oxygen Gauge Active'],
      stats: {
        might: 11,
        agility: 11,
        intellect: 17,
        arcana: 13
      }
    },
    initialQuest: {
      id: 'quest-restore-core',
      title: 'Awaken the Prometheus',
      description: 'Navigate the infested decks to reach Engineering, restart the auxiliary fusion cell, and discover what corrupted the expedition.',
      status: 'active',
      objectives: [
        { id: 'obj-1', text: 'Secure an auxiliary oxygen scrubber canister', completed: false },
        { id: 'obj-2', text: 'Access the Central Comm Bridge for crew logs', completed: false },
        { id: 'obj-3', text: 'Purge the biomass surrounding the Auxiliary Generator', completed: false }
      ],
      reward: 'Survival & Access to the Escape Shuttle Hangar'
    },
    initialItems: [
      {
        id: 'item-plasma-cutter',
        name: 'Industrial Plasma Arc Cutter',
        category: 'weapon',
        rarity: 'uncommon',
        description: 'Designed for mining asteroid ore, easily severs bulkheads and organic biomass.',
        quantity: 1,
        effect: '+5 Thermal / Melts obstacles',
        equipped: true,
        acquiredInChapter: 0
      },
      {
        id: 'item-bio-scanner',
        name: 'Omni-Spectrum Bio-Scanner',
        category: 'relic',
        rarity: 'rare',
        description: 'Analyzes alien cellular structures and traces lifeform heat signatures through walls.',
        quantity: 1,
        effect: 'Detects hidden organisms and structural hazards',
        equipped: true,
        acquiredInChapter: 0
      },
      {
        id: 'item-stims-med',
        name: 'Nano-Suture Medi-Gel',
        category: 'consumable',
        rarity: 'common',
        description: 'Coagulates wounds instantly with synthetic tissue sealant.',
        quantity: 3,
        effect: 'Restores 30 Health',
        equipped: false,
        acquiredInChapter: 0
      }
    ]
  }
];
