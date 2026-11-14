export interface RelationshipArchetype {
  id: string;
  name: string;
  tagline: string;
  emoji: string;
  suggestedAvatar: string;
  category: 'Communication' | 'Humorous' | 'Strategy';
}

export const CONFLICT_ARCHETYPES: RelationshipArchetype[] = [
  {
    id: 'debaters',
    name: 'The Debaters',
    tagline: 'Must cite facts, dates, and cross-examine everything',
    emoji: '⚖️',
    suggestedAvatar: 'fox',
    category: 'Communication',
  },
  {
    id: 'chill-couple',
    name: 'The Chill Couple',
    tagline: 'Zero stress, nothing is worth ruining the weekend over',
    emoji: '🧘',
    suggestedAvatar: 'peace',
    category: 'Strategy',
  },
  {
    id: 'overthinkers',
    name: 'The Overthinkers',
    tagline: 'Dissecting the tone and punctuation of a text sent 3 days ago',
    emoji: '🧠',
    suggestedAvatar: 'sparkles',
    category: 'Communication',
  },
  {
    id: 'peacemakers',
    name: 'The Peacemakers',
    tagline: 'Will apologize first just to restore household harmony',
    emoji: '🕊️',
    suggestedAvatar: 'dove',
    category: 'Strategy',
  },
  {
    id: 'fiery-passionates',
    name: 'The Fiery Passionates',
    tagline: 'Loud, expressive, and passionately made up within 10 minutes',
    emoji: '🔥',
    suggestedAvatar: 'flame',
    category: 'Communication',
  },
  {
    id: 'hangry-negotiators',
    name: 'The Hangry Negotiators',
    tagline: 'Refuses to discuss chores or plans until tacos are ordered',
    emoji: '🌮',
    suggestedAvatar: 'coffee',
    category: 'Humorous',
  },
  {
    id: 'spreadsheet-solvers',
    name: 'The Spreadsheet Solvers',
    tagline: 'Brings bullet points, timelines, and action items to the talk',
    emoji: '📊',
    suggestedAvatar: 'robot',
    category: 'Strategy',
  },
  {
    id: 'silent-treatment',
    name: 'The Silent Sians',
    tagline: 'Communicates displeasure exclusively through theatrical sighs',
    emoji: '🤐',
    suggestedAvatar: 'owl',
    category: 'Humorous',
  },
  {
    id: 'laugh-it-offs',
    name: 'The Laugh-It-Offs',
    tagline: 'Cracks a funny face mid-argument to break the tension',
    emoji: '😂',
    suggestedAvatar: 'sun',
    category: 'Humorous',
  },
  {
    id: 'diplomats',
    name: 'The Deep Breath Diplomats',
    tagline: 'Calls a strict 20-minute timeout when pulse rates spike',
    emoji: '🌿',
    suggestedAvatar: 'shield',
    category: 'Strategy',
  },
  {
    id: 'memory-bank',
    name: 'The Memory Bank',
    tagline: 'Remembers exactly who left the fridge open in June 2022',
    emoji: '🗂️',
    suggestedAvatar: 'star',
    category: 'Communication',
  },
  {
    id: 'sweethearts',
    name: 'The Sweethearts',
    tagline: 'Always ends every small disagreement with long hugs',
    emoji: '💖',
    suggestedAvatar: 'heart',
    category: 'Communication',
  },
];
