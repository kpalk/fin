export const FIBONACCI_CARDS = ['0', '1', '2', '3', '5', '8', '13', '∞'] as const;
export type CardValue = (typeof FIBONACCI_CARDS)[number];

export type GamePhase = 'lobby' | 'estimating' | 'revealed';

export interface Player {
    id: string;
    name: string;
    pickedCard?: CardValue;
}

export interface GameState {
    phase: GamePhase;
    players: Player[];
    availableCards: CardValue[];
    acceptedEstimate?: CardValue;
}

export type EmoteType = 'up' | 'down' | 'fire' | 'hourGlass' | 'thumbUp' | 'thumbDown';

// Messages joiner → host
export type JoinerMessage =
    | { type: 'JOIN'; name: string }
    | { type: 'PICK_CARD'; value: CardValue }
    | { type: 'DESELECT_CARD' }
    | { type: 'EMOTE'; emote: EmoteType };

// Messages host → joiner
export type HostMessage = { type: 'STATE_SYNC'; state: GameState } | { type: 'NAME_TAKEN' };
