import { useEffect, useRef, useState, useCallback } from 'react';
import Peer, { type DataConnection } from 'peerjs';
import type { GameState, JoinerMessage, HostMessage, CardValue, EmoteType } from '../types';
import { FIBONACCI_CARDS } from '../types';

const ICE_CONFIG = {
    config: {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            {
                urls: 'turn:openrelay.metered.ca:80',
                username: 'openrelayproject',
                credential: 'openrelayproject',
            },
            {
                urls: 'turn:openrelay.metered.ca:443',
                username: 'openrelayproject',
                credential: 'openrelayproject',
            },
        ],
    },
};

// ─── HOST HOOK ────────────────────────────────────────────────────────────────

const INITIAL_STATE: GameState = {
    phase: 'lobby',
    players: [],
    availableCards: [...FIBONACCI_CARDS],
    acceptedEstimate: undefined,
};

export function useHostPeer() {
    const peerRef = useRef<Peer | null>(null);
    const connectionsRef = useRef<Map<string, DataConnection>>(new Map());
    const [peerId, setPeerId] = useState<string | null>(null);
    const [lastEmote, setLastEmote] = useState<{ emote: EmoteType; key: number } | null>(null);

    // Use a ref as the single source of truth so updates are synchronous.
    // React state is only used to trigger re-renders.
    const stateRef = useRef<GameState>(INITIAL_STATE);
    const [state, setReactState] = useState<GameState>(INITIAL_STATE);

    const broadcast = useCallback((s: GameState) => {
        const msg: HostMessage = { type: 'STATE_SYNC', state: s };
        connectionsRef.current.forEach((conn) => {
            if (conn.open) conn.send(msg);
        });
    }, []);

    // Synchronously update ref, broadcast, then schedule re-render.
    const updateState = useCallback(
        (updater: (prev: GameState) => GameState) => {
            const next = updater(stateRef.current);
            stateRef.current = next;
            broadcast(next);
            setReactState(next);
        },
        [broadcast]
    );

    useEffect(() => {
        const peer = new Peer(ICE_CONFIG);
        peerRef.current = peer;

        peer.on('open', (id) => setPeerId(id));

        peer.on('connection', (conn) => {
            connectionsRef.current.set(conn.peer, conn);

            conn.on('data', (raw) => {
                const msg = raw as JoinerMessage;

                if (msg.type === 'JOIN') {
                    const nameTaken = stateRef.current.players.some(
                        (p) => p.id !== conn.peer && p.name.toLowerCase() === msg.name.toLowerCase()
                    );
                    if (nameTaken) {
                        if (conn.open) conn.send({ type: 'NAME_TAKEN' } satisfies HostMessage);
                        return;
                    }
                    updateState((prev) => ({
                        ...prev,
                        players: [...prev.players.filter((p) => p.id !== conn.peer), { id: conn.peer, name: msg.name }],
                    }));
                } else if (msg.type === 'PICK_CARD') {
                    updateState((prev) => ({
                        ...prev,
                        players: prev.players.map((p) => (p.id === conn.peer ? { ...p, pickedCard: msg.value } : p)),
                    }));
                } else if (msg.type === 'EMOTE') {
                    setLastEmote({ emote: msg.emote, key: Date.now() });
                } else if (msg.type === 'DESELECT_CARD') {
                    updateState((prev) => ({
                        ...prev,
                        players: prev.players.map((p) => (p.id === conn.peer ? { ...p, pickedCard: undefined } : p)),
                    }));
                }
            });

            conn.on('close', () => {
                connectionsRef.current.delete(conn.peer);
                updateState((prev) => ({
                    ...prev,
                    players: prev.players.filter((p) => p.id !== conn.peer),
                }));
            });
        });

        return () => {
            peer.destroy();
        };
    }, [updateState]);

    const beginEstimation = useCallback(
        (cards: CardValue[]) => {
            updateState((prev) => ({
                ...prev,
                phase: 'estimating',
                availableCards: cards,
                players: prev.players.map((p) => ({ ...p, pickedCard: undefined })),
                acceptedEstimate: undefined,
            }));
        },
        [updateState]
    );

    const reveal = useCallback(() => {
        updateState((prev) => ({ ...prev, phase: 'revealed' }));
    }, [updateState]);

    const acceptEstimate = useCallback(
        (value: CardValue) => {
            updateState((prev) => ({ ...prev, acceptedEstimate: value }));
        },
        [updateState]
    );

    const reEstimate = useCallback(
        (cards: CardValue[]) => {
            updateState((prev) => ({
                ...prev,
                phase: 'estimating',
                availableCards: cards,
                players: prev.players.map((p) => ({ ...p, pickedCard: undefined })),
                acceptedEstimate: undefined,
            }));
        },
        [updateState]
    );

    // Accepts the originally configured deck so it doesn't reset to all cards.
    const startNewEstimate = useCallback(
        (configuredCards: CardValue[]) => {
            updateState((prev) => ({
                ...prev,
                phase: 'estimating',
                availableCards: configuredCards,
                players: prev.players.map((p) => ({ ...p, pickedCard: undefined })),
                acceptedEstimate: undefined,
            }));
        },
        [updateState]
    );

    return {
        peerId,
        state,
        lastEmote,
        beginEstimation,
        reveal,
        acceptEstimate,
        reEstimate,
        startNewEstimate,
    };
}

// ─── JOINER HOOK ──────────────────────────────────────────────────────────────

export function useJoinerPeer(hostId: string) {
    const peerRef = useRef<Peer | null>(null);
    const connRef = useRef<DataConnection | null>(null);
    const wasConnectedRef = useRef(false);
    const [connected, setConnected] = useState(false);
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [myId, setMyId] = useState<string | null>(null);
    const [nameTaken, setNameTaken] = useState(false);
    const [sessionNotFound, setSessionNotFound] = useState(false);
    const [hostLeft, setHostLeft] = useState(false);

    useEffect(() => {
        const peer = new Peer(ICE_CONFIG);
        peerRef.current = peer;

        peer.on('open', (id) => {
            setMyId(id);
            const conn = peer.connect(hostId);
            connRef.current = conn;

            conn.on('open', () => {
                wasConnectedRef.current = true;
                setConnected(true);
            });

            conn.on('data', (raw) => {
                const msg = raw as HostMessage;
                if (msg.type === 'STATE_SYNC') {
                    setGameState(msg.state);
                } else if (msg.type === 'NAME_TAKEN') {
                    setNameTaken(true);
                }
            });

            conn.on('close', () => {
                setConnected(false);
                setGameState(null);
                if (wasConnectedRef.current) setHostLeft(true);
            });
        });

        peer.on('error', (err) => {
            if ((err as { type?: string }).type === 'peer-unavailable') {
                setSessionNotFound(true);
            }
        });

        return () => {
            peer.destroy();
        };
    }, [hostId]);

    const join = useCallback((name: string) => {
        setNameTaken(false);
        connRef.current?.send({ type: 'JOIN', name } satisfies JoinerMessage);
    }, []);

    const pickCard = useCallback((value: CardValue) => {
        connRef.current?.send({ type: 'PICK_CARD', value } satisfies JoinerMessage);
    }, []);

    const deselectCard = useCallback(() => {
        connRef.current?.send({ type: 'DESELECT_CARD' } satisfies JoinerMessage);
    }, []);

    const sendEmote = useCallback((emote: EmoteType) => {
        connRef.current?.send({ type: 'EMOTE', emote } satisfies JoinerMessage);
    }, []);

    return {
        connected,
        gameState,
        myId,
        nameTaken,
        sessionNotFound,
        hostLeft,
        join,
        pickCard,
        deselectCard,
        sendEmote,
    };
}
